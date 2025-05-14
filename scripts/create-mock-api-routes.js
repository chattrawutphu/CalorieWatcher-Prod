const fs = require('fs');
const path = require('path');

const mockGETResponse = `
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
`;

// Function to walk through directories recursively
function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

// Main function to replace API route files
function createMockApiRoutes() {
  const apiDir = path.join(process.cwd(), 'app', 'api');
  
  // Skip if API directory doesn't exist
  if (!fs.existsSync(apiDir)) {
    console.log('No API directory found. Skipping mock creation.');
    return;
  }
  
  let replacedCount = 0;
  
  // Process each route.ts file
  walkDir(apiDir, (filePath) => {
    if (filePath.endsWith('route.ts') || filePath.endsWith('route.js')) {
      console.log(`Converting to mock: ${filePath}`);
      fs.writeFileSync(filePath, mockGETResponse, 'utf8');
      replacedCount++;
    }
  });
  
  console.log(`Completed! Replaced ${replacedCount} API route files with mock versions.`);
}

// Run the function
createMockApiRoutes(); 