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

export default function DashboardPage() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const loadUsers = async () => {
      try {
        // Fetch users from Google Sheets API
        const allUsers = await fetchUsers();
        const filteredUsers = allUsers.filter(u => u.role === 'User');

        setUsers(filteredUsers);

        // Calculate progress
        const totalUsers = filteredUsers.length;
        const ratedUsers = filteredUsers.filter(u => u.evaluated).length;
        const progressPercent = totalUsers > 0 ? (ratedUsers / totalUsers) * 100 : 0;

        setProgress(progressPercent);
        setProgressText(`${ratedUsers} dari ${totalUsers} rekan kerja dinilai`);
      } catch (error) {
        console.error('Error loading users:', error);
        toast.error('Gagal memuat data pegawai');
      }
    };

    loadUsers();
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleRateUser = (userId: string) => {
    router.push(`/rating/${userId}`);
  };

  if (!isAuthenticated || !user) {
    return null; // Render nothing while redirecting
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Dashboard Penilaian</h1>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-8 shadow-md">
            <CardHeader>
              <CardTitle>Progres Penilaian</CardTitle>
              <CardDescription>
                Progres penilaian terhadap rekan kerja
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{progressText}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <AnimatedProgressBar value={progress} label={`${Math.round(progress)}%`} />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Daftar Rekan Kerja</CardTitle>
              <CardDescription>
                Klik pada pegawai untuk memberikan penilaian
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {users
                    .filter(u => u.role === 'User' && u.id !== user.id) // Exclude current user
                    .map((employee) => (
                      <motion.div
                        key={employee.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        whileHover={{ y: -5 }}
                        className="cursor-pointer"
                        onClick={() => !employee.evaluated && handleRateUser(employee.id)}
                      >
                        <Card className={`border-2 ${
                          employee.evaluated 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
                        } transition-all duration-200`}>
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-4">
                              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center text-blue-800 font-bold">
                                {employee.name.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-slate-800 truncate">{employee.name}</h3>
                                <p className="text-sm text-slate-600 truncate">{employee.position}</p>
                                <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                                  employee.evaluated 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-slate-100 text-slate-800'
                                }`}>
                                  {employee.evaluated ? 'Sudah Dinilai' : 'Belum Dinilai'}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}