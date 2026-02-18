
import React, { useState } from 'react';
import { Team, Category } from '../types';
import { CATEGORIES, BRAZILIAN_STATES } from '../constants';

interface TeamManagerProps {
  onAddTeam: (team: Omit<Team, 'id' | 'createdBy'>) => void;
}

const TeamManager: React.FC<TeamManagerProps> = ({ onAddTeam }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: CATEGORIES[0],
    coachName: '',
    assistantName: '',
    city: '',
    state: 'ES',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.city.trim()) {
      alert("O nome da equipe e o município são obrigatórios!");
      return;
    }
    
    onAddTeam(formData);
    setFormData({
      name: '',
      category: CATEGORIES[0],
      coachName: '',
      assistantName: '',
      city: '',
      state: 'ES',
    });
  };

  const inputClass = "border border-slate-200 rounded-xl p-3 text-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all w-full font-medium bg-white text-slate-900";

  return (
    <section className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 mb-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600"></div>
      <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
          <span className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-lg">01</span>
          Passo 1: Criar Equipe
        </h2>
        <p className="text-slate-400 text-sm mt-1 ml-11">Cadastre as informações da equipe e sua localização.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nome da Equipe *</label>
          <input
            type="text" required
            placeholder="Ex: Guerreiros do Vôlei"
            className={inputClass}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Município *</label>
          <input
            type="text" required
            placeholder="Cidade da Equipe"
            className={inputClass}
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Estado (UF)</label>
          <select
            className={inputClass}
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
          >
            {BRAZILIAN_STATES.map((uf) => (
              <option key={uf} value={uf}>{uf}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nome do Técnico</label>
          <input
            type="text"
            placeholder="Responsável técnico"
            className={inputClass}
            value={formData.coachName}
            onChange={(e) => setFormData({ ...formData, coachName: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Auxiliar (Opcional)</label>
          <input
            type="text"
            placeholder="Assistente"
            className={inputClass}
            value={formData.assistantName}
            onChange={(e) => setFormData({ ...formData, assistantName: e.target.value })}
          />
        </div>

        <div className="lg:col-span-3 mt-4 flex justify-end">
          <button
            type="submit"
            className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-12 rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 active:scale-95 text-sm uppercase tracking-widest"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
            Criar Nova Equipe
          </button>
        </div>
      </form>
    </section>
  );
};

export default TeamManager;
