import { NextResponse } from 'next/server';

/**
 * MVP: Extract email from token
 * PRODUCCIÓN: Verificar JWT y extraer payload
 */
function getUserEmailFromToken(token: string): string | null {
  try {
    const email = Buffer.from(token.replace('Bearer ', ''), 'base64').toString('utf-8');
    return email;
  } catch {
    return null;
  }
}

/**
 * GET /api/auth/me
 * Verify session and return user data
 *
 * PRODUCCIÓN: Verificar JWT token y retornar user desde DB
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return NextResponse.json(
        { error: 'No autorizado - Token requerido' },
        { status: 401 }
      );
    }

    const email = getUserEmailFromToken(authHeader);

    if (!email) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Simular delay de API
    await new Promise((resolve) => setTimeout(resolve, 200));

    // MVP: Retornar user básico
    // PRODUCCIÓN: Buscar user en DB por email
    const user = {
      id: Buffer.from(email).toString('base64').substring(0, 10),
      email,
      name: email.split('@')[0],
      role: 'user' as const,
    };

    return NextResponse.json({ user });
  } catch (error) {
    console.error('[AUTH] Error en /me:', error);
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}
