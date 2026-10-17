import { useState } from 'react';
import {
  Users, Wrench, AlertTriangle, CheckCircle2, HardHat,
  Activity, Plus, UserPlus, ClipboardList, PackagePlus, X, Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// Sahte (Mock) Veriler
const MOCK_TEAMS = [
  { id: 'T1', name: 'Boya ve Kumlama Ekibi', dept: 'Yüzey İşlem', workers: 12, capacity: 140, status: 'OVERLOADED', skills: ['Epoksi', 'Kumlama', 'Astar'] },
  { id: 'T2', name: 'Kaynak Takımı A', dept: 'Çelik Konstrüksiyon', workers: 8, capacity: 85, status: 'OPTIMAL', skills: ['TIG', 'MIG/MAG', 'Argon'] },
  { id: 'T3', name: 'Elektrik & Donatım', dept: 'Kablolama', workers: 6, capacity: 45, status: 'AVAILABLE', skills: ['Yüksek Gerilim', 'Pano Montaj'] },
];

const MOCK_RESOURCES = [
  { id: 'R1', name: 'Kule Vinç (Vinç-04)', type: 'Ağır Makine', status: 'IN_USE', project: 'TITAN DISCOVERY', condition: 'İyi' },
  { id: 'R2', name: 'Yüksek Basınçlı Kompresör', type: 'Ekipman', status: 'AVAILABLE', project: '-', condition: 'Bakım Yaklaşıyor' },
  { id: 'R3', name: 'Mobil İskele Sistemi', type: 'Demirbaş', status: 'MAINTENANCE', project: '-', condition: 'Arızalı' },
  { id: 'R4', name: 'Jotun Astar Boya (Varil)', type: 'Sarf Malzeme', status: 'LOW_STOCK', project: '-', condition: 'Kritik Seviye: 2 Varil' },
];

export default function WorkforceDashboard() {
  const [activeTab, setActiveTab] = useState<'TEAMS' | 'RESOURCES'>('TEAMS');
  const [modalType, setModalType] = useState<'TEAM' | 'WORKER' | 'TASK' | 'EQUIPMENT' | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setModalType(null);
    toast.success('Kayıt başarıyla sisteme eklendi!');
  };

  return (
    <div className="relative flex h-full flex-col gap-6 overflow-hidden">

      {/* Üst Başlık */}
      <div className="flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-950/30 text-emerald-500 border border-emerald-900/50">
            <HardHat className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-sans text-2xl font-bold text-slate-100">İşgücü ve Kaynak Yönetimi</h1>
            <p className="font-mono text-sm text-slate-500">PERSONEL KAPASİTESİ VE SAHA ENVANTERİ</p>
          </div>
        </div>
      </div>

      {/* Sekmeler (Tabs) */}
      <div className="flex shrink-0 gap-4 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('TEAMS')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 font-sans text-sm font-bold transition-colors ${activeTab === 'TEAMS' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
        >
          <Users className="h-4 w-4" /> Ekipler ve Kapasite
        </button>
        <button
          onClick={() => setActiveTab('RESOURCES')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 font-sans text-sm font-bold transition-colors ${activeTab === 'RESOURCES' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
        >
          <Wrench className="h-4 w-4" /> Ekipman ve Malzeme Havuzu
        </button>
      </div>

      {/* Aksiyon Butonları (Action Bar) */}
      <div className="flex shrink-0 gap-3">
        {activeTab === 'TEAMS' ? (
          <>
            <button onClick={() => setModalType('TEAM')} className="flex items-center gap-2 rounded-md bg-cyan-950/40 border border-cyan-500/30 px-4 py-2 font-sans text-xs font-bold text-cyan-400 transition-colors hover:bg-cyan-900">
              <Plus className="h-4 w-4" /> YENİ TAKIM OLUŞTUR
            </button>
            <button onClick={() => setModalType('WORKER')} className="flex items-center gap-2 rounded-md bg-slate-800 border border-slate-700 px-4 py-2 font-sans text-xs font-bold text-slate-300 transition-colors hover:bg-slate-700 hover:text-white">
              <UserPlus className="h-4 w-4" /> PERSONEL EKLE & ATA
            </button>
            <button onClick={() => setModalType('TASK')} className="flex items-center gap-2 rounded-md bg-slate-800 border border-slate-700 px-4 py-2 font-sans text-xs font-bold text-slate-300 transition-colors hover:bg-slate-700 hover:text-white">
              <ClipboardList className="h-4 w-4" /> GÖREV ATA
            </button>
          </>
        ) : (
          <button onClick={() => setModalType('EQUIPMENT')} className="flex items-center gap-2 rounded-md bg-emerald-950/40 border border-emerald-500/30 px-4 py-2 font-sans text-xs font-bold text-emerald-400 transition-colors hover:bg-emerald-900">
            <PackagePlus className="h-4 w-4" /> YENİ EKİPMAN EKLE
          </button>
        )}
      </div>

      {/* İçerik Alanı */}
      <div className="flex-1 overflow-y-auto pr-2 pb-10">
        <AnimatePresence mode="wait">

          {/* SEKME 1: EKİPLER VE KAPASİTE */}
          {activeTab === 'TEAMS' && (
            <motion.div key="teams" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {MOCK_TEAMS.map(team => (
                <div key={team.id} className={`flex flex-col gap-4 rounded-lg border bg-slate-900/50 p-5 ${team.status === 'OVERLOADED' ? 'border-rose-500/30' : 'border-slate-800'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-sans text-lg font-bold text-slate-200">{team.name}</h3>
                      <span className="font-mono text-[10px] text-slate-500">{team.dept}</span>
                    </div>
                    <div className="flex items-center gap-1 rounded bg-slate-800 px-2 py-1 font-mono text-xs text-slate-300">
                      <Users className="h-3.5 w-3.5 text-cyan-500" /> {team.workers}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="text-slate-400">Günlük Yük: %{team.capacity}</span>
                      {team.status === 'OVERLOADED' && <span className="flex items-center gap-1 text-rose-500"><AlertTriangle className="h-3 w-3" /> AŞIRI YÜK</span>}
                      {team.status === 'OPTIMAL' && <span className="flex items-center gap-1 text-emerald-500"><CheckCircle2 className="h-3 w-3" /> OPTİMAL</span>}
                      {team.status === 'AVAILABLE' && <span className="flex items-center gap-1 text-cyan-500"><Activity className="h-3 w-3" /> MÜSAİT</span>}
                    </div>
                    <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={`h-full ${team.capacity > 100 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]' : team.capacity > 70 ? 'bg-emerald-500' : 'bg-cyan-500'}`}
                        style={{ width: `${Math.min(team.capacity, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1.5 border-t border-slate-800/50 pt-3">
                    {team.skills.map(skill => (
                      <span key={skill} className="rounded border border-slate-700 bg-slate-800/50 px-2 py-1 font-sans text-[10px] text-slate-300">{skill}</span>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* SEKME 2: EKİPMAN VE MALZEME HAVUZU */}
          {activeTab === 'RESOURCES' && (
            <motion.div key="resources" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {MOCK_RESOURCES.map(res => (
                <div key={res.id} className="flex flex-col justify-between rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between">
                      <span className="font-mono text-[10px] text-slate-500">{res.type}</span>
                      {res.status === 'IN_USE' && <span className="rounded bg-cyan-950/50 border border-cyan-500/30 px-2 py-0.5 font-mono text-[9px] font-bold text-cyan-400">KULLANIMDA</span>}
                      {res.status === 'AVAILABLE' && <span className="rounded bg-emerald-950/50 border border-emerald-500/30 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-400">MÜSAİT</span>}
                      {res.status === 'MAINTENANCE' && <span className="rounded bg-rose-950/50 border border-rose-500/30 px-2 py-0.5 font-mono text-[9px] font-bold text-rose-400 animate-pulse">BAKIMDA</span>}
                      {res.status === 'LOW_STOCK' && <span className="rounded bg-amber-950/50 border border-amber-500/30 px-2 py-0.5 font-mono text-[9px] font-bold text-amber-400">AZALDI</span>}
                    </div>
                    <h3 className="font-sans text-sm font-bold text-slate-200 leading-tight">{res.name}</h3>
                  </div>
                  <div className="mt-4 flex flex-col gap-1.5 border-t border-slate-800/50 pt-3 font-mono text-xs">
                    <div className="flex justify-between text-slate-400"><span>Proje:</span> <span className="text-slate-300">{res.project}</span></div>
                    <div className="flex justify-between text-slate-400"><span>Durum:</span> <span className={res.status === 'MAINTENANCE' || res.status === 'LOW_STOCK' ? 'text-amber-500' : 'text-slate-300'}>{res.condition}</span></div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* İşlem Modalı (Drawer/Popup) */}
      <AnimatePresence>
        {modalType && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalType(null)} className="absolute inset-0 z-40 bg-slate-950/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="absolute left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-sans text-lg font-bold text-slate-100">
                  {modalType === 'TEAM' && 'Yeni Takım Oluştur'}
                  {modalType === 'WORKER' && 'Personel Ekle ve Takıma Ata'}
                  {modalType === 'TASK' && 'Takıma / Personele Görev Ata'}
                  {modalType === 'EQUIPMENT' && 'Yeni Ekipman / Malzeme Ekle'}
                </h2>
                <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-200"><X className="h-5 w-5" /></button>
              </div>

              <form onSubmit={handleSave} className="flex flex-col gap-4">

               {/* PERSONEL EKLEME FORMU */}
                {modalType === 'WORKER' && (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-xs text-slate-400">Ad Soyad</label>
                      <input required type="text" className="rounded-md border border-slate-700 bg-slate-950 p-2.5 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none" placeholder="Örn: Ahmet Usta" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-xs text-slate-400">Atanacak Takım</label>
                      <select required className="rounded-md border border-slate-700 bg-slate-950 p-2.5 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none">
                        <option value="">Takım Seçin...</option>
                        {MOCK_TEAMS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                  </>
                )}

                {/* ORTAK İSİM/BAŞLIK ALANI (Takım, Ekipman ve Görev için) */}
                {(modalType === 'TEAM' || modalType === 'EQUIPMENT' || modalType === 'TASK') && (
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs text-slate-400">
                      {modalType === 'TASK' ? 'Görev Başlığı' : 'İsim / Başlık'}
                    </label>
                    <input required type="text" className="rounded-md border border-slate-700 bg-slate-950 p-2.5 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none" placeholder="Buraya yazın..." />
                  </div>
                )}

                {/* SADECE GÖREV ATAMAYA ÖZEL HEDEF SEÇİCİ */}
                {modalType === 'TASK' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs text-slate-400">Hedef (Kime Atanacak?)</label>
                    <select required className="rounded-md border border-slate-700 bg-slate-950 p-2.5 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none scrollbar-thin">
                      <option value="">Seçim Yapın...</option>
                      <optgroup label="Tüm Takımlar" className="bg-slate-900 text-cyan-400 font-bold">
                        {MOCK_TEAMS.map(t => <option key={t.id} className="text-slate-200 font-normal" value={t.id}>{t.name}</option>)}
                      </optgroup>
                      <optgroup label="Bireysel Personel" className="bg-slate-900 text-emerald-400 font-bold mt-2">
                        <option value="W1" className="text-slate-200 font-normal">Ahmet Usta (Boya)</option>
                        <option value="W2" className="text-slate-200 font-normal">Mehmet Demir (Kaynak)</option>
                      </optgroup>
                    </select>
                  </div>
                )}

                {/* KAYDET BUTONLARI */}
                <div className="mt-4 flex justify-end gap-3 border-t border-slate-800 pt-4">
                  <button type="button" onClick={() => setModalType(null)} className="rounded-md px-4 py-2 font-sans text-sm font-bold text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors">İptal</button>
                  <button type="submit" className="flex items-center gap-2 rounded-md bg-cyan-600 px-6 py-2 font-sans text-sm font-bold text-white transition-colors hover:bg-cyan-500 shadow-lg shadow-cyan-900/50">
                    <Save className="h-4 w-4" /> KAYDET
                  </button>
                </div>
              </form>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}