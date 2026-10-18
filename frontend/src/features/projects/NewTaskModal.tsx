import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckSquare, Calendar, Layers, Network } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  zones: any[];
  tasks: any[]; // YENİ: Önceden eklenen görevleri seçebilmek için eklendi
  onCreated: () => void;
}

export default function NewTaskModal({ isOpen, onClose, project, zones, tasks, onCreated }: NewTaskModalProps) {
  const [name, setName] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // YENİ: Seçilen Bağımlılıkların (Predecessors) tutulduğu state
  const [selectedDeps, setSelectedDeps] = useState<string[]>([]);

  const [isSaving, setIsSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project.ship?.id) {
      toast.error('Bu projeye bağlı gemi bulunamadığı için görev oluşturulamadı.');
      return;
    }
    setIsSaving(true);
    try {
      // 1. Önce asıl görevi oluşturuyoruz
      const response = await api.post('/tasks', {
        name,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        plannedEndDate: endDate ? new Date(endDate).toISOString() : undefined,
        projectId: project.id,
        shipId: project.ship.id,
        shipAreaId: zoneId || undefined,
      });

      const createdTaskId = response.data?.id;

      // 2. Eğer başarıyla oluştuysa ve bağımlılık seçildiyse, onları birbirine bağlıyoruz
      if (createdTaskId && selectedDeps.length > 0) {
        await Promise.all(
          selectedDeps.map(depId =>
            api.post('/tasks/dependencies', {
            predecessorId: depId,
            successorId: createdTaskId,
            type: 'FINISH_TO_START'
            })
          )
        );
      }

      toast.success('Görev ve bağımlılıkları başarıyla oluşturuldu.');

      // Formu temizliyoruz
      setName('');
      setZoneId('');
      setStartDate('');
      setEndDate('');
      setSelectedDeps([]);

      onCreated();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? 'Görev oluşturulurken bir hata meydana geldi.');
    } finally {
      setIsSaving(false);
    }
  };

  const inputClasses = "w-full rounded-md border border-slate-300 bg-white p-2 pl-9 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-colors";
  const iconClasses = "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500";
  const labelClasses = "flex flex-col gap-2 text-xs font-medium text-slate-600 dark:text-slate-400";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm dark:bg-slate-950/80" />
          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative my-8 w-full max-w-lg overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          >
            {/* Üst Kısım */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <CheckSquare className="h-5 w-5 text-cyan-600 dark:text-cyan-500" />
                <div><h2 className="font-bold text-slate-900 dark:text-slate-100">Yeni Görev Ekle</h2></div>
              </div>
              <button type="button" onClick={onClose} className="rounded-md p-1 transition-colors hover:bg-slate-200 dark:hover:bg-slate-800"><X className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:hover:text-white" /></button>
            </div>

            <div className="flex flex-col gap-5 p-6">

              <label className={labelClasses}>Görev Adı
                <span className="relative"><CheckSquare className={iconClasses} /><input required value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} placeholder="Örn: Ana Güverte Kaynak İşlemi" /></span>
              </label>

              <label className={labelClasses}>İlgili Bölge (Zone)
                <span className="relative"><Layers className={iconClasses} />
                  <select value={zoneId} onChange={(e) => setZoneId(e.target.value)} className={inputClasses}>
                    <option value="">Bölge Seçilmedi (Tüm Gemi)</option>
                    {zones.map((z: any) => <option key={z.id} value={z.id}>{z.name}</option>)}
                  </select>
                </span>
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className={labelClasses}>Başlangıç Tarihi
                  <span className="relative"><Calendar className={iconClasses} /><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClasses} /></span>
                </label>
                <label className={labelClasses}>Bitiş Tarihi
                  <span className="relative"><Calendar className={iconClasses} /><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClasses} /></span>
                </label>
              </div>

              {/* YENİ: BAĞIMLILIK (PREDECESSORS) LİSTESİ */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                  <Network className="h-4 w-4" />
                  Öncelikli Görevler (Bağımlılıklar)
                </div>
                <div className="mt-1 flex max-h-32 flex-col gap-1 overflow-y-auto rounded-md border border-slate-300 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-950">
                  {tasks.length === 0 ? (
                    <span className="p-2 text-xs text-slate-500">Bu projede henüz başka bir görev bulunmuyor.</span>
                  ) : (
                    tasks.map((task) => (
                      <label
                        key={task.id}
                        className="flex cursor-pointer items-center gap-3 rounded p-2 text-sm text-slate-700 transition-colors hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300 accent-cyan-600 dark:border-slate-600 dark:accent-cyan-500"
                          checked={selectedDeps.includes(task.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedDeps([...selectedDeps, task.id]);
                            else setSelectedDeps(selectedDeps.filter(id => id !== task.id));
                          }}
                        />
                        <span className="truncate">{task.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {!project.ship?.id && <p className="text-xs text-rose-600 dark:text-rose-400">Görev oluşturmak için önce projeye gemi bağlanmalıdır.</p>}
            </div>

            {/* Alt Kısım (Footer) */}
            <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/50">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">İptal</button>
              <button type="submit" disabled={isSaving || !project.ship?.id} className="rounded-md bg-cyan-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-cyan-500 disabled:opacity-50 dark:shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                {isSaving ? 'EKLENİYOR...' : 'GÖREVİ EKLE'}
              </button>
            </div>
          </motion.form>
        </div>
      )}
    </AnimatePresence>
  );
}