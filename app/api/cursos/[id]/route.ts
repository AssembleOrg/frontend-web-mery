import { NextResponse } from 'next/server';
import { getCourseById } from '@/lib/mock-data';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const course = getCourseById(id);
    
    if (!course) {
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(course);
  } catch {
    return NextResponse.json(
      { error: 'Error al obtener los detalles del curso' },
      { status: 500 }
    );
  }
}