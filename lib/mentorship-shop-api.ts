import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export type ShopCurrency = 'ARS' | 'USD';
export type ShopPaymentMethod = 'MERCADOPAGO' | 'TRANSFER' | 'CASH' | 'FOREIGN';
export type ShopProductType = 'MENTORSHIP' | 'ONE_TO_ONE';
export type ShopOrderStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'REJECTED';
export type ShopPromoKind = 'BUY_X_PAY_Y' | 'PERCENT';
export type ShopLineKind = 'PRODUCT' | 'PACK';

export const METHOD_CURRENCY: Record<ShopPaymentMethod, ShopCurrency> = {
  MERCADOPAGO: 'ARS',
  TRANSFER: 'ARS',
  CASH: 'ARS',
  FOREIGN: 'USD',
};

export interface ShopProduct {
  id: string;
  name: string;
  description: string | null;
  tagline: string | null;
  imageUrl: string | null;
  durationMin: number | null;
  type: ShopProductType;
  category: { id: string; name: string; slug: string } | null;
  priceARS: number | null;
  priceUSD: number | null;
}

export interface ShopPack {
  id: string;
  name: string;
  description: string | null;
  tagline: string | null;
  imageUrl: string | null;
  featured: boolean;
  priceARS: number | null;
  priceUSD: number | null;
  /** Lo que costarían las mentorías sueltas (null si alguna no se vende suelta). */
  compareARS: number | null;
  compareUSD: number | null;
  items: { productId: string; name: string; type: ShopProductType; quantity: number }[];
}

export interface ShopPromo {
  id: string;
  name: string;
  kind: ShopPromoKind;
  label: string;
  appliesToAll: boolean;
  productIds: string[];
  validTo: string | null;
}

export interface ShopCatalog {
  products: ShopProduct[];
  packs: ShopPack[];
  promos: ShopPromo[];
  giftsEnabled: boolean;
}

export interface CartLine {
  kind: ShopLineKind;
  id: string;
  quantity: number;
}

export interface ShopQuote {
  currency: ShopCurrency;
  paymentMethod: ShopPaymentMethod;
  lines: (CartLine & { name: string; unitPrice: number; lineTotal: number })[];
  subtotal: number;
  discount: number;
  total: number;
  promo: {
    id: string;
    name: string;
    kind: ShopPromoKind;
    code: string | null;
    label: string;
    discount: number;
    freeUnits: { productId: string; name: string; unitPrice: number }[];
  } | null;
  code: { status: 'applied' | 'invalid' | 'not_applied'; message: string } | null;
}

export interface ShopOrder {
  id: string;
  number: number;
  status: ShopOrderStatus;
  paymentMethod: ShopPaymentMethod;
  paymentMethodLabel: string;
  currency: ShopCurrency;
  subtotal: number;
  discount: number;
  total: number;
  promoLabel: string | null;
  createdAt: string;
  paidAt: string | null;
  creditsCount: number;
  items: {
    id: string;
    kind: ShopLineKind;
    name: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    contents: { name: string; quantity: number; type: ShopProductType }[];
  }[];
}

export interface AdminShopOrder extends ShopOrder {
  user: { id: string; email: string; firstName: string | null; lastName: string | null };
  mpPaymentId: string | null;
  reviewedAt: string | null;
  adminNote: string | null;
}

export type ShopCreditStatus = 'AVAILABLE' | 'USED' | 'EXPIRED';

export interface ShopCredit {
  id: string;
  status: ShopCreditStatus;
  type: ShopProductType;
  product: { id: string; name: string; imageUrl: string | null; durationMin: number | null } | null;
  category: { id: string; name: string; slug: string } | null;
  expiresAt: string | null;
  createdAt: string;
  orderNumber: number | null;
  giftedFrom: string | null;
  mentorship: {
    id: string;
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
    scheduledStart: string;
    scheduledEnd: string;
    meetLink: string | null;
    canReschedule: boolean;
  } | null;
}

export interface MyShop {
  giftsEnabled: boolean;
  credits: ShopCredit[];
  orders: ShopOrder[];
}

// ----------------------------- Admin -----------------------------

export interface AdminShopProduct {
  id: string;
  name: string;
  description: string | null;
  type: ShopProductType;
  isActive: boolean;
  category: { id: string; name: string; slug: string } | null;
  shopEnabled: boolean;
  shopOnly: boolean;
  shopPriceARS: number | null;
  shopPriceUSD: number | null;
  shopTagline: string | null;
  shopImageUrl: string | null;
  shopDurationMin: number | null;
}

export interface AdminShopPack {
  id: string;
  name: string;
  description: string | null;
  tagline: string | null;
  imageUrl: string | null;
  priceARS: number | null;
  priceUSD: number | null;
  isActive: boolean;
  featured: boolean;
  sortOrder: number;
  items: { productId: string; name: string; type: ShopProductType; isActive: boolean; quantity: number }[];
}

export type PackInput = Omit<AdminShopPack, 'id' | 'items'> & {
  items: { productId: string; quantity: number }[];
};

export interface AdminShopPromo {
  id: string;
  name: string;
  kind: ShopPromoKind;
  label: string;
  buyQty: number | null;
  payQty: number | null;
  percent: number | null;
  code: string | null;
  appliesToAll: boolean;
  productIds: string[];
  validFrom: string | null;
  validTo: string | null;
  maxUses: number | null;
  uses: number;
  isActive: boolean;
}

export type PromoInput = Omit<AdminShopPromo, 'id' | 'label' | 'uses'>;

