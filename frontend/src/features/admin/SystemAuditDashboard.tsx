import { useState, useEffect } from 'react';
import {
  Server, Activity, BrainCircuit,
  Clock, ShieldCheck, Database, Filter, AlertTriangle, Eye, X, Copy, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { toast } from 'sonner';

// JSON verilerini renkli göstermek için mini bileşen
const JsonViewer = ({ data }: { data: any }) => {
  let parsedData = data;
  try {
    if (typeof data === 'string') parsedData = JSON.parse(data);
  } catch (e) {
    parsedData = data;
  }

  return (
    <pre className="overflow-x-auto whitespace-pre-wrap rounded-md bg-slate-900 p-4 font-mono text-[11px] leading-relaxed text-slate-300 dark:bg-slate-950/50 border border-slate-700/50 shadow-inner">
      {JSON.stringify(parsedData, null, 2).replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
        (match) => {
          let color = 'text-cyan-400'; // value
          if (/^"/.test(match)) {
            if (/:$/.test(match)) {
              color = 'text-slate-400'; // key
            } else {
              color = 'text-emerald-400'; // string
            }
          } else if (/true|false/.test(match)) {
            color = 'text-rose-400'; // boolean
          } else if (/null/.test(match)) {
            color = 'text-amber-400'; // null
          } else {
            color = 'text-cyan-300'; // number
          }
          return `<span class="${color}">${match}</span>`;
        }
      )}
    </pre>
  );
};

