import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Clock, MapPin, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface TaskListViewProps {
  tasks: any[];
  onTaskUpdated: () => void; // YENİ: Listede değişiklik olunca üst componenti tetikleyecek
}

export default function TaskListView({ tasks, onTaskUpdated }: TaskListViewProps) {
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  // Görev durumunu hızlıca değiştiren fonksiyon
  const handleStatusChange = async (taskId: string, newStatus: string) => {
    setUpdatingTaskId(taskId);
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      toast.success(newStatus === 'COMPLETED' ? 'Görev tamamlandı!' : 'Görev durumu güncellendi.');
      onTaskUpdated(); // Verileri yeniden çekmesi için babaya (ProjectDashboard) haber ver
    } catch (error) {
      toast.error('Görev güncellenirken bir hata oluştu.');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  // Checkbox tıklanma fonksiyonu (Tamamlandı / Devam Ediyor geçişi)
  const toggleTaskCompletion = (task: any) => {
    const isCompleted = task.status === 'COMPLETED';
    const newStatus = isCompleted ? 'IN_PROGRESS' : 'COMPLETED'; // Geri alırken In Progress'e atar
    handleStatusChange(task.id, newStatus);
  };

  if (!tasks || tasks.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-950">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
          <CheckSquare className="h-8 w-8 text-slate-400 dark:text-slate-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Görev Bulunamadı</h3>
        <p className="mt-1 text-sm">Bu projeye henüz bir görev tanımlanmamış.</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-auto bg-white dark:bg-slate-950">
      <table className="w-full text-left font-sans text-sm">
        <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 backdrop-blur-md font-mono dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-400">
          <tr>
            <th className="px-4 py-3 font-medium w-10 text-center">Durum</th>
            <th className="px-4 py-3 font-medium">Görev Adı</th>
            <th className="px-4 py-3 font-medium">Bölge (Zone)</th>
            <th className="px-4 py-3 font-medium">Tarih</th>
            <th className="px-4 py-3 font-medium text-right">Etiket</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
          <AnimatePresence>
            {tasks.map((task) => {
              const isCompleted = task.status === 'COMPLETED';
              const isUpdating = updatingTaskId === task.id;

              return (
                <motion.tr
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key={task.id}
                  className={`transition-all duration-300 ${
                    isCompleted
                      ? 'bg-slate-50/50 opacity-60 grayscale-[50%] dark:bg-slate-900/20'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {/* YENİ: İNTERAKTİF CHECKBOX ALANI */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleTaskCompletion(task)}
                      disabled={isUpdating}
                      className={`group relative flex h-5 w-5 items-center justify-center rounded border transition-all ${
                        isUpdating ? 'animate-pulse opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      } ${
                        isCompleted
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : 'border-slate-300 bg-white hover:border-cyan-500 dark:border-slate-600 dark:bg-slate-900 dark:hover:border-cyan-400'
                      }`}
                    >
                      {isCompleted && <Check className="h-3.5 w-3.5" />}
                    </button>
                  </td>

                  {/* Görev Adı */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className={`font-semibold transition-colors ${
                        isCompleted
                          ? 'text-slate-500 line-through dark:text-slate-500'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}>
                        {task.name}
                      </span>
                      <span className="font-mono text-[9px] text-slate-400 dark:text-slate-500">#{task.id.split('-')[0] || task.id}</span>
                    </div>
                  </td>

                  {/* Bölge */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 font-mono text-xs text-slate-600 dark:text-slate-400">
                      <MapPin className="h-3 w-3 opacity-70" />
                      {task.shipArea?.name || 'Tüm Gemi'}
                    </div>
                  </td>

                  {/* Tarih */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 font-mono text-xs text-slate-500 dark:text-slate-400">
                      <Clock className="h-3 w-3" />
                      {task.startDate ? new Date(task.startDate).toLocaleDateString('tr-TR') : 'Belirtilmedi'}
                    </div>
                  </td>

                  {/* Hızlı Durum Değiştirici (Rozet yerine Dropdown gibi çalışan bir select) */}
                  <td className="px-4 py-3 text-right">
                     <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        disabled={isUpdating}
                        className={`cursor-pointer appearance-none rounded-md border px-2 py-1 font-mono text-[10px] font-bold outline-none transition-colors ${
                          isUpdating ? 'animate-pulse opacity-50 cursor-not-allowed' : ''
                        } ${
                          task.status === 'COMPLETED' ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-500' :
                          task.status === 'IN_PROGRESS' ? 'border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-500' :
                          task.status === 'BLOCKED' ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-500' :
                          'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                     >
                        <option value="PENDING">BEKLİYOR</option>
                        <option value="IN_PROGRESS">DEVAM EDİYOR</option>
                        <option value="BLOCKED">DARBOĞAZ</option>
                        <option value="DELAYED">GECİKMELİ</option>
                        <option value="CANCELLED">İPTAL</option>
                        <option value="COMPLETED">TAMAMLANDI</option>
                     </select>
                  </td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}