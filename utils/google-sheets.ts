// utils/google-sheets.ts
import { User, Assessment, Rating } from '@/types';

// Google Sheets API configuration
const GOOGLE_SHEETS_API_URL = process.env.GOOGLE_SHEETS_API_URL || '';
const GOOGLE_SHEETS_ID = process.env.GOOGLE_SHEETS_ID || '';

// Google Apps Script Web App URL (replace with your deployed URL)
const GOOGLE_APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL || '';

// Mock data for development
const mockUsers: User[] = [
  { id: '001', username: 'admin', name: 'Admin', role: 'Admin', position: 'Administrator', evaluated: false, password: 'admin123' },
  { id: '002', username: 'pegawai1', name: 'Budi Santoso', role: 'User', position: 'Staff', evaluated: false, password: 'password1' },
  { id: '003', username: 'pegawai2', name: 'Siti Aminah', role: 'User', position: 'Staff', evaluated: false, password: 'password2' },
  { id: '004', username: 'pegawai3', name: 'Ahmad Fauzi', role: 'User', position: 'Supervisor', evaluated: false, password: 'password3' },
  { id: '005', username: 'pegawai4', name: 'Rina Kusuma', role: 'User', position: 'Staff', evaluated: false, password: 'password4' },
];

const mockAssessments: Assessment[] = [];

// Function to fetch users from Google Sheets
export const fetchUsers = async (): Promise<User[]> => {
  if (process.env.NODE_ENV === 'development') {
    // Return mock data in development
    return mockUsers;
  }

  try {
    // In production, call Google Sheets API
    const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=getUsers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.users || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    // Fallback to mock data
    return mockUsers;
  }
};

// Function to authenticate user
export const authenticateUser = async (username: string, password: string): Promise<User | null> => {
  if (process.env.NODE_ENV === 'development') {
    // Use mock authentication in development
    const user = mockUsers.find(u => u.username === username && u.password === password);
    return user ? { ...user, password: undefined as any } : null;
  }

  try {
    // In production, call Google Apps Script authentication
    const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=authenticate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.success ? data.user : null;
  } catch (error) {
    console.error('Error authenticating user:', error);
    return null;
  }
};

// Function to save assessment
export const saveAssessment = async (assessmentData: {
  targetId: string;
  evaluatorId: string;
  ratings: Rating;
}): Promise<boolean> => {
  if (process.env.NODE_ENV === 'development') {
    // Save to mock data in development
    const newAssessment: Assessment = {
      timestamp: new Date().toISOString(),
      targetId: assessmentData.targetId,
      evaluatorId: assessmentData.evaluatorId,
      pelayanan: assessmentData.ratings.pelayanan,
      akuntabel: assessmentData.ratings.akuntabel,
      kompeten: assessmentData.ratings.kompeten,
      harmonis: assessmentData.ratings.harmonis,
      loyal: assessmentData.ratings.loyal,
      adaptif: assessmentData.ratings.adaptif,
      kolaboratif: assessmentData.ratings.kolaboratif,
    };

    mockAssessments.push(newAssessment);
    return true;
  }

  try {
    // In production, call Google Apps Script to save assessment
    const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=saveAssessment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assessmentData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error saving assessment:', error);
    return false;
  }
};

// Function to update user evaluation status
export const updateUserEvaluationStatus = async (userId: string, evaluated: boolean = true): Promise<boolean> => {
  if (process.env.NODE_ENV === 'development') {
    // Update mock data in development
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      mockUsers[userIndex].evaluated = evaluated;
      return true;
    }
    return false;
  }

  try {
    // In production, call Google Apps Script to update user status
    const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=updateUserStatus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, evaluated }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error updating user status:', error);
    return false;
  }
};

// Function to fetch assessment results
export const fetchAssessmentResults = async (): Promise<Assessment[]> => {
  if (process.env.NODE_ENV === 'development') {
    // Return mock data in development
    return mockAssessments;
  }

  try {
    // In production, call Google Apps Script to get assessment results
    const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=getAssessmentResults`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching assessment results:', error);
    return [];
  }
};