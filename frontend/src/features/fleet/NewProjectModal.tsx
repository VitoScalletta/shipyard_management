import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Ship, Hash, Calendar, Layers, Search, AlignLeft, AlertCircle, Tag } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export default function NewProjectModal({ isOpen, onClose, onCreated }: NewProjectModalProps) {
  const [name, setName] = useState('');
  const [imoNumber, setImoNumber] = useState('');
  const [shipType, setShipType] = useState('Kuru yük gemisi');

  // YENİ EKLENEN PROJE DETAY STATELERİ
  const [projectType, setProjectType] = useState('NEW_BUILDING');
  const [priority, setPriority] = useState('MEDIUM');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]); // Varsayılan: Bugün
  const [deliveryDate, setDeliveryDate] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  // Akıllı Arama (Autocomplete) Stateleri
  const [availableManagers, setAvailableManagers] = useState<any[]>([]);
  const [selectedManagers, setSelectedManagers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.get('/users')
        .then((res) => {
          const managers = res.data.filter((u: any) => ['ADMIN', 'MANAGER', 'ENGINEER'].includes(u.role));
          if (managers.length > 0) setAvailableManagers(managers);
          else setFallbackManagers();
        })
        .catch(() => setFallbackManagers());
    }
  }, [isOpen]);

  const setFallbackManagers = () => {
    setAvailableManagers([
      { id: '1', firstName: 'Muhammet Emre', lastName: 'Kain', role: 'Software Engineer' },
      { id: '2', firstName: 'Sıla', lastName: 'Yılmaz', role: 'Project Manager' },
      { id: '3', firstName: 'Demo', lastName: 'Admin', role: 'Admin' }
    ]);
  };

  const filteredManagers = availableManagers.filter(manager => {
    const isAlreadySelected = selectedManagers.some(sel => sel.id === manager.id);
    const matchesSearch = `${manager.firstName} ${manager.lastName} ${manager.role}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
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
      const { data: ship } = await api.post('/ships', {
        name,
        imoNumber: imoNumber || undefined,
        shipType,
        status: 'NEW_BUILDING',
      });

      await api.post('/projects', {
        name,
        projectCode: `PRJ-${Date.now()}`,
        type: projectType, // YENİ: Dinamik Proje Türü
        priority: priority, // YENİ: Dinamik Öncelik
        description: description || undefined, // YENİ: Açıklama
        status: 'PLANNING',
        plannedStartDate: startDate ? new Date(startDate).toISOString() : undefined, // YENİ: Başlangıç
        plannedDeliveryDate: deliveryDate ? new Date(deliveryDate).toISOString() : undefined,
        manager: managerNames || 'Atanmadı',
        ship: { id: ship.id },
      });

      toast.success('Gemi ve proje başarıyla oluşturuldu.');
      handleSuccessClose();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message;
      if (errorMsg && typeof errorMsg === 'string' && errorMsg.includes('AI')) {
        toast.success('Gemi oluşturuldu (AI analizi arka planda sürüyor).');
        handleSuccessClose();
      } else {
        toast.error(errorMsg ?? 'Proje oluşturulamadı.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSuccessClose = () => {
    if (onCreated) onCreated();
    onClose();
    setName('');
    setImoNumber('');
    setDeliveryDate('');
    setDescription('');
    setProjectType('NEW_BUILDING');
    setPriority('MEDIUM');
    setSelectedManagers([]);
    setSearchQuery('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" />
          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl overflow-visible rounded-xl border border-slate-700 bg-slate-900 shadow-2xl my-8"
          >
            <div className="flex items-center justify-between border-b border-slate-800 p-5 sticky top-0 bg-slate-900 z-10 rounded-t-xl">
              <div className="flex items-center gap-3">
                <Ship className="h-5 w-5 text-cyan-500" />
                <div><h2 className="font-bold text-slate-100">Yeni Proje Başlat</h2><p className="text-xs text-slate-400">KAPSAMLI PROJE KAYDI</p></div>
              </div>
              <button type="button" onClick={onClose}><X className="h-5 w-5 text-slate-400 hover:text-white" /></button>
            </div>

            <div className="flex flex-col gap-5 p-6">

              {/* 1. SATIR: Gemi Adı ve IMO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-2 text-xs text-slate-400">Gemi adı
                  <span className="relative">
                    <Ship className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                    <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded border border-slate-700 bg-slate-950 p-2 pl-9 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none" />
                  </span>
                </label>
                <label className="flex flex-col gap-2 text-xs text-slate-400">IMO numarası (İsteğe bağlı)
                  <span className="relative">
                    <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                    <input value={imoNumber} onChange={(e) => setImoNumber(e.target.value)} placeholder="Örn: 9876543" className="w-full rounded border border-slate-700 bg-slate-950 p-2 pl-9 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none" />
                  </span>
                </label>
              </div>

              {/* 2. SATIR: Proje Türü ve Gemi Tipi */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-2 text-xs text-slate-400">Proje Türü
                  <span className="relative">
                    <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                    <select value={projectType} onChange={(e) => setProjectType(e.target.value)} className="w-full rounded border border-slate-700 bg-slate-950 p-2 pl-9 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none">
                      <option value="NEW_BUILDING">Yeni İnşa (New Building)</option>
                      <option value="REPAIR">Onarım (Repair)</option>
                      <option value="MAINTENANCE">Periyodik Bakım (Maintenance)</option>
                      <option value="CONVERSION">Gemi Dönüşümü (Conversion)</option>
                      <option value="RETROFIT">Modernizasyon (Retrofit)</option>
                    </select>
                  </span>
                </label>
                <label className="flex flex-col gap-2 text-xs text-slate-400">Gemi tipi
                  <span className="relative">
                    <Layers className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                    <select value={shipType} onChange={(e) => setShipType(e.target.value)} className="w-full rounded border border-slate-700 bg-slate-950 p-2 pl-9 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none">
                      <option>Kuru yük gemisi</option><option>Tanker</option><option>Konteyner gemisi</option><option>Liman römorkörü</option>
                    </select>
                  </span>
                </label>
              </div>

              {/* 3. SATIR: Tarihler ve Öncelik */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex flex-col gap-2 text-xs text-slate-400">Planlanan Başlangıç
                  <span className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full rounded border border-slate-700 bg-slate-950 p-2 pl-9 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none" />
                  </span>
                </label>
                <label className="flex flex-col gap-2 text-xs text-slate-400">Hedef Teslim
                  <span className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                    <input required type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} className="w-full rounded border border-slate-700 bg-slate-950 p-2 pl-9 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none" />
                  </span>
                </label>
                <label className="flex flex-col gap-2 text-xs text-slate-400">Proje Önceliği
                  <span className="relative">
                    <AlertCircle className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${priority === 'CRITICAL' ? 'text-rose-500' : priority === 'HIGH' ? 'text-amber-500' : 'text-slate-400'}`} />
                    <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full rounded border border-slate-700 bg-slate-950 p-2 pl-9 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none">
                      <option value="LOW">Düşük</option>
                      <option value="MEDIUM">Orta</option>
                      <option value="HIGH">Yüksek</option>
                      <option value="CRITICAL">Kritik</option>
                    </select>
                  </span>
                </label>
              </div>

              {/* YÖNETİCİ SEÇİMİ */}
              <div className="relative flex flex-col gap-2">
                <label className="text-xs text-slate-400">Proje Yöneticisi / Yetkili (İsteğe bağlı)</label>
                <div className={`flex min-h-[42px] flex-wrap items-center gap-2 rounded border bg-slate-950 p-2 transition-colors ${isSearchFocused ? 'border-cyan-500' : 'border-slate-700'}`}>
                  <Search className="ml-1 h-4 w-4 text-slate-500 shrink-0" />
                  {selectedManagers.map((manager) => (
                    <span key={manager.id} className="flex items-center gap-1.5 rounded-md border border-cyan-500/30 bg-cyan-950/50 px-2 py-1 text-xs text-cyan-400">
                      {manager.firstName} {manager.lastName}
                      <button type="button" onClick={() => handleRemoveManager(manager.id)} className="rounded-full p-0.5 hover:bg-cyan-900 hover:text-white transition-colors">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    placeholder={selectedManagers.length === 0 ? "İsim veya ünvan yazarak arayın..." : ""}
                    className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none min-w-[150px]"
                  />
                </div>
                <AnimatePresence>
                  {isSearchFocused && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute left-0 right-0 top-[100%] z-50 mt-1 max-h-48 overflow-y-auto rounded-md border border-slate-700 bg-slate-800 shadow-xl">
                      {filteredManagers.length > 0 ? (
                        <div className="flex flex-col p-1">
                          {filteredManagers.map((manager) => (
                            <button key={manager.id} type="button" onClick={() => handleAddManager(manager)} className="flex items-center justify-between rounded px-3 py-2 text-left text-sm text-slate-300 transition-colors hover:bg-cyan-950/50 hover:text-cyan-400">
                              <span>{manager.firstName} {manager.lastName}</span>
                              <span className="text-[10px] text-slate-500">{manager.role}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 text-center text-sm text-slate-500">{searchQuery ? "Eşleşen personel bulunamadı." : "Seçilebilecek başka personel yok."}</div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* KAPSAM / AÇIKLAMA (TEXTAREA) */}
              <label className="flex flex-col gap-2 text-xs text-slate-400">Proje Kapsamı / AI İçin Notlar (İsteğe bağlı)
                <span className="relative">
                  <AlignLeft className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Bu projede yapılacak ana iş kalemleri ve yapay zekanın dikkate almasını istediğiniz riskler..."
                    className="w-full rounded border border-slate-700 bg-slate-950 p-2 pl-9 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none min-h-[80px] resize-y"
                  />
                </span>
              </label>

            </div>

            <div className="flex justify-end gap-3 border-t border-slate-800 p-5 bg-slate-900/50 rounded-b-xl">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">İptal</button>
              <button disabled={isSaving} className="rounded bg-cyan-600 px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-cyan-500 disabled:opacity-50 shadow-[0_0_10px_rgba(6,182,212,0.3)]">{isSaving ? 'KAYDEDİLİYOR...' : 'KAYDI OLUŞTUR'}</button>
            </div>
          </motion.form>
        </div>
      )}
    </AnimatePresence>
  );
}