export interface AdminOrdersPage {
  orders: AdminShopOrder[];
  total: number;
  page: number;
  pageSize: number;
  pendingCount: number;
}

function authHeaders(): HeadersInit {
  const token = Cookies.get('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/** Mensaje de error legible: el backend manda `message` como string o lista. */
function errorMessage(data: unknown, status: number): string {
  const msg = (data as { message?: string | string[] })?.message;
  if (Array.isArray(msg)) return msg[0] ?? `Error ${status}`;
  if (msg) return msg;
  if (status === 401) return 'Tu sesión expiró. Volvé a iniciar sesión.';
  return 'Algo salió mal. Probá de nuevo en un momento.';
}

async function api<T>(endpoint: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...init,
    credentials: 'include',
    headers: { ...authHeaders(), ...(init.headers || {}) },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(errorMessage(data, res.status));
  }
  const json = (await res.json()) as { data: T };
  return json.data;
}

const post = <T>(endpoint: string, body?: unknown) =>
  api<T>(endpoint, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) });

export const shopApi = {
  catalog: () => api<ShopCatalog>('/mentorship/shop/catalog'),
  quote: (payload: { lines: CartLine[]; paymentMethod: ShopPaymentMethod; code?: string }) =>
    post<ShopQuote>('/mentorship/shop/quote', payload),
  createOrder: (payload: { lines: CartLine[]; paymentMethod: ShopPaymentMethod; code?: string }) =>
    post<{ order: ShopOrder; initPoint: string | null }>('/mentorship/shop/orders', payload),
  order: (id: string) => api<ShopOrder>(`/mentorship/shop/orders/${id}`),
  payOrder: (id: string) => post<{ initPoint: string }>(`/mentorship/shop/orders/${id}/pay`),
  cancelOrder: (id: string) => post<ShopOrder>(`/mentorship/shop/orders/${id}/cancel`),
  mine: () => api<MyShop>('/mentorship/shop/mine'),
  gift: (creditId: string, email: string) =>
    post<{ gifted: boolean; recipient: string }>(`/mentorship/shop/credits/${creditId}/gift`, { email }),

  adminProducts: () => api<AdminShopProduct[]>('/mentorship/shop/admin/products'),
  adminUpdateProduct: (
    id: string,
    payload: Partial<
      Pick<
        AdminShopProduct,
        | 'shopEnabled'
        | 'shopOnly'
        | 'shopPriceARS'
        | 'shopPriceUSD'
        | 'shopTagline'
        | 'shopImageUrl'
        | 'shopDurationMin'
      >
    >,
  ) =>
    api<AdminShopProduct>(`/mentorship/shop/admin/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  adminUploadImage: async (file: File) => {
    const token = Cookies.get('auth_token');
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${API_BASE_URL}/mentorship/shop/admin/images`, {
      method: 'POST',
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(errorMessage(data, res.status));
    }
    return ((await res.json()) as { data: { url: string; key: string } }).data;
  },
  adminPacks: () => api<AdminShopPack[]>('/mentorship/shop/admin/packs'),
  adminCreatePack: (payload: PackInput) => post<AdminShopPack>('/mentorship/shop/admin/packs', payload),
  adminUpdatePack: (id: string, payload: Partial<PackInput>) =>
    api<AdminShopPack>(`/mentorship/shop/admin/packs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  adminDeletePack: (id: string) =>
    api<{ deleted: boolean }>(`/mentorship/shop/admin/packs/${id}`, { method: 'DELETE' }),
  adminPromos: () => api<AdminShopPromo[]>('/mentorship/shop/admin/promos'),
  adminCreatePromo: (payload: PromoInput) => post<AdminShopPromo>('/mentorship/shop/admin/promos', payload),
  adminUpdatePromo: (id: string, payload: PromoInput) =>
    api<AdminShopPromo>(`/mentorship/shop/admin/promos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  adminDeletePromo: (id: string) =>
    api<{ deleted: boolean }>(`/mentorship/shop/admin/promos/${id}`, { method: 'DELETE' }),
  adminOrders: (q: { status?: ShopOrderStatus; search?: string; page?: number }) => {
    const params = new URLSearchParams();
    if (q.status) params.set('status', q.status);
    if (q.search) params.set('search', q.search);
    if (q.page) params.set('page', String(q.page));
    const qs = params.toString();
    return api<AdminOrdersPage>(`/mentorship/shop/admin/orders${qs ? `?${qs}` : ''}`);
  },
  adminApprove: (id: string, note?: string) =>
    post<AdminShopOrder>(`/mentorship/shop/admin/orders/${id}/approve`, note ? { note } : {}),
  adminReject: (id: string, note?: string) =>
    post<AdminShopOrder>(`/mentorship/shop/admin/orders/${id}/reject`, note ? { note } : {}),
};

// ----------------------------- Formato -----------------------------

/** "$ 150.000" / "USD 150". */
export function formatPrice(amount: number, currency: ShopCurrency): string {
  if (currency === 'USD') {
    return `USD ${amount.toLocaleString('es-AR', { maximumFractionDigits: 2 })}`;
  }
  return `$ ${amount.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;
}

export function priceIn(item: { priceARS: number | null; priceUSD: number | null }, currency: ShopCurrency) {
  return currency === 'ARS' ? item.priceARS : item.priceUSD;
}

export function durationLabel(min: number | null): string | null {
  if (!min) return null;
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

export const ORDER_STATUS_LABEL: Record<ShopOrderStatus, string> = {
  PENDING: 'Pendiente de pago',
  PAID: 'Pagada',
  CANCELLED: 'Cancelada',
  REJECTED: 'Pago no validado',
};
