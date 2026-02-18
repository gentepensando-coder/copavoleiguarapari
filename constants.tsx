
import { Category, ShirtSize } from './types';

export const TOURNAMENT_NAME = "Copa Interestadual Guarapari de Vôlei Sênior";
export const SHIRT_PRICE = 60.00;

export const REGISTRATION_FEES = {
  1: 70,
  2: 30, // Alterado de 100 para 30 conforme solicitado
  3: 0
};

export const CATEGORIES = Object.values(Category);
export const SHIRT_SIZES = Object.values(ShirtSize);

export const BRAZILIAN_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", 
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];
