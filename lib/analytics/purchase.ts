// Arma el evento `purchase` de Google Analytics a partir de un pago de
// Mercado Pago. Lo usa la página de pago aprobado para que Google Ads sepa
// cuánto vendió cada anuncio (la conversión se importa desde GA4).

export type PaymentSummaryItem = {
  id: string;
  title: string;
  price: number;
  quantity: number;
};

export type PaymentSummary = {
  status: string;
  amount: number;
  currency: string;
  items: PaymentSummaryItem[];
};

export type Ga4PurchaseParams = {
  transaction_id: string;
  value: number;
  currency: string;
  items: { item_id: string; item_name: string; price: number; quantity: number }[];
};

export function toGa4Purchase(
  paymentId: string,
  summary: PaymentSummary | null | undefined,
): Ga4PurchaseParams | null {
  if (!paymentId || !summary || summary.status !== 'approved') return null;
  const value = Number(summary.amount);
  if (!Number.isFinite(value) || value <= 0) return null;
  return {
    transaction_id: paymentId,
    value,
    currency: summary.currency || 'ARS',
    items: (summary.items || []).map((item) => ({
      item_id: String(item.id),
      item_name: item.title,
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
    })),
  };
}

// Mercado Pago manda payment_id (o collection_id) en la URL de vuelta.
// Solo se aceptan dígitos para no consultar cualquier cosa.
export function readPaymentId(search: string): string | null {
  const query = new URLSearchParams(search);
  const raw = query.get('payment_id') ?? query.get('collection_id');
  return raw && /^\d{1,20}$/.test(raw) ? raw : null;
}
