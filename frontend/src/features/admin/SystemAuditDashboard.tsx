import { useState } from 'react';
import {
  Server, Activity, BrainCircuit, ThumbsUp,
  Clock, ShieldCheck, Database, Filter, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Sahte (Mock) Telemetri Verileri
const MOCK_TELEMETRY = {
  systemStatus: 'ONLINE',
  dbLatency: '24ms',
  aiEngine: { status: 'ACTIVE', model: 'Qwen2.5:3b', vram: '3.2 GB / 8.0 GB' },
  aiMetrics: { totalQueries: 1245, avgResponseTime: '1.2s', satisfaction: 88 },
};

// Sahte (Mock) Denetim İzi (Audit Log) Verileri
const MOCK_AUDIT_LOGS = [
  { id: 'LOG-001', time: '10:45:22', date: '2026-10-16', user: 'Ahmet Yılmaz', role: 'MANAGER', action: 'GÖREV_GÜNCELLENDİ', target: 'TSK-104', oldVal: 'Süre: 3 Gün', newVal: 'Süre: 5 Gün', type: 'USER' },
  { id: 'LOG-002', time: '10:30:15', date: '2026-10-16', user: 'Garson AI', role: 'SYSTEM_AI', action: 'DURUM_DEĞİŞİMİ', target: 'TSK-107', oldVal: 'Durum: PENDING', newVal: 'Durum: BLOCKED', type: 'AI' },
  { id: 'LOG-003', time: '09:15:00', date: '2026-10-16', user: 'Mehmet Demir', role: 'WORKER', action: 'SÜRE_GİRİŞİ', target: 'TSK-104', oldVal: 'Kayıt: 0 Saat', newVal: 'Kayıt: 3 Saat', type: 'USER' },
  { id: 'LOG-004', time: '08:00:05', date: '2026-10-16', user: 'Sistem', role: 'CRON', action: 'GÜNLÜK_YEDEKLEME', target: 'DB_MAIN', oldVal: '-', newVal: 'Başarılı (450MB)', type: 'SYSTEM' },
];

export default function SystemAuditDashboard() {
  const [filter, setFilter] = useState('ALL');

  const filteredLogs = MOCK_AUDIT_LOGS.filter(log => filter === 'ALL' || log.type === filter);

  return (
    <div className="flex h-full flex-col gap-6 overflow-hidden">

      {/* Üst Başlık */}
      <div className="flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
            <Server className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-sans text-2xl font-bold text-slate-100">Sistem Telemetrisi & Denetim</h1>
            <p className="font-mono text-sm text-slate-500">LIVENESS PROBES, AI METRİKLERİ VE AUDIT LOG</p>
          </div>
        </div>
      </div>

      {/* 9.2 Sistem ve AI Telemetri Özeti (Grid Kartlar) */}
      <div className="grid shrink-0 gap-4 md:grid-cols-2 xl:grid-cols-4">

        {/* API & DB Durumu */}
        <div className="flex flex-col justify-between rounded-lg border border-emerald-500/30 bg-emerald-950/10 p-4">
          <div className="flex items-center gap-2 text-emerald-500">
            <Database className="h-4 w-4" />
            <span className="font-sans text-xs font-bold uppercase tracking-wider">Core API & DB</span>
          </div>
          <div className="mt-3 flex items-end justify-between">
            <span className="font-mono text-2xl font-bold text-emerald-400">ONLINE</span>
            <span className="font-mono text-xs text-emerald-500/70">Gecikme: {MOCK_TELEMETRY.dbLatency}</span>
          </div>
        </div>

        {/* AI Motoru (Ollama) */}
        <div className="flex flex-col justify-between rounded-lg border border-cyan-500/30 bg-cyan-950/10 p-4">
          <div className="flex items-center gap-2 text-cyan-500">
            <BrainCircuit className="h-4 w-4" />
            <span className="font-sans text-xs font-bold uppercase tracking-wider">Local AI (Ollama)</span>
          </div>
          <div className="mt-3 flex items-end justify-between">
            <div className="flex flex-col">
              <span className="font-mono text-xl font-bold text-cyan-400">{MOCK_TELEMETRY.aiEngine.model}</span>
              <span className="font-mono text-[10px] text-cyan-500/70">VRAM: {MOCK_TELEMETRY.aiEngine.vram}</span>
            </div>
            <span className="flex items-center gap-1 rounded bg-cyan-950/50 px-2 py-1 font-mono text-[10px] text-cyan-400 border border-cyan-500/30">
              <Activity className="h-3 w-3" /> ACTIVE
            </span>
          </div>
        </div>

        {/* AI Performans Metrikleri */}
        <div className="flex flex-col justify-between rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Clock className="h-4 w-4" />
            <span className="font-sans text-xs font-bold uppercase tracking-wider">AI Performansı</span>
          </div>
          <div className="mt-3 flex items-end justify-between">
            <div className="flex flex-col">
              <span className="font-mono text-xl font-bold text-slate-200">{MOCK_TELEMETRY.aiMetrics.avgResponseTime}</span>
              <span className="font-mono text-[10px] text-slate-500">Ortalama Yanıt Hızı</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="font-mono text-lg font-bold text-slate-300">{MOCK_TELEMETRY.aiMetrics.totalQueries}</span>
              <span className="font-mono text-[10px] text-slate-500">Toplam Sorgu</span>
            </div>
          </div>
        </div>

        {/* Kullanıcı Memnuniyeti */}
        <div className="flex flex-col justify-between rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center gap-2 text-slate-400">
            <ThumbsUp className="h-4 w-4" />
            <span className="font-sans text-xs font-bold uppercase tracking-wider">AI Memnuniyet (Faz 13)</span>
          </div>
          <div className="mt-3 flex items-center gap-4">
            <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full bg-emerald-500" style={{ width: `${MOCK_TELEMETRY.aiMetrics.satisfaction}%` }} />
            </div>
            <span className="font-mono text-2xl font-bold text-emerald-400">%{MOCK_TELEMETRY.aiMetrics.satisfaction}</span>
          </div>
        </div>

      </div>

      {/* 9.1 Denetim İzi (Audit Log) Alanı */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-slate-800 bg-slate-900/30">

        {/* Filtre Barı */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-400">
              <ShieldCheck className="h-4 w-4" />
              <span className="font-sans text-sm font-bold">Denetim İzi (Kayıt Defteri)</span>
            </div>
            <div className="h-4 w-px bg-slate-700"></div>
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-slate-500" />
              {['ALL', 'USER', 'AI', 'SYSTEM'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded px-2.5 py-1 font-mono text-[10px] font-bold transition-colors ${
                    filter === f ? 'bg-cyan-950/50 text-cyan-400 border border-cyan-800/50' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
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
          <table className="w-full text-left font-sans text-sm text-slate-300">
            <thead className="sticky top-0 border-b border-slate-800 bg-slate-950/90 text-[10px] uppercase tracking-wider text-slate-500 backdrop-blur-md font-mono">
              <tr>
                <th className="px-4 py-3 font-medium">Tarih / Saat</th>
                <th className="px-4 py-3 font-medium">Kullanıcı & Rol</th>
                <th className="px-4 py-3 font-medium">Aksiyon Türü</th>
                <th className="px-4 py-3 font-medium">Hedef Nesne</th>
                <th className="px-4 py-3 font-medium">Değişim Detayı</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              <AnimatePresence>
                {filteredLogs.map((log) => (
                  <motion.tr
                    layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    key={log.id}
                    className="transition-colors hover:bg-slate-800/40"
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs text-slate-300">{log.time}</span>
                        <span className="font-mono text-[10px] text-slate-500">{log.date}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${log.type === 'AI' ? 'bg-cyan-500' : log.type === 'USER' ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
                        <div className="flex flex-col">
                          <span className="font-sans text-xs font-bold text-slate-200">{log.user}</span>
                          <span className="font-mono text-[9px] text-slate-500">{log.role}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{log.action}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">#{log.target}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="rounded bg-slate-950 px-2 py-0.5 text-slate-400 border border-slate-800 line-through decoration-rose-500/50">{log.oldVal}</span>
                        <ArrowRight className="h-3 w-3 text-cyan-500" />
                        <span className="rounded bg-cyan-950/30 px-2 py-0.5 text-cyan-400 border border-cyan-900/50">{log.newVal}</span>
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