import { motion, AnimatePresence } from 'framer-motion';
import { X, Ship, Hash, Calendar, Layers } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewProjectModal({ isOpen, onClose }: NewProjectModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Arka Plan Karartması */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />

          {/* Modal Gövdesi */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl"
          >

            {/* Modal Başlığı */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/50 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded bg-cyan-950/30 text-cyan-500">
                  <Ship className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-sans text-lg font-bold text-slate-100">Yeni Proje Başlat</h2>
                  <p className="font-mono text-xs text-slate-400">SİSTEME YENİ GEMİ KAYDI</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded text-slate-400 hover:bg-slate-800 hover:text-slate-200 p-1 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Alanı */}
            <div className="flex flex-col gap-5 p-6">

              <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="font-sans text-xs font-medium uppercase text-slate-400">Gemi Adı</label>
                  <div className="relative">
                    <Ship className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input type="text" placeholder="M/V POSEIDON" className="w-full rounded-md border border-slate-700 bg-slate-950/50 py-2 pl-9 pr-4 font-mono text-sm text-slate-200 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-sans text-xs font-medium uppercase text-slate-400">IMO Numarası</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input type="text" placeholder="IMO 1234567" className="w-full rounded-md border border-slate-700 bg-slate-950/50 py-2 pl-9 pr-4 font-mono text-sm text-slate-200 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-sans text-xs font-medium uppercase text-slate-400">Gemi Tipi</label>
                <div className="relative">
                  <Layers className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <select className="w-full appearance-none rounded-md border border-slate-700 bg-slate-950/50 py-2 pl-9 pr-4 font-mono text-sm text-slate-200 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500">
                    <option value="CONTAINER">Konteyner Gemisi (CONTAINER)</option>
                    <option value="TANKER">Tanker (TANKER)</option>
                    <option value="CARGO">Kuru Yük (CARGO)</option>
                    <option value="TUGBOAT">Römorkör (TUGBOAT)</option>
                    <option value="NAVAL">Askeri / Diğer (NAVAL)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-sans text-xs font-medium uppercase text-slate-400">Hedef Teslim Tarihi</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input type="date" className="w-full rounded-md border border-slate-700 bg-slate-950/50 py-2 pl-9 pr-4 font-mono text-sm text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 [&::-webkit-calendar-picker-indicator]:invert" />
                </div>
              </div>

            </div>

            {/* Alt Butonlar */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-800 bg-slate-900/50 p-5">
              <button
                onClick={onClose}
                className="rounded-md px-4 py-2 font-sans text-sm font-medium text-slate-400 transition-colors hover:text-slate-200"
              >
                İptal Et
              </button>
              <button className="rounded-md bg-cyan-600 px-6 py-2 font-sans text-sm font-medium text-white transition-colors hover:bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                KAYDI OLUŞTUR
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}