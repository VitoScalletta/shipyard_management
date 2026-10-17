import { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import {
  Ship, Bot, LogOut, Menu, ChevronRight,
  BrainCircuit, Users, ShieldCheck, Network
} from 'lucide-react';
import GarsonAiDrawer from '../ai-asistant/GarsonAiDrawer';
import { Toaster } from 'sonner';

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logout } = useAuthStore();
  const [isGarsonOpen, setIsGarsonOpen] = useState(false);

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
    <div className="relative flex h-screen w-full overflow-hidden bg-slate-950 text-slate-50">
      {/* Global Blueprint (Mühendislik) Izgarası Arka Planı */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/20 via-slate-950 to-slate-950"></div>

      {/* YENİ: MOBİL İÇİN ARKA PLAN KARARTMASI (BACKDROP) */}
      {/* Sadece mobilde menü açıkken arkayı karartır ve dışarı tıklayınca kapatır */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden"
        />
      )}

      {/* TAKTİKSEL YAN MENÜ (SIDEBAR) - MOBİL VE MASAÜSTÜ DUYARLI */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-800 bg-slate-900/95 backdrop-blur-xl transition-all duration-300 md:relative md:bg-slate-900/50 ${
          isSidebarOpen
            ? 'w-64 translate-x-0'
            : 'w-64 -translate-x-full md:w-20 md:translate-x-0'
        }`}
      >
        {/* Logo Alanı */}
        <div className={`flex h-16 items-center border-b border-slate-800 px-4 ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
          <div className={`overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'max-w-[150px] opacity-100 delay-150' : 'max-w-0 opacity-0'}`}>
            <span className="whitespace-nowrap font-sans text-sm font-bold tracking-widest text-slate-100">
              TACTICAL <span className="text-cyan-500">OS</span>
            </span>
          </div>
          {/* Masaüstü Küçültme Butonu / Mobil Kapatma Butonu */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="shrink-0 rounded-md p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-cyan-400"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Navigasyon Modülleri (Aynı Kaldı) */}
        <nav className="flex-1 space-y-2 overflow-y-auto p-4 scrollbar-none">
          <NavLink
            to="/"
            end
            onClick={() => window.innerWidth < 768 && setIsSidebarOpen(false)} // Mobilde linke tıklayınca menüyü kapat
            className={({ isActive }) => `flex items-center rounded-lg p-2.5 transition-colors ${
              isActive
                ? 'bg-slate-800 text-cyan-400 shadow-[inset_3px_0_0_0_rgba(6,182,212,1)]'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            } ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}
          >
            <Ship className="h-5 w-5 shrink-0" />
            <span className={`overflow-hidden whitespace-nowrap font-sans font-medium transition-all duration-300 ${isSidebarOpen ? 'ml-3 max-w-[200px] opacity-100 delay-150' : 'max-w-0 opacity-0'}`}>
              Tersane Filosu
            </span>
          </NavLink>

          <NavLink
            to="/project/PRJ-084"
            onClick={() => window.innerWidth < 768 && setIsSidebarOpen(false)}
            className={({ isActive }) => `flex items-center rounded-lg p-2.5 transition-colors ${
              isActive
                ? 'bg-slate-800 text-cyan-400 shadow-[inset_3px_0_0_0_rgba(6,182,212,1)]'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            } ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}
          >
            <Network className="h-5 w-5 shrink-0" />
            <span className={`overflow-hidden whitespace-nowrap font-sans font-medium transition-all duration-300 ${isSidebarOpen ? 'ml-3 max-w-[200px] opacity-100 delay-150' : 'max-w-0 opacity-0'}`}>
              Görev & Kritik Yol
            </span>
          </NavLink>

          <NavLink
            to="/ai-risk-center"
            onClick={() => window.innerWidth < 768 && setIsSidebarOpen(false)}
            className={({ isActive }) => `flex items-center rounded-lg p-2.5 transition-colors ${
              isActive
                ? 'bg-rose-950/50 text-rose-400 shadow-[inset_3px_0_0_0_rgba(244,63,94,1)]'
                : 'text-rose-400/70 hover:bg-rose-950/30 hover:text-rose-300'
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
                ? 'bg-slate-800 text-cyan-400 shadow-[inset_3px_0_0_0_rgba(6,182,212,1)]'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
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
                ? 'bg-slate-800 text-cyan-400 shadow-[inset_3px_0_0_0_rgba(6,182,212,1)]'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            } ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}
          >
            <ShieldCheck className="h-5 w-5 shrink-0" />
            <span className={`overflow-hidden whitespace-nowrap font-sans font-medium transition-all duration-300 ${isSidebarOpen ? 'ml-3 max-w-[200px] opacity-100 delay-150' : 'max-w-0 opacity-0'}`}>
              Sistem & Denetim
            </span>
          </NavLink>
        </nav>

        {/* Alt Sabit Garson AI Butonu */}
        <div className="border-t border-slate-800 p-4 shrink-0">
          <button
            onClick={() => { setIsGarsonOpen(true); window.innerWidth < 768 && setIsSidebarOpen(false); }}
            className={`flex w-full items-center rounded-lg border border-cyan-500/20 bg-cyan-950/30 p-3 text-cyan-500 transition-colors hover:bg-cyan-900/40 ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}
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
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900/30 px-4 backdrop-blur-sm sm:px-6">

          {/* Sol Kısım: Mobil Menü İkonu ve Breadcrumb */}
          <div className="flex items-center gap-3">
            {/* YENİ: Mobilde Sidebar'ı açan buton */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-cyan-400 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="hidden items-center gap-2 text-slate-400 sm:flex">
              <Ship className="h-4 w-4" />
              <ChevronRight className="h-4 w-4 opacity-50" />
              <span className="font-sans text-sm font-medium text-slate-200">Tersane Filosu</span>
            </div>
          </div>

          {/* Sağ Kısım: Kontroller ve Profil */}
          <div className="flex items-center gap-4 sm:gap-6">

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
            <div className="flex items-center gap-3 border-l border-slate-800 pl-4 sm:gap-4 sm:pl-6">
              <div className="hidden flex-col items-end sm:flex">
                <span className="font-sans text-sm font-medium text-slate-200">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="rounded border border-cyan-800/50 bg-cyan-950/30 px-1.5 py-0.5 font-mono text-[10px] tracking-widest text-cyan-400">
                  {user?.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="rounded-md p-2 text-slate-400 transition-colors hover:bg-rose-500/20 hover:text-rose-500"
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

        <Toaster theme="dark" position="top-right" toastOptions={{ className: '!bg-slate-900 !border-slate-800 !text-slate-200' }} />
        <GarsonAiDrawer isOpen={isGarsonOpen} onClose={() => setIsGarsonOpen(false)} />
      </div>
    </div>
  );
}