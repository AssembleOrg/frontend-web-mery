import { NextResponse } from 'next/server';
import { isAdminEmail } from '@/lib/admin-config';

/**
 * POST /api/auth/login
 * MVP: Login solo con email (password opcional)
 *
 * PRODUCCIÓN: Verificar email + password contra base de datos
 * y generar JWT real
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validar email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email requerido' },
        { status: 400 }
      );
    }

    // MVP: Aceptar cualquier email válido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Simular delay de API
    await new Promise((resolve) => setTimeout(resolve, 300));

    // MVP: "Token" es el email en base64
    // PRODUCCIÓN: Generar JWT con jsonwebtoken
    const token = Buffer.from(email).toString('base64');

    // MVP: Determinar rol basado en email
    // PRODUCCIÓN: Rol viene de la base de datos
    const role = isAdminEmail(email) ? 'admin' : 'user';

    // MVP: User básico
    // PRODUCCIÓN: Buscar user en DB y retornar data real
    const user = {
      id: Buffer.from(email).toString('base64').substring(0, 10),
      email,
      name: email.split('@')[0], // Nombre del email
      role: role as 'user' | 'admin',
    };

    console.log(`[AUTH] Login exitoso: ${email} (${role})`);

    return NextResponse.json({
      user,
      token,
    });
  } catch (error) {
    console.error('[AUTH] Error en login:', error);
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}
