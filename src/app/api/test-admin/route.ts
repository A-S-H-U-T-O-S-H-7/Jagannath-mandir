// app/api/test-admin/route.ts
import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';

export async function GET() {
  try {
    // Try to list users (will fail if SDK not working)
    const listUsersResult = await adminAuth.listUsers(1);
    return NextResponse.json({ 
      success: true, 
      message: 'Admin SDK is working!',
      userCount: listUsersResult.users.length 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}