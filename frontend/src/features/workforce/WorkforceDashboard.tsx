import { useState, useEffect } from 'react';
import {
  Users, Wrench, HardHat, Plus, UserPlus, PackagePlus, X, Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export default function WorkforceDashboard() {
  const [activeTab, setActiveTab] = useState<'TEAMS' | 'RESOURCES'>('TEAMS');
  const [modalType, setModalType] = useState<'TEAM' | 'WORKER' | 'EQUIPMENT' | null>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    try {
      const [teamsResponse, resourcesResponse] = await Promise.all([
        api.get('/workforce/teams'),
        api.get('/resources'),
      ]);
      setTeams(teamsResponse.data.map((team: any) => ({
        id: team.id,
        name: team.name,
        dept: team.department,
        workers: team.members?.length ?? 0,
        capacity: Number(team.capacity ?? 0),
      })));
      setResources(resourcesResponse.data.map((resource: any) => ({
        ...resource,
        condition: `${resource.availableQuantity}/${resource.totalQuantity} ${resource.unit}`,
      })));
    } catch (error) {
      toast.error('Ekip ve kaynak verileri yüklenemedi.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const values = new FormData(e.currentTarget);
    setIsSaving(true);
    try {
      if (modalType === 'TEAM') {
        await api.post('/workforce/teams', {
          name: values.get('name'),
          department: values.get('department'),
          capacity: Number(values.get('capacity') || 0),
        });
      } else if (modalType === 'EQUIPMENT') {
        const quantity = Number(values.get('quantity'));
        await api.post('/resources', {
          name: values.get('name'),
          type: values.get('type'),
          status: 'AVAILABLE',
          totalQuantity: quantity,
          availableQuantity: quantity,
          unit: values.get('unit'),
        });
      } else if (modalType === 'WORKER') {
        const { data: tokens } = await api.post('/auth/register', {
          email: values.get('email'),
          password: values.get('password'),
          firstName: values.get('firstName'),
          lastName: values.get('lastName'),
        });
        const { data: user } = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        await api.post('/workforce/employees', {
          user: { id: user.id },
          department: values.get('department'),
          team: values.get('teamId') ? { id: values.get('teamId') } : undefined,
          jobPosition: values.get('jobPosition'),
        });
      }
      toast.success('Kayıt başarıyla sisteme eklendi.');
      setModalType(null);
      await loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? 'Kayıt oluşturulamadı.');
    } finally {
      setIsSaving(false);
    }
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
              {teams.map(team => (
                <div key={team.id} className="flex flex-col gap-4 rounded-lg border border-slate-800 bg-slate-900/50 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-sans text-lg font-bold text-slate-200">{team.name}</h3>
                      <span className="font-mono text-[10px] text-slate-500">{team.dept}</span>
                    </div>
                    <div className="flex items-center gap-1 rounded bg-slate-800 px-2 py-1 font-mono text-xs text-slate-300">
                      <Users className="h-3.5 w-3.5 text-cyan-500" /> {team.workers}
                    </div>
                  </div>

                  <div className="border-t border-slate-800/50 pt-3 font-mono text-xs text-slate-400">
                    Kapasite: <span className="text-slate-200">{team.capacity}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* SEKME 2: EKİPMAN VE MALZEME HAVUZU */}
          {activeTab === 'RESOURCES' && (
            <motion.div key="resources" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {resources.map(res => (
                <div key={res.id} className="flex flex-col justify-between rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between">
                      <span className="font-mono text-[10px] text-slate-500">{res.type}</span>
                      {res.status === 'IN_USE' && <span className="rounded bg-cyan-950/50 border border-cyan-500/30 px-2 py-0.5 font-mono text-[9px] font-bold text-cyan-400">KULLANIMDA</span>}
                      {res.status === 'AVAILABLE' && <span className="rounded bg-emerald-950/50 border border-emerald-500/30 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-400">MÜSAİT</span>}
                      {res.status === 'MAINTENANCE' && <span className="rounded bg-rose-950/50 border border-rose-500/30 px-2 py-0.5 font-mono text-[9px] font-bold text-rose-400 animate-pulse">BAKIMDA</span>}
                    </div>
                    <h3 className="font-sans text-sm font-bold text-slate-200 leading-tight">{res.name}</h3>
                  </div>
                  <div className="mt-4 flex flex-col gap-1.5 border-t border-slate-800/50 pt-3 font-mono text-xs">
                    <div className="flex justify-between text-slate-400"><span>Stok:</span> <span className={res.status === 'MAINTENANCE' || res.status === 'DEPLETED' ? 'text-amber-500' : 'text-slate-300'}>{res.condition}</span></div>
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
                  {modalType === 'EQUIPMENT' && 'Yeni Ekipman / Malzeme Ekle'}
                </h2>
                <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-200"><X className="h-5 w-5" /></button>
              </div>

              <form onSubmit={handleSave} className="flex flex-col gap-4">

               {/* PERSONEL EKLEME FORMU */}
                {modalType === 'WORKER' && (
                  <>
                    <input required name="firstName" placeholder="Ad" className="rounded-md border border-slate-700 bg-slate-950 p-2.5 text-sm text-slate-200" />
                    <input required name="lastName" placeholder="Soyad" className="rounded-md border border-slate-700 bg-slate-950 p-2.5 text-sm text-slate-200" />
                    <input required type="email" name="email" placeholder="E-posta" className="rounded-md border border-slate-700 bg-slate-950 p-2.5 text-sm text-slate-200" />
                    <input required minLength={6} type="password" name="password" placeholder="Geçici şifre (en az 6 karakter)" className="rounded-md border border-slate-700 bg-slate-950 p-2.5 text-sm text-slate-200" />
                    <input required name="jobPosition" placeholder="Görev unvanı" className="rounded-md border border-slate-700 bg-slate-950 p-2.5 text-sm text-slate-200" />
                    <div className="flex flex-col gap-1.5">
                      <label className="font-mono text-xs text-slate-400">Atanacak Takım</label>
                      <select name="teamId" className="rounded-md border border-slate-700 bg-slate-950 p-2.5 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none">
                        <option value="">Takım seçmeyin</option>
                        {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                    <select required name="department" className="rounded-md border border-slate-700 bg-slate-950 p-2.5 text-sm text-slate-200">
                      <option value="PAINTING">Boya</option><option value="WELDING">Kaynak</option><option value="ELECTRICAL">Elektrik</option><option value="MECHANICAL">Mekanik</option><option value="ASSEMBLY">Montaj</option><option value="LOGISTICS">Lojistik</option>
                    </select>
                  </>
                )}

                {/* ORTAK İSİM/BAŞLIK ALANI (Takım, Ekipman ve Görev için) */}
                {(modalType === 'TEAM' || modalType === 'EQUIPMENT') && (
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs text-slate-400">
                      İsim / Başlık
                    </label>
                    <input required name="name" type="text" className="rounded-md border border-slate-700 bg-slate-950 p-2.5 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none" placeholder="Buraya yazın..." />
                  </div>
                )}

                {modalType === 'TEAM' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs text-slate-400">Departman</label>
                    <select required name="department" className="rounded-md border border-slate-700 bg-slate-950 p-2.5 text-sm text-slate-200">
                      <option value="PAINTING">Boya</option><option value="WELDING">Kaynak</option><option value="ELECTRICAL">Elektrik</option><option value="MECHANICAL">Mekanik</option><option value="ASSEMBLY">Montaj</option><option value="LOGISTICS">Lojistik</option>
                    </select>
                    <label className="font-mono text-xs text-slate-400">Kapasite</label>
                    <input required min="0" type="number" name="capacity" className="rounded-md border border-slate-700 bg-slate-950 p-2.5 text-sm text-slate-200" />
                  </div>
                )}

                {modalType === 'EQUIPMENT' && (
                  <div className="grid grid-cols-2 gap-3">
                    <select name="type" className="rounded-md border border-slate-700 bg-slate-950 p-2.5 text-sm text-slate-200"><option value="EQUIPMENT">Ekipman</option><option value="MACHINE">Makine</option><option value="TOOl">El aleti</option><option value="MATERIAL">Malzeme</option></select>
                    <input required min="0" type="number" step="0.01" name="quantity" placeholder="Miktar" className="rounded-md border border-slate-700 bg-slate-950 p-2.5 text-sm text-slate-200" />
                    <select name="unit" className="col-span-2 rounded-md border border-slate-700 bg-slate-950 p-2.5 text-sm text-slate-200"><option value="adet">Adet</option><option value="kg">kg</option><option value="m">Metre</option><option value="m²">Metrekare</option><option value="m³">Metreküp</option><option value="saat">Saat</option><option value="adam-saat">Adam-saat</option></select>
                  </div>
                )}

                {/* KAYDET BUTONLARI */}
                <div className="mt-4 flex justify-end gap-3 border-t border-slate-800 pt-4">
                  <button type="button" onClick={() => setModalType(null)} className="rounded-md px-4 py-2 font-sans text-sm font-bold text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors">İptal</button>
                  <button type="submit" disabled={isSaving} className="flex items-center gap-2 rounded-md bg-cyan-600 px-6 py-2 font-sans text-sm font-bold text-white transition-colors hover:bg-cyan-500 shadow-lg shadow-cyan-900/50 disabled:opacity-50">
                    <Save className="h-4 w-4" /> {isSaving ? 'KAYDEDİLİYOR' : 'KAYDET'}
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