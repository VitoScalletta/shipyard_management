import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BrainCircuit, RefreshCw,
  ThumbsUp, ThumbsDown, Crosshair, Sparkles, Activity
} from 'lucide-react';

// AI tarafından üretilmiş örnek (Mock) Risk JSON Çıktısı
const MOCK_AI_RISKS = [
  {
    id: 'RISK-01',
    targetNodeId: '4', // React Flow'daki "Ana Katman Epoksi" kutusunun ID'si
    category: 'CRITICAL_PATH',
    severity: 'HIGH',
    title: 'Ana Katman Epoksi Görevinde Kritik Darboğaz',
    description: 'Kritik yol üzerinde bulunan epoksi görevi bloke durumda. Bu durum tüm projenin teslim tarihini en az 4 gün öteleyecek.',
    evidence: ['Geciken Görev #104', 'Bloke Nedeni: Vinç-04 Çakışması'],
    recommendation: 'Vinç-04\'ü "Ocean Horizon" projesinden 2 günlüğüne buraya kaydırın veya gece vardiyasına +5 personel ekleyin.',
  },
  {
    id: 'RISK-02',
    targetNodeId: '1', // React Flow'daki "Yüzey Hazırlığı" kutusunun ID'si
    category: 'WORKFORCE',
    severity: 'MEDIUM',
    title: 'Boya Ekibinde Aşırı Yük (Overload)',
    description: 'Yüzey hazırlığı tamamlandığı için boya ekibine aynı anda 3 farklı bölgeden iş talebi gelmiş durumda.',
    evidence: ['Aktif Görev Yükü: %140', 'Adam-Saat Bütçesi Aşılıyor'],
    recommendation: 'Taşeron "GemiBoy A.Ş." ekibinden 1 haftalık destek kuvvet çağrılması önerilir.',
  }
];

interface AiRiskPanelProps {
  onClose: () => void;
  onFocusNode?: (nodeId: string) => void; // YENİ: Dışarıya fırlatılacak hedef ID fonksiyonu
}

export default function AiRiskPanel({ onClose, onFocusNode }: AiRiskPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'UP' | 'DOWN' | null>>({});

  const handleReAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 3000);
  };

  const getSeverityStyle = (severity: string) => {
    if (severity === 'HIGH') return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    if (severity === 'MEDIUM') return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
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
            <span className="font-mono text-sm font-bold text-rose-500">YÜKSEK (HIGH)</span>
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
          {!isAnalyzing && MOCK_AI_RISKS.map((risk) => (
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              key={risk.id}
              onClick={() => onFocusNode?.(risk.targetNodeId)} // KARTA TIKLANDIĞINDA ID'Yİ GÖNDER
              className="group flex cursor-pointer flex-col gap-3 rounded-lg border border-slate-700 bg-slate-900/80 p-4 transition-all hover:border-cyan-500/50 hover:bg-slate-800/80 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]"
            >

              <div className="flex items-start justify-between">
                <span className={`rounded px-2 py-0.5 font-mono text-[9px] font-bold ${getSeverityStyle(risk.severity)}`}>
                  {risk.category} • {risk.severity}
                </span>
                <span className="rounded bg-slate-950/50 px-2 py-0.5 font-mono text-[9px] text-cyan-400 opacity-0 transition-opacity group-hover:opacity-100">
                  ODAKLAN ➔
                </span>
              </div>

              <div>
                <h3 className="font-sans text-sm font-bold text-slate-200 group-hover:text-cyan-100">{risk.title}</h3>
                <p className="mt-1 font-sans text-xs text-slate-400 leading-relaxed">{risk.description}</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-[10px] uppercase text-slate-500">Dayanak / Kanıt</span>
                <div className="flex flex-wrap gap-1.5">
                  {risk.evidence.map((ev, i) => (
                    <span key={i} className="flex items-center gap-1 rounded bg-slate-800/80 px-1.5 py-0.5 font-mono text-[10px] text-slate-300">
                      <Crosshair className="h-3 w-3 text-cyan-500" /> {ev}
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative mt-1 flex flex-col gap-1.5 rounded border border-cyan-500/20 bg-cyan-950/20 p-3">
                <div className="absolute -left-[1px] top-2 h-4 w-[2px] bg-cyan-500"></div>
                <div className="flex items-center gap-1.5 text-cyan-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span className="font-sans text-[10px] font-bold uppercase tracking-wider">AI Çözüm Önerisi</span>
                </div>
                <p className="font-sans text-xs text-cyan-100/80">{risk.recommendation}</p>
              </div>

              <div className="mt-2 flex items-center justify-between border-t border-slate-800 pt-3" onClick={(e) => e.stopPropagation() /* Butona basınca karta basılmış sayılmasın */}>
                <span className="font-mono text-[10px] text-slate-500">BU ANALİZ FAYDALI MIYDI?</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFeedbackGiven({...feedbackGiven, [risk.id]: 'UP'})}
                    className={`rounded p-1.5 transition-colors ${feedbackGiven[risk.id] === 'UP' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:bg-slate-800 hover:text-emerald-400'}`}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setFeedbackGiven({...feedbackGiven, [risk.id]: 'DOWN'})}
                    className={`rounded p-1.5 transition-colors ${feedbackGiven[risk.id] === 'DOWN' ? 'bg-rose-500/20 text-rose-400' : 'text-slate-500 hover:bg-slate-800 hover:text-rose-400'}`}
                  >
                    <ThumbsDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

            </motion.div>
          ))}

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