import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, Clock, Users, Link as LinkIcon } from 'lucide-react';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewTaskModal({ isOpen, onClose }: NewTaskModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/50 p-5">
              <div className="flex flex-col gap-1">
                <h2 className="font-sans text-lg font-bold text-slate-100">Yeni Görev Ekle</h2>
                <p className="font-mono text-xs text-slate-400">KRİTİK YOL AĞINA DÜĞÜM BAĞLA</p>
              </div>
              <button onClick={onClose} className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-5 p-6">
              <div className="flex flex-col gap-2">
                <label className="font-sans text-xs font-medium uppercase text-slate-400">Görev Adı</label>
                <div className="relative">
                  <Activity className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input type="text" placeholder="Örn: Pervane Montajı" className="w-full rounded-md border border-slate-700 bg-slate-950/50 py-2 pl-9 pr-4 font-sans text-sm text-slate-200 focus:border-cyan-500 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-xs font-medium uppercase text-slate-400">Süre (Gün)</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input type="number" placeholder="3" className="w-full rounded-md border border-slate-700 bg-slate-950/50 py-2 pl-9 pr-4 font-mono text-sm text-slate-200 focus:border-cyan-500 focus:outline-none" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-xs font-medium uppercase text-slate-400">Gerekli Personel</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input type="number" placeholder="4" className="w-full rounded-md border border-slate-700 bg-slate-950/50 py-2 pl-9 pr-4 font-mono text-sm text-slate-200 focus:border-cyan-500 focus:outline-none" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-sans text-xs font-medium uppercase text-slate-400">Ön Şart (Bağımlılık)</label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <select className="w-full appearance-none rounded-md border border-slate-700 bg-slate-950/50 py-2 pl-9 pr-4 font-sans text-sm text-slate-200 focus:border-cyan-500 focus:outline-none">
                    <option value="">-- Bağımsız Görev (Doğrudan Başlar) --</option>
                    <option value="1">Yüzey Hazırlığı & Kumlama</option>
                    <option value="2">Astar Boya Uygulaması</option>
                    <option value="3">Pervane Şaft İncelemesi</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-800 bg-slate-900/50 p-5">
              <button onClick={onClose} className="rounded-md px-4 py-2 font-sans text-sm font-medium text-slate-400 hover:text-slate-200">İptal</button>
              <button className="rounded-md bg-cyan-600 px-6 py-2 font-sans text-sm font-medium text-white transition-colors hover:bg-cyan-500">AĞA DAHİL ET</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}