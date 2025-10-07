import { NextResponse } from 'next/server';
import { getUserCourses } from '@/lib/api-server';

/**
 * MVP: Extract email from token
 * En producción, verificar JWT y extraer payload
 */
function getUserEmailFromToken(token: string): string | null {
  try {
    // MVP: Token is base64-encoded email
    // Producción: jwt.verify(token, secret) y extraer email del payload
    const email = Buffer.from(token.replace('Bearer ', ''), 'base64').toString('utf-8');
    return email;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return NextResponse.json(
        { error: 'No autorizado - Token requerido' },
        { status: 401 }
      );
    }

    const userEmail = getUserEmailFromToken(authHeader);

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Simular delay de API real
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Get user courses from userAccessDB
    const userCourses = getUserCourses(userEmail);

    return NextResponse.json(userCourses);
  } catch (error) {
    console.error('[API /cursos] Error:', error);
    return NextResponse.json(
      { error: 'Error al obtener los cursos del usuario' },
      { status: 500 }
    );
  }
}
