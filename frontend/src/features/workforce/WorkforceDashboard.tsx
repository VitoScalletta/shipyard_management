import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, Filter, HardHat, Plus, Search, ShieldAlert, Users, UserCheck, UserMinus, Wrench } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface WorkforceUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface WorkforceTeam {
  id: string;
  name: string;
  department: string;
  capacity: number;
  members?: WorkforceEmployee[];
}

interface WorkforceEmployee {
  id: string;
  department: string;
  jobPosition: string;
  skillLevel: string;
  shift: string;
  workingHours: number;
  isAvailable: boolean;
  user?: WorkforceUser;
  team?: WorkforceTeam;
}

interface WorkforceResource {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: string;
  totalQuantity: number;
  availableQuantity: number;
  unit: string;
}

const DEPARTMENTS = [
  { value: 'WELDING', label: 'Kaynak' },
  { value: 'PAINTING', label: 'Boya' },
  { value: 'ELECTRICAL', label: 'Elektrik' },
  { value: 'MECHANICAL', label: 'Mekanik' },
  { value: 'ASSEMBLY', label: 'Montaj' },
  { value: 'LOGISTICS', label: 'Lojistik' },
];

export default function WorkforceDashboard() {
  const [employees, setEmployees] = useState<WorkforceEmployee[]>([]);
  const [teams, setTeams] = useState<WorkforceTeam[]>([]);
  const [users, setUsers] = useState<WorkforceUser[]>([]);
  const [resources, setResources] = useState<WorkforceResource[]>([]);
  const [activeTab, setActiveTab] = useState<'employees' | 'resources'>('employees');
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('ALL');
  const [modal, setModal] = useState<'team' | 'employee' | 'resource' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [teamForm, setTeamForm] = useState({ name: '', department: 'WELDING', capacity: '0', leaderId: '' });
  const [employeeForm, setEmployeeForm] = useState({
    userId: '', department: 'WELDING', jobPosition: '', skillLevel: 'JUNIOR',
    shift: 'MORNING', workingHours: '45', teamId: '',
  });
  const [resourceForm, setResourceForm] = useState({
    name: '', description: '', type: 'EQUIPMENT', totalQuantity: '1', unit: 'adet',
  });

  const loadWorkforce = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const [employeeResponse, teamResponse, userResponse, resourceResponse] = await Promise.all([
        api.get('/workforce/employees'),
        api.get('/workforce/teams'),
        api.get('/users'),
        api.get('/resources'),
      ]);
      setEmployees(employeeResponse.data);
      setTeams(teamResponse.data);
      setUsers(userResponse.data);
      setResources(resourceResponse.data);
    } catch (error) {
      console.error('İşgücü ve kaynak verileri yüklenemedi:', error);
      setLoadError('İşgücü veya kaynak bilgileri yüklenemedi. Backend bağlantısını ve kullanıcı yetkilerini kontrol edin.');
      toast.error('İşgücü ve kaynak verileri yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWorkforce();
  }, [loadWorkforce]);

  const availableUsers = useMemo(() => {
    const assignedIds = new Set(employees.map((employee) => employee.user?.id).filter(Boolean));
    return users.filter((user) => !assignedIds.has(user.id));
  }, [employees, users]);

  const filteredEmployees = employees.filter((employee) => {
    const userName = `${employee.user?.firstName ?? ''} ${employee.user?.lastName ?? ''}`.trim();
    const matchesSearch = `${userName} ${employee.jobPosition} ${employee.team?.name ?? ''}`
      .toLocaleLowerCase('tr')
      .includes(searchQuery.toLocaleLowerCase('tr'));
    const matchesAvailability = availabilityFilter === 'ALL'
      || (availabilityFilter === 'AVAILABLE' ? employee.isAvailable : !employee.isAvailable);
    return matchesSearch && matchesAvailability;
  });
  const filteredResources = resources.filter((resource) => {
    const matchesSearch = `${resource.name} ${resource.type} ${resource.description ?? ''}`
      .toLocaleLowerCase('tr')
      .includes(searchQuery.toLocaleLowerCase('tr'));
    const matchesStatus = availabilityFilter === 'ALL' || resource.status === availabilityFilter;
    return matchesSearch && matchesStatus;
  });

  const createTeam = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      await api.post('/workforce/teams', {
        name: teamForm.name.trim(),
        department: teamForm.department,
        capacity: Number(teamForm.capacity),
        ...(teamForm.leaderId ? { leader: { id: teamForm.leaderId } } : {}),
      });
      toast.success('Takım oluşturuldu.');
      setModal(null);
      setTeamForm({ name: '', department: 'WELDING', capacity: '0', leaderId: '' });
      await loadWorkforce();
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? 'Takım oluşturulamadı.');
    } finally {
      setIsSaving(false);
    }
  };

  const createEmployee = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      await api.post('/workforce/employees', {
        user: { id: employeeForm.userId },
        department: employeeForm.department,
        jobPosition: employeeForm.jobPosition.trim(),
        skillLevel: employeeForm.skillLevel,
        shift: employeeForm.shift,
        workingHours: Number(employeeForm.workingHours),
        isAvailable: true,
        ...(employeeForm.teamId ? { team: { id: employeeForm.teamId } } : {}),
      });
      toast.success('Personel kaydı oluşturuldu.');
      setModal(null);
      setEmployeeForm({
        userId: '', department: 'WELDING', jobPosition: '', skillLevel: 'JUNIOR',
        shift: 'MORNING', workingHours: '45', teamId: '',
      });
      await loadWorkforce();
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? 'Personel kaydı oluşturulamadı.');
    } finally {
      setIsSaving(false);
    }
  };

  const createResource = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    const quantity = Number(resourceForm.totalQuantity);
    try {
      await api.post('/resources', {
        name: resourceForm.name.trim(),
        description: resourceForm.description.trim() || undefined,
        type: resourceForm.type,
        status: 'AVAILABLE',
        totalQuantity: quantity,
        availableQuantity: quantity,
        unit: resourceForm.unit,
      });
      toast.success('Kaynak envantere eklendi.');
      setModal(null);
      setResourceForm({ name: '', description: '', type: 'EQUIPMENT', totalQuantity: '1', unit: 'adet' });
      await loadWorkforce();
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? 'Kaynak envantere eklenemedi.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateResourceStatus = async (resource: WorkforceResource, status: string) => {
    try {
      await api.patch(`/resources/${resource.id}`, { status });
      await loadWorkforce();
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? 'Kaynak durumu güncellenemedi.');
    }
  };

  const toggleAvailability = async (employee: WorkforceEmployee) => {
    try {
      await api.patch(`/workforce/employees/${employee.id}`, { isAvailable: !employee.isAvailable });
      await loadWorkforce();
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? 'Personel durumu güncellenemedi.');
    }
  };

  const availableCount = employees.filter((employee) => employee.isAvailable).length;
  const unavailableCount = employees.length - availableCount;
  const inputClass = 'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100';

  return (
    <div className="relative z-10 flex h-full flex-col gap-6 overflow-hidden">
      <div className="flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-cyan-200 bg-cyan-50 text-cyan-600 dark:border-cyan-900/50 dark:bg-cyan-950/30 dark:text-cyan-500">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-sans text-2xl font-bold text-slate-900 dark:text-slate-100">İşgücü ve Kaynak</h1>
            <p className="font-mono text-sm text-slate-500">PERSONEL, TAKIM VE KAPASİTE YÖNETİMİ</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {activeTab === 'employees' && <button onClick={() => setModal('team')} className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 hover:text-cyan-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:text-cyan-400"><Plus className="h-4 w-4" /> TAKIM OLUŞTUR</button>}
          <button onClick={() => setModal(activeTab === 'employees' ? 'employee' : 'resource')} className="flex items-center gap-2 rounded-md bg-cyan-600 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-cyan-500">
            <Plus className="h-4 w-4" /> {activeTab === 'employees' ? 'PERSONEL EKLE' : 'KAYNAK EKLE'}
          </button>
        </div>
      </div>

      <div className="flex shrink-0 gap-2 border-b border-slate-200 dark:border-slate-800">
        <button onClick={() => { setActiveTab('employees'); setAvailabilityFilter('ALL'); }} className={`border-b-2 px-4 py-2 text-sm font-semibold ${activeTab === 'employees' ? 'border-cyan-500 text-cyan-700 dark:text-cyan-400' : 'border-transparent text-slate-500'}`}>Personel ve takımlar</button>
        <button onClick={() => { setActiveTab('resources'); setAvailabilityFilter('ALL'); }} className={`border-b-2 px-4 py-2 text-sm font-semibold ${activeTab === 'resources' ? 'border-cyan-500 text-cyan-700 dark:text-cyan-400' : 'border-transparent text-slate-500'}`}>Ekipman ve kaynaklar</button>
      </div>

      <div className="grid shrink-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {activeTab === 'employees' ? <>
        <Metric icon={<HardHat className="h-4 w-4" />} label="Toplam Personel" value={employees.length} suffix="Kişi" tone="slate" />
        <Metric icon={<Activity className="h-4 w-4" />} label="Müsait" value={availableCount} suffix="Atanabilir" tone="emerald" />
        <Metric icon={<UserCheck className="h-4 w-4" />} label="Müsait Değil" value={unavailableCount} suffix="Kişi" tone="cyan" />
        <Metric icon={<Users className="h-4 w-4" />} label="Takım Sayısı" value={teams.length} suffix="Takım" tone="rose" />
        </> : <>
        <Metric icon={<Wrench className="h-4 w-4" />} label="Toplam Kaynak" value={resources.length} suffix="Kayıt" tone="slate" />
        <Metric icon={<Activity className="h-4 w-4" />} label="Kullanılabilir" value={resources.filter((resource) => resource.status === 'AVAILABLE').length} suffix="Kaynak" tone="emerald" />
        <Metric icon={<Wrench className="h-4 w-4" />} label="Kullanımda" value={resources.filter((resource) => resource.status === 'IN_USE').length} suffix="Kaynak" tone="cyan" />
        <Metric icon={<Wrench className="h-4 w-4" />} label="Bakımda" value={resources.filter((resource) => resource.status === 'MAINTENANCE').length} suffix="Kaynak" tone="rose" />
        </>}
      </div>

      <div className="relative z-20 flex shrink-0 flex-col gap-3 rounded-xl border border-slate-200 bg-white/80 p-3 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder={activeTab === 'employees' ? 'Personel adı, rol veya takım ara...' : 'Kaynak adı veya türü ara...'} value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className={`${inputClass} pl-9`} />
          </div>
          <div className="relative min-w-[180px]">
            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select value={availabilityFilter} onChange={(event) => setAvailabilityFilter(event.target.value)} className={`${inputClass} cursor-pointer pl-9`}>
              <option value="ALL">Tüm Durumlar</option>
              {activeTab === 'employees' ? <>
                <option value="AVAILABLE">Müsait</option><option value="UNAVAILABLE">Müsait Değil</option>
              </> : <>
                <option value="AVAILABLE">Kullanılabilir</option><option value="IN_USE">Kullanımda</option><option value="MAINTENANCE">Bakımda</option><option value="DEPLETED">Tükendi</option>
              </>}
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-slate-500">İşgücü verileri yükleniyor...</div>
        ) : loadError ? (
          <div className="flex flex-col items-center gap-3 p-8 text-center text-sm text-rose-600 dark:text-rose-400">
            <p>{loadError}</p>
            <button onClick={() => void loadWorkforce()} className="rounded-md bg-cyan-600 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-500">Tekrar dene</button>
          </div>
        ) : (
          <table className="w-full text-left font-sans text-sm">
            <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-400">
              <tr>
                {activeTab === 'employees' ? <>
                  <th className="px-5 py-4 font-medium">Personel Bilgisi</th>
                  <th className="px-5 py-4 font-medium">Bağlı Olduğu Takım</th>
                  <th className="px-5 py-4 font-medium">Durum</th>
                  <th className="px-5 py-4 font-medium">Çalışma Bilgisi</th>
                  <th className="px-5 py-4 text-right font-medium">İşlemler</th>
                </> : <>
                  <th className="px-5 py-4 font-medium">Kaynak</th>
                  <th className="px-5 py-4 font-medium">Tür</th>
                  <th className="px-5 py-4 font-medium">Miktar</th>
                  <th className="px-5 py-4 font-medium">Durum</th>
                  <th className="px-5 py-4 text-right font-medium">Durumu Güncelle</th>
                </>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {activeTab === 'employees' ? filteredEmployees.map((employee) => {
                const name = `${employee.user?.firstName ?? ''} ${employee.user?.lastName ?? ''}`.trim() || employee.user?.email || 'İsimsiz kullanıcı';
                return (
                  <tr key={employee.id} className="group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-slate-100">{name}</span>
                          <span className="font-mono text-[10px] text-slate-500">{employee.jobPosition} · {employee.department}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-slate-400" />{employee.team?.name ?? 'Takım atanmamış'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[10px] font-bold ${employee.isAvailable ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400' : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400'}`}>
                        {employee.isAvailable ? <UserCheck className="h-3 w-3" /> : <UserMinus className="h-3 w-3" />}
                        {employee.isAvailable ? 'MÜSAİT' : 'MÜSAİT DEĞİL'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2"><Wrench className="h-4 w-4" />{employee.skillLevel} · {employee.shift} vardiyası · {employee.workingHours} saat/hafta</div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => void toggleAvailability(employee)} className="rounded px-3 py-1.5 text-xs font-semibold text-cyan-700 hover:bg-cyan-50 dark:text-cyan-400 dark:hover:bg-cyan-950/40">
                        {employee.isAvailable ? 'Müsaitliği kaldır' : 'Müsait yap'}
                      </button>
                    </td>
                  </tr>
                );
              }) : filteredResources.map((resource) => (
                <tr key={resource.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-4"><div className="font-semibold text-slate-900 dark:text-slate-100">{resource.name}</div><div className="text-xs text-slate-500">{resource.description || 'Açıklama yok'}</div></td>
                  <td className="px-5 py-4 text-slate-700 dark:text-slate-300">{resource.type}</td>
                  <td className="px-5 py-4 font-mono text-slate-700 dark:text-slate-300">{resource.availableQuantity} / {resource.totalQuantity} {resource.unit}</td>
                  <td className="px-5 py-4 text-slate-700 dark:text-slate-300">{resource.status}</td>
                  <td className="px-5 py-4 text-right">
                    <select aria-label={`${resource.name} durumu`} value={resource.status} onChange={(event) => void updateResourceStatus(resource, event.target.value)} className={`${inputClass} ml-auto max-w-40 py-1.5 text-xs`}>
                      <option value="AVAILABLE">Kullanılabilir</option><option value="IN_USE">Kullanımda</option><option value="MAINTENANCE">Bakımda</option><option value="DEPLETED">Tükendi</option>
                    </select>
                  </td>
                </tr>
              ))}
              {(activeTab === 'employees' ? filteredEmployees.length === 0 : filteredResources.length === 0) && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-500">{activeTab === 'employees' ? (employees.length ? 'Filtreye uygun personel bulunamadı.' : 'Henüz personel kaydı bulunmuyor.') : (resources.length ? 'Filtreye uygun kaynak bulunamadı.' : 'Henüz kaynak kaydı bulunmuyor.')}</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button aria-label="Kapat" className="absolute inset-0 bg-slate-950/60" onClick={() => setModal(null)} />
          <form onSubmit={modal === 'team' ? createTeam : modal === 'employee' ? createEmployee : createResource} className="relative z-10 w-full max-w-lg space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{modal === 'team' ? 'Yeni takım oluştur' : modal === 'employee' ? 'Personel kaydı ekle' : 'Kaynağı envantere ekle'}</h2>
              <button type="button" onClick={() => setModal(null)} aria-label="Kapat" className="text-slate-500 hover:text-slate-900 dark:hover:text-white">×</button>
            </div>
            {modal === 'team' ? (
              <>
                <label className="block text-sm text-slate-600 dark:text-slate-300">Takım adı<input className={`${inputClass} mt-1`} required value={teamForm.name} onChange={(event) => setTeamForm({ ...teamForm, name: event.target.value })} /></label>
                <label className="block text-sm text-slate-600 dark:text-slate-300">Bölüm<select className={`${inputClass} mt-1`} value={teamForm.department} onChange={(event) => setTeamForm({ ...teamForm, department: event.target.value })}>{DEPARTMENTS.map((department) => <option key={department.value} value={department.value}>{department.label}</option>)}</select></label>
                <label className="block text-sm text-slate-600 dark:text-slate-300">Kapasite<input type="number" min="0" className={`${inputClass} mt-1`} value={teamForm.capacity} onChange={(event) => setTeamForm({ ...teamForm, capacity: event.target.value })} /></label>
                <label className="block text-sm text-slate-600 dark:text-slate-300">Takım lideri<select className={`${inputClass} mt-1`} value={teamForm.leaderId} onChange={(event) => setTeamForm({ ...teamForm, leaderId: event.target.value })}><option value="">Atanmamış</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.user?.firstName} {employee.user?.lastName}</option>)}</select></label>
              </>
            ) : modal === 'employee' ? (
              <>
                <label className="block text-sm text-slate-600 dark:text-slate-300">Kullanıcı hesabı<select className={`${inputClass} mt-1`} required value={employeeForm.userId} onChange={(event) => setEmployeeForm({ ...employeeForm, userId: event.target.value })}><option value="">Kullanıcı seçin</option>{availableUsers.map((user) => <option key={user.id} value={user.id}>{user.firstName} {user.lastName} ({user.email})</option>)}</select></label>
                <label className="block text-sm text-slate-600 dark:text-slate-300">Görev/ünvan<input className={`${inputClass} mt-1`} required value={employeeForm.jobPosition} onChange={(event) => setEmployeeForm({ ...employeeForm, jobPosition: event.target.value })} /></label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-sm text-slate-600 dark:text-slate-300">Bölüm<select className={`${inputClass} mt-1`} value={employeeForm.department} onChange={(event) => setEmployeeForm({ ...employeeForm, department: event.target.value })}>{DEPARTMENTS.map((department) => <option key={department.value} value={department.value}>{department.label}</option>)}</select></label>
                  <label className="block text-sm text-slate-600 dark:text-slate-300">Takım<select className={`${inputClass} mt-1`} value={employeeForm.teamId} onChange={(event) => setEmployeeForm({ ...employeeForm, teamId: event.target.value })}><option value="">Atanmamış</option>{teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}</select></label>
                  <label className="block text-sm text-slate-600 dark:text-slate-300">Yetkinlik<select className={`${inputClass} mt-1`} value={employeeForm.skillLevel} onChange={(event) => setEmployeeForm({ ...employeeForm, skillLevel: event.target.value })}><option value="JUNIOR">Junior</option><option value="MID">Orta</option><option value="SENIOR">Kıdemli</option><option value="EXPERt">Uzman</option></select></label>
                  <label className="block text-sm text-slate-600 dark:text-slate-300">Vardiya<select className={`${inputClass} mt-1`} value={employeeForm.shift} onChange={(event) => setEmployeeForm({ ...employeeForm, shift: event.target.value })}><option value="MORNING">Sabah</option><option value="EVENING">Akşam</option><option value="NIGHT">Gece</option></select></label>
                </div>
                <label className="block text-sm text-slate-600 dark:text-slate-300">Haftalık çalışma saati<input type="number" min="0" className={`${inputClass} mt-1`} value={employeeForm.workingHours} onChange={(event) => setEmployeeForm({ ...employeeForm, workingHours: event.target.value })} /></label>
                {availableUsers.length === 0 && <p className="text-sm text-amber-700 dark:text-amber-400">Personel kaydı oluşturulabilecek kullanıcı bulunamadı. Önce kullanıcı hesabı oluşturun.</p>}
              </>
            ) : (
              <>
                <label className="block text-sm text-slate-600 dark:text-slate-300">Kaynak adı<input className={`${inputClass} mt-1`} required value={resourceForm.name} onChange={(event) => setResourceForm({ ...resourceForm, name: event.target.value })} /></label>
                <label className="block text-sm text-slate-600 dark:text-slate-300">Açıklama<textarea className={`${inputClass} mt-1`} rows={2} value={resourceForm.description} onChange={(event) => setResourceForm({ ...resourceForm, description: event.target.value })} /></label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-sm text-slate-600 dark:text-slate-300">Tür<select className={`${inputClass} mt-1`} value={resourceForm.type} onChange={(event) => setResourceForm({ ...resourceForm, type: event.target.value })}><option value="EQUIPMENT">Ekipman</option><option value="MACHINE">Makine</option><option value="TOOl">Alet</option><option value="MATERIAL">Malzeme</option></select></label>
                  <label className="block text-sm text-slate-600 dark:text-slate-300">Birim<select className={`${inputClass} mt-1`} value={resourceForm.unit} onChange={(event) => setResourceForm({ ...resourceForm, unit: event.target.value })}><option value="adet">Adet</option><option value="m">Metre</option><option value="m²">Metrekare</option><option value="m³">Metreküp</option><option value="kg">Kilogram</option><option value="saat">Saat</option></select></label>
                </div>
                <label className="block text-sm text-slate-600 dark:text-slate-300">Miktar<input type="number" min="0" step="0.01" required className={`${inputClass} mt-1`} value={resourceForm.totalQuantity} onChange={(event) => setResourceForm({ ...resourceForm, totalQuantity: event.target.value })} /></label>
              </>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="rounded-md px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">İptal</button>
              <button type="submit" disabled={isSaving || (modal === 'employee' && availableUsers.length === 0)} className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-bold text-white hover:bg-cyan-500 disabled:opacity-50">{isSaving ? 'Kaydediliyor...' : 'Kaydet'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Metric({ icon, label, value, suffix, tone }: { icon: React.ReactNode; label: string; value: number; suffix: string; tone: 'slate' | 'emerald' | 'cyan' | 'rose' }) {
  const tones = {
    slate: 'border-slate-200 bg-white/80 text-slate-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300',
    emerald: 'border-emerald-200 bg-emerald-50/50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/10 dark:text-emerald-400',
    cyan: 'border-cyan-200 bg-cyan-50/50 text-cyan-700 dark:border-cyan-500/30 dark:bg-cyan-950/10 dark:text-cyan-400',
    rose: 'border-rose-200 bg-rose-50/50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-950/10 dark:text-rose-400',
  };
  return <div className={`flex flex-col justify-between rounded-lg border p-4 backdrop-blur-sm ${tones[tone]}`}><div className="flex items-center gap-2"><span>{icon}</span><span className="font-sans text-xs font-bold uppercase tracking-wider">{label}</span></div><div className="mt-2 font-mono text-2xl font-bold">{value} <span className="font-sans text-sm opacity-70">{suffix}</span></div></div>;
}
