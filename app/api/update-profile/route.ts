
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('[API] Mock GET request');
  
  try {
    return NextResponse.json({ 
      success: true,
      message: "Using local data only - no database connection"
    });
  } catch (error) {
    console.error('[API] Error in mock endpoint:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to process request',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log('[API] Mock POST request');
  
  try {
    return NextResponse.json({ 
      success: true, 
      message: 'Using local data only - no database connection'
    });
  } catch (error) {
    console.error('[API] Error in mock endpoint:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to process request',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  console.log('[API] Mock PUT request');
  
  try {
    return NextResponse.json({ 
      success: true, 
      message: 'Using local data only - no database connection'
    });
  } catch (error) {
    console.error('[API] Error in mock endpoint:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to process request',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  console.log('[API] Mock DELETE request');
  
  try {
    return NextResponse.json({ 
      success: true, 
      message: 'Using local data only - no database connection'
    });
  } catch (error) {
    console.error('[API] Error in mock endpoint:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to process request',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
