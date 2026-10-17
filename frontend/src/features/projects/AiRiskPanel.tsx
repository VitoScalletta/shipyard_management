import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BrainCircuit, RefreshCw,
  Crosshair, Sparkles, Activity
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface AiRiskPanelProps {
  projectId: string;
  onClose: () => void;
  onFocusNode?: (nodeId: string) => void;
}

export default function AiRiskPanel({ projectId, onClose, onFocusNode }: AiRiskPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    let isActive = true;
    api.get(`/ai-context/projects/${projectId}/latest`)
      .then(({ data }) => {
        if (isActive) setAnalysis(data);
      })
      .catch((error) => {
        console.error('Proje AI analizi yüklenemedi:', error);
        toast.error('Proje AI analizi yüklenemedi.');
      });
    return () => {
      isActive = false;
    };
  }, [projectId]);

  const handleReAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const { data } = await api.post(`/ai-context/analyze/${projectId}`);
      setAnalysis(data.data);
      toast.success('AI proje analizi tamamlandı.');
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? 'AI analizi tamamlanamadı.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const risks = analysis?.risks ?? [];
  const getSeverityStyle = (severity: string) => {
    if (severity === 'HIGH') return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    if (severity === 'MEDIUM') return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    if (severity === 'LOW') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
  };

  return (
    <div className="flex h-full w-[400px] flex-col overflow-hidden rounded-lg border border-slate-800 bg-slate-900/60 shadow-2xl backdrop-blur-md">

      {/* Üst Başlık ve Radar Alanı */}
      <div className="relative flex flex-col items-center justify-center border-b border-slate-800 bg-slate-950/80 p-5 overflow-hidden">
        {isAnalyzing && (
          <motion.div
            initial={{ top: '-100%' }} animate={{ top: '200%' }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-32 bg-gradient-to-b from-transparent via-cyan-500/20 to-cyan-500/60 blur-md pointer-events-none"
          />
        )}

        <div className="relative z-10 flex w-full items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400">
            <BrainCircuit className={`h-5 w-5 ${isAnalyzing ? 'animate-pulse' : ''}`} />
            <span className="font-sans font-bold uppercase tracking-widest text-slate-100">AI İstihbarat</span>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300"><span className="text-xl">×</span></button>
        </div>

        <div className="relative z-10 mt-4 flex w-full items-center justify-between">
          <div className="flex flex-col">
            <span className="font-mono text-[10px] text-slate-500">RİSK SEVİYESİ</span>
            <span className="font-mono text-sm font-bold text-rose-500">{analysis?.overallRiskLevel ?? 'ANALİZ YOK'}</span>
          </div>
          <button
            onClick={handleReAnalyze} disabled={isAnalyzing}
            className="flex items-center gap-2 rounded-md border border-cyan-500/30 bg-cyan-950/40 px-3 py-1.5 font-sans text-xs font-bold text-cyan-400 transition-colors hover:bg-cyan-900 disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'ANALİZ EDİLİYOR...' : 'YENİDEN TARAMA'}
          </button>
        </div>
      </div>

      {/* Risk Kartları Listesi */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {!isAnalyzing && risks.map((risk: any, index: number) => {
            const targetNodeId = risk.taskId ?? risk.targetNodeId;
            const recommendations = analysis?.recommendations ?? [];
            const recommendationItem = recommendations[index];
            const recommendation = risk.recommendation
              ?? (typeof recommendationItem === 'string' ? recommendationItem : recommendationItem?.description)
              ?? 'Bu risk için öneri bulunmuyor.';
            const evidence = Array.isArray(risk.evidence) ? risk.evidence : [];
            const severity = risk.severity ?? analysis?.overallRiskLevel ?? 'UNKNOWN';
            return (
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              key={risk.id ?? `${risk.title}-${index}`}
              onClick={() => targetNodeId && onFocusNode?.(targetNodeId)}
              className={`group flex flex-col gap-3 rounded-lg border border-slate-700 bg-slate-900/80 p-4 transition-all hover:border-cyan-500/50 hover:bg-slate-800/80 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] ${targetNodeId ? 'cursor-pointer' : ''}`}
            >

              <div className="flex items-start justify-between">
                <span className={`rounded px-2 py-0.5 font-mono text-[9px] font-bold ${getSeverityStyle(severity)}`}>
                  {risk.type ?? risk.category ?? 'GENERAL'} • {severity}
                </span>
                {targetNodeId && <span className="rounded bg-slate-950/50 px-2 py-0.5 font-mono text-[9px] text-cyan-400 opacity-0 transition-opacity group-hover:opacity-100">ODAKLAN ➔</span>}
              </div>

              <div>
                <h3 className="font-sans text-sm font-bold text-slate-200 group-hover:text-cyan-100">{risk.title ?? 'AI riski'}</h3>
                <p className="mt-1 font-sans text-xs text-slate-400 leading-relaxed">{risk.description ?? 'Açıklama bulunmuyor.'}</p>
              </div>

              {evidence.length > 0 && <div className="flex flex-col gap-1.5">
                <span className="font-mono text-[10px] uppercase text-slate-500">Dayanak / Kanıt</span>
                <div className="flex flex-wrap gap-1.5">
                  {evidence.map((ev: string, i: number) => (
                    <span key={i} className="flex items-center gap-1 rounded bg-slate-800/80 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">
                      <Crosshair className="h-3 w-3 text-cyan-500" /> {ev}
                    </span>
                  ))}
                </div>
              </div>}

              <div className="relative mt-1 flex flex-col gap-1.5 rounded border border-cyan-500/20 bg-cyan-950/20 p-3">
                <div className="absolute -left-[1px] top-2 h-4 w-[2px] bg-cyan-500"></div>
                <div className="flex items-center gap-1.5 text-cyan-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span className="font-sans text-[10px] font-bold uppercase tracking-wider">AI Çözüm Önerisi</span>
                </div>
                <p className="font-sans text-xs text-cyan-100/80">{recommendation}</p>
              </div>

            </motion.div>
            );
          })}

          {!isAnalyzing && analysis && risks.length === 0 && (
            <p className="rounded-lg border border-slate-800 p-4 text-sm text-slate-400">Bu analizde risk kaydı bulunmuyor.</p>
          )}
          {!isAnalyzing && !analysis && (
            <p className="rounded-lg border border-slate-800 p-4 text-sm text-slate-400">Henüz analiz yok. Analiz başlatmak için yeniden taramayı seçin.</p>
          )}

          {isAnalyzing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-10 opacity-50">
               <Activity className="h-8 w-8 animate-pulse text-cyan-500" />
               <span className="mt-4 font-mono text-xs text-slate-400">SİSTEM VERİLERİ İŞLENİYOR...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}