import { useState } from 'react';
import { CheckCircle2, AlertTriangle, Clock, Wrench, Play, Square, HardHat, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const MOCK_MY_TASKS = [
  {
    id: 'TSK-104',
    title: 'Pervane Şaft İncelemesi ve Yağlama',
    location: 'Makine Dairesi - Alt Katman',
    expectedHours: 5,
    loggedHours: 3,
    status: 'IN_PROGRESS',
    equipment: ['Gres Pompası', 'Kumpas', 'El Feneri']
  },
  {
    id: 'TSK-105',
    title: 'Kargo Bölümü Astar Boya Rötuşu',
    location: 'Kargo Bölümü A',
    expectedHours: 2,
    loggedHours: 0,
    status: 'PENDING',
    equipment: ['Boya Tabancası', 'Jotun Astar', 'Koruyucu Maske']
  },
];

export default function WorkerDashboard() {
  const [activeTask, setActiveTask] = useState<string | null>('TSK-104');
  const [loggedTime, setLoggedTime] = useState<Record<string, number>>({'TSK-104': 3, 'TSK-105': 0});

  const handleTimeAdd = (id: string) => {
    setLoggedTime(prev => ({ ...prev, [id]: prev[id] + 1 }));
  };

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto pb-10">

      {/* 8.3 Üst Karşılama (Sade ve Büyük) */}
      <div className="flex shrink-0 flex-col gap-2 rounded-xl bg-gradient-to-r from-cyan-950/40 to-slate-900/40 p-6 border border-cyan-900/30">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-900/50 text-cyan-400 border-2 border-cyan-500/50">
            <HardHat className="h-8 w-8" />
          </div>
          <div>
            <h1 className="font-sans text-2xl font-bold text-slate-100">Kolay Gelsin, Ahmet Usta</h1>
            <p className="font-mono text-sm text-cyan-500">Boya ve Kumlama Ekibi • Bugün: 2 Aktif Görev</p>
          </div>
        </div>
      </div>

      {/* Görev Kartları (Tablet ve Dokunmatik Ekranlara Uygun Devasa Tasarım) */}
      <div className="flex flex-col gap-6">
        {MOCK_MY_TASKS.map((task) => (
          <div
            key={task.id}
            className={`flex flex-col gap-4 rounded-xl border-2 p-6 transition-all ${
              activeTask === task.id ? 'border-cyan-500/50 bg-slate-900/80 shadow-[0_0_20px_rgba(6,182,212,0.1)]' : 'border-slate-800 bg-slate-900/40'
            }`}
          >
            {/* Görev Başlığı ve Konum */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-800/60 pb-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-slate-800 px-2 py-1 font-mono text-xs font-bold text-slate-400">{task.id}</span>
                  <h2 className="font-sans text-xl font-bold text-slate-100">{task.title}</h2>
                </div>
                <div className="flex items-center gap-2 font-sans text-sm text-slate-400">
                  <MapPin className="h-4 w-4 text-rose-400" />
                  {task.location}
                </div>
              </div>

              {/* Başla / Durdur Butonu */}
              <div className="shrink-0">
                {activeTask === task.id ? (
                  <button
                    onClick={() => setActiveTask(null)}
                    className="flex w-full md:w-auto items-center justify-center gap-2 rounded-lg bg-amber-500/20 border border-amber-500/50 px-6 py-3 font-sans text-sm font-bold text-amber-400 transition-colors hover:bg-amber-500/30"
                  >
                    <Square className="h-5 w-5" /> ÇALIŞMAYI DURAKLAT
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTask(task.id)}
                    className="flex w-full md:w-auto items-center justify-center gap-2 rounded-lg bg-cyan-600 px-6 py-3 font-sans text-sm font-bold text-white transition-colors hover:bg-cyan-500"
                  >
                    <Play className="h-5 w-5" /> GÖREVE BAŞLA
                  </button>
                )}
              </div>
            </div>

            {/* Orta Alan: Süre ve Ekipmanlar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">

              {/* Süre Girişi */}
              <div className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-950/50 p-4">
                <span className="flex items-center gap-2 font-mono text-xs text-slate-500"><Clock className="h-4 w-4" /> HARCANAN SÜRE (ADAM-SAAT)</span>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-3xl font-bold text-slate-200">{loggedTime[task.id]} <span className="text-lg text-slate-500">/ {task.expectedHours} saat</span></span>
                  <button
                    onClick={() => handleTimeAdd(task.id)}
                    className="flex h-10 w-10 items-center justify-center rounded bg-slate-800 text-2xl text-slate-300 hover:bg-slate-700 hover:text-white"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Gerekli Ekipmanlar */}
              <div className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-950/50 p-4">
                <span className="flex items-center gap-2 font-mono text-xs text-slate-500"><Wrench className="h-4 w-4" /> GEREKLİ EKİPMANLAR</span>
                <div className="flex flex-wrap gap-2">
                  {task.equipment.map(eq => (
                    <span key={eq} className="rounded bg-slate-800/80 px-3 py-1.5 font-sans text-xs text-slate-300 border border-slate-700">{eq}</span>
                  ))}
                </div>
              </div>

            </div>

            {/* Alt Aksiyonlar (Devasa Butonlar) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800/60 mt-2">
              <button className="flex items-center justify-center gap-2 rounded-lg border border-rose-500/50 bg-rose-950/30 px-6 py-4 font-sans text-base font-bold text-rose-400 transition-colors hover:bg-rose-900/50">
                <AlertTriangle className="h-6 w-6" /> SORUN BİLDİR (BLOKE)
              </button>
              <button
                onClick={() => {
                  toast.success(`${task.id} başarıyla tamamlandı!`, {
                    description: 'Kritik yol güncellendi ve Garson AI bilgilendirildi.',
                  });
                  setActiveTask(null);
                }}
                className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-4 font-sans text-base font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-colors hover:bg-emerald-500"
              >
                <CheckCircle2 className="h-6 w-6" /> İŞİ TAMAMLADIM
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}