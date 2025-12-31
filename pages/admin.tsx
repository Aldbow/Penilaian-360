'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Assessment } from '@/types/supabase';
import { fetchUsers as fetchSupabaseUsers, fetchAssessmentResults } from '@/utils/supabase';
import AnimatedProgressBar from '@/components/AnimatedProgressBar';

export default function AdminPage() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
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

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Dashboard Admin</h1>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Progress Overview */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Monitoring Progres</CardTitle>
              <CardDescription>
                Status penilaian pegawai UKPBJ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-blue-700">{totalEmployees}</div>
                  <div className="text-slate-600">Total Pegawai</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-green-700">{ratedEmployees}</div>
                  <div className="text-slate-600">Sudah Dinilai</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-yellow-700">{unratedEmployees}</div>
                  <div className="text-slate-600">Belum Dinilai</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Table */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Hasil Penilaian</CardTitle>
              <CardDescription>
                Rata-rata penilaian untuk setiap pegawai (anonim)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Nama Pegawai</th>
                      <th className="text-center py-2 px-4">Pelayanan</th>
                      <th className="text-center py-2 px-4">Akuntabel</th>
                      <th className="text-center py-2 px-4">Kompeten</th>
                      <th className="text-center py-2 px-4">Harmonis</th>
                      <th className="text-center py-2 px-4">Loyal</th>
                      <th className="text-center py-2 px-4">Adaptif</th>
                      <th className="text-center py-2 px-4">Kolaboratif</th>
                      <th className="text-center py-2 px-4">Rata-rata</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {users.map((employee, index) => {
                        const scores = calculateEmployeeScores(employee.id);
                        return (
                          <motion.tr
                            key={employee.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="border-b hover:bg-slate-50"
                          >
                            <td className="py-3 px-4 font-medium">{employee.name}</td>
                            <td className="py-3 px-4 text-center">{scores.pelayanan}</td>
                            <td className="py-3 px-4 text-center">{scores.akuntabel}</td>
                            <td className="py-3 px-4 text-center">{scores.kompeten}</td>
                            <td className="py-3 px-4 text-center">{scores.harmonis}</td>
                            <td className="py-3 px-4 text-center">{scores.loyal}</td>
                            <td className="py-3 px-4 text-center">{scores.adaptif}</td>
                            <td className="py-3 px-4 text-center">{scores.kolaboratif}</td>
                            <td className="py-3 px-4 text-center font-bold">{scores.average}</td>
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
      </div>
    </div>
  );
}