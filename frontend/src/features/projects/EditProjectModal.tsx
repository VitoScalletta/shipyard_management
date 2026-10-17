import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Ship, Calendar, User, Activity } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  onUpdated: () => void;
}

export default function EditProjectModal({ isOpen, onClose, project, onUpdated }: EditProjectModalProps) {
  const [name, setName] = useState('');
  const [manager, setManager] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (project && isOpen) {
      setName(project.name || '');
      setManager(project.manager || '');
      setStatus(project.status || 'PLANNING');

      if (project.plannedDeliveryDate || project.dueDate) {
        const dateObj = new Date(project.plannedDeliveryDate || project.dueDate);
        setDeliveryDate(dateObj.toISOString().split('T')[0]);
      }
    }
  }, [project, isOpen]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      await api.patch(`/projects/${project.id}`, {
        name,
        manager,
        status,
        plannedDeliveryDate: deliveryDate ? new Date(deliveryDate).toISOString() : undefined,
      });

      toast.success('Proje başarıyla güncellendi.');
      onUpdated();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? 'Proje güncellenemedi.');
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
                <div><h2 className="font-bold text-slate-100">Projeyi Düzenle</h2><p className="text-xs text-slate-400">{project?.projectCode || project?.id}</p></div>
              </div>
              <button type="button" onClick={onClose}><X className="h-5 w-5 text-slate-400 hover:text-white" /></button>
            </div>

            <div className="flex flex-col gap-5 p-6">
              <label className="flex flex-col gap-2 text-xs text-slate-400">Gemi/Proje Adı
                <span className="relative"><Ship className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" /><input required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded border border-slate-700 bg-slate-950 p-2 pl-9 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none" /></span>
              </label>
              <label className="flex flex-col gap-2 text-xs text-slate-400">Proje Yöneticisi
                <span className="relative"><User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" /><input value={manager} onChange={(e) => setManager(e.target.value)} placeholder="Örn: Kpt. Demir" className="w-full rounded border border-slate-700 bg-slate-950 p-2 pl-9 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none" /></span>
              </label>
              <label className="flex flex-col gap-2 text-xs text-slate-400">Genel Durum
                <span className="relative"><Activity className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" /><select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded border border-slate-700 bg-slate-950 p-2 pl-9 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"><option value="PLANNING">Planlanıyor</option><option value="ON_TRACK">Zamanında İlerliyor</option><option value="DELAYED">Gecikmeli</option><option value="MAINTENANCE">Bakımda</option></select></span>
              </label>
              <label className="flex flex-col gap-2 text-xs text-slate-400">Hedef Teslim Tarihi
                <span className="relative"><Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" /><input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} className="w-full rounded border border-slate-700 bg-slate-950 p-2 pl-9 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none" /></span>
              </label>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-800 p-5 bg-slate-900/50">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200">İptal</button>
              <button type="submit" disabled={isSaving} className="rounded bg-cyan-600 px-5 py-2 text-sm font-bold text-white hover:bg-cyan-500 disabled:opacity-50">{isSaving ? 'GÜNCELLENİYOR...' : 'DEĞİŞİKLİKLERİ KAYDET'}</button>
            </div>
          </motion.form>
        </div>
      )}
    </AnimatePresence>
  );
}