import { NextResponse } from 'next/server';
import { mockUserCourses } from '@/lib/mock-data';

export async function GET() {
  try {
    // Simular un pequeño delay como si fuera una API real
    await new Promise((resolve) => setTimeout(resolve, 500));

    return NextResponse.json(mockUserCourses);
  } catch {
    return NextResponse.json(
      { error: 'Error al obtener los cursos del usuario' },
      { status: 500 }
    );
  }
}
