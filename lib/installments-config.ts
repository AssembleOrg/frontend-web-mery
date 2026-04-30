// Aca para mostrar cuotsa en formaciones

export const INSTALLMENTS_CONFIG: Record<string, string> = {
  'estilismo-de-cejas': '3 cuotas sin interés',
  'modulo-ii-microblading-mg': '3 cuotas sin interés',
  'camuflaje-simple': '3 cuotas sin interés',
  'lipblush': '3 cuotas sin interés',
  'auto-styling-estilismo-de-cejas': '3 cuotas sin interés',
};

// Slugs que NO admiten cuotas en MercadoPago (pago único).
// Coordinado en /api/create-preference para forzar installments=1.
export const NON_INSTALLMENT_SLUGS = new Set<string>([
  'nanoblading',
  'camuflaje-senior',
]);
