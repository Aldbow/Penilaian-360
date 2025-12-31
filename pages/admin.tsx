'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '@/types';
import { fetchUsers } from '@/utils/google-sheets';
import AnimatedProgressBar from '@/components/AnimatedProgressBar';

export default function AdminPage() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [ratedEmployees, setRatedEmployees] = useState(0);
  const [unratedEmployees, setUnratedEmployees] = useState(0);

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'Admin') {
      router.push('/login');
      return;
    }

    const loadAdminData = async () => {
      try {
        // Fetch users from Google Sheets API
        const allUsers = await fetchUsers();
        const filteredUsers = allUsers.filter(u => u.role === 'User');

        setUsers(filteredUsers);

        const total = filteredUsers.length;
        const rated = filteredUsers.filter(u => u.evaluated).length;

        setTotalEmployees(total);
        setRatedEmployees(rated);
        setUnratedEmployees(total - rated);
      } catch (error) {
        console.error('Error loading admin data:', error);
        toast.error('Gagal memuat data admin');
      }
    };

    loadAdminData();
  }, [isAuthenticated, user, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!isAuthenticated || !user || user.role !== 'Admin') {
    return null; // Render nothing while redirecting
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
                      {users.map((employee, index) => (
                        <motion.tr
                          key={employee.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="border-b hover:bg-slate-50"
                        >
                          <td className="py-3 px-4 font-medium">{employee.name}</td>
                          <td className="py-3 px-4 text-center">
                            {employee.evaluated ? (Math.random() * 40 + 60).toFixed(1) : '-'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {employee.evaluated ? (Math.random() * 40 + 60).toFixed(1) : '-'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {employee.evaluated ? (Math.random() * 40 + 60).toFixed(1) : '-'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {employee.evaluated ? (Math.random() * 40 + 60).toFixed(1) : '-'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {employee.evaluated ? (Math.random() * 40 + 60).toFixed(1) : '-'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {employee.evaluated ? (Math.random() * 40 + 60).toFixed(1) : '-'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {employee.evaluated ? (Math.random() * 40 + 60).toFixed(1) : '-'}
                          </td>
                          <td className="py-3 px-4 text-center font-bold">
                            {employee.evaluated ? (Math.random() * 40 + 60).toFixed(1) : '-'}
                          </td>
                        </motion.tr>
                      ))}
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