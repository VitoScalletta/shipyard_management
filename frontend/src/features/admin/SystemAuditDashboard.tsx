import { useState, useEffect } from 'react';
import {
  Server, Activity, BrainCircuit,
  Clock, ShieldCheck, Database, Filter, ArrowRight, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function SystemAuditDashboard() {
  const [filter, setFilter] = useState('ALL');
  const [logs, setLogs] = useState<any[]>([]);

  // Sistem Telemetri Stateleri
  const [apiStatus, setApiStatus] = useState('KONTROL EDİLİYOR');
  const [databaseStatus, setDatabaseStatus] = useState('KONTROL EDİLİYOR');
  const [aiStatus, setAiStatus] = useState('KONTROL EDİLİYOR');

  // AI Performans Metrikleri
  const [aiLatency, setAiLatency] = useState<number | null>(null);
  const [aiTotalQueries, setAiTotalQueries] = useState<number>(0);

  useEffect(() => {
    // 1. Audit Logları Çek ve AI Sorgularını Say
    api.get('/audit?limit=100')
      .then(({ data }) => {
        const mappedLogs = data.map((log: any) => ({
          ...log,
          time: new Date(log.timeStamp).toLocaleTimeString('tr-TR'),
          date: new Date(log.timeStamp).toLocaleDateString('tr-TR'),
          user: log.userEmail ?? log.userId ?? 'Sistem',
          role: '-',
          action: log.action,
          target: `${log.entityName}:${log.entityId}`,
          oldVal: log.oldValues ? JSON.stringify(log.oldValues) : '-',
          newVal: log.newValues ? JSON.stringify(log.newValues) : '-',
          type: log.action.includes('AI') ? 'AI' : log.userId ? 'USER' : 'SYSTEM',
        }));

        setLogs(mappedLogs);

        const aiActionsCount = mappedLogs.filter((l: any) => l.type === 'AI').length;
        setAiTotalQueries(aiActionsCount);
      })
      .catch((error) => {
        console.error('Denetim kayıtları yüklenemedi:', error);
        toast.error('Denetim kayıtları yüklenemedi. Admin yetkinizi kontrol edin.');
      });

    // 2. Liveness Check
    api.get('/health/liveness')
      .then(() => setApiStatus('ONLINE'))
      .catch(() => setApiStatus('OFFLINE'));

    // 3. Readiness Check
    const startTime = performance.now();
    api.get('/health/readiness')
      .then(({ data }) => {
        const latency = Math.round(performance.now() - startTime);
        const dbStatus = data?.details?.database?.status;
        const ollamaStatus = data?.details?.ollama?.status;

        setDatabaseStatus(dbStatus === 'up' ? 'BAĞLI' : 'ERİŞİLEMİYOR');
        setAiStatus(ollamaStatus === 'up' ? 'AKTİF' : 'KAPALI');

        if (ollamaStatus === 'up') setAiLatency(latency);
      })
      .catch((error) => {
        const details = error.response?.data?.details;
        setDatabaseStatus(details?.database?.status === 'up' ? 'BAĞLI' : 'ERİŞİLEMİYOR');
        setAiStatus(details?.ollama?.status === 'up' ? 'AKTİF' : 'KAPALI');
      });
  }, []);

  const filteredLogs = logs.filter(log => filter === 'ALL' || log.type === filter);

  const isDbHealthy = apiStatus === 'ONLINE' && databaseStatus === 'BAĞLI';
  const isAiHealthy = aiStatus === 'AKTİF';

  return (
    <div className="flex h-full flex-col gap-6 overflow-hidden relative z-10">
      {/* Üst Başlık */}
      <div className="flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border shadow-sm border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:shadow-lg transition-colors">
            <Server className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-sans text-2xl font-bold text-slate-900 dark:text-slate-100 transition-colors">Sistem Telemetrisi & Denetim</h1>
            <p className="font-mono text-sm text-slate-500 transition-colors">LIVENESS PROBES, AI METRİKLERİ VE AUDIT LOG</p>
          </div>
        </div>
      </div>

      {/* 9.2 Sistem ve AI Telemetri Özeti (Grid Kartlar) */}
      <div className="grid shrink-0 gap-4 md:grid-cols-2 xl:grid-cols-4">

        {/* API & DB Durumu (Dinamik Renk) */}
        <div className={`flex flex-col justify-between rounded-lg border p-4 transition-colors ${isDbHealthy ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-950/10' : 'border-rose-200 bg-rose-50 dark:border-rose-500/50 dark:bg-rose-950/20'}`}>
          <div className={`flex items-center gap-2 ${isDbHealthy ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-600 dark:text-rose-500'}`}>
            <Database className="h-4 w-4" />
            <span className="font-sans text-xs font-bold uppercase tracking-wider">Core API & DB</span>
          </div>
          <div className="mt-3 flex items-end justify-between">
            <span className={`font-mono text-2xl font-bold ${isDbHealthy ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
              {apiStatus}
            </span>
            <span className={`font-mono text-xs ${isDbHealthy ? 'text-emerald-600/70 dark:text-emerald-500/70' : 'text-rose-600/70 dark:text-rose-500/70'}`}>
              DB: {databaseStatus}
            </span>
          </div>
        </div>

        {/* AI Motoru (Ollama) (Dinamik Renk) */}
        <div className={`flex flex-col justify-between rounded-lg border p-4 transition-colors ${isAiHealthy ? 'border-cyan-200 bg-cyan-50 dark:border-cyan-500/30 dark:bg-cyan-950/10' : 'border-rose-200 bg-rose-50 dark:border-rose-500/50 dark:bg-rose-950/20'}`}>
          <div className={`flex items-center gap-2 ${isAiHealthy ? 'text-cyan-600 dark:text-cyan-500' : 'text-rose-600 dark:text-rose-500'}`}>
            <BrainCircuit className="h-4 w-4" />
            <span className="font-sans text-xs font-bold uppercase tracking-wider">Local AI (Ollama)</span>
          </div>
          <div className="mt-3 flex items-end justify-between">
            <div className="flex flex-col">
              <span className={`font-mono text-xl font-bold ${isAiHealthy ? 'text-cyan-700 dark:text-cyan-400' : 'text-rose-700 dark:text-rose-400'}`}>Ollama Qwen</span>
              <span className={`font-mono text-[10px] ${isAiHealthy ? 'text-cyan-600/70 dark:text-cyan-500/70' : 'text-rose-600/70 dark:text-rose-500/70'}`}>LLM Motoru</span>
            </div>
            <span className={`flex items-center gap-1 rounded px-2 py-1 font-mono text-[10px] border ${isAiHealthy ? 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-400 dark:border-cyan-500/30' : 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-500/30 animate-pulse'}`}>
              {isAiHealthy ? <Activity className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
              {aiStatus}
            </span>
          </div>
        </div>

        {/* AI Performans Metrikleri */}
        <div className="flex flex-col justify-between rounded-lg border p-4 transition-colors border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Clock className="h-4 w-4" />
            <span className="font-sans text-xs font-bold uppercase tracking-wider">Sağlık Kontrolü Yanıt Süresi</span>
          </div>
          <div className="mt-3 flex items-end justify-between">
            <div className="flex flex-col">
              <span className={`font-mono text-xl font-bold ${aiLatency && aiLatency < 500 ? 'text-emerald-600 dark:text-emerald-400' : aiLatency && aiLatency < 2000 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {aiLatency ? `${aiLatency} ms` : '—'}
              </span>
              <span className="font-mono text-[10px] text-slate-500">API ve bağımlılık kontrolü</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="font-mono text-lg font-bold text-slate-700 dark:text-slate-300">{aiTotalQueries}</span>
              <span className="font-mono text-[10px] text-slate-500">Son 100 kayıttaki AI olayı</span>
            </div>
          </div>
        </div>

      </div>

      {/* 9.1 Denetim İzi (Audit Log) Alanı */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-lg border transition-colors border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/30 shadow-sm dark:shadow-none">

        {/* Filtre Barı */}
        <div className="flex items-center justify-between border-b px-4 py-3 transition-colors border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <ShieldCheck className="h-4 w-4" />
              <span className="font-sans text-sm font-bold text-slate-800 dark:text-slate-200">Denetim İzi (Kayıt Defteri)</span>
            </div>
            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700"></div>
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
              {['ALL', 'USER', 'AI', 'SYSTEM'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded border px-2.5 py-1 font-mono text-[10px] font-bold transition-colors ${
                    filter === f
                      ? 'bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-400 dark:border-cyan-800/50'
                      : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  {f === 'ALL' ? 'TÜMÜ' : f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tablo */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left font-sans text-sm text-slate-700 dark:text-slate-300">
            <thead className="sticky top-0 z-10 border-b text-[10px] uppercase tracking-wider backdrop-blur-md font-mono transition-colors border-slate-200 bg-slate-50/90 text-slate-500 dark:border-slate-800 dark:bg-slate-950/90">
              <tr>
                <th className="px-4 py-3 font-medium">Tarih / Saat</th>
                <th className="px-4 py-3 font-medium">Kullanıcı & Rol</th>
                <th className="px-4 py-3 font-medium">Aksiyon Türü</th>
                <th className="px-4 py-3 font-medium">Hedef Nesne</th>
                <th className="px-4 py-3 font-medium">Değişim Detayı</th>
              </tr>
            </thead>
            <tbody className="divide-y transition-colors divide-slate-100 dark:divide-slate-800/50">
              <AnimatePresence>
                {filteredLogs.map((log) => (
                  <motion.tr
                    layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    key={log.id}
                    className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs text-slate-800 dark:text-slate-300">{log.time}</span>
                        <span className="font-mono text-[10px] text-slate-500">{log.date}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${log.type === 'AI' ? 'bg-cyan-500 dark:shadow-[0_0_8px_rgba(6,182,212,0.8)]' : log.type === 'USER' ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-500'}`}></span>
                        <div className="flex flex-col">
                          <span className="font-sans text-xs font-bold text-slate-800 dark:text-slate-200">{log.user}</span>
                          <span className="font-mono text-[9px] text-slate-500">{log.role}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{log.action}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">#{log.target}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="rounded border px-2 py-0.5 line-through transition-colors border-slate-200 bg-slate-100 text-slate-500 decoration-rose-500/50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">{log.oldVal}</span>
                        <ArrowRight className="h-3 w-3 text-cyan-500" />
                        <span className="rounded border px-2 py-0.5 transition-colors border-cyan-200 bg-cyan-50 text-cyan-600 dark:border-cyan-900/50 dark:bg-cyan-950/30 dark:text-cyan-400">{log.newVal}</span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}