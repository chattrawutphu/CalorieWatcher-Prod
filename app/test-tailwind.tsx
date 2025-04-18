"use client";

import React, { useEffect } from "react";

export default function TestTailwind() {
  useEffect(() => {
    // Check if Tailwind styles are being applied
    const testElement = document.createElement('div');
    testElement.className = 'hidden';
    document.body.appendChild(testElement);
    
    const styles = window.getComputedStyle(testElement);
    const isHidden = styles.display === 'none';
    
    console.log('Tailwind "hidden" class working:', isHidden);
    console.log('CSS Variables:', {
      background: getComputedStyle(document.documentElement).getPropertyValue('--background'),
      primary: getComputedStyle(document.documentElement).getPropertyValue('--primary'),
    });
    
    document.body.removeChild(testElement);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[hsl(var(--background))]">
      <h1 className="text-4xl font-bold text-[hsl(var(--foreground))]">Tailwind Test Page</h1>
      
      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="p-6 rounded-lg bg-[hsl(var(--primary))]">
          <p className="text-[hsl(var(--primary-foreground))]">Primary Color Block</p>
        </div>
        <div className="p-6 rounded-lg bg-[hsl(var(--secondary))]">
          <p className="text-[hsl(var(--secondary-foreground))]">Secondary Color Block</p>
        </div>
        <div className="p-6 rounded-lg bg-[hsl(var(--accent))]">
          <p className="text-[hsl(var(--accent-foreground))]">Accent Color Block</p>
        </div>
        <div className="p-6 rounded-lg bg-[hsl(var(--muted))]">
          <p className="text-[hsl(var(--muted-foreground))]">Muted Color Block</p>
        </div>
      </div>
      
      <div className="mt-8">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          If you can see properly styled colored blocks above, then Tailwind CSS is working correctly.
        </p>
      </div>
      
      <div className="mt-4 flex space-x-4">
        <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          Direct Tailwind Class Button
        </button>
        <button className="px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-md hover:bg-[hsl(var(--primary))/0.8]">
          CSS Variable Button
        </button>
      </div>

      {/* Test standard Tailwind classes */}
      <div className="mt-8 p-4 bg-red-500 text-white rounded-lg">
        Direct Tailwind Color Class
      </div>
    </div>
  );
} 