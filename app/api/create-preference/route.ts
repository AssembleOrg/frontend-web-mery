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
    return NextResponse.json(
      { error: 'Configuración del servidor incompleta: falta ACCESS_TOKEN de MercadoPago.' },
      { status: 500 }
    );
  }

  if (!frontendUrl && !backendUrl) {
    return NextResponse.json(
      { error: 'Configuración del servidor incompleta: falta URL del frontend.' },
      { status: 500 }
    );
  }

  // Para las redirecciones, usar frontend URL si existe, sino usar el backend URL como fallback
  const redirectBaseUrl = (frontendUrl || backendUrl)!.replace(/\/$/, '');
  // Para el webhook, usar backend URL si existe, sino frontend
  const webhookBaseUrl = (backendUrl || frontendUrl)!.replace(/\/$/, '');

  try {
    const { items, locale, userEmail, userId, couponId } = await req.json();
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

    // Cuotas: 3 sin interés excepto cursos cobrados en USD por fuera de la
    // plataforma (Nanoblading, Camuflaje Senior), que sólo aceptan pago único.
    const hasNonInstallmentItem = items.some((item: any) => {
      const title = String(item.title || '').toLowerCase();
      return (
        title.includes('nanoblading') ||
        title.includes('camuflaje senior') ||
        title.includes('camuflaje señor')
      );
    });
    const installments = hasNonInstallmentItem ? 1 : 3;

    // Extraer category IDs de los items
    const categoryIds = items.map((item: any) => item.id);

    // Expiración de la preference: 15 minutos
    const now = new Date();
    const expirationDate = new Date(now.getTime() + 15 * 60 * 1000);

    const preference = await new Preference(client).create({
      body: {
        expires: true,
        expiration_date_from: now.toISOString(),
        expiration_date_to: expirationDate.toISOString(),
        items: preferenceItems,
        payer: {
          email: userEmail,
        },
        metadata: {
          user_id: userId,
          user_email: userEmail,
          category_ids: JSON.stringify(categoryIds),
          coupon_id: couponId || '',
        },
        external_reference: `${userId}_${Date.now()}`,
        back_urls: {
          success: `${redirectBaseUrl}/${effectiveLocale}/checkout/success`,
          failure: `${redirectBaseUrl}/${effectiveLocale}/checkout/failure`,
          pending: `${redirectBaseUrl}/${effectiveLocale}/checkout/pending`,
        },
        auto_return: 'approved',
        notification_url: `${webhookBaseUrl}/api/webhook`,
        payment_methods: {
          installments,
          default_installments: 1,
        },
        statement_descriptor: 'MERY CURSOS',
      },
    });

    if (!preference.id) {
      throw new Error('No se pudo crear la preferencia de pago.');
    }

    // Devuelve tanto el ID como la URL para compatibilidad
    return NextResponse.json({ 
      id: preference.id,
      url: preference.init_point,
      sandbox_init_point: preference.sandbox_init_point
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message || 'Error al crear la preferencia de pago',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
