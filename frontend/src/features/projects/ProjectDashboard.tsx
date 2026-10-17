import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Ship, Activity, Clock, Users, AlertOctagon, Layers, ChevronRight, TriangleAlert, Plus, BrainCircuit, Edit, Trash2 } from 'lucide-react';
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
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [expandedZones, setExpandedZones] = useState<Record<string, boolean>>({
    Z1: true,
  });

  // CANLI VERİ STATELERİ
  const [isLoading, setIsLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [zones, setZones] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [dependencies, setDependencies] = useState<any[]>([]);
  const [reloadTasks, setReloadTasks] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  // GERÇEK API BAĞLANTISI
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setIsLoading(true);
        // 1. Proje ve Bölgeleri Çek (Burası kesin çalışıyor)
        const [projectRes, zonesRes] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get(`/projects/${id}/zones`)
        ]);
        const projectData = projectRes.data;

        // 2. Görevleri Çek (Backend uçları henüz yoksa ana sayfayı PATLATMASIN diye ayrı try-catch içinde)
        let fetchedTasks = [];
        let fetchedDeps = [];
        try {
          const tasksRes = await api.get('/tasks');
          fetchedTasks = tasksRes.data.filter((task: any) => task.project?.id === projectData.id);
          const depsRes = await api.get('/tasks/dependencies', { params: { projectId: projectData.id } });
          fetchedDeps = depsRes.data;
        } catch (taskError) {
          console.warn('Görev (Task) API uçları henüz hazır değil, ağ haritası boş render edilecek.');
        }

        setDependencies(fetchedDeps);
        setTasks(fetchedTasks.map((task: any) => ({
          ...task,
          dependencies: fetchedDeps
            .filter((dependency: any) => dependency.successor?.id === task.id)
            .map((dependency: any) => ({ predecessor: dependency.predecessor })),
        })));

        // 3. Proje Verilerini Ekrana Uyarla
        const progress = Number(projectData.progressPercentage ?? projectData.progress ?? 0);
        setProject({
          ...projectData,
          code: projectData.projectCode || projectData.code,
          health: projectData.priority === 'CRITICAL' ? 'CRITICAL' : 'GOOD',
          progress,
          plannedProgress: progress,
          delayDays: 0,
          dueDate: projectData.plannedDeliveryDate || projectData.dueDate,
          manHoursSpent: Number(projectData.actualManHours ?? projectData.manHoursSpent ?? 0),
          manHoursEstimated: Number(projectData.estimatedManHours ?? projectData.manHoursEstimated ?? 0),
        });

        // 4. Bölgeleri (Zones) Hiyerarşik Hale Getir
        const allZones = zonesRes.data.map((zone: any) => ({
          ...zone,
          parentId: zone.parentArea?.id ?? null,
          area: zone.size == null ? 'Ölçü belirtilmedi' : `${zone.size} ${zone.unit ?? ''}`,
          hasRisk: false,
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

  // EKLENDİ: Silme Fonksiyonu
  const executeDeleteProject = async () => {
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Proje kalıcı olarak silindi.');
      setIsDeleteModalOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Silme hatası:', error);
      toast.error('Proje silinirken bir hata oluştu.');
      setIsDeleteModalOpen(false);
    }
  };

  // Veri yüklenirken iskelet ekranı göster
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
          <h2 className="text-lg font-semibold text-slate-100">Proje açılamadı</h2>
          <p className="mt-2 text-sm text-slate-400">{loadError ?? 'Proje bulunamadı.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-6 overflow-hidden">
      {/* 4.1: GEMİ KÜNYESİ VE TELEMETRİ ŞERİDİ (CANLI VERİ) */}
      <div className="flex flex-col gap-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-950/30 text-cyan-500 border border-cyan-900/50">
              <Ship className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-sans text-2xl font-bold text-slate-100">{project.name}</h1>
                <span className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold ${project.health === 'CRITICAL' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-500'}`}>DURUM: {project.status}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 font-mono text-sm text-slate-500">
                <span className="text-cyan-600/80">{project.code}</span>
                <span>•</span>
                <span>Proje ID: {project.id}</span>
              </div>
            </div>
          </div>

          {/* EKLENDİ: Düzenle ve Sil Butonları */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center justify-center rounded-md border border-slate-700 bg-slate-800/50 p-2.5 text-slate-400 transition-all hover:border-cyan-500/50 hover:bg-slate-800 hover:text-cyan-400"
              title="Projeyi Düzenle"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center justify-center rounded-md border border-slate-700 bg-slate-800/50 p-2.5 text-slate-400 transition-all hover:border-rose-500/50 hover:bg-slate-800 hover:text-rose-500"
              title="Projeyi Sil"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 4 Büyük Deterministik Metrik Kartı */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="relative overflow-hidden rounded-lg border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400">
                <Activity className="h-4 w-4" />
                <span className="font-sans text-xs font-medium uppercase tracking-wider">Genel İlerleme</span>
              </div>
              <span className="font-mono text-lg font-bold text-cyan-400">%{project.progress}</span>
            </div>
            <div className="mt-3 flex flex-col gap-1">
              <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]" style={{ width: `${project.progress}%` }} />
              </div>
              <div className="flex items-center justify-between font-mono text-[10px] text-slate-500 mt-1">
                <span>PLANLANAN: %{project.plannedProgress}</span>
                {project.progress < project.plannedProgress && <span className="text-rose-400">-%{project.plannedProgress - project.progress} SAPMA</span>}
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-lg border border-amber-500/30 bg-amber-950/10 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-500/80">
                <Clock className="h-4 w-4" />
                <span className="font-sans text-xs font-medium uppercase tracking-wider">Takvim Durumu</span>
              </div>
              <span className="font-mono text-lg font-bold text-amber-500">{project.delayDays} GÜN GECİKME</span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-amber-500/10 pt-2 font-mono text-xs">
              <span className="text-slate-400">
                HEDEF: <span className="text-slate-200">{project.dueDate ? new Date(project.dueDate).toLocaleDateString('tr-TR') : '-'}</span>
              </span>
              {project.delayDays > 0 && (
                <span className="flex items-center gap-1 text-amber-500/80">
                  <TriangleAlert className="h-3 w-3" /> RİSKLİ
                </span>
              )}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-lg border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400">
                <Users className="h-4 w-4" />
                <span className="font-sans text-xs font-medium uppercase tracking-wider">Adam-Saat</span>
              </div>
              <span className="font-mono text-lg font-bold text-slate-200">
                {project.manHoursSpent.toLocaleString()} <span className="text-sm text-slate-500">saat</span>
              </span>
            </div>
            <div className="mt-3 flex flex-col gap-1">
              <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full bg-emerald-500"
                  style={{
                    width: `${project.manHoursEstimated ? Math.min((project.manHoursSpent / project.manHoursEstimated) * 100, 100) : 0}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between font-mono text-[10px] text-slate-500 mt-1">
                <span>BÜTÇE: {project.manHoursEstimated.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-lg border border-rose-500/30 bg-rose-950/10 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-500/80">
                <AlertOctagon className="h-4 w-4" />
                <span className="font-sans text-xs font-medium uppercase tracking-wider">Aktif Darboğaz</span>
              </div>
              <span className="font-mono text-lg font-bold text-rose-500">SİSTEM OTO-HESABI</span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-rose-500/10 pt-2 font-mono text-xs">
              <span className="text-rose-400">CRITICAL PATH ÜZERİNDE</span>
            </div>
          </div>
        </div>
      </div>

      {/* ALT PANEL: BÖLGELER (SOL) VE KRİTİK YOL (SAĞ) */}
      <div className="flex flex-1 gap-6 min-h-0">
        {/* GEMİ BÖLGELERİ (CANLI VERİ) */}
        <div className="hidden w-80 shrink-0 flex-col overflow-hidden rounded-lg border border-slate-800 bg-slate-900/30 backdrop-blur-sm md:flex">
          <div className="border-b border-slate-800 bg-slate-900/50 p-4">
            <h3 className="flex items-center gap-2 font-sans text-sm font-bold text-slate-200">
              <Layers className="h-4 w-4 text-cyan-500" /> Gemi Bölgeleri
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <div className="flex flex-col gap-1.5">
              {zones.map((zone) => {
                const isExpanded = expandedZones[zone.id];

                return (
                  <div key={zone.id} className="flex flex-col">
                    <button onClick={() => toggleZone(zone.id)} className={`group flex w-full items-center justify-between rounded-md px-3 py-2 transition-colors ${activeZone === zone.id ? 'bg-cyan-950/40 border border-cyan-900/50' : 'hover:bg-slate-800/50 border border-transparent'}`}>
                      <div className="flex items-center gap-2">
                        <ChevronRight className={`h-4 w-4 text-slate-500 transition-transform ${isExpanded ? 'rotate-90 text-cyan-400' : 'group-hover:text-slate-300'}`} />
                        <div className="flex flex-col items-start">
                          <span className={`font-sans text-sm font-medium ${activeZone === zone.id ? 'text-cyan-400' : 'text-slate-300 group-hover:text-slate-100'}`}>{zone.name}</span>
                          <span className="font-mono text-[10px] text-slate-500">{zone.area}</span>
                        </div>
                      </div>
                      {zone.hasRisk && <TriangleAlert className="h-4 w-4 animate-pulse text-rose-500" />}
                    </button>

                    <AnimatePresence>
                      {isExpanded && zone.subZones && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="ml-6 mt-1 flex flex-col gap-1 border-l border-slate-800 pl-3 overflow-hidden">
                          {zone.subZones.map((sub: any) => (
                            <button
                              key={sub.id}
                              onClick={() => setActiveZone(sub.id)}
                              className={`group flex w-full items-center justify-between rounded-md px-3 py-1.5 transition-colors ${activeZone === sub.id ? 'bg-slate-800/80 text-cyan-400 border border-slate-700' : 'hover:bg-slate-800/40 text-slate-400 border border-transparent'}`}
                            >
                              <div className="flex flex-col items-start">
                                <span className="font-sans text-xs font-medium group-hover:text-slate-200">{sub.name}</span>
                                <span className="font-mono text-[9px] text-slate-500">{sub.area}</span>
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

        {/* KRİTİK YOL AĞI VE GÖRÜNÜM SEÇİCİ */}
        <div className="flex flex-1 flex-col gap-4 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-md border border-slate-800 bg-slate-900/50 p-1">
                <button onClick={() => setViewMode('DAG')} className={`flex items-center gap-2 rounded px-4 py-1.5 font-sans text-sm font-medium transition-all ${viewMode === 'DAG' ? 'bg-slate-800 text-cyan-400 shadow' : 'text-slate-500 hover:text-slate-300'}`}>
                  🕸️ Ağ Görünümü
                </button>
                <button onClick={() => setViewMode('LIST')} className={`flex items-center gap-2 rounded px-4 py-1.5 font-sans text-sm font-medium transition-all ${viewMode === 'LIST' ? 'bg-slate-800 text-cyan-400 shadow' : 'text-slate-500 hover:text-slate-300'}`}>
                  📋 Liste Görünümü
                </button>
              </div>
              <button onClick={() => setIsNewTaskModalOpen(true)} className="flex items-center gap-1.5 rounded-md bg-cyan-600/20 border border-cyan-500/30 px-3 py-1.5 font-sans text-sm font-medium text-cyan-400 transition-colors hover:bg-cyan-600/40">
                <Plus className="h-4 w-4" /> Yeni Görev
              </button>
            </div>
            {project.health === 'CRITICAL' && (
              <button
                onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
                className="group flex cursor-pointer items-center gap-3 rounded-md border border-rose-500/50 bg-rose-500/10 px-1 py-1 pr-3 font-mono text-xs font-bold text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.15)] transition-all hover:bg-rose-600 hover:text-white"
              >
                <div className="flex items-center gap-2 rounded bg-rose-950/50 px-3 py-1.5 transition-colors group-hover:bg-rose-700/50">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75 group-hover:bg-white"></span>
                    <span className="relative inline-flex h-full w-full rounded-full bg-rose-500 group-hover:bg-white"></span>
                  </span>
                  <span>KRİTİK DARBOĞAZ</span>
                </div>
                <div className="flex items-center gap-1.5 pl-1">
                  <BrainCircuit className="h-4 w-4" />
                  <span>AI ANALİZİNİ AÇ</span>
                </div>
              </button>
            )}
          </div>

          <div className="flex-1 rounded-lg border border-slate-800 bg-slate-950 relative overflow-hidden">
            {viewMode === 'DAG' ? (
              <CriticalPathGraph focusedNodeId={focusedNodeId} tasks={tasks} dependencies={dependencies} onTaskUpdated={handleTaskUpdated} />
            ) : (
              <TaskListView tasks={tasks} />
            )}
          </div>
        </div>

        {isAiPanelOpen && <AiRiskPanel projectId={project.id} onClose={() => setIsAiPanelOpen(false)} onFocusNode={setFocusedNodeId} />}
      </div>

      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        project={project}
        zones={zones.flatMap((zone) => [zone, ...(zone.subZones ?? [])])}
        tasks={tasks}
        onCreated={handleTaskUpdated}
      />

      {/* EKLENDİ: Düzenleme Modalı */}
      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        project={project}
        onUpdated={handleTaskUpdated}
      />
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDeleteModalOpen(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-xl border border-rose-500/30 bg-slate-900 shadow-2xl"
            >
              <div className="flex flex-col items-center p-8 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/20">
                  <TriangleAlert className="h-8 w-8 text-rose-500 animate-pulse" />
                </div>
                <h2 className="mb-2 text-xl font-bold text-slate-100">Projeyi Silmek Üzeresiniz!</h2>
                <p className="mb-6 text-sm text-slate-400">
                  <strong className="text-white">{project?.name}</strong> projesini ve ona bağlı tüm görevleri, bölgeleri ve AI analizlerini kalıcı olarak sileceksiniz. Bu işlem <span className="text-rose-400">geri alınamaz.</span> Onaylıyor musunuz?
                </p>
                <div className="flex w-full gap-3">
                  <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 rounded-md border border-slate-700 bg-slate-800 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-700 hover:text-white">Vazgeç</button>
                  <button onClick={executeDeleteProject} className="flex-1 rounded-md bg-rose-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.4)]">Evet, Kalıcı Olarak Sil</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}