import { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import {
  Ship, Bot, LogOut, Menu, ChevronRight,
  BrainCircuit, Users, ShieldCheck,
  Sun, Moon, Activity // İkonlar eklendi
} from 'lucide-react';
import GarsonAiDrawer from '../ai-asistant/GarsonAiDrawer';
import { Toaster } from 'sonner';
import { useTheme } from '@/contexts/ThemeContext'; // .tsx uzantısı silindi

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logout } = useAuthStore();
  const [isGarsonOpen, setIsGarsonOpen] = useState(false);

  // Tema Context'ini buraya çağırdık
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsGarsonOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={`relative flex h-screen w-full overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-950 text-slate-50' : 'bg-slate-50 text-slate-900'}`}>

      {/* Global Blueprint (Mühendislik) Izgarası Arka Planı (Temaya duyarlı) */}
      <div className={`pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] ${theme === 'dark' ? 'from-slate-900/20 via-slate-950 to-slate-950' : 'from-slate-200/50 via-slate-50 to-slate-50'}`}></div>
      <div className={`absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] ${theme === 'dark' ? 'opacity-50' : 'opacity-5'}`}></div>

      {/* MOBİL İÇİN ARKA PLAN KARARTMASI */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden"
        />
      )}

      {/* TAKTİKSEL YAN MENÜ (SIDEBAR) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 md:relative ${
          isSidebarOpen
            ? 'w-64 translate-x-0'
            : 'w-64 -translate-x-full md:w-20 md:translate-x-0'
        } ${theme === 'dark' ? 'border-r border-slate-800 bg-slate-900/95 md:bg-slate-900/50' : 'border-r border-slate-200 bg-white/95 md:bg-white/80'} backdrop-blur-xl`}
      >
        {/* Logo Alanı */}
        <div className={`flex h-16 items-center px-4 ${theme === 'dark' ? 'border-b border-slate-800' : 'border-b border-slate-200'} ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
          <div className={`overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'max-w-[150px] opacity-100 delay-150' : 'max-w-0 opacity-0'}`}>
            <span className={`whitespace-nowrap font-sans text-sm font-bold tracking-widest ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>
              TACTICAL <span className="text-cyan-500">OS</span>
            </span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`shrink-0 rounded-md p-2 transition-colors ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-800 hover:text-cyan-400' : 'text-slate-500 hover:bg-slate-100 hover:text-cyan-600'}`}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Navigasyon Modülleri */}
        <nav className="flex-1 space-y-2 overflow-y-auto p-4 scrollbar-none">
          {/* Menü linkleri temaya göre renk değiştirir */}
          <NavLink
            to="/"
            end
            onClick={() => window.innerWidth < 768 && setIsSidebarOpen(false)}
            className={({ isActive }) => `flex items-center rounded-lg p-2.5 transition-colors ${
              isActive
                ? (theme === 'dark' ? 'bg-slate-800 text-cyan-400 shadow-[inset_3px_0_0_0_rgba(6,182,212,1)]' : 'bg-cyan-50 text-cyan-600 shadow-[inset_3px_0_0_0_rgba(6,182,212,1)]')
                : (theme === 'dark' ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
            } ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}
          >
            <Ship className="h-5 w-5 shrink-0" />
            <span className={`overflow-hidden whitespace-nowrap font-sans font-medium transition-all duration-300 ${isSidebarOpen ? 'ml-3 max-w-[200px] opacity-100 delay-150' : 'max-w-0 opacity-0'}`}>
              Tersane Filosu
            </span>
          </NavLink>

          <NavLink
            to="/ai-risk-center"
            onClick={() => window.innerWidth < 768 && setIsSidebarOpen(false)}
            className={({ isActive }) => `flex items-center rounded-lg p-2.5 transition-colors ${
              isActive
                ? (theme === 'dark' ? 'bg-rose-950/50 text-rose-400 shadow-[inset_3px_0_0_0_rgba(244,63,94,1)]' : 'bg-rose-50 text-rose-600 shadow-[inset_3px_0_0_0_rgba(244,63,94,1)]')
                : (theme === 'dark' ? 'text-rose-400/70 hover:bg-rose-950/30 hover:text-rose-300' : 'text-rose-500/70 hover:bg-rose-50 hover:text-rose-600')
            } ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}
          >
            <BrainCircuit className="h-5 w-5 shrink-0" />
            <span className={`overflow-hidden whitespace-nowrap font-sans font-medium transition-all duration-300 ${isSidebarOpen ? 'ml-3 max-w-[200px] opacity-100 delay-150' : 'max-w-0 opacity-0'}`}>
              AI Risk Merkezi
            </span>
          </NavLink>

          <NavLink
            to="/workforce"
            onClick={() => window.innerWidth < 768 && setIsSidebarOpen(false)}
            className={({ isActive }) => `flex items-center rounded-lg p-2.5 transition-colors ${
              isActive
                ? (theme === 'dark' ? 'bg-slate-800 text-cyan-400 shadow-[inset_3px_0_0_0_rgba(6,182,212,1)]' : 'bg-cyan-50 text-cyan-600 shadow-[inset_3px_0_0_0_rgba(6,182,212,1)]')
                : (theme === 'dark' ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
            } ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}
          >
            <Users className="h-5 w-5 shrink-0" />
            <span className={`overflow-hidden whitespace-nowrap font-sans font-medium transition-all duration-300 ${isSidebarOpen ? 'ml-3 max-w-[200px] opacity-100 delay-150' : 'max-w-0 opacity-0'}`}>
              İşgücü & Kaynak
            </span>
          </NavLink>

          <NavLink
            to="/audit-log"
            onClick={() => window.innerWidth < 768 && setIsSidebarOpen(false)}
            className={({ isActive }) => `flex items-center rounded-lg p-2.5 transition-colors ${
              isActive
                ? (theme === 'dark' ? 'bg-slate-800 text-cyan-400 shadow-[inset_3px_0_0_0_rgba(6,182,212,1)]' : 'bg-cyan-50 text-cyan-600 shadow-[inset_3px_0_0_0_rgba(6,182,212,1)]')
                : (theme === 'dark' ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
            } ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}
          >
            <ShieldCheck className="h-5 w-5 shrink-0" />
            <span className={`overflow-hidden whitespace-nowrap font-sans font-medium transition-all duration-300 ${isSidebarOpen ? 'ml-3 max-w-[200px] opacity-100 delay-150' : 'max-w-0 opacity-0'}`}>
              Sistem & Denetim
            </span>
          </NavLink>
          <NavLink
            to="/analytics"
            onClick={() => window.innerWidth < 768 && setIsSidebarOpen(false)}
            className={({ isActive }) => `flex items-center rounded-lg p-2.5 transition-colors ${
              isActive
                ? (theme === 'dark' ? 'bg-slate-800 text-cyan-400 shadow-[inset_3px_0_0_0_rgba(6,182,212,1)]' : 'bg-cyan-50 text-cyan-600 shadow-[inset_3px_0_0_0_rgba(6,182,212,1)]')
                : (theme === 'dark' ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
            } ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}
          >
            <Activity className="h-5 w-5 shrink-0" />
            <span className={`overflow-hidden whitespace-nowrap font-sans font-medium transition-all duration-300 ${isSidebarOpen ? 'ml-3 max-w-[200px] opacity-100 delay-150' : 'max-w-0 opacity-0'}`}>
              Yönetici Özeti
            </span>
          </NavLink>
        </nav>

        {/* Alt Sabit Garson AI Butonu */}
        <div className={`p-4 shrink-0 ${theme === 'dark' ? 'border-t border-slate-800' : 'border-t border-slate-200'}`}>
          <button
            onClick={() => { setIsGarsonOpen(true); window.innerWidth < 768 && setIsSidebarOpen(false); }}
            className={`flex w-full items-center rounded-lg border p-3 transition-colors ${isSidebarOpen ? 'justify-start' : 'justify-center'} ${
              theme === 'dark'
                ? 'border-cyan-500/20 bg-cyan-950/30 text-cyan-500 hover:bg-cyan-900/40'
                : 'border-cyan-200 bg-cyan-50 text-cyan-600 hover:bg-cyan-100'
            }`}
          >
            <Bot className="h-5 w-5 shrink-0" />
            <span className={`overflow-hidden whitespace-nowrap font-sans font-medium transition-all duration-300 ${isSidebarOpen ? 'ml-3 max-w-[200px] opacity-100 delay-150' : 'max-w-0 opacity-0'}`}>
              Garson AI
            </span>
          </button>
        </div>
      </aside>

      {/* ANA İÇERİK ALANI */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden w-full">

        {/* ÜST DURUM ŞERİDİ (TOPBAR) */}
        <header className={`flex h-16 shrink-0 items-center justify-between px-4 backdrop-blur-sm sm:px-6 ${theme === 'dark' ? 'border-b border-slate-800 bg-slate-900/30' : 'border-b border-slate-200 bg-white/50'}`}>

          {/* Sol Kısım */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className={`rounded-md p-1.5 transition-colors md:hidden ${theme === 'dark' ? 'text-slate-400 hover:bg-slate-800 hover:text-cyan-400' : 'text-slate-500 hover:bg-slate-100 hover:text-cyan-600'}`}
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className={`hidden items-center gap-2 sm:flex ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              <Ship className="h-4 w-4" />
              <ChevronRight className="h-4 w-4 opacity-50" />
              <span className={`font-sans text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Tersane Filosu</span>
            </div>
          </div>

          {/* Sağ Kısım: Kontroller ve Profil */}
          <div className="flex items-center gap-4 sm:gap-6">

            {/* YENİ: TEMA DEĞİŞTİRME BUTONU BURADA */}
            <button
              onClick={toggleTheme}
              className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all ${
                theme === 'dark'
                  ? 'border-slate-700 bg-slate-800/50 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50'
                  : 'border-slate-200 bg-white text-slate-500 hover:text-cyan-600 hover:border-cyan-300'
              }`}
              title={theme === 'dark' ? 'Aydınlık Moda Geç' : 'Karanlık Moda Geç'}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Sistem Sağlık Durumu */}
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span className="hidden font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-500/80 sm:block">
                Sys. Online
              </span>
            </div>

            {/* Kullanıcı Profili ve Çıkış */}
            <div className={`flex items-center gap-3 pl-4 sm:gap-4 sm:pl-6 ${theme === 'dark' ? 'border-l border-slate-800' : 'border-l border-slate-200'}`}>
              <div className="hidden flex-col items-end sm:flex">
                <span className={`font-sans text-sm font-medium ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                  {user?.firstName} {user?.lastName}
                </span>
                <span className={`rounded border px-1.5 py-0.5 font-mono text-[10px] tracking-widest ${
                  theme === 'dark'
                    ? 'border-cyan-800/50 bg-cyan-950/30 text-cyan-400'
                    : 'border-cyan-200 bg-cyan-50 text-cyan-600'
                }`}>
                  {user?.role}
                </span>
              </div>
              <button
                onClick={logout}
                className={`rounded-md p-2 transition-colors ${theme === 'dark' ? 'text-slate-400 hover:bg-rose-500/20 hover:text-rose-500' : 'text-slate-500 hover:bg-rose-50 hover:text-rose-600'}`}
                title="Sistemden Çıkış Yap"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>

          </div>
        </header>

        {/* Sayfa İçeriği */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 w-full">
          <Outlet />
        </main>

        <Toaster theme={theme === 'dark' ? 'dark' : 'light'} position="top-right" toastOptions={{ className: theme === 'dark' ? '!bg-slate-900 !border-slate-800 !text-slate-200' : '' }} />
        <GarsonAiDrawer isOpen={isGarsonOpen} onClose={() => setIsGarsonOpen(false)} />
      </div>
    </div>
  );
}