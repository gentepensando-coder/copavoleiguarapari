
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Athlete, Team, User, RegistrationLevel } from './types';
import { SHIRT_PRICE, TOURNAMENT_NAME } from './constants';
import { getRegistrationFee, formatCurrency } from './utils';
import AthleteForm from './components/AthleteForm';
import TeamManager from './components/TeamManager';
import Stats from './components/Stats';
import Login from './components/Login';
import * as XLSX from 'xlsx';

type ViewState = 'public' | 'auth' | 'dashboard';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('public');
  const [targetRole, setTargetRole] = useState<'ADMIN' | 'MANAGER'>('MANAGER');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'info' } | null>(null);
  const [lastRegisteredAthlete, setLastRegisteredAthlete] = useState<Athlete | null>(null);
  
  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const copyRegistrationLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      showToast("Link de inscrição copiado!", "info");
    });
  };

  const [users, setUsers] = useState<any[]>(() => {
    const saved = localStorage.getItem('volei_users');
    const defaultAdmin = { 
      id: 'admin_master', 
      username: 'gentepensando@gmail.com', 
      password: '1232026', 
      name: 'Organizador Master', 
      role: 'ADMIN' 
    };
    if (!saved) return [defaultAdmin];
    const parsed = JSON.parse(saved);
    if (!parsed.find((u: any) => u.username === 'gentepensando@gmail.com')) parsed.push(defaultAdmin);
    return parsed;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'teams' | 'athletes' | 'admin'>('teams');
  
  const [athletes, setAthletes] = useState<Athlete[]>(() => {
    const saved = localStorage.getItem('volei_athletes');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem('volei_teams');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedTeamIdForAthlete, setSelectedTeamIdForAthlete] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('volei_athletes', JSON.stringify(athletes));
  }, [athletes]);

  useEffect(() => {
    localStorage.setItem('volei_teams', JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem('volei_users', JSON.stringify(users));
  }, [users]);

  const handleLogin = (username: string, password: string): User | null => {
    const found = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if (found) {
      const { password: _, ...userWithoutPass } = found;
      setCurrentUser(userWithoutPass as User);
      setView('dashboard');
      setActiveTab(found.role === 'ADMIN' ? 'admin' : 'teams');
      showToast(`Bem-vindo, ${found.name}!`, 'info');
      return userWithoutPass as User;
    }
    return null;
  };

  const handleRegister = (name: string, username: string, password: string) => {
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      name, username, password, role: 'MANAGER'
    };
    setUsers(prev => [...prev, newUser]);
    const { password: _, ...userWithoutPass } = newUser;
    setCurrentUser(userWithoutPass as User);
    setView('dashboard');
    setActiveTab('teams');
    showToast("Conta de gestor criada!");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('public');
    setLastRegisteredAthlete(null);
  };

  const handleAddAthlete = useCallback((newAthleteData: Omit<Athlete, 'id' | 'registrationFee' | 'shirtValue' | 'totalValue' | 'createdBy'>) => {
    const regFee = getRegistrationFee(newAthleteData.registrationLevel);
    const actualShirtValue = newAthleteData.hasShirt ? SHIRT_PRICE : 0;
    
    const newAthlete: Athlete = {
      ...newAthleteData,
      id: Math.random().toString(36).substr(2, 9),
      registrationFee: regFee,
      shirtValue: actualShirtValue,
      totalValue: regFee + actualShirtValue,
      createdBy: currentUser?.id || 'public_guest'
    };
    
    setAthletes(prev => [...prev, newAthlete]);
    setSelectedTeamIdForAthlete(null);
    
    if (view === 'public') {
      setLastRegisteredAthlete(newAthlete);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      showToast("Inscrição realizada com sucesso!");
    }
  }, [currentUser, view]);

  const handleAddTeam = useCallback((newTeamData: Omit<Team, 'id' | 'createdBy'>) => {
    if (!currentUser) return;
    const newTeam: Team = {
      ...newTeamData,
      id: Math.random().toString(36).substr(2, 9),
      createdBy: currentUser.id,
    };
    setTeams(prev => [...prev, newTeam]);
    showToast("Equipe criada!");
  }, [currentUser]);

  const handleRemoveAthlete = (id: string) => {
    if (window.confirm('Remover este atleta?')) {
      setAthletes(prev => prev.filter(a => a.id !== id));
      showToast("Atleta removido.", 'info');
    }
  };

  const handleRemoveTeam = (id: string) => {
    if (window.confirm('Excluir equipe e atletas vinculados?')) {
      setTeams(prev => prev.filter(t => t.id !== id));
      setAthletes(prev => prev.map(a => a.teamId === id ? { ...a, teamId: undefined } : a));
      showToast("Equipe excluída.", 'info');
    }
  };

  const handleExportToExcel = () => {
    try {
      const excelData = athletes.map(a => {
        const team = teams.find(t => t.id === a.teamId);
        return {
          'Nome Completo': a.fullName,
          'RG': a.identity, 'CPF': a.cpf, 'Nascimento': a.birthDate, 'Telefone': a.phone,
          'Categoria': a.category, 'Equipe': team?.name || 'Pendente',
          'Camisa': a.hasShirt ? `Sim (${a.shirtSize})` : 'Não',
          'Lote': `${a.registrationLevel}ª`, 'Total': a.totalValue
        };
      });
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Inscritos");
      XLSX.writeFile(wb, `Inscritos_Copa_Volei.xlsx`);
      showToast("Planilha gerada!");
    } catch (err) { alert("Erro ao gerar Excel."); }
  };

  const myVisibleAthletes = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'ADMIN') return athletes;
    return athletes.filter(a => a.createdBy === currentUser.id || teams.some(t => t.id === a.teamId && t.createdBy === currentUser.id));
  }, [athletes, teams, currentUser]);

  const visibleTeams = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'ADMIN') return teams;
    return teams.filter(t => t.createdBy === currentUser.id);
  }, [teams, currentUser]);

  const athletesByTeam = useMemo(() => {
    const map: Record<string, Athlete[]> = {};
    athletes.forEach(a => {
      const key = a.teamId || 'unassigned';
      if (!map[key]) map[key] = [];
      map[key].push(a);
    });
    return map;
  }, [athletes]);

  // VISÃO PÚBLICA (Entrada Direta)
  if (view === 'public') {
    return (
      <div className="min-h-screen bg-slate-50 pb-20">
        <header className="bg-gradient-to-br from-blue-700 to-indigo-900 text-white py-14 px-4 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
          </div>
          <div className="max-w-4xl mx-auto relative z-10">
            <span className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 inline-block shadow-sm">
              🏐 2026 • Guarapari/ES
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-3 leading-[1.1]">{TOURNAMENT_NAME}</h1>
            <p className="text-blue-100 font-medium opacity-80 text-sm md:text-base max-w-2xl mx-auto">
              Inscrição para atletas sênior. Preencha os dados corretamente para validar sua participação.
            </p>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 -mt-10 relative z-20">
          {lastRegisteredAthlete ? (
            <div className="bg-white p-8 md:p-14 rounded-[3.5rem] shadow-2xl border border-blue-50 animate-in zoom-in-95 duration-500 text-center">
              <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center text-4xl mx-auto mb-8 shadow-2xl shadow-green-100 ring-8 ring-green-50">
                ✓
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-2">Inscrição Confirmada!</h2>
              <p className="text-slate-400 font-bold mb-10">Sua solicitação foi enviada para análise da organização.</p>
              
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-left mb-10 max-w-md mx-auto relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-600/5 -mr-4 -mt-4 rotate-45"></div>
                <div className="space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocolo</span>
                    <span className="text-xs font-black text-slate-900">#{lastRegisteredAthlete.id.toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nome do Atleta</p>
                    <p className="text-xl font-black text-slate-800">{lastRegisteredAthlete.fullName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Categoria</p>
                      <p className="text-sm font-bold text-slate-700">{lastRegisteredAthlete.category}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Uniforme</p>
                      <p className="text-sm font-bold text-slate-700">{lastRegisteredAthlete.hasShirt ? `Tam. ${lastRegisteredAthlete.shirtSize}` : 'Sem Camisa'}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-200 flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Previsão de Taxa</p>
                      <p className="text-2xl font-black text-blue-600">{formatCurrency(lastRegisteredAthlete.totalValue)}</p>
                    </div>
                    <div className="bg-slate-900 p-2 rounded-lg">
                       <div className="w-12 h-12 bg-white flex items-center justify-center text-[6px] font-black text-center p-1 leading-none">QR<br/>OK</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 max-w-sm mx-auto">
                <button 
                  onClick={() => window.print()}
                  className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                  Imprimir Comprovante
                </button>
                <button 
                  onClick={() => setLastRegisteredAthlete(null)}
                  className="text-blue-600 font-black uppercase tracking-widest text-[10px] hover:underline"
                >
                  Fazer nova inscrição
                </button>
              </div>
            </div>
          ) : (
            <>
              <AthleteForm onAdd={handleAddAthlete} teams={teams} />
              
              <footer className="mt-16 text-center border-t border-slate-200 pt-12 pb-10">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-6">Administração</p>
                <div className="flex flex-wrap justify-center gap-8 items-center opacity-60">
                   <button 
                    onClick={() => setView('auth')}
                    className="text-slate-500 hover:text-blue-600 font-black text-[10px] uppercase tracking-widest transition-all"
                  >
                    Painel do Organizador
                  </button>
                  <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
                  <button 
                    onClick={() => setView('auth')}
                    className="text-slate-500 hover:text-blue-600 font-black text-[10px] uppercase tracking-widest transition-all"
                  >
                    Gestão de Equipes
                  </button>
                </div>
              </footer>
            </>
          )}
        </main>
      </div>
    );
  }

  // TELA DE LOGIN
  if (view === 'auth') {
    return (
      <Login 
        targetRole={targetRole}
        onLogin={handleLogin} 
        onRegister={handleRegister}
        onSwitchRole={(role) => setTargetRole(role)}
        onBack={() => setView('public')}
      />
    );
  }

  // DASHBOARD
  return (
    <div className="min-h-screen pb-20 bg-slate-50">
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 duration-300">
          <div className="bg-blue-600 text-white px-8 py-4 rounded-2xl shadow-2xl font-black text-sm uppercase tracking-widest border border-white/20">
            ℹ️ {toast.message}
          </div>
        </div>
      )}

      <header className="bg-slate-900 text-white py-10 px-4 shadow-xl">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-xl font-black uppercase tracking-widest text-indigo-400 mb-1">Painel Administrativo</h1>
            <p className="text-slate-400 font-bold text-sm">Olá, {currentUser?.name} • <button onClick={handleLogout} className="text-red-400 hover:underline">Sair</button></p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2 bg-slate-800 p-1.5 rounded-2xl">
            <button onClick={() => setActiveTab('teams')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'teams' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Equipes</button>
            <button onClick={() => setActiveTab('athletes')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'athletes' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Atletas</button>
            {currentUser?.role === 'ADMIN' && (
              <button onClick={() => setActiveTab('admin')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'admin' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Relatórios</button>
            )}
          </div>

          <button 
            onClick={copyRegistrationLink}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
            Copiar Link para WhatsApp
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8">
        <Stats athletes={myVisibleAthletes} />
        
        {activeTab === 'teams' ? (
          <div className="space-y-8">
            <TeamManager onAddTeam={handleAddTeam} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {visibleTeams.map(team => (
                <section key={team.id} className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                   <div className="p-8 border-b border-slate-50 flex justify-between items-start bg-slate-50/50">
                      <div>
                        <h3 className="text-xl font-black text-slate-900 leading-tight">{team.name}</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase mt-1">{team.category} • {team.city}</p>
                      </div>
                      <button onClick={() => handleRemoveTeam(team.id)} className="text-slate-300 hover:text-red-500 p-2 transition-colors"><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9z"/></svg></button>
                    </div>
                    <div className="p-8">
                      <div className="space-y-3">
                        {athletesByTeam[team.id]?.map(athlete => (
                          <div key={athlete.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="text-xs font-bold text-slate-700">{athlete.fullName}</span>
                            <span className="text-[10px] font-black text-blue-600 uppercase">{athlete.shirtSize}</span>
                          </div>
                        ))}
                        <button onClick={() => setSelectedTeamIdForAthlete(team.id === selectedTeamIdForAthlete ? null : team.id)} className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-blue-300 hover:text-blue-500 transition-all">+ Novo Atleta nesta Equipe</button>
                        {selectedTeamIdForAthlete === team.id && (
                          <div className="mt-4 p-4 bg-blue-50/30 rounded-2xl border border-blue-100 animate-in zoom-in-95">
                            <AthleteForm key={team.id} onAdd={handleAddAthlete} teams={teams} defaultTeamId={team.id} compact={true} />
                          </div>
                        )}
                      </div>
                    </div>
                </section>
              ))}
            </div>
          </div>
        ) : activeTab === 'athletes' ? (
          <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50"><h2 className="text-xl font-black">Atletas Cadastrados ({myVisibleAthletes.length})</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                  <tr><th className="px-8 py-4">Atleta</th><th className="px-8 py-4">Equipe</th><th className="px-8 py-4 text-right">Valor Total</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {myVisibleAthletes.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-4"><p className="text-sm font-black text-slate-800">{a.fullName}</p><p className="text-[10px] text-slate-400">{a.phone}</p></td>
                      <td className="px-8 py-4"><p className="text-xs font-bold text-slate-600">{teams.find(t => t.id === a.teamId)?.name || 'Pendente'}</p></td>
                      <td className="px-8 py-4 text-right"><p className="text-xs font-black text-blue-600">{formatCurrency(a.totalValue)}</p></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-indigo-900 text-white p-12 rounded-[3.5rem] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8">
              <div>
                <h2 className="text-3xl font-black mb-3 leading-tight">Exportar Relatório Geral</h2>
                <p className="text-indigo-200 font-medium max-w-md">Gere uma planilha completa com todos os dados dos atletas, tamanhos de uniforme e valores financeiros.</p>
              </div>
              <button onClick={handleExportToExcel} className="bg-white text-indigo-900 px-12 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-indigo-50 transition-all active:scale-95 whitespace-nowrap">
                Baixar Excel (.xlsx)
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
