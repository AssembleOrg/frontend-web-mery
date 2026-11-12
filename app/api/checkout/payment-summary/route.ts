import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import type { PaymentSummary } from '@/lib/analytics/purchase';

// Resumen mínimo de un pago para medir la venta (monto y cursos).
// No devuelve datos de la persona: ni mail, ni nombre, ni medio de pago.
export async function GET(req: NextRequest) {
  const paymentId = req.nextUrl.searchParams.get('payment_id') ?? '';
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!/^\d{1,20}$/.test(paymentId) || !accessToken) {
    return NextResponse.json({ error: 'Pago inválido' }, { status: 400 });
  }

  try {
    const client = new MercadoPagoConfig({ accessToken });
    const payment = await new Payment(client).get({ id: paymentId });
    const summary: PaymentSummary = {
      status: String(payment.status ?? ''),
      amount: Number(payment.transaction_amount) || 0,
      currency: payment.currency_id || 'ARS',
      items: (payment.additional_info?.items || []).map((item: any) => ({
        id: String(item.id ?? ''),
        title: String(item.title ?? ''),
        price: Number(item.unit_price) || 0,
        quantity: Number(item.quantity) || 1,
      })),
    };
    return NextResponse.json(summary, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 });
  }
}
