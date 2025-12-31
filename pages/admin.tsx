'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { LogOut, Users, CheckCircle2, Clock } from 'lucide-react';
import { User, Assessment } from '@/types/supabase';
import { fetchUsers, fetchAssessmentResults } from '@/utils/supabase';

export default function AdminPage() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [users, setUsers] = useState<User[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [ratedEmployees, setRatedEmployees] = useState(0);
  const [unratedEmployees, setUnratedEmployees] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'Admin') {
      router.push('/login');
      return;
    }

    const loadAdminData = async () => {
      try {
        setIsLoading(true);

        // Fetch users and assessments from Supabase
        const usersData = await fetchUsers(user.id, user.role);
        const assessmentsData = await fetchAssessmentResults();

        setUsers(usersData);
        setAssessments(assessmentsData);

        // Calculate statistics
        const total = usersData.length;

        // Count unique targets that have been assessed
        const uniqueTargets = new Set(assessmentsData.map(a => a.target_id));
        const rated = uniqueTargets.size;

        setTotalEmployees(total);
        setRatedEmployees(rated);
        setUnratedEmployees(total - rated);
      } catch (error) {
        console.error('Error loading admin data:', error);
        toast.error('Gagal memuat data admin');
      } finally {
        setIsLoading(false);
      }
    };

    loadAdminData();
  }, [isAuthenticated, user, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Calculate average scores for each employee
  const calculateEmployeeScores = (employeeId: string) => {
    const employeeAssessments = assessments.filter(a => a.target_id === employeeId);

    if (employeeAssessments.length === 0) {
      return {
        pelayanan: '-',
        akuntabel: '-',
        kompeten: '-',
        harmonis: '-',
        loyal: '-',
        adaptif: '-',
        kolaboratif: '-',
        average: '-'
      };
    }

    const sum = {
      pelayanan: employeeAssessments.reduce((sum, a) => sum + a.pelayanan, 0),
      akuntabel: employeeAssessments.reduce((sum, a) => sum + a.akuntabel, 0),
      kompeten: employeeAssessments.reduce((sum, a) => sum + a.kompeten, 0),
      harmonis: employeeAssessments.reduce((sum, a) => sum + a.harmonis, 0),
      loyal: employeeAssessments.reduce((sum, a) => sum + a.loyal, 0),
      adaptif: employeeAssessments.reduce((sum, a) => sum + a.adaptif, 0),
      kolaboratif: employeeAssessments.reduce((sum, a) => sum + a.kolaboratif, 0)
    };

    const count = employeeAssessments.length;
    const avg = {
      pelayanan: (sum.pelayanan / count).toFixed(1),
      akuntabel: (sum.akuntabel / count).toFixed(1),
      kompeten: (sum.kompeten / count).toFixed(1),
      harmonis: (sum.harmonis / count).toFixed(1),
      loyal: (sum.loyal / count).toFixed(1),
      adaptif: (sum.adaptif / count).toFixed(1),
      kolaboratif: (sum.kolaboratif / count).toFixed(1)
    };

    const overallAvg = (
      (parseFloat(avg.pelayanan) +
       parseFloat(avg.akuntabel) +
       parseFloat(avg.kompeten) +
       parseFloat(avg.harmonis) +
       parseFloat(avg.loyal) +
       parseFloat(avg.adaptif) +
       parseFloat(avg.kolaboratif)) / 7
    ).toFixed(1);

    return {
      ...avg,
      average: overallAvg
    };
  };

  if (!isAuthenticated || !user || user.role !== 'Admin') {
    return null; // Render nothing while redirecting
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Memuat data admin...</p>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: shouldReduceMotion
        ? { duration: 0 }
        : { staggerChildren: 0.08, delayChildren: 0.05 },
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
        <div className="mx-auto max-w-7xl">
          <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                Dashboard Admin
              </h1>
              <p className="text-sm text-slate-600 md:text-base">
                Monitoring progres dan hasil penilaian (anonim).
              </p>
            </div>

            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-fit rounded-full bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/40 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <LogOut className="size-4" />
              Logout
            </Button>
          </header>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="mt-8 grid grid-cols-1 gap-4 md:mt-10 md:grid-cols-6 md:gap-6"
          >
            <motion.div variants={itemVariants} className="md:col-span-6">
              <Card className="relative overflow-hidden border-white/40 bg-white/60 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/6 via-transparent to-fuchsia-500/6" />
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">Monitoring Progres</CardTitle>
                  <CardDescription>Status penilaian pegawai UKPBJ</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/40 bg-white/50 px-4 py-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                          <Users className="size-4 text-slate-600" />
                          Total Pegawai
                        </div>
                        <div className="text-sm font-semibold text-slate-900">{totalEmployees}</div>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/60 px-4 py-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium text-emerald-900">
                          <CheckCircle2 className="size-4 text-emerald-700" />
                          Sudah Dinilai
                        </div>
                        <div className="text-sm font-semibold text-emerald-900">{ratedEmployees}</div>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-amber-200/60 bg-amber-50/60 px-4 py-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium text-amber-900">
                          <Clock className="size-4 text-amber-700" />
                          Belum Dinilai
                        </div>
                        <div className="text-sm font-semibold text-amber-900">{unratedEmployees}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants} className="md:col-span-6">
              <Card className="border-white/40 bg-white/60 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">Hasil Penilaian</CardTitle>
                  <CardDescription>Rata-rata penilaian untuk setiap pegawai (anonim)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto rounded-2xl border border-white/40 bg-white/40">
                    <table className="w-full min-w-[980px]">
                      <thead className="bg-slate-900 text-white">
                        <tr>
                          <th className="text-left py-4 px-6 rounded-l-2xl text-xs font-semibold tracking-wide text-white/80">Nama Pegawai</th>
                          <th className="text-center py-4 px-4 text-xs font-semibold tracking-wide text-white/80">Pelayanan</th>
                          <th className="text-center py-4 px-4 text-xs font-semibold tracking-wide text-white/80">Akuntabel</th>
                          <th className="text-center py-4 px-4 text-xs font-semibold tracking-wide text-white/80">Kompeten</th>
                          <th className="text-center py-4 px-4 text-xs font-semibold tracking-wide text-white/80">Harmonis</th>
                          <th className="text-center py-4 px-4 text-xs font-semibold tracking-wide text-white/80">Loyal</th>
                          <th className="text-center py-4 px-4 text-xs font-semibold tracking-wide text-white/80">Adaptif</th>
                          <th className="text-center py-4 px-4 text-xs font-semibold tracking-wide text-white/80">Kolaboratif</th>
                          <th className="text-center py-4 px-6 rounded-r-2xl text-xs font-semibold tracking-wide text-white/80">Rata-rata</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/50">
                        <AnimatePresence>
                          {users.map((employee, index) => {
                            const scores = calculateEmployeeScores(employee.id);
                            return (
                              <motion.tr
                                key={employee.id}
                                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.1 }}
                                exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -12 }}
                                transition={
                                  shouldReduceMotion
                                    ? { duration: 0 }
                                    : { duration: 0.35, ease: 'easeOut', delay: index * 0.02 }
                                }
                                className="bg-white/40 hover:bg-white/60 transition-colors"
                              >
                                <td className="py-4 px-6 font-medium text-slate-900">{employee.name}</td>
                                <td className="py-4 px-4 text-center font-medium text-slate-700">{scores.pelayanan}</td>
                                <td className="py-4 px-4 text-center font-medium text-slate-700">{scores.akuntabel}</td>
                                <td className="py-4 px-4 text-center font-medium text-slate-700">{scores.kompeten}</td>
                                <td className="py-4 px-4 text-center font-medium text-slate-700">{scores.harmonis}</td>
                                <td className="py-4 px-4 text-center font-medium text-slate-700">{scores.loyal}</td>
                                <td className="py-4 px-4 text-center font-medium text-slate-700">{scores.adaptif}</td>
                                <td className="py-4 px-4 text-center font-medium text-slate-700">{scores.kolaboratif}</td>
                                <td className="py-4 px-6 text-center font-semibold text-slate-900">{scores.average}</td>
                              </motion.tr>
                            );
                          })}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}