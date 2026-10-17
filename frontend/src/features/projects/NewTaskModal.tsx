import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, Clock, Link as LinkIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  zones: any[];
  tasks: any[];
  onCreated: () => void;
}

export default function NewTaskModal({ isOpen, onClose, project, zones, tasks, onCreated }: NewTaskModalProps) {
  const [name, setName] = useState('');
  const [durationDays, setDurationDays] = useState('1');
  const [shipAreaId, setShipAreaId] = useState('');
  const [predecessorId, setPredecessorId] = useState('');
  const [employees, setEmployees] = useState<any[]>([]);
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    api.get('/workforce/employees')
      .then(({ data }) => setEmployees(data))
      .catch((error) => {
        console.error('Personel listesi yüklenemedi:', error);
        toast.error('Göreve atanabilecek personel listesi yüklenemedi.');
      });
  }, [isOpen]);

  const createTask = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!project?.ship?.id) {
      toast.error('Bu projeye gemi bağlanmadığı için görev oluşturulamıyor.');
      return;
    }

    setIsSaving(true);
    try {
      const { data: task } = await api.post('/tasks', {
        name,
        projectId: project.id,
        shipId: project.ship.id,
        shipAreaId: shipAreaId || undefined,
        estimatedHours: Number(durationDays) * 8,
        assignedUserIds,
      });

      if (predecessorId) {
        try {
          await api.post('/tasks/dependencies', {
            predecessorId,
            successorId: task.id,
            type: 'FINISH_TO_START',
          });
        } catch (error: any) {
          onCreated();
          toast.error(error.response?.data?.message ?? 'Görev oluşturuldu ancak ön koşul eklenemedi.');
          onClose();
          return;
        }
      }

      toast.success('Görev oluşturuldu.');
      onCreated();
      setName('');
      setDurationDays('1');
      setShipAreaId('');
      setPredecessorId('');
      setAssignedUserIds([]);
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? 'Görev oluşturulamadı.');
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
            onSubmit={createTask}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/50 p-5">
              <div>
                <h2 className="font-sans text-lg font-bold text-slate-100">Yeni Görev Ekle</h2>
                <p className="font-mono text-xs text-slate-400">PROJE GÖREV AĞINA KAYDET</p>
              </div>
              <button type="button" onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-slate-800"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex flex-col gap-5 p-6">
              <label className="flex flex-col gap-2 text-xs font-medium uppercase text-slate-400">
                Görev adı
                <span className="relative">
                  <Activity className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input required value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-md border border-slate-700 bg-slate-950/50 py-2 pl-9 pr-4 text-sm normal-case text-slate-200" />
                </span>
              </label>
              <label className="flex flex-col gap-2 text-xs font-medium uppercase text-slate-400">
                Süre (gün)
                <span className="relative">
                  <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input type="number" min="0.125" step="0.125" required value={durationDays} onChange={(event) => setDurationDays(event.target.value)} className="w-full rounded-md border border-slate-700 bg-slate-950/50 py-2 pl-9 pr-4 text-sm normal-case text-slate-200" />
                </span>
              </label>
              <label className="flex flex-col gap-2 text-xs font-medium uppercase text-slate-400">
                Gemi alanı
                <select value={shipAreaId} onChange={(event) => setShipAreaId(event.target.value)} className="rounded-md border border-slate-700 bg-slate-950/50 p-2 text-sm normal-case text-slate-200">
                  <option value="">Alan seçilmedi</option>
                  {zones.map((zone) => <option key={zone.id} value={zone.id}>{zone.name}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-xs font-medium uppercase text-slate-400">
                Ön koşul
                <span className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <select value={predecessorId} onChange={(event) => setPredecessorId(event.target.value)} className="w-full rounded-md border border-slate-700 bg-slate-950/50 py-2 pl-9 pr-4 text-sm normal-case text-slate-200">
                    <option value="">Bağımsız görev</option>
                    {tasks.map((task) => <option key={task.id} value={task.id}>{task.name}</option>)}
                  </select>
                </span>
              </label>
              <label className="flex flex-col gap-2 text-xs font-medium uppercase text-slate-400">
                Atanacak personel
                <select
                  multiple
                  value={assignedUserIds}
                  onChange={(event) => setAssignedUserIds(Array.from(event.target.selectedOptions, (option) => option.value))}
                  className="min-h-24 rounded-md border border-slate-700 bg-slate-950/50 p-2 text-sm normal-case text-slate-200"
                >
                  {employees.map((employee) => (
                    <option key={employee.user.id} value={employee.user.id}>
                      {[employee.user.firstName, employee.user.lastName].filter(Boolean).join(' ') || employee.user.email}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-800 bg-slate-900/50 p-5">
              <button type="button" onClick={onClose} className="rounded-md px-4 py-2 text-sm text-slate-400">İptal</button>
              <button disabled={isSaving} className="rounded-md bg-cyan-600 px-6 py-2 text-sm font-medium text-white disabled:opacity-50">{isSaving ? 'KAYDEDİLİYOR...' : 'AĞA DAHİL ET'}</button>
            </div>
          </motion.form>
        </div>
      )}
    </AnimatePresence>
  );
}
