"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DoctorRegisterRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/register?role=doctor');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#05080d] flex items-center justify-center text-teal-400 text-sm font-semibold">
      Loading Doctor Registration Form...
    </div>
  );
}
