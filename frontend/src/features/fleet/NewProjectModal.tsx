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
          setAvailableManagers(managers);
        })
        .catch((error) => {
          console.error('Proje yöneticileri yüklenemedi:', error);
          setAvailableManagers([]);
          toast.error('Proje yöneticileri yüklenemedi.');
        });
    }
  }, [isOpen]);

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
        type: projectType,
        priority: priority,
        description: description || undefined,
        status: 'PLANNING',
        plannedStartDate: startDate ? new Date(startDate).toISOString() : undefined,
        plannedDeliveryDate: deliveryDate ? new Date(deliveryDate).toISOString() : undefined,
        manager: managerNames || 'Atanmadı',
        ship: { id: ship.id },
      });

      toast.success('Gemi ve proje başarıyla oluşturuldu.');
      handleSuccessClose();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message;
      toast.error(errorMsg ?? 'Proje oluşturulamadı.');
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

  // Ortak input sınıfları
  const inputClasses = "w-full rounded-md border border-slate-300 bg-white p-2 pl-9 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-colors";
  const iconClasses = "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500";
  const labelClasses = "flex flex-col gap-2 text-xs font-medium text-slate-600 dark:text-slate-400";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Arka plan overlay */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm dark:bg-slate-950/80" />

          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative my-8 w-full max-w-2xl overflow-visible rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-xl border-b border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <Ship className="h-5 w-5 text-cyan-600 dark:text-cyan-500" />
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-slate-100">Yeni Proje Başlat</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">KAPSAMLI PROJE KAYDI</p>
                </div>
              </div>
              <button type="button" onClick={onClose} className="rounded-md p-1 transition-colors hover:bg-slate-200 dark:hover:bg-slate-800">
                <X className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:hover:text-white" />
              </button>
            </div>

            <div className="flex flex-col gap-5 p-6">
              {/* 1. SATIR: Gemi Adı ve IMO */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className={labelClasses}>Gemi adı
                  <span className="relative">
                    <Ship className={iconClasses} />
                    <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} />
                  </span>
                </label>
                <label className={labelClasses}>IMO numarası (İsteğe bağlı)
                  <span className="relative">
                    <Hash className={iconClasses} />
                    <input value={imoNumber} onChange={(e) => setImoNumber(e.target.value)} placeholder="Örn: 9876543" className={inputClasses} />
                  </span>
                </label>
              </div>

              {/* 2. SATIR: Proje Türü ve Gemi Tipi */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className={labelClasses}>Proje Türü
                  <span className="relative">
                    <Tag className={iconClasses} />
                    <select value={projectType} onChange={(e) => setProjectType(e.target.value)} className={inputClasses}>
                      <option value="NEW_BUILDING">Yeni İnşa (New Building)</option>
                      <option value="REPAIR">Onarım (Repair)</option>
                      <option value="MAINTENANCE">Periyodik Bakım (Maintenance)</option>
                      <option value="CONVERSION">Gemi Dönüşümü (Conversion)</option>
                      <option value="RETROFIT">Modernizasyon (Retrofit)</option>
                    </select>
                  </span>
                </label>
                <label className={labelClasses}>Gemi tipi
                  <span className="relative">
                    <Layers className={iconClasses} />
                    <select value={shipType} onChange={(e) => setShipType(e.target.value)} className={inputClasses}>
                      <option>Kuru yük gemisi</option><option>Tanker</option><option>Konteyner gemisi</option><option>Liman römorkörü</option>
                    </select>
                  </span>
                </label>
              </div>

              {/* 3. SATIR: Tarihler ve Öncelik */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <label className={labelClasses}>Planlanan Başlangıç
                  <span className="relative">
                    <Calendar className={iconClasses} />
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClasses} />
                  </span>
                </label>
                <label className={labelClasses}>Hedef Teslim
                  <span className="relative">
                    <Calendar className={iconClasses} />
                    <input required type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} className={inputClasses} />
                  </span>
                </label>
                <label className={labelClasses}>Proje Önceliği
                  <span className="relative">
                    <AlertCircle className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${priority === 'CRITICAL' ? 'text-rose-600 dark:text-rose-500' : priority === 'HIGH' ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'}`} />
                    <select value={priority} onChange={(e) => setPriority(e.target.value)} className={inputClasses}>
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
                <label className={labelClasses}>Proje Yöneticisi / Yetkili (İsteğe bağlı)</label>
                <div className={`flex min-h-[42px] flex-wrap items-center gap-2 rounded-md border bg-white p-2 transition-colors dark:bg-slate-950 ${isSearchFocused ? 'border-cyan-500' : 'border-slate-300 dark:border-slate-700'}`}>
                  <Search className="ml-1 h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />

                  {/* Seçili Yöneticiler (Rozetler) */}
                  {selectedManagers.map((manager) => (
                    <span key={manager.id} className="flex items-center gap-1.5 rounded-md border border-cyan-200 bg-cyan-50 px-2 py-1 text-xs text-cyan-700 dark:border-cyan-500/30 dark:bg-cyan-950/50 dark:text-cyan-400">
                      {manager.firstName} {manager.lastName}
                      <button type="button" onClick={() => handleRemoveManager(manager.id)} className="rounded-full p-0.5 transition-colors hover:bg-cyan-200 dark:hover:bg-cyan-900 dark:hover:text-white">
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
                    className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-600 min-w-[150px]"
                  />
                </div>

                {/* Autocomplete Dropdown */}
                <AnimatePresence>
                  {isSearchFocused && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute left-0 right-0 top-[100%] z-50 mt-1 max-h-48 overflow-y-auto rounded-md border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
                      {filteredManagers.length > 0 ? (
                        <div className="flex flex-col p-1">
                          {filteredManagers.map((manager) => (
                            <button key={manager.id} type="button" onClick={() => handleAddManager(manager)} className="flex items-center justify-between rounded px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-cyan-50 hover:text-cyan-700 dark:text-slate-300 dark:hover:bg-cyan-950/50 dark:hover:text-cyan-400">
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
              <label className={labelClasses}>Proje Kapsamı / AI İçin Notlar (İsteğe bağlı)
                <span className="relative">
                  <AlignLeft className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Bu projede yapılacak ana iş kalemleri ve yapay zekanın dikkate almasını istediğiniz riskler..."
                    className={`${inputClasses} min-h-[80px] resize-y`}
                  />
                </span>
              </label>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 rounded-b-xl border-t border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/50">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">İptal</button>
              <button disabled={isSaving} className="rounded-md bg-cyan-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-cyan-500 disabled:opacity-50 dark:shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                {isSaving ? 'KAYDEDİLİYOR...' : 'KAYDI OLUŞTUR'}
              </button>
            </div>
          </motion.form>
        </div>
      )}
    </AnimatePresence>
  );
}