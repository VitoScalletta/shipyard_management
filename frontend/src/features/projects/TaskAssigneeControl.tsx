import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, LoaderCircle, Plus, Search, Users, X } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

type User = {
  id: string;
  firstName: string;
  lastName: string;
  role?: string;
  status?: string;
};

interface TaskAssigneeControlProps {
  task: { id: string; assignedUsers?: User[] };
  onUpdated: () => void;
}

const fullName = (user: User) => `${user.firstName} ${user.lastName}`.trim();
const initials = (user: User) => `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || '?';
const avatarTones = [
  'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300',
  'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
];

export default function TaskAssigneeControl({ task, onUpdated }: TaskAssigneeControlProps) {
  const role = useAuthStore((state) => state.user?.role);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [displayedAssignees, setDisplayedAssignees] = useState(task.assignedUsers ?? []);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const assignees = displayedAssignees;
  const canAssign = role === 'ADMIN' || role === 'MANAGER' || role === 'ENGINEER';

  useEffect(() => {
    setDisplayedAssignees(task.assignedUsers ?? []);
  }, [task.id, task.assignedUsers]);

  useEffect(() => {
    if (!isOpen) return;

    setSelectedIds(assignees.map((user) => user.id));
    setSearch('');
    setIsLoading(true);
    api.get('/users')
      .then(({ data }) => setUsers(data.filter((user: User) => user.status !== 'INACTIVE')))
      .catch(() => {
        setUsers([]);
        toast.error('Personel listesi yüklenemedi.');
      })
      .finally(() => setIsLoading(false));
  }, [isOpen, task.id]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('tr-TR');
    if (!normalizedSearch) return users;
    return users.filter((user) =>
      `${fullName(user)} ${user.role ?? ''}`.toLocaleLowerCase('tr-TR').includes(normalizedSearch),
    );
  }, [search, users]);

  const toggleUser = (userId: string) => {
    setSelectedIds((current) => current.includes(userId)
      ? current.filter((id) => id !== userId)
      : [...current, userId]);
  };

  const save = async () => {
    setIsSaving(true);
    try {
      const { data } = await api.patch(`/tasks/${task.id}/assignees`, { userIds: selectedIds });
      setDisplayedAssignees(data.assignedUsers ?? []);
      toast.success('Görev personelleri güncellendi.');
      setIsOpen(false);
      onUpdated();
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? 'Personel ataması güncellenemedi.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        {assignees.length > 0 ? (
          <div className="flex -space-x-2" title={assignees.map(fullName).join(', ')}>
            {assignees.slice(0, 3).map((user, index) => (
              <span key={user.id} className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[9px] font-bold dark:border-slate-950 ${avatarTones[index % avatarTones.length]}`}>
                {initials(user)}
              </span>
            ))}
            {assignees.length > 3 && (
              <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[9px] font-bold text-slate-600 dark:border-slate-950 dark:bg-slate-800 dark:text-slate-300">+{assignees.length - 3}</span>
            )}
          </div>
        ) : <span className="text-xs text-slate-400 dark:text-slate-500">Atanmadı</span>}
        {canAssign && (
          <button type="button" onClick={() => setIsOpen(true)} className="inline-flex h-7 items-center gap-1 rounded-md border border-dashed border-cyan-300 px-2 text-[10px] font-bold text-cyan-700 transition-colors hover:border-cyan-500 hover:bg-cyan-50 dark:border-cyan-700 dark:text-cyan-400 dark:hover:border-cyan-400 dark:hover:bg-cyan-950/40" title="Personel Ata">
            <Plus className="h-3.5 w-3.5" /> Personel Ata
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isSaving && setIsOpen(false)} className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }} className="relative w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-start justify-between border-b border-slate-200 p-5 dark:border-slate-800">
                <div className="flex gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400"><Users className="h-5 w-5" /></span><div><h2 className="font-bold text-slate-900 dark:text-slate-100">Personel Ata</h2><p className="text-xs text-slate-500 dark:text-slate-400">Göreve atanacak personelleri seçin.</p></div></div>
                <button type="button" disabled={isSaving} onClick={() => setIsOpen(false)} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-200"><X className="h-5 w-5" /></button>
              </div>
              <div className="p-5">
                <label className="relative block"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Personel veya rol ara..." className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" /></label>
                <div className="mt-3 max-h-72 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800">
                  {isLoading ? <div className="flex items-center justify-center gap-2 p-8 text-sm text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin" /> Personeller yükleniyor...</div> : filteredUsers.length > 0 ? filteredUsers.map((user, index) => {
                    const selected = selectedIds.includes(user.id);
                    return <button key={user.id} type="button" onClick={() => toggleUser(user.id)} className="flex w-full items-center gap-3 border-b border-slate-100 p-3 text-left last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/70">
                      <span className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${avatarTones[index % avatarTones.length]}`}>{initials(user)}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{fullName(user)}</span><span className="block text-[10px] font-mono text-slate-500 dark:text-slate-400">{user.role ?? 'PERSONEL'}</span></span><span className={`flex h-5 w-5 items-center justify-center rounded border ${selected ? 'border-cyan-600 bg-cyan-600 text-white' : 'border-slate-300 dark:border-slate-600'}`}>{selected && <Check className="h-3.5 w-3.5" />}</span>
                    </button>;
                  }) : <p className="p-8 text-center text-sm text-slate-500">Eşleşen personel bulunamadı.</p>}
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50"><span className="text-xs text-slate-500 dark:text-slate-400">{selectedIds.length} personel seçildi</span><div className="flex gap-2"><button type="button" disabled={isSaving} onClick={() => setIsOpen(false)} className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">İptal</button><button type="button" disabled={isSaving || isLoading} onClick={save} className="inline-flex items-center gap-2 rounded-md bg-cyan-600 px-4 py-2 text-sm font-bold text-white hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50">{isSaving && <LoaderCircle className="h-4 w-4 animate-spin" />} Kaydet</button></div></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
