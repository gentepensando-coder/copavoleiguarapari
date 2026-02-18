
import React from 'react';
import { Athlete } from '../types';
import { formatCurrency } from '../utils';

interface StatsProps {
  athletes: Athlete[];
}

const Stats: React.FC<StatsProps> = ({ athletes }) => {
  const totalInscriptions = athletes.reduce((acc, curr) => acc + curr.registrationFee, 0);
  const totalShirts = athletes.reduce((acc, curr) => acc + curr.shirtValue, 0);
  const total = totalInscriptions + totalShirts;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <p className="text-slate-500 text-sm font-medium">Total Inscrições</p>
        <p className="text-2xl font-bold text-blue-600 mt-1">{formatCurrency(totalInscriptions)}</p>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <p className="text-slate-500 text-sm font-medium">Total Camisas</p>
        <p className="text-2xl font-bold text-orange-600 mt-1">{formatCurrency(totalShirts)}</p>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 bg-blue-50/30">
        <p className="text-slate-500 text-sm font-medium">Valor Total</p>
        <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(total)}</p>
      </div>
    </div>
  );
};

export default Stats;
