
export enum Category {
  Feminino45 = "45+ Feminino",
  Feminino58 = "58+ Feminino",
  Feminino68 = "68+ Feminino",
  Masculino58 = "58+ Masculino",
  Masculino68 = "68+ Masculino",
}

export enum ShirtSize {
  P = "P",
  M = "M",
  G = "G",
  GG = "GG",
  G1 = "G1",
}

export type RegistrationLevel = 1 | 2 | 3;

export type UserRole = 'ADMIN' | 'MANAGER';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
}

export interface Team {
  id: string;
  name: string;
  category: Category;
  coachName: string;
  assistantName: string;
  city: string;
  state: string;
  createdBy: string;
}

export interface Athlete {
  id: string;
  fullName: string;
  cpf: string;
  identity: string;
  phone: string;
  birthDate: string;
  category: Category;
  hasShirt: boolean;
  shirtSize: ShirtSize;
  registrationLevel: RegistrationLevel;
  registrationFee: number;
  shirtValue: number;
  totalValue: number;
  teamId?: string;
  createdBy: string; // Novo campo
}
