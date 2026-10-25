import { Target, Activity, Users, AlertTriangle, Zap, Bot, Sparkles, CheckCircle2, Map, CalendarClock, Anchor, Wrench } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';

// --- 1. MOCK VERİLER ---
const INERTIA_DATA = [
  { date: '1 Eki', planlanan: 12, gerceklesen: 10 },
  { date: '5 Eki', planlanan: 18, gerceklesen: 15 },
  { date: '10 Eki', planlanan: 25, gerceklesen: 28 },
  { date: '15 Eki', planlanan: 32, gerceklesen: 30 },
  { date: '20 Eki', planlanan: 40, gerceklesen: 38 },
  { date: '25 Eki', planlanan: 48, gerceklesen: 42 },
  { date: '30 Eki', planlanan: 55, gerceklesen: 50 },
];

const WORKLOAD_DATA = [
  { department: 'Kaynak', mevcutYük: 115 },
  { department: 'Montaj', mevcutYük: 88 },
  { department: 'Elektrik', mevcutYük: 95 },
  { department: 'Boya/Raspa', mevcutYük: 60 },
  { department: 'Donatım', mevcutYük: 75 },
];

const RISK_DATA = [
  { name: 'Sağlıklı İlerleyen', value: 65, color: '#10b981' },
  { name: 'Gecikme Riskli', value: 25, color: '#f59e0b' },
  { name: 'Kritik / Bloke', value: 10, color: '#f43f5e' },
];

const AI_INSIGHTS = [
  {
    id: 1,
    type: 'CRITICAL',
    text: "Kaynak ekibindeki %115 kapasite aşımı yarına kadar çözülmezse, M/V Yıldız projesinin montaj fazı 2 gün gecikecek.",
    icon: AlertTriangle,
    color: 'text-rose-600 dark:text-rose-500',
    bg: 'bg-rose-50 dark:bg-rose-500/10',
    border: 'border-rose-200 dark:border-rose-500/20'
  },
  {
    id: 2,
    type: 'WARNING',
    text: "Elektrik takımının 3 görevi birbiriyle çakışıyor. Vardiya kaydırması yapmanız önerilir.",
    icon: Zap,
    color: 'text-amber-600 dark:text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    border: 'border-amber-200 dark:border-amber-500/20'
  },
  {
    id: 3,
    type: 'GOOD',
    text: "Boya/Raspa ekibi planlanandan %15 daha hızlı ilerliyor. Kaynaklar optimize edildi.",
    icon: CheckCircle2,
    color: 'text-emerald-600 dark:text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    border: 'border-emerald-200 dark:border-emerald-500/20'
  }
];

const MILESTONES_DATA = [
  {
    id: 1,
    date: '28 Eki 2026',
    project: 'M/V Yıldız Yeni İnşa',
    task: 'Gövde Montajı ve Kaynak Fazı Bitişi',
    status: 'CRITICAL',
    daysLeft: 4
  },
  {
    id: 2,
    date: '02 Kas 2026',
    project: 'Kuzey Yıldızı Bakım',
    task: 'Kuru Havuzdan İndirme',
    status: 'WARNING',
    daysLeft: 9
  },
  {
    id: 3,
    date: '15 Kas 2026',
    project: 'Güneş Feribotu',
    task: 'Elektrik ve Donatım Testleri Teslimatı',
    status: 'ON_TRACK',
    daysLeft: 22
  }
];

const FACILITIES_DATA = [
  { id: 'K1', name: 'Kızak 1', status: 'OCCUPIED', project: 'M/V Yıldız', type: 'Kızak' },
  { id: 'K2', name: 'Kızak 2', status: 'EMPTY', project: 'Boş / Kullanıma Hazır', type: 'Kızak' },
  { id: 'H1', name: 'Kuru Havuz A', status: 'OCCUPIED', project: 'Kuzey Yıldızı', type: 'Havuz' },
  { id: 'H2', name: 'Kuru Havuz B', status: 'MAINTENANCE', project: 'Periyodik Bakımda', type: 'Havuz' },
];

