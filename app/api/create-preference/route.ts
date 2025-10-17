import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(req: NextRequest) {
  // Validar configuración
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  
  // URL del frontend para redirecciones (success/failure/pending)
  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || process.env.VERCEL_URL;
  
  // URL del backend para webhook
  const backendUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!accessToken) {
    console.error('MERCADOPAGO_ACCESS_TOKEN no está definido.');
    return NextResponse.json(
      { error: 'Configuración del servidor incompleta: falta ACCESS_TOKEN de MercadoPago.' },
      { status: 500 }
    );
  }

  if (!frontendUrl && !backendUrl) {
    console.error('Ni NEXT_PUBLIC_FRONTEND_URL ni NEXT_PUBLIC_BASE_URL están definidas.');
    return NextResponse.json(
      { error: 'Configuración del servidor incompleta: falta URL del frontend.' },
      { status: 500 }
    );
  }

  // Para las redirecciones, usar frontend URL si existe, sino usar el backend URL como fallback
  const redirectBaseUrl = (frontendUrl || backendUrl)!.replace(/\/$/, '');
  // Para el webhook, usar backend URL si existe, sino frontend
  const webhookBaseUrl = (backendUrl || frontendUrl)!.replace(/\/$/, '');
  
  console.log('[Create Preference] Frontend URL:', redirectBaseUrl);
  console.log('[Create Preference] Webhook URL:', webhookBaseUrl);

  try {
    const { items, locale, userEmail, userId } = await req.json();
    console.log('[Create Preference] Datos recibidos:', { items, locale, userEmail, userId });
    const effectiveLocale = locale || 'es';

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'El carrito está vacío.' },
        { status: 400 }
      );
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Email de usuario requerido.' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'ID de usuario requerido.' },
        { status: 400 }
      );
    }

    const preferenceItems = items.map((item: any) => {
      const quantity = Number(item.quantity);
      const price = Number(item.price);
      
      if (isNaN(quantity) || quantity <= 0) {
        throw new Error(`Cantidad inválida para el item: ${item.title}`);
      }
      if (isNaN(price) || price <= 0) {
        throw new Error(`Precio inválido para el item: ${item.title}`);
      }

      return {
        id: String(item.id),
        title: item.title,
        description: item.description || item.title,
        quantity: quantity,
        unit_price: price,
        currency_id: 'ARS',
      };
    });

    console.log('[Create Preference] Items procesados:', preferenceItems);

    // Extraer category IDs de los items
    const categoryIds = items.map((item: any) => item.id);
    console.log('[Create Preference] Category IDs:', categoryIds);

    const preference = await new Preference(client).create({
      body: {
        items: preferenceItems,
        payer: {
          email: userEmail,
        },
        // ⭐ METADATA COMPLETA REQUERIDA POR EL BACKEND
        metadata: {
          user_id: userId,                          // ⭐ CRÍTICO: ID del usuario
          user_email: userEmail,                    // ⭐ CRÍTICO: Email del usuario
          category_ids: JSON.stringify(categoryIds), // ⭐ CRÍTICO: IDs de categorías como JSON string
        },
        // ⭐ EXTERNAL REFERENCE: Fallback para identificar usuario
        external_reference: `${userId}_${Date.now()}`,
        back_urls: {
          success: `${redirectBaseUrl}/${effectiveLocale}/checkout/success`,
          failure: `${redirectBaseUrl}/${effectiveLocale}/checkout/failure`,
          pending: `${redirectBaseUrl}/${effectiveLocale}/checkout/pending`,
        },
        auto_return: 'approved',
        notification_url: `${webhookBaseUrl}/api/webhook`,
        // Opcional: Statement descriptor (aparece en resumen de tarjeta)
        statement_descriptor: 'MERY CURSOS',
      },
    });

    if (!preference.id) {
      throw new Error('No se pudo crear la preferencia de pago.');
    }

    console.log('[Create Preference] Preferencia creada:', {
      id: preference.id,
      init_point: preference.init_point,
      sandbox_init_point: preference.sandbox_init_point,
      metadata: {
        user_id: userId,
        user_email: userEmail,
        category_ids: categoryIds,
      },
      external_reference: `${userId}_${Date.now()}`,
    });

    // Devuelve tanto el ID como la URL para compatibilidad
    return NextResponse.json({ 
      id: preference.id,
      url: preference.init_point,
      sandbox_init_point: preference.sandbox_init_point
    });
  } catch (error: any) {
    console.error('[Create Preference] Error completo:', error);
    console.error('[Create Preference] Stack:', error.stack);
    console.error('[Create Preference] Causa:', error.cause);
    
    return NextResponse.json({ 
      error: error.message || 'Error al crear la preferencia de pago',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
