import { NextResponse } from 'next/server';

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
    const { name, email, password, phone, country, city } = body;

    // Validar campos requeridos
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Nombre requerido' },
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

    // MVP: User completo con todos los datos
    // PRODUCCIÓN: Guardar en DB y retornar user creado
    const user = {
      id: Buffer.from(email).toString('base64').substring(0, 10),
      email,
      name,
      role: 'user' as const,
      phone: phone || undefined,
      country: country || undefined,
      city: city || undefined,
    };

    console.log(`[AUTH] Registro exitoso: ${email} - ${name}`);

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
