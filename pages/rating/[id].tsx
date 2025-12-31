'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Rating } from '@/types';
import { saveAssessment, updateUserEvaluationStatus } from '@/utils/google-sheets';
import StarRating from '@/components/StarRating';

export default function RatingPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [targetUser, setTargetUser] = useState<{ id: string; name: string } | null>(null);
  const [ratings, setRatings] = useState<Partial<Rating>>({
    pelayanan: 0,
    akuntabel: 0,
    kompeten: 0,
    harmonis: 0,
    loyal: 0,
    adaptif: 0,
    kolaboratif: 0
  });
  const [descriptions, setDescriptions] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!params.id) {
      router.push('/dashboard');
      return;
    }

    // Find target user (in real app, this would come from API)
    const mockUsers = [
      { id: '002', name: 'Budi Santoso' },
      { id: '003', name: 'Siti Aminah' },
      { id: '004', name: 'Ahmad Fauzi' },
      { id: '005', name: 'Rina Kusuma' },
    ];

    const foundUser = mockUsers.find(u => u.id === params.id as string);
    if (foundUser) {
      setTargetUser(foundUser);
    } else {
      router.push('/dashboard');
    }
  }, [isAuthenticated, params.id, router]);

  const handleStarClick = (aspect: keyof Rating, value: number) => {
    setRatings(prev => ({ ...prev, [aspect]: value }));
    
    // Update description based on selected value
    const desc = getRatingDescription(aspect, value);
    setDescriptions(prev => ({ ...prev, [aspect]: desc }));
  };

  const getRatingDescription = (aspect: keyof Rating, value: number): string => {
    const descriptionsMap: Record<string, string[]> = {
      pelayanan: [
        'Sangat Kurang: Tidak responsif terhadap kebutuhan pelayanan',
        'Kurang: Responsif namun terbatas dalam pelayanan',
        'Butuh Perbaikan: Cukup responsif terhadap kebutuhan pelayanan',
        'Baik: Responsif dan proaktif dalam pelayanan',
        'Sangat Baik: Sangat responsif dan inovatif dalam pelayanan'
      ],
      akuntabel: [
        'Sangat Kurang: Tidak bertanggung jawab atas tugasnya',
        'Kurang: Kadang-kadang bertanggung jawab atas tugasnya',
        'Butuh Perbaikan: Bertanggung jawab namun perlu pengawasan',
        'Baik: Bertanggung jawab atas tugasnya',
        'Sangat Baik: Sangat bertanggung jawab dan transparan'
      ],
      kompeten: [
        'Sangat Kurang: Tidak memiliki kompetensi yang diperlukan',
        'Kurang: Kompetensi dasar namun perlu banyak bimbingan',
        'Butuh Perbaikan: Memiliki kompetensi dasar',
        'Baik: Kompeten dalam bidangnya',
        'Sangat Baik: Sangat kompeten dan menjadi referensi'
      ],
      harmonis: [
        'Sangat Kurang: Sering menimbulkan konflik',
        'Kurang: Kadang-kadang tidak harmonis dalam tim',
        'Butuh Perbaikan: Cukup harmonis dalam tim',
        'Baik: Harmonis dalam bekerja sama',
        'Sangat Baik: Mampu menciptakan harmoni dalam tim'
      ],
      loyal: [
        'Sangat Kurang: Tidak loyal terhadap organisasi',
        'Kurang: Loyaltas yang lemah terhadap organisasi',
        'Butuh Perbaikan: Cukup loyal terhadap organisasi',
        'Baik: Loyal terhadap organisasi',
        'Sangat Baik: Sangat loyal dan membanggakan organisasi'
      ],
      adaptif: [
        'Sangat Kurang: Tidak mampu beradaptasi dengan perubahan',
        'Kurang: Lambat dalam beradaptasi dengan perubahan',
        'Butuh Perbaikan: Cukup mampu beradaptasi dengan perubahan',
        'Baik: Mampu beradaptasi dengan perubahan',
        'Sangat Baik: Sangat cepat dan inovatif dalam beradaptasi'
      ],
      kolaboratif: [
        'Sangat Kurang: Tidak mampu bekerja sama',
        'Kurang: Kadang-kadang bekerja sama',
        'Butuh Perbaikan: Cukup mampu bekerja sama',
        'Baik: Mampu bekerja sama dengan baik',
        'Sangat Baik: Sangat kolaboratif dan membangun tim'
      ]
    };

    return descriptionsMap[aspect][value - 1] || 'Pilih jumlah bintang untuk melihat deskripsi...';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all ratings are completed
    if (Object.values(ratings).some(rating => !rating || rating <= 0)) {
      toast.error('Mohon lengkapi semua aspek penilaian');
      return;
    }

    setIsSubmitting(true);

    try {
      // Save assessment to Google Sheets
      if (user && targetUser) {
        const success = await saveAssessment({
          targetId: targetUser.id,
          evaluatorId: user.id,
          ratings: ratings as Rating
        });

        if (success) {
          // Update user evaluation status
          await updateUserEvaluationStatus(targetUser.id, true);
          toast.success('Penilaian berhasil dikirim!');

          // Redirect back to dashboard after a delay
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        } else {
          throw new Error('Failed to save assessment');
        }
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Gagal mengirim penilaian. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (aspect: keyof Rating) => {
    return (
      <div className="mb-2">
        <StarRating
          value={ratings[aspect] || 0}
          onChange={(value) => handleStarClick(aspect, value)}
          size={32}
        />
      </div>
    );
  };

  if (!isAuthenticated || !user || !targetUser) {
    return null; // Render nothing while redirecting
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <Button onClick={() => router.push('/dashboard')} variant="outline">
            ← Kembali ke Dashboard
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Penilaian Pegawai</h1>
          <div className="w-24"></div> {/* Spacer for alignment */}
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-md">
            <CardHeader className="text-center">
              <CardTitle>Penilaian untuk {targetUser.name}</CardTitle>
              <CardDescription>
                Berikan penilaian untuk 7 aspek BerAKHLAK
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-8">
                <div className="space-y-6">
                  {/* Berorientasi Pelayanan */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-3 text-slate-700">Berorientasi Pelayanan</h3>
                    {renderStars('pelayanan')}
                    <p className="text-sm text-slate-600 italic min-h-[2rem]">
                      {descriptions.pelayanan || 'Pilih jumlah bintang untuk melihat deskripsi...'}
                    </p>
                  </div>

                  {/* Akuntabel */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-3 text-slate-700">Akuntabel</h3>
                    {renderStars('akuntabel')}
                    <p className="text-sm text-slate-600 italic min-h-[2rem]">
                      {descriptions.akuntabel || 'Pilih jumlah bintang untuk melihat deskripsi...'}
                    </p>
                  </div>

                  {/* Kompeten */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-3 text-slate-700">Kompeten</h3>
                    {renderStars('kompeten')}
                    <p className="text-sm text-slate-600 italic min-h-[2rem]">
                      {descriptions.kompeten || 'Pilih jumlah bintang untuk melihat deskripsi...'}
                    </p>
                  </div>

                  {/* Harmonis */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-3 text-slate-700">Harmonis</h3>
                    {renderStars('harmonis')}
                    <p className="text-sm text-slate-600 italic min-h-[2rem]">
                      {descriptions.harmonis || 'Pilih jumlah bintang untuk melihat deskripsi...'}
                    </p>
                  </div>

                  {/* Loyal */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-3 text-slate-700">Loyal</h3>
                    {renderStars('loyal')}
                    <p className="text-sm text-slate-600 italic min-h-[2rem]">
                      {descriptions.loyal || 'Pilih jumlah bintang untuk melihat deskripsi...'}
                    </p>
                  </div>

                  {/* Adaptif */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-3 text-slate-700">Adaptif</h3>
                    {renderStars('adaptif')}
                    <p className="text-sm text-slate-600 italic min-h-[2rem]">
                      {descriptions.adaptif || 'Pilih jumlah bintang untuk melihat deskripsi...'}
                    </p>
                  </div>

                  {/* Kolaboratif */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-3 text-slate-700">Kolaboratif</h3>
                    {renderStars('kolaboratif')}
                    <p className="text-sm text-slate-600 italic min-h-[2rem]">
                      {descriptions.kolaboratif || 'Pilih jumlah bintang untuk melihat deskripsi...'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-center pt-4">
                  <Button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Mengirim...' : 'Kirim Penilaian'}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}