import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Ship, Calendar, Activity, Search, AlignLeft, AlertCircle, Tag } from 'lucide-react';
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
  const [status, setStatus] = useState('');
  const [projectType, setProjectType] = useState('NEW_BUILDING');
  const [priority, setPriority] = useState('MEDIUM');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [availableManagers, setAvailableManagers] = useState<any[]>([]);
  const [selectedManagers, setSelectedManagers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    if (isOpen && project) {
      api.get('/users')
        .then((res) => {
          const managers = res.data.filter((u: any) => ['ADMIN', 'MANAGER', 'ENGINEER'].includes(u.role));
          setAvailableManagers(managers);

          if (project.manager && project.manager !== 'Atanmadı') {
            const managerNames = project.manager.split(',').map((n: string) => n.trim());
            const matchedManagers = managers.filter((m: any) => managerNames.includes(`${m.firstName} ${m.lastName}`));
            setSelectedManagers(matchedManagers);
          } else {
            setSelectedManagers([]);
          }
        })
        .catch((error) => {
          console.error('Proje yöneticileri yüklenemedi:', error);
          setAvailableManagers([]);
          setSelectedManagers([]);
          toast.error('Proje yöneticileri yüklenemedi.');
        });

      setName(project.name || '');
      setStatus(project.status || 'PLANNING');
      setProjectType(project.type || 'NEW_BUILDING');
      setPriority(project.priority || 'MEDIUM');
      setDescription(project.description || '');

      if (project.plannedStartDate) setStartDate(new Date(project.plannedStartDate).toISOString().split('T')[0]);
      if (project.plannedDeliveryDate || project.dueDate) {
        setDeliveryDate(new Date(project.plannedDeliveryDate || project.dueDate).toISOString().split('T')[0]);
      }
    }
  }, [isOpen, project]);

  const filteredManagers = availableManagers.filter(manager => {
    const isAlreadySelected = selectedManagers.some(sel => sel.id === manager.id);
    const matchesSearch = `${manager.firstName} ${manager.lastName} ${manager.role}`.toLowerCase().includes(searchQuery.toLowerCase());
    return !isAlreadySelected && matchesSearch;
  });

  const handleAddManager = (manager: any) => {
    setSelectedManagers([...selectedManagers, manager]);
    setSearchQuery('');
  };

  const handleRemoveManager = (idToRemove: string) => {
    setSelectedManagers(selectedManagers.filter(m => m.id !== idToRemove));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    const managerNames = selectedManagers.map(m => `${m.firstName} ${m.lastName}`).join(', ');

    try {
      await api.patch(`/projects/${project.id}`, {
        name, status, type: projectType, priority,
        description: description || undefined,
        plannedStartDate: startDate ? new Date(startDate).toISOString() : undefined,
        plannedDeliveryDate: deliveryDate ? new Date(deliveryDate).toISOString() : undefined,
        manager: managerNames || 'Atanmadı'
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
            className="relative my-8 w-full max-w-2xl overflow-visible rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-xl border-b border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <Ship className="h-5 w-5 text-cyan-600 dark:text-cyan-500" />
                <div><h2 className="font-bold text-slate-900 dark:text-slate-100">Projeyi Düzenle</h2><p className="text-xs text-slate-500 dark:text-slate-400">{project?.projectCode || project?.id?.substring(0,8)}</p></div>
              </div>
              <button type="button" onClick={onClose} className="rounded-md p-1 transition-colors hover:bg-slate-200 dark:hover:bg-slate-800"><X className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:hover:text-white" /></button>
            </div>

            <div className="flex flex-col gap-5 p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className={labelClasses}>Proje / Gemi Adı
                  <span className="relative"><Ship className={iconClasses} /><input required value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} /></span>
                </label>
                <label className={labelClasses}>Genel Durum
                  <span className="relative"><Activity className={iconClasses} />
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClasses}>
                      <option value="PLANNING">Planlanıyor</option><option value="ON_TRACK">Zamanında İlerliyor</option><option value="DELAYED">Gecikmeli</option><option value="MAINTENANCE">Bakımda</option><option value="COMPLETED">Tamamlandı</option>
                    </select>
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className={labelClasses}>Proje Türü
                  <span className="relative"><Tag className={iconClasses} />
                    <select value={projectType} onChange={(e) => setProjectType(e.target.value)} className={inputClasses}>
                      <option value="NEW_BUILDING">Yeni İnşa</option><option value="REPAIR">Onarım</option><option value="MAINTENANCE">Periyodik Bakım</option><option value="CONVERSION">Gemi Dönüşümü</option><option value="RETROFIT">Modernizasyon</option>
                    </select>
                  </span>
                </label>
                <label className={labelClasses}>Proje Önceliği
                  <span className="relative"><AlertCircle className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${priority === 'CRITICAL' ? 'text-rose-600 dark:text-rose-500' : 'text-amber-500'}`} />
                    <select value={priority} onChange={(e) => setPriority(e.target.value)} className={inputClasses}>
                      <option value="LOW">Düşük</option><option value="MEDIUM">Orta</option><option value="HIGH">Yüksek</option><option value="CRITICAL">Kritik</option>
                    </select>
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className={labelClasses}>Planlanan Başlangıç
                  <span className="relative"><Calendar className={iconClasses} /><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClasses} /></span>
                </label>
                <label className={labelClasses}>Hedef Teslim
                  <span className="relative"><Calendar className={iconClasses} /><input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} className={inputClasses} /></span>
                </label>
              </div>

              <div className="relative flex flex-col gap-2">
                <label className={labelClasses}>Proje Yöneticisi / Yetkili</label>
                <div className={`flex min-h-[42px] flex-wrap items-center gap-2 rounded-md border bg-white p-2 transition-colors dark:bg-slate-950 ${isSearchFocused ? 'border-cyan-500' : 'border-slate-300 dark:border-slate-700'}`}>
                  <Search className="ml-1 h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
                  {selectedManagers.map((manager) => (
                    <span key={manager.id} className="flex items-center gap-1.5 rounded-md border border-cyan-200 bg-cyan-50 px-2 py-1 text-xs text-cyan-700 dark:border-cyan-500/30 dark:bg-cyan-950/50 dark:text-cyan-400">
                      {manager.firstName} {manager.lastName}
                      <button type="button" onClick={() => handleRemoveManager(manager.id)} className="rounded-full p-0.5 transition-colors hover:bg-cyan-200 dark:hover:bg-cyan-900 dark:hover:text-white"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onFocus={() => setIsSearchFocused(true)} onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)} placeholder={selectedManagers.length === 0 ? "İsim veya ünvan yazarak arayın..." : ""} className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-600 min-w-[150px]" />
                </div>
                <AnimatePresence>
                  {isSearchFocused && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute left-0 right-0 top-[100%] z-50 mt-1 max-h-48 overflow-y-auto rounded-md border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
                      {filteredManagers.map((manager) => (
                        <button key={manager.id} type="button" onClick={() => handleAddManager(manager)} className="flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-cyan-50 hover:text-cyan-700 dark:text-slate-300 dark:hover:bg-cyan-950/50 dark:hover:text-cyan-400">
                          <span>{manager.firstName} {manager.lastName}</span><span className="text-[10px] text-slate-500">{manager.role}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <label className={labelClasses}>Proje Kapsamı / AI İçin Notlar
                <span className="relative"><AlignLeft className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" /><textarea value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClasses} min-h-[80px] resize-y`} /></span>
              </label>
            </div>

            <div className="flex justify-end gap-3 rounded-b-xl border-t border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/50">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">İptal</button>
              <button type="submit" disabled={isSaving} className="rounded-md bg-cyan-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-cyan-500 disabled:opacity-50 dark:shadow-[0_0_10px_rgba(6,182,212,0.3)]">{isSaving ? 'GÜNCELLENİYOR...' : 'DEĞİŞİKLİKLERİ KAYDET'}</button>
            </div>
          </motion.form>
        </div>
      )}
    </AnimatePresence>
  );
}