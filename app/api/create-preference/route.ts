import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(req: NextRequest) {
  const rawBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!rawBaseUrl) {
    console.error('NEXT_PUBLIC_BASE_URL no está definida.');
    return NextResponse.json(
      { error: 'Configuración del servidor incompleta.' },
      { status: 500 }
    );
  }

  const baseUrl = rawBaseUrl.replace(/\/$/, '');

  try {
    const { items, locale, userEmail } = await req.json();
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

    const preferenceItems = items.map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      quantity: Number(item.quantity),
      unit_price: Number(item.price),
      currency_id: 'ARS',
    }));

    const preference = await new Preference(client).create({
      body: {
        items: preferenceItems,
        payer: {
          email: 'TESTUSER8883738017904117317@TESTUSER.COM',
        },
        metadata: {
          user_email: userEmail,
        },
        back_urls: {
          success: `${baseUrl}/${effectiveLocale}/checkout/success`,
          failure: `${baseUrl}/${effectiveLocale}/checkout/failure`,
          pending: `${baseUrl}/${effectiveLocale}/checkout/pending`,
        },
        notification_url: `${baseUrl}/api/webhook`,
      },
    });

    if (!preference.init_point) {
      throw new Error('No se pudo obtener la URL de pago (init_point).');
    }

    return NextResponse.json({ url: preference.init_point });
  } catch (error: any) {
    console.error('Error al crear la preferencia de Mercado Pago:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
