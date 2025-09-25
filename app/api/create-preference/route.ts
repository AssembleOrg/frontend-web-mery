// File: app/api/create-preference/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(req: NextRequest) {
  console.log('======================================================');
  console.log(
    'API Endpoint Iniciado. Valor de BASE_URL:',
    process.env.NEXT_PUBLIC_BASE_URL
  );
  console.log('======================================================');
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) {
    console.error(
      'Error Crítico: La variable de entorno NEXT_PUBLIC_BASE_URL no está definida.'
    );
    return NextResponse.json(
      { error: 'Configuración del servidor incompleta.' },
      { status: 500 }
    );
  }

  try {
    const { items, payerData, locale } = await req.json();
    const effectiveLocale = locale || 'es';

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'El carrito está vacío.' },
        { status: 400 }
      );
    }

    if (
      !payerData ||
      !payerData.nombre ||
      !payerData.apellido ||
      !payerData.email ||
      !payerData.telefono
    ) {
      return NextResponse.json(
        { error: 'Faltan datos del comprador.' },
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

    const cleanedPhoneNumber = payerData.telefono.replace(/[\s()-]+/g, '');

    const preference = await new Preference(client).create({
      body: {
        items: preferenceItems,
        payer: {
          name: payerData.nombre,
          surname: payerData.apellido,
          email: payerData.email,
          phone: {
            number: cleanedPhoneNumber,
          },
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
