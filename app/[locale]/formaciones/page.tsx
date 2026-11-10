import FormacionesClient from './formaciones-client';
import { JsonLd } from '@/components/json-ld';
import { coursesJsonLd } from '@/lib/seo';
import type { Category } from '@/lib/api-client';

// Los precios cambian con las promos: se vuelven a leer cada 5 minutos.
export const revalidate = 300;

/**
 * Cursos activos leídos en el servidor, para que la página llegue con los
 * nombres, descripciones y precios (antes Google veía la página vacía porque se
 * cargaban recién en el navegador). Si el backend no responde, la página sigue
 * funcionando como antes: los trae el navegador.
 */
async function getPublicCategories(): Promise<Category[]> {
  const base = process.env.NEXT_PUBLIC_BASE_URL;
  if (!base) return [];
  try {
    const res = await fetch(`${base}/api/categories?isActive=true&limit=100`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const body = await res.json();
    const rows: unknown = body?.data?.data;
    return Array.isArray(rows) ? (rows as Category[]) : [];
  } catch {
    return [];
  }
}

export default async function FormacionesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const categories = await getPublicCategories();
  const jsonLd = coursesJsonLd(categories, locale);
  return (
    <>
      {jsonLd && <JsonLd data={jsonLd} />}
      <FormacionesClient initialCategories={categories} />
    </>
  );
}
