import { Clock, Users, Activity, CheckCircle2, AlertOctagon } from 'lucide-react';

interface TaskListItem {
  id: string;
  name: string;
  status: string;
  estimatedHours?: number;
  assignedUsers?: { id: string }[];
  isCritical?: boolean;
  dependencies?: { predecessor: { id: string; name: string } }[];
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'COMPLETED': return <span className="flex w-max items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-500"><CheckCircle2 className="h-3 w-3" /> TAMAMLANDI</span>;
    case 'IN_PROGRESS': return <span className="flex w-max items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/30 px-2.5 py-1 text-[10px] font-bold text-cyan-400"><Activity className="h-3 w-3" /> DEVAM EDİYOR</span>;
    case 'DELAYED': return <span className="flex w-max items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-950/30 px-2.5 py-1 text-[10px] font-bold text-amber-500"><Clock className="h-3 w-3" /> GECİKMELİ</span>;
    case 'BLOCKED': return <span className="flex w-max items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-950/30 px-2.5 py-1 text-[10px] font-bold text-rose-500 animate-pulse"><AlertOctagon className="h-3 w-3" /> BLOKE</span>;
    default: return <span className="flex w-max items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/50 px-2.5 py-1 text-[10px] font-bold text-slate-400"><Clock className="h-3 w-3" /> BEKLEMEDE</span>;
  }
};

export default function TaskListView({
  tasks,
}: {
  tasks: TaskListItem[];
}) {
  return (
    <div className="h-full w-full overflow-auto p-2">
      <div className="rounded-lg border border-slate-800 bg-slate-900/40">
        <table className="w-full text-left font-sans text-sm text-slate-300">
          <thead className="sticky top-0 border-b border-slate-800 bg-slate-900/90 text-xs uppercase tracking-wider text-slate-500 backdrop-blur-md">
            <tr>
              <th className="px-5 py-4 font-medium">Görev Adı</th>
              <th className="px-5 py-4 font-medium">Durum</th>
              <th className="px-5 py-4 font-medium">Süre</th>
              <th className="px-5 py-4 font-medium">Atanan Ekip</th>
              <th className="px-5 py-4 font-medium">Ön Şart (Bağımlılık)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {tasks.map((task) => (
              <tr key={task.id} className="transition-colors hover:bg-slate-800/40">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-200">{task.name}</span>
                    {task.isCritical && (
                      <span className="rounded bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 text-[9px] font-bold text-rose-400">KRİTİK</span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4">{getStatusBadge(task.status)}</td>
                <td className="px-5 py-4 font-mono text-xs text-slate-400">{Number(task.estimatedHours ?? 0) / 8} Gün</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5 font-mono text-xs text-slate-400">
                    <Users className="h-3.5 w-3.5 text-cyan-500/70" /> {task.assignedUsers?.length ?? 0} Personel
                  </div>
                </td>
                <td className="px-5 py-4 font-mono text-xs text-slate-500">{task.dependencies?.map(({ predecessor }) => predecessor.name).join(', ') || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}