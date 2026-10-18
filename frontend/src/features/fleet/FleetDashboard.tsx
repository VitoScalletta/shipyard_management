import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ship, Activity, Clock, Plus, Anchor, AlertTriangle, Search, Filter, ShieldAlert, ArrowUpDown, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/ui/Skeleton';
import { EmptyState } from '@/ui/EmptyState';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import NewProjectModal from './NewProjectModal';

export interface ShipProject {
  id: string;
  name: string;
  type: string;
  status: string;
  progress: number;
  health: string;
  manager: string;
  dueDate: string;
  plannedDeliveryDate?: string;
  projectCode?: string;
  ship?: {
    imoNumber?: string;
    name?: string;
  };
}

interface ProjectRecord extends ShipProject {
  progressPercentage?: number | string;
  actualDeliveryDate?: string;
}

interface TaskRecord {
  project?: { id: string };
  status: string;
  plannedEndDate?: string;
}

const PROJECT_TYPES: Record<string, string> = {
  NEW_BUILDING: 'Yeni İnşa',
  REPAIR: 'Onarım',
  MAINTENANCE: 'Periyodik Bakım',
  CONVERSION: 'Gemi Dönüşümü',
  RETROFIT: 'Modernizasyon',
};

// ŞIK VE ANİMASYONLU ÖZEL DROPDOWN BİLEŞENİ (TEMAYA DUYARLI)
function CustomDropdown({ value, onChange, options, icon: Icon, minWidth = '160px' }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((o: any) => o.value === value);

  return (
    <div className="relative flex-1 sm:flex-none" style={{ minWidth }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className={`flex w-full items-center justify-between pl-9 pr-3 py-2 border rounded-lg text-sm transition-all focus:outline-none ${
          isOpen
            ? 'border-cyan-500 text-cyan-600 bg-white shadow-[0_0_10px_rgba(6,182,212,0.2)] dark:bg-slate-950/50 dark:text-cyan-400'
            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700/50 dark:bg-slate-950/50 dark:text-slate-300 dark:hover:border-slate-600'
        }`}
      >
        <Icon className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${isOpen ? 'text-cyan-500' : 'text-slate-400 dark:text-slate-500'}`} />
        <span className="truncate pr-2 font-medium">{selected?.label}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-cyan-500' : 'text-slate-400 dark:text-slate-500'}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] dark:border-slate-700 dark:bg-slate-800 dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]"
          >
            {options.map((opt: any) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange(opt.value)}
                className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
              >
                <div className="flex items-center gap-2">
                  {opt.icon && <opt.icon className={`h-4 w-4 ${opt.color || 'text-slate-400'}`} />}
                  <span className={value === opt.value ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}>{opt.label}</span>
                </div>
                {value === opt.value && <Check className="h-4 w-4 text-cyan-500" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FleetDashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<ShipProject[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadError, setLoadError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [healthFilter, setHealthFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('RISK_DESC');

  const HEALTH_OPTIONS = [
    { value: 'ALL', label: 'Tüm Riskler' },
    { value: 'CRITICAL', label: 'Kritik Darboğaz', icon: ShieldAlert, color: 'text-rose-500' },
    { value: 'WARNING', label: 'Uyarı / Gecikme', icon: AlertTriangle, color: 'text-amber-500' },
    { value: 'GOOD', label: 'Sağlıklı', icon: Activity, color: 'text-emerald-500' },
  ];

  const STATUS_OPTIONS = [
    { value: 'ALL', label: 'Tüm Durumlar' },
    { value: 'PLANNING', label: 'Planlanıyor', color: 'text-slate-400' },
    { value: 'IN_PROGRESS', label: 'Devam Ediyor', color: 'text-cyan-400' },
    { value: 'ON_HOLD', label: 'Beklemede', color: 'text-amber-400' },
    { value: 'COMPLETED', label: 'Tamamlandı', color: 'text-emerald-400' },
    { value: 'CANCELLED', label: 'İptal Edildi', color: 'text-rose-400' },
  ];

  const SORT_OPTIONS = [
    { value: 'RISK_DESC', label: 'Önce Riskliler' },
    { value: 'DATE_ASC', label: 'Yaklaşan Teslimat' },
    { value: 'DATE_DESC', label: 'En Uzak Teslimat' },
    { value: 'PROGRESS_DESC', label: 'İlerleme (Çoktan aza)' },
    { value: 'PROGRESS_ASC', label: 'İlerleme (Azdan çoğa)' },
  ];

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError('');
      const { data } = await api.get('/projects');
      let tasks: TaskRecord[] = [];
      try {
        const response = await api.get('/tasks');
        tasks = response.data;
      } catch (error) {
        console.error('Görev verileri yüklenemedi; filo ilerlemesi proje kayıtlarından gösterilecek:', error);
        toast.error('Görev verileri yüklenemedi. Proje kayıtlarındaki ilerleme gösteriliyor.');
      }
      const mappedProjects = (data as ProjectRecord[]).map((project) => {
        const projectTasks = tasks.filter((task) => task.project?.id === project.id);
        const progress = projectTasks.length
          ? Math.round((projectTasks.filter((task) => task.status === 'COMPLETED').length / projectTasks.length) * 100)
          : Number(project.progressPercentage ?? project.progress ?? 0);
        const hasBlockedTask = projectTasks.some((task) => task.status === 'BLOCKED');
        const hasDelayedTask = projectTasks.some((task) => task.status === 'DELAYED');
        const deliveryDate = project.plannedDeliveryDate ? new Date(project.plannedDeliveryDate) : null;
        const isOverdue = Boolean(
          deliveryDate
          && deliveryDate.getTime() < Date.now()
          && project.status !== 'COMPLETED'
          && project.status !== 'CANCELLED',
        );
        return {
          ...project,
          progress,
          health: hasBlockedTask ? 'CRITICAL' : hasDelayedTask || isOverdue ? 'WARNING' : 'GOOD',
          manager: project.manager || 'Atanmadı',
          dueDate: project.plannedDeliveryDate ?? '',
        };
      });
      setProjects(mappedProjects);
    } catch (error) {
      console.error('Projeler çekilemedi:', error);
      setLoadError('Projeler yüklenemedi. Backend bağlantısını kontrol edip yeniden deneyin.');
      toast.error('Sunucu bağlantısı kurulamadı.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  let processedProjects = projects.filter((p) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      p.name?.toLowerCase().includes(searchLower) ||
      p.projectCode?.toLowerCase().includes(searchLower) ||
      p.ship?.imoNumber?.toLowerCase().includes(searchLower);
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesHealth = healthFilter === 'ALL' || p.health === healthFilter;
    return matchesSearch && matchesStatus && matchesHealth;
  });

  processedProjects.sort((a, b) => {
    if (sortBy === 'RISK_DESC') {
      const riskWeight: Record<string, number> = { CRITICAL: 3, WARNING: 2, GOOD: 1 };
      const riskA = riskWeight[a.health] || 0;
      const riskB = riskWeight[b.health] || 0;
      if (riskA !== riskB) return riskB - riskA;
      return (b.progress || 0) - (a.progress || 0);
    }
    if (sortBy === 'PROGRESS_DESC') return (b.progress || 0) - (a.progress || 0);
    if (sortBy === 'PROGRESS_ASC') return (a.progress || 0) - (b.progress || 0);
    if (sortBy === 'DATE_ASC' || sortBy === 'DATE_DESC') {
      const dateA = new Date(a.plannedDeliveryDate || a.dueDate || '2099-12-31').getTime();
      const dateB = new Date(b.plannedDeliveryDate || b.dueDate || '2099-12-31').getTime();
      return sortBy === 'DATE_ASC' ? dateA - dateB : dateB - dateA;
    }
    return 0;
  });

  return (
    <div className="relative flex h-full flex-col gap-6 overflow-hidden z-0">

      {/* Üst Başlık ve Aksiyon */}
      <div className="flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-cyan-200 bg-cyan-50 text-cyan-600 shadow-[0_0_15px_rgba(6,182,212,0.15)] dark:border-cyan-900/50 dark:bg-cyan-950/30 dark:text-cyan-500">
            <Anchor className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center">
              <h1 className="font-sans text-2xl font-bold text-slate-900 dark:text-slate-100">Aktif Tersane Filosu</h1>
              {!isLoading && (
                <span className="ml-3 rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-0.5 font-mono text-xs font-bold text-cyan-600 dark:border-cyan-500/30 dark:bg-cyan-950/50 dark:text-cyan-400">
                  {processedProjects.length} Proje
                </span>
              )}
            </div>
            <p className="font-mono text-sm text-slate-500">KIZAK VE HAVUZLARDAKİ GEMİLER</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-md bg-cyan-600 px-4 py-2 font-sans text-sm font-bold text-white transition-all hover:bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
        >
          <Plus className="h-4 w-4" /> YENİ GEMİ EKLE
        </button>
      </div>

      {/* KONTROL PANELİ (FİLTRE & SIRALAMA) */}
      <div className="relative z-20 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white/80 p-3 shrink-0 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Akıllı Arama */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Gemi adı veya IMO numarası ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 dark:border-slate-700/50 dark:bg-slate-950/50 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3">
            <CustomDropdown value={healthFilter} onChange={setHealthFilter} options={HEALTH_OPTIONS} icon={ShieldAlert} minWidth="150px" />
            <CustomDropdown value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} icon={Filter} minWidth="150px" />
            <CustomDropdown value={sortBy} onChange={setSortBy} options={SORT_OPTIONS} icon={ArrowUpDown} minWidth="160px" />
          </div>
        </div>
      </div>

      {/* Gemi Listesi Alanı */}
      <div className="flex-1 overflow-y-auto pb-6 pr-2">
        {isLoading && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex h-48 flex-col justify-between rounded-xl border border-slate-200 bg-white/50 p-5 dark:border-slate-800 dark:bg-slate-900/30">
                <div className="flex gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="mt-4 h-2 w-full" />
                <div className="mt-4 flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && loadError && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
            <p>{loadError}</p>
            <button onClick={() => void fetchProjects()} className="rounded-md bg-cyan-600 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-500">Tekrar dene</button>
          </div>
        )}

        {!isLoading && !loadError && projects.length === 0 && (
          <EmptyState
            icon={Ship}
            title="Tersanede Gemi Bulunmuyor"
            description="Şu anda kızakta veya havuzda kayıtlı aktif bir gemi projesi yok. Yeni bir gemi ekleyerek operasyona başlayın."
          />
        )}

        {!isLoading && projects.length > 0 && processedProjects.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/40">
            <Search className="h-12 w-12 mb-4 text-slate-400 dark:text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-300">Sonuç Bulunamadı</h3>
            <p className="text-sm mt-1 text-slate-500">Seçtiğiniz filtrelere veya aramaya uygun bir proje bulunamadı.</p>
            <button onClick={() => {setSearchQuery(''); setStatusFilter('ALL'); setHealthFilter('ALL'); setSortBy('RISK_DESC');}} className="mt-4 text-cyan-600 hover:text-cyan-500 text-sm font-medium dark:text-cyan-500 dark:hover:text-cyan-400">Filtreleri Temizle</button>
          </div>
        )}

        {!isLoading && processedProjects.length > 0 && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {processedProjects.map((ship: any) => {
              const progress = ship.progress || 0;
              const manager = ship.manager || 'Atanmadı';
              const rawDate = ship.plannedDeliveryDate || ship.dueDate;
              const displayDate = rawDate ? new Date(rawDate).toLocaleDateString('tr-TR') : 'Tarih Belirtilmedi';

              const initials = manager !== 'Atanmadı'
                ? manager.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
                : '?';

              return (
                <button
                  key={ship.id}
                  onClick={() => navigate(`/project/${ship.id}`)}
                  className="group flex flex-col justify-between rounded-xl border p-5 text-left transition-all border-slate-200 bg-white/90 hover:-translate-y-1 hover:border-cyan-400/50 hover:bg-slate-50 hover:shadow-[0_10px_30px_-10px_rgba(6,182,212,0.15)] dark:border-slate-800 dark:bg-slate-900/60 dark:backdrop-blur-md dark:hover:border-cyan-500/50 dark:hover:bg-slate-800/80 dark:hover:shadow-[0_10px_30px_-10px_rgba(6,182,212,0.3)]"
                >
                  <div className="flex items-start justify-between border-b pb-4 border-slate-100 dark:border-slate-800/60">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${
                        ship.health === 'CRITICAL' ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/50 dark:border-rose-500/30 dark:text-rose-500' :
                        ship.health === 'WARNING' ? 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/50 dark:border-amber-500/30 dark:text-amber-500' :
                        'bg-cyan-50 border-cyan-200 text-cyan-600 dark:bg-cyan-950/50 dark:border-cyan-500/30 dark:text-cyan-500'
                      }`}>
                        <Ship className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <h3 className="font-sans text-lg font-bold transition-colors line-clamp-1 text-slate-800 group-hover:text-cyan-600 dark:text-slate-100 dark:group-hover:text-cyan-400" title={ship.name}>{ship.name}</h3>
                        <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <span className={`h-1.5 w-1.5 rounded-full ${ship.status === 'COMPLETED' ? 'bg-emerald-500' : ship.status === 'DELAYED' ? 'bg-amber-500' : 'bg-cyan-500'}`}></span>
                            {PROJECT_TYPES[ship.type] || ship.type} · {ship.status}
                          </span>
                          {ship.ship?.imoNumber && (
                            <>
                              <span>•</span>
                              <span>IMO: {ship.ship.imoNumber}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {ship.health === 'CRITICAL' && <span title="Kritik Darboğaz"><AlertTriangle className="h-5 w-5 animate-pulse text-rose-500" /></span>}
                    {ship.health === 'WARNING' && <span title="Uyarı"><ShieldAlert className="h-5 w-5 text-amber-500" /></span>}
                  </div>

                  <div className="mt-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="text-slate-500 dark:text-slate-400">PROJE İLERLEMESİ</span>
                      <span className="font-bold text-cyan-600 dark:text-cyan-400">%{progress}</span>
                    </div>
                    <div className="flex h-2 w-full overflow-hidden rounded-full border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950">
                      <div
                        className={`h-full ${ship.health === 'CRITICAL' ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]' : ship.health === 'WARNING' ? 'bg-amber-500' : 'bg-cyan-500'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between font-mono text-xs">
                    <div className="flex items-center gap-2 flex-1 mr-2 text-slate-500 dark:text-slate-400">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold border border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {initials}
                      </div>
                      <span className="line-clamp-1 flex-1 text-slate-700 dark:text-slate-200" title={manager}>{manager}</span>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 text-slate-500 dark:text-slate-400">
                      <Clock className="h-4 w-4" /> <span className="text-slate-700 dark:text-slate-200">{displayDate}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={() => fetchProjects()}
      />
    </div>
  );
}