// types/supabase.ts

export interface User {
  id: string;
  username: string;
  name: string;
  role: 'Admin' | 'User';
  position: string;
  password_hash?: string; // hanya untuk keperluan autentikasi internal
  created_at: string;
}

export interface Assessment {
  id: string;
  evaluator_id: string;
  target_id: string;
  pelayanan: number; // 1-5
  akuntabel: number; // 1-5
  kompeten: number; // 1-5
  harmonis: number; // 1-5
  loyal: number; // 1-5
  adaptif: number; // 1-5
  kolaboratif: number; // 1-5
  created_at: string;
}

// Ini adalah tipe untuk form penilaian
export interface Rating {
  pelayanan: number;
  akuntabel: number;
  kompeten: number;
  harmonis: number;
  loyal: number;
  adaptif: number;
  kolaboratif: number;
}