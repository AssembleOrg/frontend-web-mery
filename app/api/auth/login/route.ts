import { NextResponse } from 'next/server';
import { isAdminEmail } from '@/lib/admin-config';

/**
 * POST /api/auth/login
 *
 * Development mode: Simulates authentication
 * Production: Replace with real database authentication and JWT generation
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email requerido' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Contraseña requerida' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 300));

    const token = Buffer.from(email).toString('base64');
    const role = isAdminEmail(email) ? 'admin' : 'user';

    const user = {
      id: Buffer.from(email).toString('base64').substring(0, 10),
      email,
      name: email.split('@')[0],
      role: role as 'user' | 'admin',
    };

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
