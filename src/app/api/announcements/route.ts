import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export async function GET() {
  try {
    const result = await query(
      `SELECT id, text, color FROM announcements 
       WHERE active = true 
       ORDER BY priority ASC, created_at DESC`
    );
    return NextResponse.json({ announcements: result.rows });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json({ announcements: [] });
  }
}