export default function SystemAuditDashboard() {
  const [filter, setFilter] = useState('ALL');
  const [logs, setLogs] = useState<any[]>([]);

  // Seçili Log Detayı için Drawer State
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [copiedObjId, setCopiedObjId] = useState<string | null>(null);

  // Sistem Telemetri Stateleri
  const [apiStatus, setApiStatus] = useState('KONTROL EDİLİYOR');
  const [databaseStatus, setDatabaseStatus] = useState('KONTROL EDİLİYOR');
  const [aiStatus, setAiStatus] = useState('KONTROL EDİLİYOR');
  const [aiLatency, setAiLatency] = useState<number | null>(null);
  const [aiTotalQueries, setAiTotalQueries] = useState<number>(0);

  useEffect(() => {
    // 1. Audit Logları Çek
    api.get('/audit?limit=100')
      .then(({ data }) => {
        const mappedLogs = data.map((log: any) => {

          // YENİ: Yapay Zeka İşlemlerini Taktiksel Tespit Etme
          const isAiAction =
            log.action.includes('AI') ||
            log.entityName.includes('Ai') ||
            log.entityName.includes('Analysis') ||
            log.entityName.includes('ContextSnapshot');

          return {
            ...log,
            time: new Date(log.timeStamp).toLocaleTimeString('tr-TR'),
            date: new Date(log.timeStamp).toLocaleDateString('tr-TR'),
            // Aktör ismini ve rolünü AI'a göre şekillendiriyoruz
            user: log.userEmail ?? log.userId ?? (isAiAction ? 'Ollama AI Motoru' : 'Sistem'),
            role: isAiAction ? 'AI_AGENT' : (log.userId ? 'KULLANICI' : 'SYSTEM_PROCESS'),
            action: log.action,
            targetRaw: `${log.entityName}:${log.entityId}`,
            target: `${log.entityName}:${log.entityId.substring(0, 4)}...${log.entityId.substring(log.entityId.length - 4)}`,
            oldVal: log.oldValues ? JSON.stringify(log.oldValues) : '-',
            newVal: log.newValues ? JSON.stringify(log.newValues) : '-',
            type: isAiAction ? 'AI' : log.userId ? 'USER' : 'SYSTEM',
          };
        });

        setLogs(mappedLogs);
        setAiTotalQueries(mappedLogs.filter((l: any) => l.type === 'AI').length);
      })
      .catch(() => toast.error('Denetim kayıtları yüklenemedi.'));

    // 2. Liveness Check
    api.get('/health/liveness')
      .then(() => setApiStatus('ONLINE'))
      .catch(() => setApiStatus('OFFLINE'));

    // 3. Readiness Check
    const startTime = performance.now();
    api.get('/health/readiness')
      .then(({ data }) => {
        const latency = Math.round(performance.now() - startTime);
        setDatabaseStatus(data?.details?.database?.status === 'up' ? 'BAĞLI' : 'ERİŞİLEMİYOR');
        setAiStatus(data?.details?.ollama?.status === 'up' ? 'AKTİF' : 'KAPALI');
        if (data?.details?.ollama?.status === 'up') setAiLatency(latency);
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

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedObjId(id);
    setTimeout(() => setCopiedObjId(null), 2000);
  };

  return (
    <div className="flex h-full flex-col gap-6 overflow-hidden relative z-10">
      {/* Üst Başlık (Değişmedi) */}
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

      {/* Metrik Kartları (Değişmedi) */}
      <div className="grid shrink-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* ... (API, Ollama ve Performans metrik kartları buradaydı, olduğu gibi kalıyor) ... */}
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

      {/* YENİLENMİŞ TABLO ALANI */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-lg border transition-colors border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/30 shadow-sm dark:shadow-none">

        {/* Filtre Barı (Değişmedi) */}
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
                <th className="px-6 py-4 font-medium">Tarih / Saat</th>
                <th className="px-6 py-4 font-medium">Kullanıcı & Rol</th>
                <th className="px-6 py-4 font-medium">Aksiyon</th>
                <th className="px-6 py-4 font-medium">Hedef Nesne</th>
                <th className="px-6 py-4 font-medium text-right">Veri Yükü</th>
              </tr>
            </thead>
            <tbody className="divide-y transition-colors divide-slate-100 dark:divide-slate-800/50">
              <AnimatePresence>
                {filteredLogs.map((log) => (
                  <motion.tr
                    layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    key={log.id}
                    className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40 group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">{log.time}</span>
                        <span className="font-mono text-[10px] text-slate-500">{log.date}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`h-2.5 w-2.5 rounded-full shadow-sm ${
                          log.type === 'AI' ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]' :
                          log.type === 'USER' ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}></span>
                        <div className="flex flex-col">
                          <span className="font-sans text-sm font-medium text-slate-800 dark:text-slate-200">{log.user}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {/* Renkli Aksiyon Rozeti */}
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-widest border ${
                        log.action === 'CREATE' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                        log.action === 'UPDATE' ? 'bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20' :
                        log.action === 'DELETE' ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20' :
                        'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20'
                      }`}>
                        {log.action}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 group/copy cursor-pointer" onClick={() => handleCopyId(log.targetRaw)}>
                        <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400 px-2 py-1 rounded bg-slate-100 dark:bg-slate-900 border border-transparent group-hover/copy:border-slate-300 dark:group-hover/copy:border-slate-700 transition-colors">
                          #{log.target}
                        </span>
                        {copiedObjId === log.targetRaw ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-slate-400 opacity-0 group-hover/copy:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      {/* Göz Yoran JSON Yerine Şık Buton */}
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-3 py-1.5 font-sans text-xs font-bold text-cyan-600 border border-cyan-200 shadow-sm transition-all hover:bg-cyan-50 dark:bg-slate-900 dark:border-cyan-500/30 dark:text-cyan-400 dark:hover:bg-slate-800"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Detay İncele
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON Detay Çekmecesi (Drawer) */}
      <AnimatePresence>
        {selectedLog && (
          <>
            {/* Arka plan karartması */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLog(null)}
              className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm dark:bg-slate-950/70"
            />
            {/* Çekmece */}
            <motion.div
              initial={{ x: '100%', boxShadow: '-20px 0 50px rgba(0,0,0,0)' }}
              animate={{ x: 0, boxShadow: '-20px 0 50px rgba(0,0,0,0.5)' }}
              exit={{ x: '100%', boxShadow: '-20px 0 50px rgba(0,0,0,0)' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-lg flex-col border-l border-slate-200 bg-white text-slate-900 shadow-2xl dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            >
              {/* Taktiksel Sol Çizgi */}
              <div className="absolute bottom-0 left-0 top-0 w-1 bg-cyan-500" />

              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 p-5 pl-6 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Denetim İzi Detayı</span>
                  <div className="flex items-center gap-2">
                    <h2 className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">#{selectedLog.targetRaw.split(':')[1]}</h2>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="rounded p-2 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">

                {/* Olay Meta Bilgileri */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1 rounded border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/50">
                    <span className="font-mono text-[10px] text-slate-500 uppercase">Aksiyon & Zaman</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">{selectedLog.action}</span>
                      <span className="font-mono text-[10px] text-slate-600 dark:text-slate-400">{selectedLog.time}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 rounded border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/50">
                    <span className="font-mono text-[10px] text-slate-500 uppercase">Aktör (Kullanıcı/Sistem)</span>
                    <span className="font-sans text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">{selectedLog.user}</span>
                  </div>
                </div>

                {/* Önceki Durum (Old Values) */}
                {selectedLog.oldVal !== '-' && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-rose-500"></div>
                      <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">Önceki Durum (Eski Değerler)</span>
                    </div>
                    <div dangerouslySetInnerHTML={{ __html: JsonViewer({ data: selectedLog.oldVal }).props.children }} />
                  </div>
                )}

                {/* Yeni Durum (New Values) */}
                {selectedLog.newVal !== '-' && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                      <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">Güncel Durum (Yeni Değerler)</span>
                    </div>
                    <div dangerouslySetInnerHTML={{ __html: JsonViewer({ data: selectedLog.newVal }).props.children }} />
                  </div>
                )}

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}