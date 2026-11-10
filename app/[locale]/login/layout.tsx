import { NO_INDEX_METADATA } from '@/lib/seo';

// Google puede leerla (no está bloqueada en robots) y así ve que no tiene que mostrarla.
export const metadata = NO_INDEX_METADATA;

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
