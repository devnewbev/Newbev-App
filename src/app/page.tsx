'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { initStore } from '@/lib/store';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    initStore();
    router.replace('/login');
  }, [router]);
  return null;
}
