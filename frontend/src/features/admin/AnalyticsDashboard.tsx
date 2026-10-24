import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { Target, Activity, Users, AlertTriangle } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext'; // Varsa kendi tema context'ini kullan, yoksa silebilirsin

// --- 1. MOCK VERİLER (Görsel Şov İçin Geçici Veri Seti) ---
const INERTIA_DATA = [
  { date: '1 Eki', planlanan: 12, gerceklesen: 10 },
  { date: '5 Eki', planlanan: 18, gerceklesen: 15 },
  { date: '10 Eki', planlanan: 25, gerceklesen: 28 }, // Hızlanma var
  { date: '15 Eki', planlanan: 32, gerceklesen: 30 },
  { date: '20 Eki', planlanan: 40, gerceklesen: 38 },
  { date: '25 Eki', planlanan: 48, gerceklesen: 42 },
  { date: '30 Eki', planlanan: 55, gerceklesen: 50 },
];

const WORKLOAD_DATA = [
  { department: 'Kaynak', kapasite: 100, mevcutYük: 110 }, // Darboğaz
  { department: 'Montaj', kapasite: 100, mevcutYük: 85 },
  { department: 'Elektrik', kapasite: 100, mevcutYük: 95 },
  { department: 'Boya/Raspa', kapasite: 100, mevcutYük: 60 },
  { department: 'Donatım', kapasite: 100, mevcutYük: 75 },
];

const RISK_DATA = [
  { name: 'Sağlıklı İlerleyen', value: 65, color: '#10b981' }, // Emerald
  { name: 'Gecikme Riskli', value: 25, color: '#f59e0b' },    // Amber
  { name: 'Kritik / Bloke', value: 10, color: '#f43f5e' },    // Rose
];

// --- 2. SHADCN UI TARZI CUSTOM TOOLTIP ---
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95">
        <p className="mb-2 font-sans text-xs font-bold text-slate-800 dark:text-slate-200">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 font-mono text-[11px]">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-600 dark:text-slate-400">{entry.name}:</span>
            <span className="font-bold" style={{ color: entry.color }}>{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsDashboard() {
  const { theme } = useTheme(); // Temaya göre grid ve text renkleri değişecek
  const gridColor = theme === 'dark' ? '#1e293b' : '#f1f5f9';
  const textColor = theme === 'dark' ? '#64748b' : '#94a3b8';

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto pb-6 relative z-10">

      {/* Üst Başlık */}
      <div className="flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border shadow-sm border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-sans text-2xl font-bold text-slate-900 dark:text-slate-100">Operasyonel Analitik</h1>
            <p className="font-mono text-sm text-slate-500">TERSANE FİLOSU PERFORMANS VE DARBOĞAZ ANALİZİ</p>
          </div>
        </div>
      </div>

      {/* Yönetici Özet Kartları (KPIs) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Target className="h-4 w-4 text-cyan-500" />
            <span className="font-sans text-xs font-bold uppercase tracking-wider">Plan Uyum Oranı</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="font-mono text-3xl font-bold text-slate-800 dark:text-slate-100">%92.4</span>
            <span className="mb-1 font-mono text-xs font-bold text-emerald-500">+2.1% (Geçen aya göre)</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Users className="h-4 w-4 text-amber-500" />
            <span className="font-sans text-xs font-bold uppercase tracking-wider">İşgücü Kullanım Kapasitesi</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="font-mono text-3xl font-bold text-slate-800 dark:text-slate-100">%88.0</span>
            <span className="mb-1 font-mono text-xs font-bold text-rose-500">Kaynak Ekibi Darboğazda</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-xl border border-rose-200 bg-rose-50 p-5 shadow-sm dark:border-rose-900/30 dark:bg-rose-950/20">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-sans text-xs font-bold uppercase tracking-wider">Bloke Edilmiş Görevler</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="font-mono text-3xl font-bold text-rose-700 dark:text-rose-400">14</span>
            <span className="mb-1 font-mono text-xs font-bold text-rose-600/70 dark:text-rose-500/70">Tüm projeler genelinde</span>
          </div>
        </div>
      </div>

      {/* Grafikler Bölümü */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* 1. Operasyonel İvme (Area Chart) - 2 Kolon Kaplar */}
        <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 lg:col-span-2">
          <div className="mb-6 flex flex-col">
            <h3 className="font-sans text-sm font-bold text-slate-800 dark:text-slate-200">Operasyonel İvme (Kümülatif Görev Tamamlama)</h3>
            <p className="font-mono text-[10px] text-slate-500">Planlanan görev takvimine karşı sahadaki gerçekleşme oranı</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={INERTIA_DATA} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPlanlanan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorGerceklesen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: textColor, fontSize: 11 }} dy={10} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: textColor, fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" name="Planlanan" dataKey="planlanan" stroke="#94a3b8" strokeWidth={2} fillOpacity={1} fill="url(#colorPlanlanan)" />
                <Area type="monotone" name="Gerçekleşen" dataKey="gerceklesen" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorGerceklesen)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Sistem Risk Radarı (Donut Chart) - 1 Kolon Kaplar */}
        <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <div className="mb-6 flex flex-col">
            <h3 className="font-sans text-sm font-bold text-slate-800 dark:text-slate-200">Proje Risk Radarı</h3>
            <p className="font-mono text-[10px] text-slate-500">Aktif operasyonların sağlık durumu</p>
          </div>
          <div className="relative h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={RISK_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {RISK_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Halkanın Ortasındaki Metin */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="font-sans text-2xl font-bold text-slate-800 dark:text-slate-100">148</span>
              <span className="font-mono text-[10px] text-slate-500">Aktif Görev</span>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {RISK_DATA.map((item, index) => (
              <div key={index} className="flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-200">%{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. İşgücü ve Kaynak Darboğazı (Bar Chart) - Tam Genişlik */}
        <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 lg:col-span-3">
          <div className="mb-6 flex flex-col">
            <h3 className="font-sans text-sm font-bold text-slate-800 dark:text-slate-200">Ekip İş Yükü ve Darboğaz Analizi</h3>
            <p className="font-mono text-[10px] text-slate-500">Kapasite (Gri) vs Mevcut Yük (Mavi/Kırmızı)</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WORKLOAD_DATA} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="department" tickLine={false} axisLine={false} tick={{ fill: textColor, fontSize: 11 }} dy={10} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: textColor, fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: theme === 'dark' ? '#334155' : '#f1f5f9', opacity: 0.4 }} />

                {/* İki barı yan yana basmak yerine üst üste bindirebilir (Stacked) veya yan yana (Grouped) gösterebiliriz. Yan yana modern durur. */}
                <Bar name="Kapasite Seviyesi" dataKey="kapasite" fill={theme === 'dark' ? '#334155' : '#cbd5e1'} radius={[4, 4, 0, 0]} />
                <Bar name="Mevcut Yük" dataKey="mevcutYük" radius={[4, 4, 0, 0]}>
                  {WORKLOAD_DATA.map((entry, index) => (
                    // Yük kapasiteyi aşıyorsa Kırmızı, altındaysa Camgöbeği
                    <Cell key={`cell-${index}`} fill={entry.mevcutYük > entry.kapasite ? '#f43f5e' : '#06b6d4'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}