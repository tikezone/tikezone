'use client';

// Bridge file to keep existing imports while using Next.js navigation primitives.
export { useRouter, usePathname, useSearchParams } from 'next/navigation';
export { default as Link } from 'next/link';
