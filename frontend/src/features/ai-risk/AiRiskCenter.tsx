import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BrainCircuit, AlertTriangle, ShieldAlert,
  Activity, ArrowRight, Ship, Crosshair, Filter
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function AiRiskCenter() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('ALL');
  const [risks, setRisks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRisks = async () => {
      try {
        const { data: projects } = await api.get('/projects');
        const analyses = await Promise.all(
          projects.map(async (project: any) => {
            const { data } = await api.get(`/ai-context/projects/${project.id}/latest`);
            return { project, analysis: data };
          }),
        );
        setRisks(
          analyses.flatMap(({ project, analysis }) =>
            (analysis?.risks ?? []).map((risk: any, index: number) => ({
              id: `${analysis.id}-${index}`,
              projectId: project.id,
              projectName: project.name,
              category: risk.type ?? 'GENERAL',
              severity: risk.severity ?? analysis.overallRiskLevel,
              title: risk.title ?? 'AI risk',
              description: risk.description ?? '',
              time: analysis.generatedTimestamp ? new Date(analysis.generatedTimestamp).toLocaleString('tr-TR') : '-',
            })),
          ),
        );
      } catch (error) {
        console.error('AI risk verileri yüklenemedi:', error);
        toast.error('AI risk kayıtları backend’den alınamadı.');
      } finally {
        setIsLoading(false);
      }
    };
    loadRisks();
  }, []);

  const filteredRisks = risks.filter((risk) => filter === 'ALL' || risk.severity === filter);
  const countBySeverity = (severity: string) => risks.filter((risk) => risk.severity === severity).length;

  const getSeverityConfig = (severity: string) => {
    if (severity === 'HIGH') return { color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/30', icon: ShieldAlert, label: 'KRİTİK' };
    if (severity === 'MEDIUM') return { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: AlertTriangle, label: 'ORTA' };
    return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: Activity, label: 'DÜŞÜK' };
  };

  return (
    <div className="flex h-full flex-col gap-6 overflow-hidden">

      {/* Üst Başlık ve KPI'lar */}
      <div className="flex flex-col gap-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-rose-950/30 text-rose-500 border border-rose-900/50">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-sans text-2xl font-bold text-slate-100">Genel AI Risk Merkezi</h1>
              <p className="font-mono text-sm text-slate-500">TÜM FİLO İÇİN YAPAY ZEKA İSTİHBARAT ÖZETİ</p>
            </div>
          </div>
        </div>

        {/* 3 Büyük Analiz Kartı */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="relative overflow-hidden rounded-lg border border-rose-500/30 bg-rose-950/10 p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-rose-500">
              <ShieldAlert className="h-5 w-5" />
              <span className="font-sans text-sm font-bold uppercase tracking-wider">Kritik Riskler</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-3xl font-bold text-rose-400">{countBySeverity('HIGH')}</span>
              <span className="font-mono text-xs text-rose-500/70">ACİL MÜDAHALE GEREKİYOR</span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-lg border border-amber-500/30 bg-amber-950/10 p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-amber-500">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-sans text-sm font-bold uppercase tracking-wider">Orta Seviye</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-3xl font-bold text-amber-400">{countBySeverity('MEDIUM')}</span>
              <span className="font-mono text-xs text-amber-500/70">TAKİP EDİLMELİ</span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-lg border border-emerald-500/30 bg-emerald-950/10 p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-emerald-500">
              <Activity className="h-5 w-5" />
              <span className="font-sans text-sm font-bold uppercase tracking-wider">Düşük Seviye</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-3xl font-bold text-emerald-400">{countBySeverity('LOW')}</span>
              <span className="font-mono text-xs text-emerald-500/70">OLASILIK DAHİLİNDE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtreleme ve Liste Alanı */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-slate-800 bg-slate-900/30 backdrop-blur-sm">

        {/* Filtre Barı (Mobil Uyumlu Kesin Çözüm) */}
        <div className="flex flex-col gap-3 border-b border-slate-800 bg-slate-900/50 px-4 py-3 sm:flex-row sm:items-center">
          <div className="flex shrink-0 items-center gap-2 text-slate-400">
            <Filter className="h-4 w-4" />
            <span className="font-sans text-sm font-bold uppercase tracking-widest">Filtrele:</span>
          </div>

          <div className="flex w-full overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            <div className="flex gap-2">
              {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`shrink-0 rounded-md px-4 py-2 font-mono text-xs font-bold transition-all ${
                    filter === f
                      ? 'bg-cyan-900 text-cyan-400 border border-cyan-500'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-slate-200'
                  }`}
                >
                  {f === 'ALL' ? 'TÜMÜ' : f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* İstihbarat Akışı (Liste) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {isLoading && <p className="p-6 text-center text-sm text-slate-400">AI risk kayıtları yükleniyor...</p>}
            {!isLoading && filteredRisks.length === 0 && (
              <p className="rounded-lg border border-slate-800 p-6 text-center text-sm text-slate-400">
                {risks.length === 0 ? 'Projeler için kayıtlı AI riski bulunamadı.' : 'Bu seviyede risk bulunamadı.'}
              </p>
            )}
            {filteredRisks.map((risk) => {
              const conf = getSeverityConfig(risk.severity);
              const Icon = conf.icon;
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                  key={risk.id}
                  className={`group flex flex-col sm:flex-row sm:items-stretch gap-4 rounded-lg border bg-slate-900/60 p-4 transition-colors hover:bg-slate-800/80 ${conf.border}`}
                >

                  {/* Sol Kısım: İkon ve İçerik */}
                  <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">

                    {/* İkon (Ezilmesini önlemek için min-w-[3rem] eklendi) */}
                    <div className={`flex h-12 w-12 min-w-[3rem] shrink-0 items-center justify-center rounded-full ${conf.bg} ${conf.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>

                    {/* Metin İçeriği (min-w-0 eklendi, böylece uzun yazılar ikonları ezmez) */}
                    <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
                      <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-2">
                        <span className={`shrink-0 rounded px-2 py-0.5 font-mono text-[10px] font-bold ${conf.bg} ${conf.color}`}>
                          {conf.label}
                        </span>
                        <h3 className="w-full truncate font-sans text-sm font-bold text-slate-200 sm:text-base">
                          {risk.title}
                        </h3>
                      </div>
                      <p className="line-clamp-2 font-sans text-xs text-slate-400 sm:text-sm">{risk.description}</p>

                      {/* Meta Etiketler */}
                      <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[10px] text-slate-500 sm:text-xs">
                        <span className="flex items-center gap-1"><Ship className="h-3 w-3 shrink-0" /> {risk.projectName}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="flex items-center gap-1"><Crosshair className="h-3 w-3 shrink-0" /> {risk.category}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{risk.time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Sağ Kısım: Projeye Git Butonu */}
                  <div className="flex w-full shrink-0 flex-col justify-center border-t border-slate-800/50 pt-3 sm:w-auto sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
                    <button
                      onClick={() => navigate(`/project/${risk.projectId}`)}
                      className="flex w-full items-center justify-center gap-2 rounded bg-slate-800 px-4 py-3 font-sans text-xs font-bold text-slate-300 transition-all hover:bg-cyan-600 hover:text-white sm:w-auto sm:py-2"
                    >
                      PROJEYE GİT <ArrowRight className="h-4 w-4 shrink-0" />
                    </button>
                  </div>

                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}