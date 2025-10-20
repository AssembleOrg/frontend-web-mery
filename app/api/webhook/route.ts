/**
 * MercadoPago Webhook Handler
 * 
 * NOTE: This webhook should ideally be handled by the backend API
 * to create CategoryPurchase records directly in the database.
 * 
 * However, if needed on frontend for specific reasons, this proxies
 * the webhook data to the backend for processing.
 * 
 * Backend should handle:
 * - Payment verification
 * - Creating CategoryPurchase records
 * - Granting user access to purchased categories
 * 
 * See api.md for CategoryPurchase model documentation
 */

import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// GET handler for MercadoPago webhook verification
export async function GET(_request: NextRequest) {
  // MercadoPago hace GET para verificar que el webhook existe
  return NextResponse.json({
    status: 'ok',
    message: 'Webhook endpoint is active',
    timestamp: new Date().toISOString()
  }, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.type === 'payment') {
      const paymentId = body.data.id;

      const payment = await new Payment(client).get({ id: paymentId });

      if (payment.status === 'approved') {
        
        // Formatear items correctamente para el backend
        const items = (payment.additional_info?.items || []).map((item: any) => ({
          id: item.id || item.category_id,
          title: item.title,
          description: item.description || item.title,
          quantity: Number(item.quantity) || 1,
          unit_price: Number(item.unit_price),
          currency_id: payment.currency_id || 'ARS',
        }));

        // Validar que tenemos el email del usuario
        const userEmail = payment.metadata?.user_email || payment.payer?.email;

        if (!userEmail) {
          throw new Error('User email not found in payment data');
        }

        if (items.length === 0) {
          throw new Error('No items found in payment');
        }
        
        const backendPayload = {
          paymentId: String(payment.id),
          userEmail: userEmail,
          items: items,
          amount: Number(payment.transaction_amount),
          currency: payment.currency_id || 'ARS',
          status: payment.status,
          transactionId: String(payment.id),
          paymentMethod: payment.payment_method_id,
          payerEmail: payment.payer?.email,
        };

        try {
          const backendUrl = `${BACKEND_API_URL}/purchases/mercadopago-webhook`;

          const _backendResponse = await fetch(backendUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(backendPayload),
          });

        } catch (_backendError: any) {
          // Continue - don't fail webhook if backend is down
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    
    // Siempre retornar 200 para evitar que MercadoPago reintente
    return NextResponse.json(
      { received: true, error: error.message },
      { status: 200 }
    );
  }
}
