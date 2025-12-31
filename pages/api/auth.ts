// pages/api/auth.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { User } from '@/types';

// Mock users data
const mockUsers: User[] = [
  { id: '001', username: 'admin', name: 'Admin', role: 'Admin', position: 'Administrator', evaluated: false, password: 'admin123' },
  { id: '002', username: 'pegawai1', name: 'Budi Santoso', role: 'User', position: 'Staff', evaluated: false, password: 'password1' },
  { id: '003', username: 'pegawai2', name: 'Siti Aminah', role: 'User', position: 'Staff', evaluated: false, password: 'password2' },
  { id: '004', username: 'pegawai3', name: 'Ahmad Fauzi', role: 'User', position: 'Supervisor', evaluated: false, password: 'password3' },
  { id: '005', username: 'pegawai4', name: 'Rina Kusuma', role: 'User', position: 'Staff', evaluated: false, password: 'password4' },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { username, password } = req.body;

    // Find user in mock data
    const user = mockUsers.find(u => u.username === username && u.password === password);

    if (user) {
      // Return user data (excluding password)
      const { password, ...userWithoutPassword } = user;
      res.status(200).json({ success: true, user: userWithoutPassword });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}