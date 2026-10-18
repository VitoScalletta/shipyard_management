import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useTheme } from '@/contexts/ThemeContext';
import {
  X, Clock, Users, Wrench,
  CheckCircle2, Activity, AlertOctagon, ShieldAlert
} from 'lucide-react';

interface TaskDetailDrawerProps {
  isOpen: boolean;
  task: any;
  onClose: () => void;
  onTaskUpdated: () => void;
}

export default function TaskDetailDrawer({ isOpen, task, onClose, onTaskUpdated }: TaskDetailDrawerProps) {
  const { theme } = useTheme();
  const [availableResources, setAvailableResources] = useState<any[]>([]);
  const [isResourceFormOpen, setIsResourceFormOpen] = useState(false);
  const [resourceId, setResourceId] = useState('');
  const [resourceQuantity, setResourceQuantity] = useState('1');
  const [isAssigningResource, setIsAssigningResource] = useState(false);
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [resourceLoadError, setResourceLoadError] = useState('');

  const toggleResourceForm = async () => {
    if (isResourceFormOpen) {
      setIsResourceFormOpen(false);
      return;
    }
    setIsResourceFormOpen(true);
    setIsLoadingResources(true);
    setResourceLoadError('');
    try {
      const { data } = await api.get('/resources', { params: { status: 'AVAILABLE' } });
      setAvailableResources(data);
      setResourceId(data[0]?.id ?? '');
    } catch (error) {
      console.error('Kullanılabilir kaynaklar yüklenemedi:', error);
      setResourceLoadError('Kullanılabilir kaynaklar yüklenemedi.');
      toast.error('Kullanılabilir kaynaklar yüklenemedi.');
    } finally {
      setIsLoadingResources(false);
    }
  };

  const completeTask = async () => {
    try {
      await api.patch(`/tasks/${task.id}/status`, { status: 'COMPLETED' });
      toast.success('Görev tamamlandı olarak kaydedildi.');
      onTaskUpdated();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? 'Görev durumu güncellenemedi.');
    }
  };

  const assignResource = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsAssigningResource(true);
    try {
      await api.post(`/tasks/${task.id}/resources`, {
        resourceId,
        quantity: Number(resourceQuantity),
      });
      toast.success('Kaynak göreve atandı.');
      onTaskUpdated();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? 'Kaynak göreve atanamadı.');
    } finally {
      setIsAssigningResource(false);
    }
  };
  // Görev durumuna göre renk ve ikon seçimi
  const getStatusConfig = (status: string) => {
    const light = theme === 'light';
    switch (status) {
      case 'COMPLETED': return { color: light ? 'text-emerald-700' : 'text-emerald-500', bg: light ? 'bg-emerald-100' : 'bg-emerald-500/10', border: light ? 'border-emerald-300' : 'border-emerald-500/20', icon: CheckCircle2, text: 'TAMAMLANDI' };
      case 'IN_PROGRESS': return { color: light ? 'text-cyan-700' : 'text-cyan-400', bg: light ? 'bg-cyan-100' : 'bg-cyan-950/30', border: light ? 'border-cyan-300' : 'border-cyan-500/30', icon: Activity, text: 'DEVAM EDİYOR' };
      case 'DELAYED': return { color: light ? 'text-amber-700' : 'text-amber-500', bg: light ? 'bg-amber-100' : 'bg-amber-950/30', border: light ? 'border-amber-300' : 'border-amber-500/30', icon: Clock, text: 'GECİKMELİ' };
      case 'BLOCKED': return { color: light ? 'text-rose-700' : 'text-rose-500', bg: light ? 'bg-rose-100' : 'bg-rose-950/30', border: light ? 'border-rose-300' : 'border-rose-500/30', icon: AlertOctagon, text: 'BLOKE EDİLDİ' };
      default: return { color: light ? 'text-slate-600' : 'text-slate-400', bg: light ? 'bg-slate-100' : 'bg-slate-900/50', border: light ? 'border-slate-300' : 'border-slate-700', icon: Clock, text: 'BEKLEMEDE' };
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
            className="fixed inset-0 z-40 bg-slate-900/25 backdrop-blur-sm dark:bg-slate-950/60"
          />

          {/* Sağdan Açılan Çekmece */}
          <motion.div
            initial={{ x: '100%', boxShadow: '-20px 0 50px rgba(0,0,0,0)' }}
            animate={{ x: 0, boxShadow: '-20px 0 50px rgba(0,0,0,0.5)' }}
            exit={{ x: '100%', boxShadow: '-20px 0 50px rgba(0,0,0,0)' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-md flex-col border-l border-slate-200 bg-white text-slate-900 shadow-2xl dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          >
            {/* Taktiksel Sol Çizgi Vurgusu */}
            <div className={`absolute bottom-0 left-0 top-0 w-1 ${config.bg.replace('/10', '').replace('/30', '')}`} />

            {/* Başlık Alanı */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 p-5 pl-6 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Görev Detayı</span>
                <h2 className="font-sans text-lg font-bold text-slate-900 dark:text-slate-100">{task.label}</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded p-2 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
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
                    {task.isCritical && <span className="font-mono text-[10px] text-slate-600 dark:text-slate-400">KRİTİK YOL ÜZERİNDE</span>}
                  </div>
                </div>

                {/* Eğer BLOKE ise Sistem Uyarısı */}
                {task.status === 'BLOCKED' && (
                  <div className="flex items-start gap-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4">
                    <ShieldAlert className="h-5 w-5 shrink-0 text-rose-500" />
                    <div className="flex flex-col gap-1">
                      <span className="font-sans text-sm font-bold text-rose-700 dark:text-rose-400">Kaynak Çakışması / Bloke</span>
                        <p className="font-sans text-xs text-rose-700/80 dark:text-rose-500/80">
                        Bu görev bloke durumunda. Ön koşul görevlerini ve atanmış kaynakların kullanılabilirliğini kontrol edin.
                      </p>
                    </div>
                  </div>
                )}

                {/* Operasyonel Metrikler */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1 rounded border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/50">
                    <span className="font-mono text-[10px] text-slate-500">TAHMİNİ SÜRE</span>
                    <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                      <Clock className="h-4 w-4 text-cyan-500" />
                      <span className="font-mono text-sm font-bold">{task.estimatedHours == null ? 'Belirtilmedi' : `${task.estimatedHours} saat`}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 rounded border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/50">
                    <span className="font-mono text-[10px] text-slate-500">ATANAN PERSONEL</span>
                    <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                      <Users className="h-4 w-4 text-cyan-500" />
                      <span className="font-mono text-sm font-bold">{task.assignedUsers?.length ?? 0} personel · {task.assignedTeams?.length ?? 0} takım</span>
                    </div>
                  </div>
                </div>

                {/* Ekipman ve Malzeme İhtiyacı */}
                <div className="flex flex-col gap-3">
                  <h3 className="font-sans text-sm font-bold text-slate-800 dark:text-slate-300">Gerekli Kaynaklar</h3>
                  <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/30">
                    {task.resources?.length ? task.resources.map((allocation: any) => (
                      <div key={allocation.id} className="flex items-center justify-between border-b border-slate-200 pb-2 last:border-0 last:pb-0 dark:border-slate-800/50">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <Wrench className="h-3.5 w-3.5" />
                          <span className="font-sans text-xs">{allocation.resource?.name ?? 'Kaynak'} · {allocation.allocatedQuantity} {allocation.resource?.unit ?? ''}</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-500">{allocation.resource?.status ?? 'Durum belirtilmedi'}</span>
                      </div>
                    )) : <p className="text-xs text-slate-500">Bu göreve atanmış kaynak bulunmuyor.</p>}
                    <button type="button" onClick={() => void toggleResourceForm()} className="mt-2 w-fit text-xs font-semibold text-cyan-700 hover:text-cyan-900 dark:text-cyan-400 dark:hover:text-cyan-200">
                      {isResourceFormOpen ? 'Atamayı kapat' : 'Kaynak ata'}
                    </button>
                    {isResourceFormOpen && (
                      <form onSubmit={assignResource} className="mt-2 flex flex-col gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
                        {!task.startDate || !task.plannedEndDate ? (
                          <p className="text-xs text-amber-700 dark:text-amber-400">Kaynak ayırmak için görev başlangıç ve bitiş tarihlerini tanımlayın.</p>
                        ) : resourceLoadError ? (
                          <p className="text-xs text-rose-600 dark:text-rose-400">{resourceLoadError}</p>
                        ) : isLoadingResources ? (
                          <p className="text-xs text-slate-500">Kaynaklar yükleniyor...</p>
                        ) : availableResources.length === 0 ? (
                          <p className="text-xs text-slate-500">Kullanılabilir kaynak bulunmuyor.</p>
                        ) : (
                          <>
                            <label className="text-xs text-slate-600 dark:text-slate-400">Kaynak
                              <select required value={resourceId} onChange={(event) => setResourceId(event.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                                {availableResources.map((resource) => <option key={resource.id} value={resource.id}>{resource.name} · {resource.availableQuantity} {resource.unit} uygun</option>)}
                              </select>
                            </label>
                            <label className="text-xs text-slate-600 dark:text-slate-400">Miktar
                              <input required type="number" min="0.01" step="0.01" value={resourceQuantity} onChange={(event) => setResourceQuantity(event.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-white p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
                            </label>
                            <button type="submit" disabled={isAssigningResource || !resourceId} className="rounded bg-cyan-600 px-3 py-2 text-xs font-bold text-white hover:bg-cyan-500 disabled:opacity-50">{isAssigningResource ? 'Atanıyor...' : 'Kaynağı ata'}</button>
                          </>
                        )}
                      </form>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Alt Aksiyon Butonları */}
            <div className="border-t border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/80">
              <button onClick={completeTask} disabled={task.status === 'COMPLETED'} className="rounded bg-cyan-600 py-2.5 font-sans text-xs font-bold text-white shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-colors hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50">
                GÖREVİ TAMAMLA
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}