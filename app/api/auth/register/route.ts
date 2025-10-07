import { NextResponse } from 'next/server';
import { isAdminEmail } from '@/lib/admin-config';

/**
 * POST /api/auth/register
 * MVP: Registro con nombre completo + datos opcionales
 *
 * PRODUCCIÓN: Validar email único, hashear password,
 * guardar en base de datos
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, password, phone, country, city } = body;

    // Validar campos requeridos
    if (!firstName || typeof firstName !== 'string') {
      return NextResponse.json(
        { error: 'Nombre requerido' },
        { status: 400 }
      );
    }

    if (!lastName || typeof lastName !== 'string') {
      return NextResponse.json(
        { error: 'Apellido requerido' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email requerido' },
        { status: 400 }
      );
    }

    // Validar email formato
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
    // PRODUCCIÓN: Rol viene de la base de datos o se asigna manualmente
    const role = isAdminEmail(email) ? 'admin' : 'user';

    // MVP: User completo con todos los datos
    // PRODUCCIÓN: Guardar en DB y retornar user creado
    const fullName = `${firstName} ${lastName}`;
    const user = {
      id: Buffer.from(email).toString('base64').substring(0, 10),
      email,
      name: fullName,
      role: role as 'user' | 'admin',
      phone: phone || undefined,
      country: country || undefined,
      city: city || undefined,
    };

    console.log(`[AUTH] Registro exitoso: ${email} - ${fullName} (${role})`);

    return NextResponse.json({
      user,
      token,
    });
  } catch (error) {
    console.error('[AUTH] Error en registro:', error);
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}
