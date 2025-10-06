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
 * PATCH /api/auth/profile
 * Update user profile data
 *
 * MVP: Acepta datos pero no persiste (frontend usa localStorage)
 * PRODUCCIÓN: Actualizar user en DB
 */
export async function PATCH(request: Request) {
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

    const body = await request.json();
    const { name, phone, country, city } = body;

    // Simular delay de API
    await new Promise((resolve) => setTimeout(resolve, 300));

    // MVP: Retornar user actualizado
    // PRODUCCIÓN: Actualizar en DB y retornar user actualizado
    const user = {
      id: Buffer.from(email).toString('base64').substring(0, 10),
      email,
      name: name || email.split('@')[0],
      role: 'user' as const,
      phone: phone || undefined,
      country: country || undefined,
      city: city || undefined,
    };

    console.log(`[AUTH] Perfil actualizado: ${email}`);

    return NextResponse.json({ user });
  } catch (error) {
    console.error('[AUTH] Error al actualizar perfil:', error);
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}
