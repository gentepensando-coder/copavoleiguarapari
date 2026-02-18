
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { TOURNAMENT_NAME } from '../constants';

interface LoginProps {
  targetRole: UserRole;
  onLogin: (username: string, password: string) => User | null;
  onRegister: (name: string, username: string, password: string) => void;
  onSwitchRole: (role: UserRole) => void;
  onBack: () => void;
}

const Login: React.FC<LoginProps> = ({ targetRole, onLogin, onRegister, onSwitchRole, onBack }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const isAdmin = targetRole === 'ADMIN';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegistering && !isAdmin) {
      if (!name || !username || !password) {
        setError('Preencha todos os campos.');
        return;
      }
      onRegister(name, username, password);
    } else {
      const loggedUser = onLogin(username, password);
      if (!loggedUser) {
        setError('E-mail ou senha incorretos.');
      } else if (loggedUser.role !== targetRole) {
        setError('Acesso negado para este perfil.');
      }
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center px-4 transition-all duration-700 ${isAdmin ? 'bg-slate-900' : 'bg-slate-100'}`}>
      <div className="max-w-md w-full mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold text-xs uppercase tracking-widest transition-all mb-8">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"/></svg>
          Voltar para Inscrição
        </button>
      </div>

      <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-1.5 ${isAdmin ? 'bg-indigo-600' : 'bg-blue-600'}`}></div>
        
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            {isAdmin ? 'Acesso Administrativo' : 'Área de Gestão'}
          </h2>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-2">{TOURNAMENT_NAME}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isRegistering && !isAdmin && (
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-2">Seu Nome</label>
              <input
                type="text" required
                className="w-full border border-slate-200 rounded-2xl p-4 text-slate-900 font-bold focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                placeholder="Responsável"
                value={name} onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-2">E-mail</label>
            <input
              type="email" required
              className="w-full border border-slate-200 rounded-2xl p-4 text-slate-900 font-bold focus:ring-4 focus:ring-blue-50 outline-none transition-all"
              placeholder="email@exemplo.com"
              value={username} onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-2">Senha</label>
            <input
              type="password" required
              className="w-full border border-slate-200 rounded-2xl p-4 text-slate-900 font-bold focus:ring-4 focus:ring-blue-50 outline-none transition-all"
              placeholder="Digite sua senha"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-red-500 text-[10px] font-black bg-red-50 p-3 rounded-xl border border-red-100 text-center uppercase tracking-widest">{error}</p>
          )}

          <button
            type="submit"
            className={`w-full text-white font-black py-5 rounded-2xl shadow-2xl transition-all uppercase tracking-widest text-sm ${isAdmin ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isRegistering ? 'Criar Conta' : 'Acessar Painel'}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-slate-50 text-center flex flex-col gap-4">
          {!isAdmin && (
            <button 
              onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
              className="text-xs font-black text-blue-600 hover:underline uppercase tracking-widest"
            >
              {isRegistering ? 'Já tenho conta? Entrar' : 'Não tem conta de gestor? Clique aqui'}
            </button>
          )}
          
          <button 
            onClick={() => onSwitchRole(isAdmin ? 'MANAGER' : 'ADMIN')}
            className="text-[10px] font-bold text-slate-300 hover:text-slate-500 uppercase tracking-widest transition-colors mt-2"
          >
            {isAdmin ? 'Voltar para Gestão de Equipes' : 'Acesso Organizador (Restrito)'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
