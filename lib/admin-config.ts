/**
 * Admin Configuration
 * MVP: Hardcoded list of admin emails
 *
 * PRODUCCIÓN: Backend determina el rol desde la base de datos
 * Este archivo será eliminado cuando se conecte el backend real
 */

/**
 * Lista de emails que tienen rol de administrador
 * Agregar emails aquí para darles acceso al panel admin
 */
export const ADMIN_EMAILS = [
  'admin@example.com',
  'mery@example.com',
  // Agregar más emails admin según necesites
];

/**
 * Verifica si un email es administrador
 */
export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}
