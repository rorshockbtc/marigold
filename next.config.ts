import type { NextConfig } from "next";
import path from "path";

const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.clerk.accounts.dev https://*.clerk.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://img.clerk.com https:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    connect-src 'self' https://*.clerk.accounts.dev https://*.clerk.com https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com;
    worker-src 'self' blob:;
    frame-src 'self' https://www.youtube.com https://youtube.com;
    upgrade-insecure-requests;
`;

const nextConfig: NextConfig = {
  // removed turbopack root override to prevent infinite loop / incorrect resolution
  async redirects() {
    return [
      {
        source: '/create-group',
        destination: '/explore-groups?create=true',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, ''),
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
