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
    const {
      items,
      locale,
      userEmail,
      userId,
      couponCode,
      installments: requestedInstallments,
    } = await req.json();
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

    // BLINDAJE DE PRECIO: no se confía en el precio que manda el cliente. El
    // backend es la autoridad: calcula los line-items desde la DB, valida el
    // cupón (vigencia, categorías, propiedad del cupón personal) y resuelve las
    // cuotas. Acá solo se arma la preference de MP con esos precios.
    const categoryIds = items.map((item: any) => String(item.id));
    const authToken = req.cookies.get('auth_token')?.value;
    const apiBase = process.env.NEXT_PUBLIC_API_URL?.startsWith('http')
      ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
      : `${(process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '')}/api`;

    const quoteRes = await fetch(`${apiBase}/checkout/quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify({
        categoryIds,
        couponCode: couponCode || undefined,
        installments: requestedInstallments,
      }),
    });

    if (!quoteRes.ok) {
      const err = await quoteRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.message || 'No se pudo calcular el precio del pedido.' },
        { status: quoteRes.status === 401 ? 401 : 400 }
      );
    }

    const quote = (await quoteRes.json()).data;
    if (!quote?.items?.length) {
      return NextResponse.json(
        { error: 'No se pudo calcular el precio del pedido.' },
        { status: 400 }
      );
    }

    const preferenceItems = quote.items.map((item: any) => ({
      id: String(item.categoryId),
      title: item.title,
      description: item.description || item.title,
      quantity: 1,
      unit_price: Number(item.unitPrice),
      currency_id: 'ARS',
    }));

    const installments = Number(quote.installments) || 6;
    const couponId = quote.couponId || '';

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
          default_installments: installments,
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
