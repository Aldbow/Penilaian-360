'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';
import { motion, useReducedMotion } from 'framer-motion';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(username, password);

      if (success) {
        toast.success('Login berhasil!');
        // Redirect based on user role
        setTimeout(() => {
          router.push('/dashboard');
        }, 500);
      } else {
        toast.error('Username atau password salah');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat login');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-400/20 via-indigo-400/15 to-fuchsia-400/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-emerald-400/15 via-cyan-400/10 to-blue-400/15 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.55, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <Card className="relative overflow-hidden border-white/40 bg-white/60 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/6 via-transparent to-fuchsia-500/6" />
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-2xl font-semibold tracking-tight text-slate-900">
                Penilaian 360° BerAKHLAK
              </CardTitle>
              <CardDescription className="text-slate-600">
                UKPBJ - Unit Kerja Pengadaan Barang/Jasa
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-slate-700">
                    NIP/Username
                  </Label>
                  <Input
                    id="username"
                    placeholder="Masukkan NIP atau Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="h-11 rounded-xl border-white/40 bg-white/50 backdrop-blur"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 rounded-xl border-white/40 bg-white/50 backdrop-blur"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="h-11 w-full rounded-full shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  disabled={isLoading}
                >
                  <LogIn className="size-4" />
                  {isLoading ? 'Memproses...' : 'Login'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}