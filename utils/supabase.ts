// utils/supabase.ts
import { supabase } from '@/lib/supabase';
import { User, Assessment, Rating } from '@/types/supabase';

// Fungsi untuk mengambil semua pengguna (kecuali admin jika bukan admin)
export const fetchUsers = async (currentUserId: string, currentUserRole: string): Promise<User[]> => {
  try {
    let query = supabase
      .from('users')
      .select('id, username, name, role, position')
      .neq('role', 'Admin'); // Jangan tampilkan admin di daftar pengguna

    // Jika pengguna adalah user biasa, jangan tampilkan dirinya sendiri
    if (currentUserRole === 'User') {
      query = query.neq('id', currentUserId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchUsers:', error);
    throw error;
  }
};

// Fungsi untuk mengambil penilaian yang sudah diberikan oleh pengguna
export const fetchUserAssessments = async (userId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('assessments')
      .select('target_id')
      .eq('evaluator_id', userId);

    if (error) {
      console.error('Error fetching user assessments:', error);
      throw error;
    }

    return data ? data.map(item => item.target_id) : [];
  } catch (error) {
    console.error('Error in fetchUserAssessments:', error);
    throw error;
  }
};

// Fungsi untuk menyimpan penilaian
export const saveAssessment = async (assessmentData: {
  evaluator_id: string;
  target_id: string;
  ratings: Rating;
}): Promise<boolean> => {
  try {
    const { evaluator_id, target_id, ratings } = assessmentData;

    const { error } = await supabase
      .from('assessments')
      .insert([{
        evaluator_id,
        target_id,
        ...ratings
      }]);

    if (error) {
      console.error('Error saving assessment:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in saveAssessment:', error);
    return false;
  }
};

// Fungsi untuk mengambil hasil penilaian untuk admin
export const fetchAssessmentResults = async (): Promise<Assessment[]> => {
  try {
    const { data, error } = await supabase
      .from('assessments')
      .select('*');

    if (error) {
      console.error('Error fetching assessment results:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchAssessmentResults:', error);
    throw error;
  }
};

// Fungsi untuk menghitung progres penilaian
export const calculateProgress = async (currentUserId: string): Promise<{ total: number, completed: number }> => {
  try {
    // Ambil semua pengguna non-admin
    const allUsers = await fetchUsers(currentUserId, 'User'); // role sementara

    // Ambil penilaian yang sudah diberikan oleh pengguna ini
    const assessments = await fetchUserAssessments(currentUserId);

    return {
      total: allUsers.length,
      completed: assessments.length
    };
  } catch (error) {
    console.error('Error calculating progress:', error);
    return { total: 0, completed: 0 };
  }
};

// Fungsi tambahan untuk menghitung progres penilaian
export const fetchUserAssessmentsCount = async (userId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('assessments')
      .select('*', { count: 'exact', head: true })
      .eq('evaluator_id', userId);

    if (error) {
      console.error('Error fetching user assessments count:', error);
      throw error;
    }

    return count || 0;
  } catch (error) {
    console.error('Error in fetchUserAssessmentsCount:', error);
    throw error;
  }
};