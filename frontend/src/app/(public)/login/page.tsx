"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { HeartPulse, Mail, Lock, ArrowRight, Loader2, User, Stethoscope } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/ThemeToggle';
import { toast } from '@/components/ui/toast';
import api from '@/lib/api';

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');

  // If already logged in once today, seamlessly bypass login without extra steps
  useEffect(() => {
    try {
      const token = localStorage.getItem('accessToken');
      const userRole = localStorage.getItem('userRole');
      if (token) {
        if (userRole === 'DOCTOR') {
          window.location.href = '/doctor/dashboard';
        } else if (userRole === 'ADMIN') {
          window.location.href = '/admin/dashboard';
        } else {
          window.location.href = '/patient/dashboard';
        }
      }
    } catch {}
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    try {
      const response = await api.post('/api/auth/login', data);
      const result = response.data;

      // Store credentials
      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('user', JSON.stringify(result.user));
      localStorage.setItem('userName', result.user?.fullName || result.user?.name || '');
      localStorage.setItem('userRole', result.user?.role || 'PATIENT');
      localStorage.setItem('userEmail', result.user?.email || '');

      // Redirect based on role
      const userRole = result.user?.role;
      if (userRole === 'ADMIN') window.location.href = '/admin/dashboard';
      else if (userRole === 'DOCTOR') window.location.href = '/doctor/dashboard';
      else window.location.href = '/patient/dashboard';
      
    } catch (error: any) {
      console.error(error);
      if (error.response) {
        toast.add({ title: 'Error', description: error.response.data.message || 'Login failed. Please check your credentials.', type: 'error' });
      } else {
        toast.add({ title: 'Error', description: 'Network error. Please make sure the backend server is running.', type: 'error' });
      }
      setIsLoading(false);
    }
  };

  const isDoctor = role === 'doctor';

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors">
      
      {/* Top Bar Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-6 relative z-10 my-8">
        
        {/* Logo Header */}
        <div className="flex flex-col items-center justify-center text-center">
          <Link href="/" className="flex items-center gap-2 mb-2 group">
            <div className="h-10 w-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md">
              <HeartPulse className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              HealthConnect <span className="text-teal-600 dark:text-teal-400">AI</span>
            </span>
          </Link>
          <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Sign in to access your consultations, prescriptions, and health records
          </p>
        </div>

        <Card className="shadow-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
          
          {/* Role Tabs */}
          <div className="grid grid-cols-2 p-2 bg-gray-100/80 dark:bg-slate-800/80 border-b border-gray-200 dark:border-slate-700 gap-1.5">
            <button
              type="button"
              onClick={() => setRole('patient')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                !isDoctor
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-sm'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              Patient Portal
            </button>
            <button
              type="button"
              onClick={() => setRole('doctor')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isDoctor
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-sm'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              Doctor Portal
            </button>
          </div>

          <CardContent className="pt-6 px-6 sm:px-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              <div className="space-y-2 text-left">
                <Label htmlFor="email" className="text-xs font-bold text-gray-700 dark:text-slate-300">
                  {isDoctor ? "Doctor Email Address" : "Patient Email Address"}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400 dark:text-slate-500" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder={isDoctor ? "healthcareantigravity1@gmail.com" : "john.doe@example.com"} 
                    className="pl-10 h-11 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500"
                    {...register('email')}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-bold text-gray-700 dark:text-slate-300">Password</Label>
                  <Link href="/forgot-password" className="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-700 font-medium">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400 dark:text-slate-500" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10 h-11 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white"
                    {...register('password')}
                  />
                </div>
                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold h-11 shadow-sm mt-4 cursor-pointer" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In as {isDoctor ? "Doctor" : "Patient"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center bg-gray-50/80 dark:bg-slate-800/60 py-4 border-t border-gray-100 dark:border-slate-800 rounded-b-2xl">
            <p className="text-xs text-gray-600 dark:text-slate-400">
              Don't have an account?{' '}
              <Link href="/register" className="font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700">
                Register as Patient or Doctor
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