// --- 2. CUSTOM TOOLTIP ---
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-[0_0_20px_rgba(0,0,0,0.5)]">
        <p className="mb-2 font-mono text-xs font-bold text-slate-800 dark:text-slate-300">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 font-mono text-[11px]">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-500 uppercase tracking-wider dark:text-slate-400">{entry.name}:</span>
            <span className="font-bold" style={{ color: entry.color }}>{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsDashboard() {
  const { theme } = useTheme();

  const chartConfig = {
    grid: theme === 'dark' ? '#1e293b' : '#e2e8f0',
    text: theme === 'dark' ? '#64748b' : '#94a3b8',
    planlananLine: theme === 'dark' ? '#64748b' : '#94a3b8',
    gerceklesenLine: '#06b6d4',
  };

  const panelStyle = "flex flex-col rounded-xl p-5 shadow-sm border border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-lg transition-colors";

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto pb-6 relative z-10 px-2">

      {/* Üst Başlık */}
      <div className="flex shrink-0 items-center justify-between mt-2">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-cyan-200 bg-cyan-50 text-cyan-600 shadow-sm dark:border-cyan-500/30 dark:bg-cyan-950/40 dark:text-cyan-400 dark:shadow-[0_0_15px_rgba(34,211,238,0.15)] transition-colors">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-sans text-2xl font-bold text-slate-900 tracking-wide transition-colors dark:text-slate-100">Operasyonel Analitik</h1>
            <p className="font-mono text-xs text-slate-500 uppercase tracking-widest mt-0.5 transition-colors">Tersane Filosu Performans & Kaynak Telemetrisi</p>
          </div>
        </div>
      </div>

      {/* KPI Kartları */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className={`gap-3 ${panelStyle}`}>
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
            <span className="font-sans text-xs font-bold uppercase tracking-wider">Plan Uyum Oranı</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="font-mono text-4xl font-bold text-slate-800 dark:text-slate-100 drop-shadow-sm dark:shadow-emerald-500/20">%92.4</span>
            <span className="mb-1 font-mono text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded dark:text-emerald-500 dark:bg-emerald-500/10 dark:border-emerald-500/20">+2.1% (30G)</span>
          </div>
        </div>

        <div className={`gap-3 ${panelStyle}`}>
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Users className="h-4 w-4 text-amber-600 dark:text-amber-500" />
            <span className="font-sans text-xs font-bold uppercase tracking-wider">İşgücü Kapasitesi</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="font-mono text-4xl font-bold text-slate-800 dark:text-slate-100 drop-shadow-sm">%88.0</span>
            <span className="mb-1 font-mono text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded dark:text-amber-500 dark:bg-amber-500/10 dark:border-amber-500/20">Kaynak Darboğazı</span>
          </div>
        </div>

        <div className={`flex flex-col gap-3 rounded-xl p-5 shadow-sm border border-rose-200 bg-rose-50 backdrop-blur-md dark:border-rose-900/50 dark:bg-rose-950/10 dark:shadow-[0_0_20px_rgba(244,63,94,0.1)] transition-colors`}>
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-500">
            <AlertTriangle className="h-4 w-4 animate-pulse" />
            <span className="font-sans text-xs font-bold uppercase tracking-wider">Kritik Görevler</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="font-mono text-4xl font-bold text-rose-600 dark:text-rose-500 drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]">14</span>
            <span className="mb-1 font-mono text-[10px] uppercase font-bold text-rose-600/70 tracking-widest dark:text-rose-400/80">Sistem Geneli</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* --- SATIR 1 --- */}
        {/* 1. Operasyonel İvme (Area Chart) */}
        <div className={`lg:col-span-2 ${panelStyle}`}>
          <div className="mb-6 flex flex-col gap-1 border-b border-slate-100 pb-4 dark:border-slate-800">
            <h3 className="font-sans text-sm font-bold text-slate-800 tracking-wide dark:text-slate-200">Operasyon İvme Telemetrisi</h3>
            <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Planlanan (Gri) vs Gerçekleşen (Siber Mavi)</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={INERTIA_DATA} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPlanlanan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartConfig.planlananLine} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={chartConfig.planlananLine} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorGerceklesen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartConfig.gerceklesenLine} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={chartConfig.gerceklesenLine} stopOpacity={0}/>
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartConfig.grid} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: chartConfig.text, fontSize: 11, fontFamily: 'monospace' }} dy={10} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: chartConfig.text, fontSize: 11, fontFamily: 'monospace' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" name="Planlanan" dataKey="planlanan" stroke={chartConfig.planlananLine} strokeWidth={2} fill="url(#colorPlanlanan)" />
                <Area
                  type="monotone"
                  name="Gerçekleşen"
                  dataKey="gerceklesen"
                  stroke={chartConfig.gerceklesenLine}
                  strokeWidth={3}
                  filter={theme === 'dark' ? "url(#glow)" : ""}
                  fill="url(#colorGerceklesen)"
                  activeDot={{ r: 6, strokeWidth: 0, fill: chartConfig.gerceklesenLine, filter: theme === 'dark' ? 'url(#glow)' : '' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Sistem Risk Radarı (Donut Chart) */}
        <div className={panelStyle}>
          <div className="mb-6 flex flex-col gap-1 border-b border-slate-100 pb-4 dark:border-slate-800">
            <h3 className="font-sans text-sm font-bold text-slate-800 tracking-wide dark:text-slate-200">Proje Risk Radarı</h3>
            <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Aktif Statü Dağılımı</p>
          </div>
          <div className="relative h-48 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={RISK_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={4}
                >
                  {RISK_DATA.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      style={{ filter: theme === 'dark' ? `drop-shadow(0 0 6px ${entry.color}80)` : 'none' }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
              <span className="font-mono text-3xl font-bold text-slate-800 dark:text-slate-100">148</span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500 mt-1">Aktif Görev</span>
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-3">
            {RISK_DATA.map((item, index) => (
              <div key={index} className="flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color, boxShadow: theme === 'dark' ? `0 0 8px ${item.color}` : 'none' }}></span>
                  <span className="text-slate-600 uppercase tracking-wider text-[10px] dark:text-slate-400">{item.name}</span>
                </div>
                <span className="font-bold text-slate-700 dark:text-slate-200">%{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* --- SATIR 2 --- */}
        {/* 3. KAYNAK VE İŞGÜCÜ MONİTÖRÜ */}
        <div className={`lg:col-span-2 ${panelStyle}`}>
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex flex-col gap-1">
              <h3 className="font-sans text-sm font-bold text-slate-800 tracking-wide dark:text-slate-200">Sistem Kaynak Kullanımı & Darboğaz Radarı</h3>
              <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Adam-Saat Yükü ve Kapasite İhlalleri</p>
            </div>
            <div className="flex items-center gap-2 rounded bg-slate-50 px-3 py-1.5 border border-slate-200 dark:bg-slate-950 dark:border-slate-800">
              <Zap className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
              <span className="font-mono text-[10px] font-bold text-slate-700 uppercase tracking-widest dark:text-slate-300">Maks. Kapasite Sınırı: %100</span>
            </div>
          </div>

          <div className="flex flex-col gap-6 px-2 relative h-full justify-center">
            {WORKLOAD_DATA.map((item) => {
              const isCritical = item.mevcutYük > 100;
              const isWarning = item.mevcutYük > 80 && item.mevcutYük <= 100;

              const barColor = isCritical ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-cyan-500';
              const textColor = isCritical ? 'text-rose-600 dark:text-rose-400' : isWarning ? 'text-amber-600 dark:text-amber-400' : 'text-cyan-600 dark:text-cyan-400';
              const glowEffect = theme === 'dark'
                ? (isCritical ? 'shadow-[0_0_12px_rgba(244,63,94,0.8)]' : isWarning ? 'shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'shadow-[0_0_8px_rgba(6,182,212,0.4)]')
                : '';

              const maxScale = 120;
              const barWidthPercentage = Math.min((item.mevcutYük / maxScale) * 100, 100);

              return (
                <div key={item.department} className="relative flex flex-col gap-2">
                  <div className="flex justify-between items-end mb-1">
                    <span className="font-sans text-sm font-semibold text-slate-700 tracking-wide dark:text-slate-200">{item.department}</span>
                    <div className="flex items-center gap-2">
                      {isCritical && <span className="font-mono text-[9px] uppercase tracking-widest text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 dark:bg-rose-500/10 dark:text-rose-500 dark:border-rose-500/20">Kapasite Aşımı</span>}
                      <span className={`font-mono font-bold text-sm ${textColor}`}>
                        {item.mevcutYük}%
                      </span>
                    </div>
                  </div>
                  <div className="relative h-2 w-full rounded-sm bg-slate-100 border border-slate-200 overflow-hidden dark:bg-slate-950/80 dark:border-slate-800/80">
                    <div
                      className={`h-full rounded-sm transition-all duration-1000 ease-out ${barColor} ${glowEffect}`}
                      style={{ width: `${barWidthPercentage}%` }}
                    >
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite] -skew-x-12" />
                    </div>
                  </div>
                </div>
              )
            })}
            <div className="absolute top-0 bottom-0 left-[83.33%] w-px border-l border-dashed border-rose-400/60 z-0 pointer-events-none dark:border-rose-500/40" />
          </div>
        </div>

        {/* 4. AI STRATEJİK ÖNGÖRÜ PANELİ */}
        <div className={`flex flex-col relative overflow-hidden ${panelStyle}`}>
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

          <div className="mb-6 flex flex-col gap-1 border-b border-slate-100 pb-4 dark:border-slate-800 relative z-10">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              <h3 className="font-sans text-sm font-bold text-slate-800 tracking-wide dark:text-slate-200">Ollama AI Stratejik Öngörü</h3>
            </div>
            <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-cyan-500 animate-pulse" /> Gerçek Zamanlı Analiz Sonuçları
            </p>
          </div>

          <div className="flex flex-col gap-3 relative z-10">
            {AI_INSIGHTS.map((insight) => (
              <div key={insight.id} className={`flex gap-3 rounded-lg border p-3 ${insight.bg} ${insight.border}`}>
                <insight.icon className={`h-4 w-4 shrink-0 mt-0.5 ${insight.color}`} />
                <p className="font-sans text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  {insight.text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-6 flex justify-end">
            <span className="flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 font-mono text-[9px] font-bold text-cyan-600 dark:border-cyan-500/30 dark:bg-cyan-950/40 dark:text-cyan-400">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-500"></span>
              </span>
              MODEL: QWEN-2.5-7B AKTİF
            </span>
          </div>
        </div>

        {/* --- YENİ SATIR 3 --- */}
        {/* 5. YAKLAŞAN TESLİMATLAR VE KİLOMETRE TAŞLARI (Timeline) */}
        <div className={`lg:col-span-2 ${panelStyle}`}>
          <div className="mb-6 flex flex-col gap-1 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              <h3 className="font-sans text-sm font-bold text-slate-800 tracking-wide dark:text-slate-200">Yaklaşan Kilometre Taşları & Teslimatlar</h3>
            </div>
            <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Kritik Tarihler ve Teslimat Takvimi</p>
          </div>

          <div className="flex flex-col px-2 h-full justify-center">
            {MILESTONES_DATA.map((milestone, idx) => {
              const isLast = idx === MILESTONES_DATA.length - 1;
              const isCritical = milestone.status === 'CRITICAL';
              const isWarning = milestone.status === 'WARNING';

              const statusColor = isCritical ? 'text-rose-600 dark:text-rose-500' : isWarning ? 'text-amber-600 dark:text-amber-500' : 'text-emerald-600 dark:text-emerald-500';
              const dotColor = isCritical ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]' : isWarning ? 'bg-amber-500' : 'bg-emerald-500';
              const bgHighlight = isCritical ? 'bg-rose-50 dark:bg-rose-500/5' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30';

              return (
                <div key={milestone.id} className="relative flex gap-4">
                  {/* Timeline Çizgisi */}
                  <div className="flex flex-col items-center">
                    <div className={`h-3 w-3 rounded-full mt-1.5 shrink-0 z-10 border-2 border-white dark:border-slate-900 ${dotColor}`} />
                    {!isLast && <div className="w-px h-full bg-slate-200 dark:bg-slate-800 -mt-1.5" />}
                  </div>

                  {/* İçerik */}
                  <div className={`flex flex-1 flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 -mt-1 p-3 rounded-lg transition-colors ${bgHighlight}`}>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-[10px] font-bold tracking-widest uppercase ${statusColor}`}>{milestone.date}</span>
                        {isCritical && <span className="rounded bg-rose-100 px-1.5 py-0.5 font-mono text-[9px] font-bold text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">ACİL (4 GÜN KALDI)</span>}
                      </div>
                      <h4 className="font-sans text-sm font-bold text-slate-800 dark:text-slate-200">{milestone.project}</h4>
                      <p className="font-sans text-xs text-slate-600 dark:text-slate-400">{milestone.task}</p>
                    </div>
                    <div className="flex shrink-0">
                      <button className="rounded border border-slate-200 bg-white px-3 py-1.5 font-sans text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50 hover:text-cyan-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-cyan-400">
                        Detay
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6. YENİ: FİZİKSEL TESİS RADARI (Kızak/Havuz Doluluğu) */}
        <div className={panelStyle}>
          <div className="mb-6 flex flex-col gap-1 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Map className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              <h3 className="font-sans text-sm font-bold text-slate-800 tracking-wide dark:text-slate-200">Fiziksel Tesis Radarı</h3>
            </div>
            <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Kızak ve Kuru Havuz Durumları</p>
          </div>

          <div className="flex flex-col gap-4">
            {FACILITIES_DATA.map((facility) => {
              const isOccupied = facility.status === 'OCCUPIED';
              const isMaintenance = facility.status === 'MAINTENANCE';

              const StatusIcon = isOccupied ? Anchor : isMaintenance ? Wrench : CheckCircle2;
              const statusColor = isOccupied ? 'text-cyan-600 dark:text-cyan-400' : isMaintenance ? 'text-amber-600 dark:text-amber-500' : 'text-emerald-600 dark:text-emerald-500';
              const bgColor = isOccupied ? 'bg-cyan-50 border-cyan-200 dark:bg-cyan-500/10 dark:border-cyan-500/20' : isMaintenance ? 'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20' : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20';

              return (
                <div key={facility.id} className={`flex items-center justify-between rounded-lg border p-3 ${bgColor}`}>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded bg-white dark:bg-slate-900 shadow-sm ${statusColor}`}>
                      {/* Icon'u dinamik render ediyoruz */}
                      <StatusIcon className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-sans text-xs font-bold text-slate-800 dark:text-slate-200">{facility.name}</span>
                      <span className={`font-mono text-[9px] uppercase tracking-widest ${statusColor}`}>
                        {facility.type}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end text-right">
                    <span className="font-sans text-xs font-bold text-slate-700 dark:text-slate-300">{facility.project}</span>
                    <span className="font-mono text-[9px] text-slate-500">{isOccupied ? 'KULLANIMDA' : isMaintenance ? 'BAKIMDA' : 'MÜSAİT'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}