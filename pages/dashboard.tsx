'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { LogOut, Users, CheckCircle2, ArrowRight } from 'lucide-react';
import { User } from '@/types/supabase';
import { fetchUsers, fetchUserAssessments } from '@/utils/supabase';
import AnimatedProgressBar from '@/components/AnimatedProgressBar';

export default function DashboardPage() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [users, setUsers] = useState<User[]>([]);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [ratedUserIds, setRatedUserIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }

    const loadData = async () => {
      try {
        setIsLoading(true);

        // Fetch users and assessments
        const usersData = await fetchUsers(user.id, user.role);
        const assessments = await fetchUserAssessments(user.id);

        setUsers(usersData);
        setRatedUserIds(assessments);

        // Calculate progress
        const totalUsers = usersData.length;
        const completed = assessments.length;
        const progressPercent = totalUsers > 0 ? (completed / totalUsers) * 100 : 0;

        setProgress(progressPercent);
        setProgressText(`${completed} dari ${totalUsers} rekan kerja dinilai`);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast.error('Gagal memuat data pegawai');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, user, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleRateUser = (userId: string) => {
    // Prevent admin from accessing rating pages
    if (user && user.role === 'Admin') {
      router.push('/admin');
      return;
    }
    router.push(`/rating/${userId}`);
  };

  if (!isAuthenticated || !user) {
    return null; // Render nothing while redirecting
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  const totalUsers = users.length;
  const completed = ratedUserIds.length;
  const remaining = Math.max(0, totalUsers - completed);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: shouldReduceMotion
        ? { duration: 0 }
        : { staggerChildren: 0.07, delayChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: shouldReduceMotion ? { duration: 0 } : { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-400/20 via-indigo-400/15 to-fuchsia-400/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-emerald-400/15 via-cyan-400/10 to-blue-400/15 blur-3xl" />
      </div>

      <div className="relative px-4 py-6 md:px-8 md:py-10">
        <div className="mx-auto max-w-6xl">
          <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                Dashboard Penilaian
              </h1>
              <p className="text-sm text-slate-600 md:text-base">
                Pantau progres dan lanjutkan penilaian rekan kerja.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="rounded-full bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/40 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <LogOut className="size-4" />
                Logout
              </Button>
            </div>
          </header>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="mt-8 grid grid-cols-1 gap-4 md:mt-10 md:grid-cols-6 md:gap-6"
          >
            <motion.div variants={itemVariants} className="md:col-span-4">
              <Card className="relative overflow-hidden border-white/40 bg-white/60 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-fuchsia-500/5" />
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">Progres Penilaian</CardTitle>
                  <CardDescription>Progres penilaian terhadap rekan kerja</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-sm text-slate-700">
                        <span className="font-medium text-slate-900">{progressText}</span>
                      </div>
                      <div className="text-sm font-semibold text-slate-900">
                        {Math.round(progress)}%
                      </div>
                    </div>
                    <AnimatedProgressBar
                      value={progress}
                      label={`${Math.round(progress)}%`}
                      className="bg-slate-200/70"
                    />
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <div className="rounded-2xl border border-white/40 bg-white/50 px-3 py-3">
                        <div className="text-xs text-slate-600">Total</div>
                        <div className="mt-1 text-base font-semibold text-slate-900">{totalUsers}</div>
                      </div>
                      <div className="rounded-2xl border border-white/40 bg-white/50 px-3 py-3">
                        <div className="text-xs text-slate-600">Selesai</div>
                        <div className="mt-1 text-base font-semibold text-slate-900">{completed}</div>
                      </div>
                      <div className="rounded-2xl border border-white/40 bg-white/50 px-3 py-3">
                        <div className="text-xs text-slate-600">Tersisa</div>
                        <div className="mt-1 text-base font-semibold text-slate-900">{remaining}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants} className="md:col-span-2">
              <Card className="h-full border-white/40 bg-white/60 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">Ringkasan</CardTitle>
                  <CardDescription>Informasi cepat untuk hari ini</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-2xl border border-slate-200/60 bg-white/50 px-4 py-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                        <Users className="size-4 text-slate-600" />
                        Pegawai
                      </div>
                      <div className="text-sm font-semibold text-slate-900">{totalUsers}</div>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-emerald-200/60 bg-emerald-50/60 px-4 py-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-emerald-900">
                        <CheckCircle2 className="size-4 text-emerald-700" />
                        Dinilai
                      </div>
                      <div className="text-sm font-semibold text-emerald-900">{completed}</div>
                    </div>
                    <div className="rounded-2xl border border-white/40 bg-gradient-to-br from-slate-900 to-slate-800 px-4 py-4 text-white shadow-sm">
                      <div className="text-xs/5 text-white/70">Langkah berikutnya</div>
                      <div className="mt-1 text-sm font-semibold">
                        {user?.role === 'Admin'
                          ? 'Buka halaman Admin untuk manajemen data.'
                          : remaining > 0
                            ? 'Lanjutkan penilaian rekan kerja yang belum dinilai.'
                            : 'Semua penilaian selesai. Terima kasih!'}
                      </div>
                      {user?.role !== 'Admin' && remaining > 0 && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-white/80">
                          <span>Scroll ke bawah untuk memilih pegawai</span>
                          <ArrowRight className="size-3" />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants} className="md:col-span-6">
              <Card className="border-white/40 bg-white/60 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
                <CardHeader className="space-y-2 md:flex-row md:items-end md:justify-between md:space-y-0">
                  <div className="space-y-1">
                    <CardTitle className="text-lg md:text-xl">Daftar Rekan Kerja</CardTitle>
                    <CardDescription>
                      {user?.role === 'Admin'
                        ? 'Admin tidak dapat mengakses halaman penilaian.'
                        : 'Klik pada pegawai untuk memberikan penilaian.'}
                    </CardDescription>
                  </div>
                  <div className="text-xs font-medium text-slate-600">
                    {completed}/{totalUsers} selesai
                  </div>
                </CardHeader>
                <CardContent>
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.2 }}
                    className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
                  >
                    <AnimatePresence>
                      {users.map((employee) => {
                        const isRated = ratedUserIds.includes(employee.id);
                        const canInteract = user?.role !== 'Admin' && !isRated;

                        return (
                          <motion.div
                            key={employee.id}
                            variants={itemVariants}
                            initial="hidden"
                            animate="show"
                            exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
                            whileHover={
                              canInteract && !shouldReduceMotion
                                ? { scale: 1.01, y: -2 }
                                : undefined
                            }
                            whileTap={canInteract && !shouldReduceMotion ? { scale: 0.99 } : undefined}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                            role={canInteract ? 'button' : undefined}
                            tabIndex={canInteract ? 0 : -1}
                            aria-disabled={!canInteract}
                            className={
                              canInteract
                                ? 'cursor-pointer rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50'
                                : ''
                            }
                            onClick={() => canInteract && handleRateUser(employee.id)}
                            onKeyDown={(e) => {
                              if (!canInteract) return;
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleRateUser(employee.id);
                              }
                            }}
                          >
                            <Card
                              className={
                                `group relative overflow-hidden border transition-all duration-300 ` +
                                (isRated
                                  ? 'border-emerald-200/70 bg-emerald-50/60'
                                  : 'border-white/40 bg-white/60 hover:bg-white/70 hover:shadow-md')
                              }
                            >
                              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 via-transparent to-fuchsia-500/8" />
                              </div>
                              <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                  <div
                                    className={
                                      `flex size-12 items-center justify-center rounded-2xl text-sm font-semibold ring-1 ring-inset transition-all duration-300 ` +
                                      (isRated
                                        ? 'bg-emerald-100 text-emerald-900 ring-emerald-200/70'
                                        : 'bg-blue-100 text-blue-900 ring-blue-200/70 group-hover:bg-blue-200')
                                    }
                                  >
                                    {employee.name.charAt(0)}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                      <h3 className="truncate text-sm font-semibold text-slate-900 md:text-[15px]">
                                        {employee.name}
                                      </h3>
                                      <span
                                        className={
                                          `shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset ` +
                                          (isRated
                                            ? 'bg-emerald-100/70 text-emerald-900 ring-emerald-200/70'
                                            : 'bg-slate-100/70 text-slate-800 ring-slate-200/70')
                                        }
                                      >
                                        {isRated ? 'Sudah Dinilai' : 'Belum Dinilai'}
                                      </span>
                                    </div>
                                    <p className="mt-1 truncate text-sm text-slate-600">{employee.position}</p>
                                    {canInteract && (
                                      <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-blue-700">
                                        Mulai penilaian
                                        <ArrowRight className="size-3 transition-transform duration-300 group-hover:translate-x-0.5" />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}