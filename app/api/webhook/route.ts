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
export async function GET(request: NextRequest) {
  console.log('[Webhook] GET request recibido - Verificación de MercadoPago');
  
  // MercadoPago hace GET para verificar que el webhook existe
  return NextResponse.json({ 
    status: 'ok',
    message: 'Webhook endpoint is active',
    timestamp: new Date().toISOString()
  }, { status: 200 });
}

export async function POST(request: NextRequest) {
  console.log('[Webhook] ========== Nueva notificación de MercadoPago ==========');
  
  try {
    const body = await request.json();
    console.log('[Webhook] Tipo de notificación:', body.type);
    console.log('[Webhook] Datos recibidos:', JSON.stringify(body, null, 2));

    if (body.type === 'payment') {
      const paymentId = body.data.id;
      console.log('[Webhook] Consultando pago ID:', paymentId);
      
      const payment = await new Payment(client).get({ id: paymentId });
      console.log('[Webhook] Estado del pago:', payment.status);
      console.log('[Webhook] Email del usuario:', payment.metadata?.user_email);
      console.log('[Webhook] Monto:', payment.transaction_amount, payment.currency_id);

      if (payment.status === 'approved') {
        console.log('[Webhook] ✅ Pago aprobado - Reenviando al backend...');
        
        const backendPayload = {
          paymentId: payment.id,
          userEmail: payment.metadata?.user_email,
          items: payment.additional_info?.items,
          amount: payment.transaction_amount,
          currency: payment.currency_id,
          status: payment.status,
          transactionId: payment.id?.toString(),
          paymentMethod: payment.payment_method_id,
          payerEmail: payment.payer?.email,
        };
        
        console.log('[Webhook] Payload para backend:', JSON.stringify(backendPayload, null, 2));
        
        try {
          const backendUrl = `${BACKEND_API_URL}/purchases/mercadopago-webhook`;
          console.log('[Webhook] URL del backend:', backendUrl);
          
          const backendResponse = await fetch(backendUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(backendPayload),
          });

          if (backendResponse.ok) {
            const backendData = await backendResponse.json();
            console.log('[Webhook] ✅ Backend procesó exitosamente:', backendData);
          } else {
            const errorText = await backendResponse.text();
            console.error('[Webhook] ❌ Backend falló (status', backendResponse.status, '):', errorText);
          }
        } catch (backendError: any) {
          console.error('[Webhook] ❌ Error al contactar backend:', backendError.message);
          console.error('[Webhook] Stack:', backendError.stack);
          // Continue - don't fail webhook if backend is down
        }
      } else {
        console.log('[Webhook] ⚠️ Pago no aprobado, estado:', payment.status);
      }
    } else {
      console.log('[Webhook] Tipo de notificación ignorado:', body.type);
    }

    console.log('[Webhook] ========== Fin de procesamiento ==========\n');
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('[Webhook] ❌ ERROR CRÍTICO:', error.message);
    console.error('[Webhook] Stack:', error.stack);
    console.log('[Webhook] ========== Fin con error ==========\n');
    
    // Siempre retornar 200 para evitar que MercadoPago reintente
    return NextResponse.json(
      { received: true, error: error.message },
      { status: 200 }
    );
  }
}
