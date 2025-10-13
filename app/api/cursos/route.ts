/**
 * This route has been deprecated.
 * The frontend now communicates directly with the backend API.
 * 
 * To get user courses, use:
 * - GET /api/categories (with authentication) - Returns categories with hasAccess field
 * 
 * See lib/api-client.ts for the new implementation
 * See api.md for complete API documentation
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { 
      error: 'This endpoint is deprecated. Use GET /api/categories instead.',
      message: 'Frontend now communicates directly with backend API'
    },
    { status: 410 } // 410 Gone
  );
}
