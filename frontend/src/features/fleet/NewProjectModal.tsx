import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Ship, Hash, Calendar, Layers } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function NewProjectModal({ isOpen, onClose, onCreated }: NewProjectModalProps) {
  const [name, setName] = useState('');
  const [imoNumber, setImoNumber] = useState('');
  const [shipType, setShipType] = useState('Kuru yük gemisi');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const { data: ship } = await api.post('/ships', {
        name,
        imoNumber: imoNumber || undefined,
        shipType,
        status: 'NEW_BUILDING',
      });
      await api.post('/projects', {
        name,
        projectCode: `PRJ-${Date.now()}`,
        type: 'NEW_BUILDING',
        status: 'PLANNING',
        priority: 'MEDIUM',
        plannedDeliveryDate: deliveryDate || undefined,
        ship: { id: ship.id },
      });
      toast.success('Gemi ve proje oluşturuldu.');
      onCreated();
      onClose();
      setName('');
      setImoNumber('');
      setDeliveryDate('');
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? 'Proje oluşturulamadı.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 p-5">
              <div className="flex items-center gap-3">
                <Ship className="h-5 w-5 text-cyan-500" />
                <div><h2 className="font-bold text-slate-100">Yeni Proje Başlat</h2><p className="text-xs text-slate-400">GEMİ VE PROJE KAYDI</p></div>
              </div>
              <button type="button" onClick={onClose}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <div className="flex flex-col gap-5 p-6">
              <label className="flex flex-col gap-2 text-xs text-slate-400">Gemi adı
                <span className="relative"><Ship className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" /><input required value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded border border-slate-700 bg-slate-950 p-2 pl-9 text-sm text-slate-100" /></span>
              </label>
              <label className="flex flex-col gap-2 text-xs text-slate-400">IMO numarası (isteğe bağlı)
                <span className="relative"><Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" /><input value={imoNumber} onChange={(event) => setImoNumber(event.target.value)} className="w-full rounded border border-slate-700 bg-slate-950 p-2 pl-9 text-sm text-slate-100" /></span>
              </label>
              <label className="flex flex-col gap-2 text-xs text-slate-400">Gemi tipi
                <span className="relative"><Layers className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" /><select value={shipType} onChange={(event) => setShipType(event.target.value)} className="w-full rounded border border-slate-700 bg-slate-950 p-2 pl-9 text-sm text-slate-100"><option>Kuru yük gemisi</option><option>Tanker</option><option>Konteyner gemisi</option><option>Liman römorkörü</option></select></span>
              </label>
              <label className="flex flex-col gap-2 text-xs text-slate-400">Hedef teslim tarihi
                <span className="relative"><Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" /><input type="date" value={deliveryDate} onChange={(event) => setDeliveryDate(event.target.value)} className="w-full rounded border border-slate-700 bg-slate-950 p-2 pl-9 text-sm text-slate-100" /></span>
              </label>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-800 p-5">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-400">İptal</button>
              <button disabled={isSaving} className="rounded bg-cyan-600 px-5 py-2 text-sm font-bold text-white disabled:opacity-50">{isSaving ? 'KAYDEDİLİYOR...' : 'KAYDI OLUŞTUR'}</button>
            </div>
          </motion.form>
        </div>
      )}
    </AnimatePresence>
  );
}
