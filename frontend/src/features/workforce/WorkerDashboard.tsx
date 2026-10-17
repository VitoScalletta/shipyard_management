import { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, Clock, Wrench, Play, Square, HardHat, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

type WorkerTask = {
  id: string;
  name: string;
  description?: string;
  status: string;
  estimatedHours?: number;
  actualHours?: number;
  shipArea?: { name: string };
  resources?: { resource: { name: string } }[];
};

export default function WorkerDashboard() {
  const user = useAuthStore((state) => state.user);
  const [tasks, setTasks] = useState<WorkerTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTasks = async () => {
    try {
      const { data } = await api.get('/tasks');
      setTasks(data.filter((task: WorkerTask & { assignedUsers?: { id: string }[] }) =>
        task.assignedUsers?.some((assignedUser) => assignedUser.id === user?.id),
      ));
    } catch (error) {
      toast.error('Görevler backend’den yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [user?.id]);

  const updateStatus = async (task: WorkerTask, status: string) => {
    try {
      await api.patch(`/tasks/${task.id}/status`, { status });
      toast.success('Görev durumu güncellendi.');
      await loadTasks();
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? 'Görev durumu güncellenemedi.');
    }
  };

  const addHour = async (task: WorkerTask) => {
    try {
      await api.patch(`/tasks/${task.id}`, { actualHours: Number(task.actualHours ?? 0) + 1 });
      await loadTasks();
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? 'Çalışma saati kaydedilemedi.');
    }
  };

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto pb-10">
      <div className="flex shrink-0 flex-col gap-2 rounded-xl border border-cyan-900/30 bg-gradient-to-r from-cyan-950/40 to-slate-900/40 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-cyan-500/50 bg-cyan-900/50 text-cyan-400"><HardHat className="h-8 w-8" /></div>
          <div>
            <h1 className="font-sans text-2xl font-bold text-slate-100">Kolay Gelsin, {user?.firstName ?? user?.email}</h1>
            <p className="font-mono text-sm text-cyan-500">Atanmış görevler • {tasks.length} görev</p>
          </div>
        </div>
      </div>

      {isLoading && <p className="text-sm text-slate-400">Görevler yükleniyor...</p>}
      {!isLoading && tasks.length === 0 && <p className="rounded-lg border border-slate-800 p-6 text-slate-400">Hesabınıza atanmış görev bulunmuyor.</p>}
      <div className="flex flex-col gap-6">
        {tasks.map((task) => (
          <div key={task.id} className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/40 p-6">
            <div className="flex flex-col justify-between gap-4 border-b border-slate-800/60 pb-4 md:flex-row md:items-start">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2"><span className="rounded bg-slate-800 px-2 py-1 font-mono text-xs text-slate-400">{task.id.slice(0, 8)}</span><h2 className="font-sans text-xl font-bold text-slate-100">{task.name}</h2></div>
                <div className="flex items-center gap-2 text-sm text-slate-400"><MapPin className="h-4 w-4 text-rose-400" />{task.shipArea?.name ?? 'Gemi alanı belirtilmedi'}</div>
              </div>
              {task.status === 'IN_PROGRESS' ? (
                <button onClick={() => updateStatus(task, 'PENDING')} className="flex items-center justify-center gap-2 rounded-lg border border-amber-500/50 bg-amber-500/20 px-6 py-3 text-sm font-bold text-amber-400"><Square className="h-5 w-5" /> ÇALIŞMAYI DURAKLAT</button>
              ) : task.status !== 'COMPLETED' ? (
                <button onClick={() => updateStatus(task, 'IN_PROGRESS')} className="flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-6 py-3 text-sm font-bold text-white"><Play className="h-5 w-5" /> GÖREVE BAŞLA</button>
              ) : <span className="flex items-center gap-2 text-emerald-400"><CheckCircle2 className="h-5 w-5" /> TAMAMLANDI</span>}
            </div>
            <div className="grid grid-cols-1 gap-6 pt-2 md:grid-cols-2">
              <div className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-950/50 p-4">
                <span className="flex items-center gap-2 font-mono text-xs text-slate-500"><Clock className="h-4 w-4" /> HARCANAN SÜRE (SAAT)</span>
                <div className="flex items-center gap-4"><span className="font-mono text-3xl font-bold text-slate-200">{Number(task.actualHours ?? 0)} <span className="text-lg text-slate-500">/ {Number(task.estimatedHours ?? 0)} saat</span></span><button onClick={() => addHour(task)} className="flex h-10 w-10 items-center justify-center rounded bg-slate-800 text-2xl text-slate-300 hover:bg-slate-700">+</button></div>
              </div>
              <div className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-950/50 p-4">
                <span className="flex items-center gap-2 font-mono text-xs text-slate-500"><Wrench className="h-4 w-4" /> GEREKLİ KAYNAKLAR</span>
                <div className="flex flex-wrap gap-2">{task.resources?.length ? task.resources.map(({ resource }) => <span key={resource.name} className="rounded border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-300">{resource.name}</span>) : <span className="text-xs text-slate-500">Atanmış kaynak yok</span>}</div>
              </div>
            </div>
            {task.status !== 'COMPLETED' && (
              <div className="grid grid-cols-1 gap-4 border-t border-slate-800/60 pt-4 md:grid-cols-2">
                <button onClick={() => updateStatus(task, 'BLOCKED')} className="flex items-center justify-center gap-2 rounded-lg border border-rose-500/50 bg-rose-950/30 px-6 py-4 text-base font-bold text-rose-400"><AlertTriangle className="h-6 w-6" /> SORUN BİLDİR (BLOKE)</button>
                <button onClick={() => updateStatus(task, 'COMPLETED')} className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-4 text-base font-bold text-white"><CheckCircle2 className="h-6 w-6" /> İŞİ TAMAMLADIM</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
