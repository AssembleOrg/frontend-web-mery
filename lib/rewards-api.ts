import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface NewCourseCoupon {
  code: string;
  /** ISO */
  validTo: string;
  /** true si ya lo había reclamado antes: se devuelve el mismo código. */
  alreadyClaimed: boolean;
}

/** Cupón 20% OFF nueva formación (3 meses). Uno por cuenta. */
export async function claimNewCourseCoupon(): Promise<NewCourseCoupon> {
  const token = Cookies.get('auth_token');
  const res = await fetch(`${API_BASE_URL}/rewards/new-course-coupon`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message || `Error ${res.status}`);
  }
  const json = (await res.json()) as { data: NewCourseCoupon };
  return json.data;
}
