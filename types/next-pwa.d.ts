declare module 'next-pwa' {
  import { NextConfig } from 'next';
  
  interface PWAConfig {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    scope?: string;
    sw?: string;
    skipWaiting?: boolean;
  }
  
  export type WithPWAOptions = PWAConfig;
  
  export default function withPWA(options?: WithPWAOptions): 
    (nextConfig?: NextConfig) => NextConfig;
} 