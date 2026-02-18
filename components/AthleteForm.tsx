
import React, { useState } from 'react';
import { Category, ShirtSize, Athlete, RegistrationLevel, Team } from '../types';
import { CATEGORIES, SHIRT_SIZES, SHIRT_PRICE, REGISTRATION_FEES } from '../constants';
import { maskCPF, maskDate, maskPhone } from '../utils';

interface AthleteFormProps {
  onAdd: (athlete: Omit<Athlete, 'id' | 'registrationFee' | 'shirtValue' | 'totalValue'>) => void;
  teams: Team[];
  defaultTeamId?: string;
  compact?: boolean;
}

const AthleteForm: React.FC<AthleteFormProps> = ({ onAdd, teams, defaultTeamId = '', compact = false }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    cpf: '',
    identity: '',
    phone: '',
    birthDate: '',
    category: CATEGORIES[0],
    hasShirt: true, // Padrão como Sim
    shirtSize: SHIRT_SIZES[1],
    registrationLevel: 1 as RegistrationLevel,
    teamId: defaultTeamId,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.cpf || !formData.birthDate || !formData.phone || !formData.identity) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    
    onAdd(formData);
    setFormData({
      fullName: '',
      cpf: '',
      identity: '',
      phone: '',
      birthDate: '',
      category: CATEGORIES[0],
      hasShirt: true,
      shirtSize: SHIRT_SIZES[1],
      registrationLevel: 1,
      teamId: defaultTeamId,
    });
  };

  const inputClass = "border border-slate-200 rounded-xl p-3 text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all w-full font-medium bg-white text-slate-900 placeholder:text-slate-300";

  return (
    <form onSubmit={handleSubmit} className={`${compact ? '' : 'bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 mb-8'}`}>
      {!compact && (
        <div className="mb-8">
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <span className="bg-blue-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center text-sm shadow-lg shadow-blue-100">02</span>
            Dados do Atleta
          </h2>
          <p className="text-slate-400 text-sm mt-1 ml-14 font-medium">Preencha os dados de identificação e escolha do uniforme.</p>
        </div>
      )}
      
      <div className={`grid grid-cols-1 ${compact ? 'gap-4' : 'md:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nome Completo *</label>
          <input
            type="text" required
            placeholder="Nome completo"
            className={inputClass}
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Identidade (RG) *</label>
          <input
            type="text" required
            placeholder="Nº da Identidade"
            className={inputClass}
            value={formData.identity}
            onChange={(e) => setFormData({ ...formData, identity: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">CPF *</label>
          <input
            type="text" required
            placeholder="000.000.000-00"
            className={inputClass}
            value={formData.cpf}
            onChange={(e) => setFormData({ ...formData, cpf: maskCPF(e.target.value) })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">WhatsApp / Celular *</label>
          <input
            type="text" required
            placeholder="(00) 00000-0000"
            className={inputClass}
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: maskPhone(e.target.value) })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Data de Nasc. *</label>
          <input
            type="text" required
            placeholder="DD/MM/AAAA"
            className={inputClass}
            value={formData.birthDate}
            onChange={(e) => setFormData({ ...formData, birthDate: maskDate(e.target.value) })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Categoria</label>
          <select
            className={inputClass}
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Opção de Camisa (Sim/Não) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Camisa Oficial?</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, hasShirt: true })}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest border-2 transition-all ${formData.hasShirt ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}
            >
              Sim (+R$60)
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, hasShirt: false })}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest border-2 transition-all ${!formData.hasShirt ? 'bg-slate-800 text-white border-slate-800 shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}
            >
              Não
            </button>
          </div>
        </div>

        {/* Tamanho na sequência */}
        <div className={`flex flex-col gap-1.5 transition-all ${formData.hasShirt ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tamanho da Camisa</label>
          <select
            className={inputClass}
            value={formData.shirtSize}
            onChange={(e) => setFormData({ ...formData, shirtSize: e.target.value as ShirtSize })}
            disabled={!formData.hasShirt}
          >
            {SHIRT_SIZES.map((size) => (
              <option key={size} value={size}>Tamanho {size}</option>
            ))}
          </select>
        </div>

        {!compact && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Equipe Destino</label>
            <select
              className={inputClass}
              value={formData.teamId}
              onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
            >
              <option value="">Ainda sem equipe</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className={`mt-10 ${compact ? '' : 'border-t border-slate-50 pt-8'}`}>
        <label className="text-[10px] font-black text-slate-500 block mb-4 uppercase tracking-widest px-1">Qual o lote/nível desta inscrição?</label>
        <div className={`grid grid-cols-1 ${compact ? 'gap-2' : 'md:grid-cols-3 gap-4'}`}>
          {[1, 2, 3].map((lvl) => {
            const level = lvl as RegistrationLevel;
            const isActive = formData.registrationLevel === level;
            return (
              <label 
                key={lvl}
                className={`flex items-center justify-between ${compact ? 'p-4' : 'p-5'} rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                  isActive 
                  ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-50' 
                  : 'border-slate-100 hover:border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isActive ? 'border-blue-600' : 'border-slate-300'}`}>
                    {isActive && <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-in zoom-in duration-300"></div>}
                    <input 
                      type="radio" 
                      name="regLevel"
                      className="sr-only"
                      checked={isActive}
                      onChange={() => setFormData({ ...formData, registrationLevel: level })}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-xs font-black uppercase tracking-tight ${isActive ? 'text-blue-900' : 'text-slate-500'}`}>
                      {lvl}ª Inscrição
                    </span>
                  </div>
                </div>
                <span className={`text-sm font-black ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                  {REGISTRATION_FEES[level] === 0 ? 'Isento' : `R$ ${REGISTRATION_FEES[level]}`}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* AVISO DE CONFERÊNCIA DE PAGAMENTO */}
      <div className="mt-8 p-6 bg-amber-50 border-l-4 border-amber-400 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-start gap-4">
          <div className="text-2xl bg-white w-10 h-10 rounded-full shadow-sm flex items-center justify-center">⚠️</div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1 opacity-80">Aviso da Organização</span>
            <p className="text-xs md:text-sm font-bold text-amber-900 leading-relaxed">
              O pagamento referente às inscrições será liberado após a conferência e validação pela organização do evento.
            </p>
          </div>
        </div>
      </div>

      <div className={`${compact ? 'mt-8' : 'mt-12 flex justify-end'}`}>
        <button
          type="submit"
          className={`w-full ${compact ? '' : 'md:w-auto md:px-16'} bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-3 active:scale-95 text-sm uppercase tracking-widest`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
          Concluir Inscrição
        </button>
      </div>
    </form>
  );
};

export default AthleteForm;
