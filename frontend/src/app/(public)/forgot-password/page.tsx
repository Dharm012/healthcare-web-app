'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HeartPulse, ArrowLeft } from 'lucide-react';
import { toast } from '@/components/ui/toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.add({
      title: 'Coming Soon',
      description: 'Password reset functionality will be available soon.',
      type: 'info'
    });
  };

  return (
    <div className="min-h-screen bg-[#05080d] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center items-center gap-2 mb-6 group">
          <HeartPulse className="h-8 w-8 text-teal-500 group-hover:scale-110 transition-transform" />
          <span className="text-2xl font-bold text-white tracking-tight">CareConnect</span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Or{' '}
          <Link href="/login" className="font-medium text-teal-400 hover:text-teal-300">
            return to login
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#0f172a] py-8 px-4 shadow-xl shadow-teal-900/10 sm:rounded-xl sm:px-10 border border-slate-800">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-700 rounded-lg shadow-sm placeholder-gray-500 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-slate-800/50 text-white"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 focus:ring-offset-slate-900 transition-colors"
              >
                Send Reset Link
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
