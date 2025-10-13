/**
 * This route has been deprecated.
 * The frontend now communicates directly with the backend API.
 * 
 * To get a course by ID, use:
 * - GET /api/categories/:id - Returns category details
 * - GET /api/videos?categoryId=:id - Returns videos for a category
 * 
 * See lib/api-client.ts for the new implementation
 * See api.md for complete API documentation
 */

import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  return NextResponse.json(
    { 
      error: 'This endpoint is deprecated. Use GET /api/categories/' + id + ' instead.',
      message: 'Frontend now communicates directly with backend API'
    },
    { status: 410 } // 410 Gone
  );
}