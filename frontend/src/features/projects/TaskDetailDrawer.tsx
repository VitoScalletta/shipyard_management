import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Clock, Users, Wrench, AlertTriangle,
  CheckCircle2, Activity, AlertOctagon, ShieldAlert
} from 'lucide-react';

interface TaskDetailDrawerProps {
  isOpen: boolean;
  task: any;
  onClose: () => void;
}

export default function TaskDetailDrawer({ isOpen, task, onClose }: TaskDetailDrawerProps) {
  // Görev durumuna göre renk ve ikon seçimi
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'COMPLETED': return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle2, text: 'TAMAMLANDI' };
      case 'IN_PROGRESS': return { color: 'text-cyan-400', bg: 'bg-cyan-950/30', border: 'border-cyan-500/30', icon: Activity, text: 'DEVAM EDİYOR' };
      case 'DELAYED': return { color: 'text-amber-500', bg: 'bg-amber-950/30', border: 'border-amber-500/30', icon: Clock, text: 'GECİKMELİ' };
      case 'BLOCKED': return { color: 'text-rose-500', bg: 'bg-rose-950/30', border: 'border-rose-500/30', icon: AlertOctagon, text: 'BLOKE EDİLDİ' };
      default: return { color: 'text-slate-400', bg: 'bg-slate-900/50', border: 'border-slate-700', icon: Clock, text: 'BEKLEMEDE' };
    }
  };

  const config = task ? getStatusConfig(task.status) : getStatusConfig('');
  const StatusIcon = config.icon;

  return (
    <AnimatePresence>
      {isOpen && task && (
        <>
          {/* Arka Plan Karartması (Backdrop) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Sağdan Açılan Çekmece */}
          <motion.div
            initial={{ x: '100%', boxShadow: '-20px 0 50px rgba(0,0,0,0)' }}
            animate={{ x: 0, boxShadow: '-20px 0 50px rgba(0,0,0,0.5)' }}
            exit={{ x: '100%', boxShadow: '-20px 0 50px rgba(0,0,0,0)' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-md flex-col border-l border-slate-800 bg-slate-900 shadow-2xl"
          >
            {/* Taktiksel Sol Çizgi Vurgusu */}
            <div className={`absolute bottom-0 left-0 top-0 w-1 ${config.bg.replace('/10', '').replace('/30', '')}`} />

            {/* Başlık Alanı */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/50 p-5 pl-6">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Görev Detayı</span>
                <h2 className="font-sans text-lg font-bold text-slate-100">{task.label}</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Çekmece İçeriği */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex flex-col gap-6">

                {/* Durum Rozeti */}
                <div className={`flex items-center gap-3 rounded-lg border ${config.border} ${config.bg} p-4`}>
                  <StatusIcon className={`h-6 w-6 ${config.color}`} />
                  <div className="flex flex-col">
                    <span className={`font-mono text-xs font-bold ${config.color}`}>{config.text}</span>
                    {task.isCritical && <span className="font-mono text-[10px] text-slate-400">KRİTİK YOL ÜZERİNDE</span>}
                  </div>
                </div>

                {/* Eğer BLOKE ise Sistem Uyarısı */}
                {task.status === 'BLOCKED' && (
                  <div className="flex items-start gap-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4">
                    <ShieldAlert className="h-5 w-5 shrink-0 text-rose-500" />
                    <div className="flex flex-col gap-1">
                      <span className="font-sans text-sm font-bold text-rose-400">Kaynak Çakışması / Bloke</span>
                      <p className="font-sans text-xs text-rose-500/80">
                        Bu görev için gerekli olan "Vinç-04" şu anda "OCEAN HORIZON" projesinde aktif olarak kullanılmaktadır. Görev başlatılamıyor.
                      </p>
                    </div>
                  </div>
                )}

                {/* Operasyonel Metrikler */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1 rounded border border-slate-800 bg-slate-950/50 p-3">
                    <span className="font-mono text-[10px] text-slate-500">TAHMİNİ SÜRE</span>
                    <div className="flex items-center gap-2 text-slate-200">
                      <Clock className="h-4 w-4 text-cyan-500" />
                      <span className="font-mono text-sm font-bold">{task.duration}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 rounded border border-slate-800 bg-slate-950/50 p-3">
                    <span className="font-mono text-[10px] text-slate-500">ATANAN PERSONEL</span>
                    <div className="flex items-center gap-2 text-slate-200">
                      <Users className="h-4 w-4 text-cyan-500" />
                      <span className="font-mono text-sm font-bold">{task.team} İşçi / Mühendis</span>
                    </div>
                  </div>
                </div>

                {/* Ekipman ve Malzeme İhtiyacı */}
                <div className="flex flex-col gap-3">
                  <h3 className="font-sans text-sm font-bold text-slate-300">Gerekli Kaynaklar</h3>
                  <div className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-950/30 p-3">
                    <div className="flex items-center justify-between border-b border-slate-800/50 pb-2">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Wrench className="h-3.5 w-3.5" />
                        <span className="font-sans text-xs">Yüksek Basınçlı Kompresör</span>
                      </div>
                      <span className="font-mono text-[10px] text-emerald-500">SAHADA</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2 text-slate-400">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                        <span className="font-sans text-xs">Astar Boya (Jotun) - 400L</span>
                      </div>
                      <span className="font-mono text-[10px] text-amber-500">TEDARİKTE</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Alt Aksiyon Butonları */}
            <div className="grid grid-cols-2 gap-3 border-t border-slate-800 bg-slate-900/80 p-5">
              <button className="rounded bg-slate-800 py-2.5 font-sans text-xs font-bold text-slate-300 transition-colors hover:bg-slate-700">
                SORUN BİLDİR
              </button>
              <button className="rounded bg-cyan-600 py-2.5 font-sans text-xs font-bold text-white shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-colors hover:bg-cyan-500">
                GÖREVİ TAMAMLA
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}