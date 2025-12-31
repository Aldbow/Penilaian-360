export type User = {
  id: string;
  username: string;
  name: string;
  role: 'Admin' | 'User';
  position: string;
  evaluated: boolean;
  password: string;
};

export type Rating = {
  pelayanan: number;
  akuntabel: number;
  kompeten: number;
  harmonis: number;
  loyal: number;
  adaptif: number;
  kolaboratif: number;
};

export type Assessment = {
  timestamp: string;
  targetId: string;
  evaluatorId: string;
  pelayanan: number;
  akuntabel: number;
  kompeten: number;
  harmonis: number;
  loyal: number;
  adaptif: number;
  kolaboratif: number;
};

export type Question = {
  aspect: string;
  description_100: string;
  description_80: string;
  description_60: string;
  description_40: string;
  description_20: string;
};