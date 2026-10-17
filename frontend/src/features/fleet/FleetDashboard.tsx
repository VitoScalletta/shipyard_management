import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ship, Activity, Clock, Plus, Anchor, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/ui/Skeleton';
import { EmptyState } from '@/ui/EmptyState';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export interface ShipProject {
  id: string;
  name: string;
  type: string;
  status: 'DELAYED' | 'ON_TRACK' | 'MAINTENANCE';
  progress: number;
  health: 'CRITICAL' | 'GOOD' | 'WARNING';
  manager: string;
  dueDate: string;
}

// Backend kapalıysa devreye girecek Yedek Tohum Verisi (Fallback)
const FALLBACK_FLEET: ShipProject[] = [
  {
    id: 'PRJ-084',
    name: 'M/V YILDIZ KURU YÜK',
    type: '120m Kuru Yük',
    status: 'DELAYED',
    progress: 74,
    health: 'CRITICAL',
    manager: 'Kpt. Demir',
    dueDate: '2026-12-15'
  },
  {
    id: 'PRJ-091',
    name: 'M/T KARADENİZ TANKER',
    type: 'Kimyasal Tanker',
    status: 'ON_TRACK',
    progress: 45,
    health: 'GOOD',
    manager: 'Ahmet Usta',
    dueDate: '2027-03-20'
  },
  {
    id: 'PRJ-095',
    name: 'T/B FIRTINA RÖMORKÖR',
    type: 'Liman Römorkörü',
    status: 'MAINTENANCE',
    progress: 12,
    health: 'WARNING',
    manager: 'Ayşe Müh.',
    dueDate: '2026-11-05'
  }
];

export default function FleetDashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<ShipProject[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        // GERÇEK VERİTABANI İSTEĞİ
        const response = await api.get('/projects');
        setProjects(response.data);
      } catch (error) {
        console.warn('Backend API erişilemedi, yerel sunum verisi yükleniyor...', error);
        toast.info('Sunucu bağlantısı bekleniyor: Demo verileri yüklendi.');
        setProjects(FALLBACK_FLEET);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="flex h-full flex-col gap-6 overflow-hidden">
      {/* Üst Başlık ve Aksiyon */}
      <div className="flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-950/30 text-cyan-500 border border-cyan-900/50">
            <Anchor className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-sans text-2xl font-bold text-slate-100">Aktif Tersane Filosu</h1>
            <p className="font-mono text-sm text-slate-500">KIZAK VE HAVUZLARDAKİ GEMİLER</p>
          </div>
        </div>
        <button className="flex items-center justify-center gap-2 rounded-md bg-cyan-600 px-4 py-2 font-sans text-sm font-bold text-white transition-all hover:bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
          <Plus className="h-4 w-4" /> YENİ GEMİ EKLE
        </button>
      </div>

      {/* Gemi Listesi Alanı */}
      <div className="flex-1 overflow-y-auto pb-6">
        {isLoading && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex h-48 flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/30 p-5">
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

        {!isLoading && projects.length === 0 && (
          <EmptyState
            icon={Ship}
            title="Tersanede Gemi Bulunmuyor"
            description="Şu anda kızakta veya havuzda kayıtlı aktif bir gemi projesi yok. Yeni bir gemi ekleyerek operasyona başlayın."
          />
        )}

        {!isLoading && projects.length > 0 && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {projects.map((ship) => (
              <button
                key={ship.id}
                onClick={() => navigate(`/project/${ship.id}`)}
                className="group flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/50 p-5 text-left transition-all hover:-translate-y-1 hover:border-cyan-500/50 hover:bg-slate-800 hover:shadow-[0_10px_30px_-10px_rgba(6,182,212,0.3)]"
              >
                <div className="flex items-start justify-between border-b border-slate-800/60 pb-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${
                      ship.health === 'CRITICAL' ? 'bg-rose-950/50 border-rose-500/30 text-rose-500' :
                      ship.health === 'WARNING' ? 'bg-amber-950/50 border-amber-500/30 text-amber-500' :
                      'bg-cyan-950/50 border-cyan-500/30 text-cyan-500'
                    }`}>
                      <Ship className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="font-sans text-lg font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">{ship.name}</h3>
                      <span className="font-mono text-xs text-slate-500">{ship.type} • {ship.id}</span>
                    </div>
                  </div>
                  {ship.health === 'CRITICAL' && <AlertTriangle className="h-5 w-5 animate-pulse text-rose-500" />}
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-slate-400">PROJE İLERLEMESİ</span>
                    <span className="font-bold text-cyan-400">%{ship.progress}</span>
                  </div>
                  <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-950 border border-slate-800">
                    <div
                      className={`h-full ${ship.health === 'CRITICAL' ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]' : 'bg-cyan-500'}`}
                      style={{ width: `${ship.progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between font-mono text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Activity className="h-4 w-4" /> Yöneticisi: <span className="text-slate-200">{ship.manager}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="h-4 w-4" /> Teslim: <span className="text-slate-200">{ship.dueDate}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}