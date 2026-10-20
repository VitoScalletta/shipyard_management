import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Ship, Activity, Clock, Users, AlertOctagon, Layers, ChevronRight, TriangleAlert, Plus, BrainCircuit, Edit, Trash2, X, MapPin } from 'lucide-react';
import CriticalPathGraph from './CriticalPathGraph';
import TaskListView from './TaskListView';
import NewTaskModal from './NewTaskModal';
import AiRiskPanel from './AiRiskPanel';
import { AnimatePresence, motion } from 'framer-motion';
import { Skeleton } from '@/ui/Skeleton';
import EditProjectModal from './EditProjectModal';

export default function ProjectDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeZone, setActiveZone] = useState('ALL');
  const [viewMode, setViewMode] = useState<'DAG' | 'LIST'>('DAG');
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // YENİ: Bölge Ekleme Modalı State'leri
  const [isNewZoneModalOpen, setIsNewZoneModalOpen] = useState(false);
  const [zoneForm, setZoneForm] = useState({ name: '', parentId: '', size: '', unit: 'm²' });
  const [isZoneSaving, setIsZoneSaving] = useState(false);

  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [expandedZones, setExpandedZones] = useState<Record<string, boolean>>({
    Z1: true,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [zones, setZones] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [dependencies, setDependencies] = useState<any[]>([]);
  const [reloadTasks, setReloadTasks] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setIsLoading(true);
        const [projectRes, zonesRes] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get(`/projects/${id}/zones`)
        ]);
        const projectData = projectRes.data;
        const [tasksRes, depsRes] = await Promise.all([
          api.get('/tasks'),
          api.get('/tasks/dependencies', { params: { projectId: projectData.id } }),
        ]);
        const fetchedTasks = tasksRes.data.filter((task: any) => task.project?.id === projectData.id);
        const fetchedDeps = depsRes.data;

        setDependencies(fetchedDeps);
        setTasks(fetchedTasks.map((task: any) => ({
          ...task,
          label: task.name,
          duration: task.estimatedHours == null ? 'Belirtilmedi' : `${task.estimatedHours} saat`,
          team: (task.assignedUsers?.length ?? 0) + (task.assignedTeams?.length ?? 0),
          dependencies: fetchedDeps
            .filter((dependency: any) => dependency.successor?.id === task.id)
            .map((dependency: any) => ({ predecessor: dependency.predecessor })),
        })));

        const completedTasks = fetchedTasks.filter((task: any) => task.status === 'COMPLETED').length;
        const progress = fetchedTasks.length
          ? Math.round((completedTasks / fetchedTasks.length) * 100)
          : Number(projectData.progressPercentage ?? 0);
        const plannedStart = projectData.plannedStartDate ? new Date(projectData.plannedStartDate).getTime() : null;
        const plannedDelivery = projectData.plannedDeliveryDate ? new Date(projectData.plannedDeliveryDate).getTime() : null;
        const plannedProgress = plannedStart !== null && plannedDelivery !== null && plannedDelivery > plannedStart
          ? Math.max(0, Math.min(100, Math.round(((Date.now() - plannedStart) / (plannedDelivery - plannedStart)) * 100)))
          : null;
        const dueDate = projectData.plannedDeliveryDate ? new Date(projectData.plannedDeliveryDate) : null;
        const actualDelivery = projectData.actualDeliveryDate ? new Date(projectData.actualDeliveryDate) : null;
        const delayDays = dueDate
          ? Math.max(0, Math.ceil(((actualDelivery ?? new Date()).getTime() - dueDate.getTime()) / 86_400_000))
          : 0;
        const blockedTasks = fetchedTasks.filter((task: any) => task.status === 'BLOCKED' || task.status === 'DELAYED').length;
        const hasOverdueTasks = fetchedTasks.some((task: any) =>
          task.status !== 'COMPLETED' && task.plannedEndDate && new Date(task.plannedEndDate).getTime() < Date.now(),
        );
        const health = blockedTasks > 0 ? 'CRITICAL' : delayDays > 0 || hasOverdueTasks ? 'WARNING' : 'GOOD';
        const actualHours = fetchedTasks.reduce((sum: number, task: any) => sum + Number(task.actualHours ?? 0), 0);
        const estimatedHours = fetchedTasks.reduce((sum: number, task: any) => sum + Number(task.estimatedHours ?? 0), 0);
        setProject({
          ...projectData,
          code: projectData.projectCode || projectData.id,
          health,
          progress,
          plannedProgress,
          delayDays,
          dueDate: projectData.plannedDeliveryDate,
          blockedTasks,
          manHoursSpent: actualHours || Number(projectData.actualManHours ?? 0),
          manHoursEstimated: estimatedHours || Number(projectData.estimatedManHours ?? 0),
        });

        const allZones = zonesRes.data.map((zone: any) => ({
          ...zone,
          parentId: zone.parentArea?.id ?? null,
          area: zone.size == null ? 'Ölçü belirtilmedi' : `${zone.size} ${zone.unit ?? ''}`,
          hasRisk: fetchedTasks.some((task: any) =>
            (task.status === 'BLOCKED' || task.status === 'DELAYED') && task.shipArea?.id === zone.id,
          ),
        }));
        const mainZones = allZones
          .filter((z: any) => !z.parentId)
          .map((main: any) => ({
            ...main,
            subZones: allZones.filter((sub: any) => sub.parentId === main.id),
          }));

        setZones(mainZones);
      } catch (error) {
        console.error('Proje verisi çekilemedi:', error);
        setLoadError('Proje bilgileri yüklenemedi. Backend bağlantısını kontrol edin.');
        toast.error('Proje yüklenemedi.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchProjectData();
  }, [id, reloadTasks]);

  const handleTaskUpdated = () => setReloadTasks((value) => value + 1);

  const toggleZone = (zoneId: string) => {
    setExpandedZones((prev) => ({ ...prev, [zoneId]: !prev[zoneId] }));
  };

  const executeDeleteProject = async () => {
    try {
      await api.delete(`/projects/${project.id}`);
      toast.success('Proje kalıcı olarak silindi.');
      setIsDeleteModalOpen(false);
      navigate('/');
    } catch (error) {
      toast.error('Proje silinirken bir hata oluştu.');
      setIsDeleteModalOpen(false);
    }
  };

  // YENİ: Bölge Oluşturma Fonksiyonu
  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsZoneSaving(true);
    try {
      await api.post('/ship-areas', {
        name: zoneForm.name,
        project: { id: project.id },
        parentArea: zoneForm.parentId ? { id: zoneForm.parentId } : undefined,
        size: zoneForm.size ? Number(zoneForm.size) : undefined,
        unit: zoneForm.unit
      });
      toast.success('Gemi bölgesi başarıyla oluşturuldu.');
      setIsNewZoneModalOpen(false);
      setZoneForm({ name: '', parentId: '', size: '', unit: 'm2' });
      handleTaskUpdated();
    } catch (error) {
      toast.error('Bölge eklenirken bir hata oluştu.');
    } finally {
      setIsZoneSaving(false);
    }
  };

  // Ortak Input Sınıfları (Temaya Duyarlı)
  const inputClasses = "w-full rounded-md border border-slate-300 bg-white p-2 pl-9 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-colors";
  const iconClasses = "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500";

  if (isLoading) {
    return (
      <div className="flex h-full flex-col gap-6 p-4">
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="flex flex-1 gap-6">
          <Skeleton className="w-80 h-full rounded-xl" />
          <Skeleton className="flex-1 h-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (loadError || !project) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Proje açılamadı</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{loadError ?? 'Proje bulunamadı.'}</p>
          <button onClick={() => setReloadTasks((value) => value + 1)} className="mt-4 rounded-md bg-cyan-600 px-4 py-2 text-sm font-bold text-white hover:bg-cyan-500">Tekrar dene</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-6 overflow-hidden">
      {/* GEMİ KÜNYESİ VE TELEMETRİ */}
      <div className="flex flex-col gap-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-cyan-200 bg-cyan-50 text-cyan-600 dark:border-cyan-900/50 dark:bg-cyan-950/30 dark:text-cyan-500">
              <Ship className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-sans text-2xl font-bold text-slate-900 dark:text-slate-100">{project.name}</h1>
                <span className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold border ${project.health === 'CRITICAL' ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-500' : 'bg-cyan-50 border-cyan-200 text-cyan-600 dark:bg-cyan-500/10 dark:border-cyan-500/20 dark:text-cyan-500'}`}>DURUM: {project.status}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 font-mono text-sm text-slate-500">
                <span className="text-cyan-600 dark:text-cyan-600/80">{project.code}</span>
                <span>•</span>
                <span>Proje ID: {project.id}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center justify-center rounded-md border p-2.5 transition-all border-slate-200 bg-white text-slate-500 hover:border-cyan-300 hover:bg-slate-50 hover:text-cyan-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:border-cyan-500/50 dark:hover:bg-slate-800 dark:hover:text-cyan-400"
              title="Projeyi Düzenle"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center justify-center rounded-md border p-2.5 transition-all border-slate-200 bg-white text-slate-500 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:border-rose-500/50 dark:hover:bg-slate-800 dark:hover:text-rose-500"
              title="Projeyi Sil"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {/* Metrik Kartları (Kısaltıldı, tasarımı korundu) */}
          <div className="relative overflow-hidden rounded-lg border p-4 backdrop-blur-sm border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400"><Activity className="h-4 w-4" /><span className="font-sans text-xs font-medium uppercase tracking-wider">Genel İlerleme</span></div>
              <span className="font-mono text-lg font-bold text-cyan-600 dark:text-cyan-400">%{project.progress}</span>
            </div>
            <div className="mt-3 flex flex-col gap-1">
              <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full bg-cyan-500 dark:shadow-[0_0_10px_rgba(6,182,212,0.8)]" style={{ width: `${project.progress}%` }} /></div>
              <div className="flex items-center justify-between font-mono text-[10px] text-slate-500 mt-1"><span>PLANLANAN: {project.plannedProgress == null ? '—' : `%${project.plannedProgress}`}</span>{project.plannedProgress != null && project.progress < project.plannedProgress && <span className="text-rose-500 dark:text-rose-400">-%{project.plannedProgress - project.progress} SAPMA</span>}</div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg border p-4 backdrop-blur-sm border-amber-200 bg-amber-50/50 dark:border-amber-500/30 dark:bg-amber-950/10">
            <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-amber-600 dark:text-amber-500/80"><Clock className="h-4 w-4" /><span className="font-sans text-xs font-medium uppercase tracking-wider">Takvim Durumu</span></div><span className="font-mono text-lg font-bold text-amber-600 dark:text-amber-500">{project.delayDays ? `${project.delayDays} GÜN GECİKME` : 'GECİKME YOK'}</span></div>
          </div>
          <div className="relative overflow-hidden rounded-lg border p-4 backdrop-blur-sm border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-slate-500 dark:text-slate-400"><Users className="h-4 w-4" /><span className="font-sans text-xs font-medium uppercase tracking-wider">Adam-Saat</span></div><span className="font-mono text-lg font-bold text-slate-700 dark:text-slate-200">{project.manHoursSpent.toLocaleString()} <span className="text-sm text-slate-500">saat</span></span></div>
          </div>
          <div className="relative overflow-hidden rounded-lg border p-4 backdrop-blur-sm border-rose-200 bg-rose-50/50 dark:border-rose-500/30 dark:bg-rose-950/10">
            <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-rose-600 dark:text-rose-500/80"><AlertOctagon className="h-4 w-4" /><span className="font-sans text-xs font-medium uppercase tracking-wider">Aktif Darboğaz</span></div><span className="font-mono text-lg font-bold text-rose-600 dark:text-rose-500">{project.blockedTasks}</span></div>
          </div>
        </div>
      </div>

      {/* ALT PANEL */}
      <div className="flex flex-1 gap-6 min-h-0">

        {/* GEMİ BÖLGELERİ */}
        <div className="hidden w-80 shrink-0 flex-col overflow-hidden rounded-lg border backdrop-blur-sm md:flex border-slate-200 bg-white/60 dark:border-slate-800 dark:bg-slate-900/30">
          <div className="flex items-center justify-between border-b p-4 border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
            <h3 className="flex items-center gap-2 font-sans text-sm font-bold text-slate-800 dark:text-slate-200">
              <Layers className="h-4 w-4 text-cyan-600 dark:text-cyan-500" /> Gemi Bölgeleri
            </h3>
            {/* YENİ BÖLGE EKLE BUTONU */}
            <button
              onClick={() => setIsNewZoneModalOpen(true)}
              className="rounded-md p-1.5 transition-colors bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-cyan-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-cyan-400 shadow-sm"
              title="Yeni Bölge Ekle"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <div className="flex flex-col gap-1.5">
              {zones.length === 0 ? (
                <div className="text-center p-4 text-sm text-slate-500">Henüz bölge eklenmemiş.</div>
              ) : zones.map((zone) => {
                const isExpanded = expandedZones[zone.id];
                return (
                  <div key={zone.id} className="flex flex-col">
                    <button onClick={() => toggleZone(zone.id)} className={`group flex w-full items-center justify-between rounded-md px-3 py-2 transition-colors ${activeZone === zone.id ? 'bg-cyan-50 border border-cyan-200 dark:bg-cyan-950/40 dark:border-cyan-900/50' : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 border border-transparent'}`}>
                      <div className="flex items-center gap-2">
                        <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90 text-cyan-500 dark:text-cyan-400' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'}`} />
                        <div className="flex flex-col items-start">
                          <span className={`font-sans text-sm font-medium ${activeZone === zone.id ? 'text-cyan-700 dark:text-cyan-400' : 'text-slate-700 group-hover:text-slate-900 dark:text-slate-300 dark:group-hover:text-slate-100'}`}>{zone.name}</span>
                          <span className="font-mono text-[10px] text-slate-500">{zone.area}</span>
                        </div>
                      </div>
                      {zone.hasRisk && <TriangleAlert className="h-4 w-4 animate-pulse text-rose-500" />}
                    </button>

                    <AnimatePresence>
                      {isExpanded && zone.subZones && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="ml-6 mt-1 flex flex-col gap-1 border-l pl-3 overflow-hidden border-slate-200 dark:border-slate-800">
                          {zone.subZones.map((sub: any) => (
                            <button
                              key={sub.id}
                              onClick={() => setActiveZone(sub.id)}
                              className={`group flex w-full items-center justify-between rounded-md px-3 py-1.5 transition-colors ${activeZone === sub.id ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-slate-800/80 dark:text-cyan-400 dark:border-slate-700' : 'hover:bg-slate-100 text-slate-600 border border-transparent dark:hover:bg-slate-800/40 dark:text-slate-400'}`}
                            >
                              <div className="flex flex-col items-start">
                                <span className="font-sans text-xs font-medium group-hover:text-slate-800 dark:group-hover:text-slate-200">{sub.name}</span>
                                <span className="font-mono text-[9px] text-slate-400 dark:text-slate-500">{sub.area}</span>
                              </div>
                              {sub.hasRisk && <TriangleAlert className="h-3 w-3 text-rose-500" />}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* KRİTİK YOL AĞI */}
        <div className="flex flex-1 flex-col gap-4 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-md border p-1 border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50">
                <button onClick={() => setViewMode('DAG')} className={`flex items-center gap-2 rounded px-4 py-1.5 font-sans text-sm font-medium transition-all ${viewMode === 'DAG' ? 'bg-slate-100 text-cyan-600 shadow-sm dark:bg-slate-800 dark:text-cyan-400 dark:shadow' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>🕸️ Ağ Görünümü</button>
                <button onClick={() => setViewMode('LIST')} className={`flex items-center gap-2 rounded px-4 py-1.5 font-sans text-sm font-medium transition-all ${viewMode === 'LIST' ? 'bg-slate-100 text-cyan-600 shadow-sm dark:bg-slate-800 dark:text-cyan-400 dark:shadow' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>📋 Liste Görünümü</button>
              </div>
              <button onClick={() => setIsNewTaskModalOpen(true)} className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 font-sans text-sm font-medium transition-colors bg-cyan-50 border-cyan-200 text-cyan-600 hover:bg-cyan-100 dark:bg-cyan-600/20 dark:border-cyan-500/30 dark:text-cyan-400 dark:hover:bg-cyan-600/40"><Plus className="h-4 w-4" /> Yeni Görev</button>
            </div>
            {project.health === 'CRITICAL' && (
              <button onClick={() => setIsAiPanelOpen(!isAiPanelOpen)} className="group flex cursor-pointer items-center gap-3 rounded-md border px-1 py-1 pr-3 font-mono text-xs font-bold transition-all hover:text-white border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-500 dark:border-rose-500/50 dark:bg-rose-500/10 dark:text-rose-400 dark:shadow-[0_0_15px_rgba(244,63,94,0.15)] dark:hover:bg-rose-600">
                <div className="flex items-center gap-2 rounded px-3 py-1.5 transition-colors bg-rose-100 group-hover:bg-rose-600 dark:bg-rose-950/50 dark:group-hover:bg-rose-700/50"><span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75 group-hover:bg-white"></span><span className="relative inline-flex h-full w-full rounded-full bg-rose-500 group-hover:bg-white"></span></span><span>KRİTİK DARBOĞAZ</span></div>
                <div className="flex items-center gap-1.5 pl-1"><BrainCircuit className="h-4 w-4" /><span>AI ANALİZİNİ AÇ</span></div>
              </button>
            )}
          </div>

          <div className="flex-1 rounded-lg border relative overflow-hidden border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
            {viewMode === 'DAG' ? (
              <CriticalPathGraph focusedNodeId={focusedNodeId} tasks={tasks} dependencies={dependencies} onTaskUpdated={handleTaskUpdated} />
            ) : (
              <TaskListView tasks={tasks} onTaskUpdated={handleTaskUpdated} />
            )}
          </div>
        </div>

        {isAiPanelOpen && <AiRiskPanel projectId={project.id} onClose={() => setIsAiPanelOpen(false)} onFocusNode={setFocusedNodeId} />}
      </div>

      {/* YENİ: BÖLGE (ZONE) EKLEME MODALI */}
      <AnimatePresence>
        {isNewZoneModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsNewZoneModalOpen(false)} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm dark:bg-slate-950/80" />
            <motion.form
              onSubmit={handleCreateZone}
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-xl border shadow-2xl border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between border-b p-5 border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-cyan-600 dark:text-cyan-500" />
                  <h2 className="font-bold text-slate-900 dark:text-slate-100">Yeni Gemi Bölgesi Ekle</h2>
                </div>
                <button type="button" onClick={() => setIsNewZoneModalOpen(false)} className="rounded-md p-1 transition-colors hover:bg-slate-200 dark:hover:bg-slate-800"><X className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:hover:text-white" /></button>
              </div>

              <div className="flex flex-col gap-4 p-6">
                <label className="flex flex-col gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">Bölge Adı
                  <span className="relative"><MapPin className={iconClasses} /><input required value={zoneForm.name} onChange={(e) => setZoneForm({...zoneForm, name: e.target.value})} placeholder="Örn: Makine Dairesi, Ana Güverte" className={inputClasses} /></span>
                </label>

                <label className="flex flex-col gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">Üst Bölge (Opsiyonel Alt Bölge Ekleme)
                  <span className="relative"><Layers className={iconClasses} />
                    <select value={zoneForm.parentId} onChange={(e) => setZoneForm({...zoneForm, parentId: e.target.value})} className={inputClasses}>
                      <option value="">Ana Bölge Olarak Ekle</option>
                      {zones.map((z: any) => <option key={z.id} value={z.id}>{z.name}</option>)}
                    </select>
                  </span>
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">Boyut/Ölçü (Opsiyonel)
                    <input type="number" value={zoneForm.size} onChange={(e) => setZoneForm({...zoneForm, size: e.target.value})} placeholder="Örn: 150" className="w-full rounded-md border border-slate-300 bg-white p-2 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />
                  </label>
                  <label className="flex flex-col gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">Birim
                    <select value={zoneForm.unit} onChange={(e) => setZoneForm({...zoneForm, unit: e.target.value})} className="w-full rounded-md border border-slate-300 bg-white p-2 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                      <option value="m²">Metrekare (m²)</option>
                      <option value="m³">Metreküp (m³)</option>
                      <option value="m">Metre (m)</option>
                      <option value="kg">Kilogram (kg)</option>
                      <option value="adet">Adet</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t p-5 border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
                <button type="button" onClick={() => setIsNewZoneModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">İptal</button>
                <button type="submit" disabled={isZoneSaving} className="rounded-md bg-cyan-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-cyan-500 disabled:opacity-50 dark:shadow-[0_0_10px_rgba(6,182,212,0.3)]">{isZoneSaving ? 'EKLENİYOR...' : 'BÖLGEYİ EKLE'}</button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      <NewTaskModal isOpen={isNewTaskModalOpen} onClose={() => setIsNewTaskModalOpen(false)} project={project} zones={zones.flatMap((zone) => [zone, ...(zone.subZones ?? [])])} tasks={tasks} onCreated={handleTaskUpdated} />
      <EditProjectModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} project={project} onUpdated={handleTaskUpdated} />
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDeleteModalOpen(false)} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm dark:bg-slate-950/80" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md overflow-hidden rounded-xl border shadow-2xl border-rose-200 bg-white dark:border-rose-500/30 dark:bg-slate-900">
              <div className="flex flex-col items-center p-8 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-rose-100 bg-rose-50 dark:border-rose-500/20 dark:bg-rose-500/10"><TriangleAlert className="h-8 w-8 text-rose-500 animate-pulse" /></div>
                <h2 className="mb-2 text-xl font-bold text-slate-900 dark:text-slate-100">Projeyi Silmek Üzeresiniz!</h2>
                <p className="mb-6 text-sm text-slate-600 dark:text-slate-400"><strong className="text-slate-900 dark:text-white">{project?.name}</strong> projesini ve ona bağlı tüm görevleri, bölgeleri ve AI analizlerini kalıcı olarak sileceksiniz. Bu işlem <span className="text-rose-500 dark:text-rose-400">geri alınamaz.</span> Onaylıyor musunuz?</p>
                <div className="flex w-full gap-3"><button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 rounded-md border py-2.5 text-sm font-semibold transition-colors border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white">Vazgeç</button><button onClick={executeDeleteProject} className="flex-1 rounded-md bg-rose-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-500 dark:shadow-[0_0_15px_rgba(225,29,72,0.4)]">Evet, Kalıcı Olarak Sil</button></div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}