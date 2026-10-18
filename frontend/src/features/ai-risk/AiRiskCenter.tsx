import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, BrainCircuit, Crosshair, Filter, Search, ShieldAlert, Ship, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface ProjectRisk {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  recommendation: string;
  projectId: string;
  projectCode: string;
  shipName: string;
}

const normalizeSeverity = (severity?: string) => {
  const value = (severity ?? '').toUpperCase();
  if (value === 'CRITICAL' || value === 'HIGH') return 'CRITICAL';
  if (value === 'MEDIUM' || value === 'WARNING') return 'WARNING';
  return value || 'UNKNOWN';
};

export default function AiRiskCenter() {
  const navigate = useNavigate();
  const [risks, setRisks] = useState<ProjectRisk[]>([]);
  const [analyzedProjectCount, setAnalyzedProjectCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isActive = true;
    const loadRisks = async () => {
      setIsLoading(true);
      setLoadError('');
      try {
        const { data: projects } = await api.get('/projects');
        const analyses = await Promise.all(projects.map(async (project: any) => {
          try {
            const { data } = await api.get(`/ai-context/projects/${project.id}/latest`);
            return data ? { project, analysis: data } : null;
          } catch (error) {
            console.error(`Proje ${project.id} risk analizi yüklenemedi:`, error);
            return null;
          }
        }));
        if (!isActive) return;

        const completedAnalyses = analyses.filter((entry): entry is NonNullable<typeof entry> => entry !== null);
        const projectRisks = completedAnalyses.flatMap(({ project, analysis }) => {
          const recommendations = Array.isArray(analysis.recommendations) ? analysis.recommendations : [];
          return (Array.isArray(analysis.risks) ? analysis.risks : []).map((risk: any, index: number) => {
            const recommendation = risk.recommendation
              ?? recommendations[index]?.description
              ?? recommendations[index]?.title
              ?? (typeof recommendations[index] === 'string' ? recommendations[index] : '');
            return {
              id: `${analysis.id}-${risk.id ?? index}`,
              title: risk.title ?? risk.type ?? 'Proje riski',
              description: risk.description ?? 'Analiz açıklaması bulunmuyor.',
              category: risk.type ?? risk.category ?? 'GENEL',
              severity: normalizeSeverity(risk.severity ?? analysis.overallRiskLevel),
              recommendation: recommendation || 'Bu risk için öneri bulunmuyor.',
              projectId: project.id,
              projectCode: project.projectCode ?? project.id,
              shipName: project.ship?.name ?? project.name,
            };
          });
        });
        setAnalyzedProjectCount(completedAnalyses.length);
        setRisks(projectRisks);
      } catch (error) {
        console.error('AI risk merkezi yüklenemedi:', error);
        if (isActive) {
          setLoadError('Risk analizleri yüklenemedi. Backend bağlantısını kontrol edip yeniden deneyin.');
          toast.error('AI risk verileri yüklenemedi.');
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    };
    void loadRisks();
    return () => { isActive = false; };
  }, []);

  const filteredRisks = useMemo(() => risks.filter((risk) => {
    const search = searchQuery.toLocaleLowerCase('tr');
    const matchesSearch = `${risk.shipName} ${risk.projectCode} ${risk.title} ${risk.category}`
      .toLocaleLowerCase('tr').includes(search);
    const matchesFilter = riskFilter === 'ALL' || risk.severity === riskFilter;
    return matchesSearch && matchesFilter;
  }), [risks, riskFilter, searchQuery]);

  const criticalCount = risks.filter((risk) => risk.severity === 'CRITICAL').length;
  const warningCount = risks.filter((risk) => risk.severity === 'WARNING').length;

  return (
    <div className="relative z-10 flex h-full flex-col gap-6 overflow-hidden">
      <div className="flex shrink-0 items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-500">
          <BrainCircuit className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-sans text-2xl font-bold text-slate-900 dark:text-slate-100">AI Risk Merkezi</h1>
          <p className="font-mono text-sm text-slate-500">KAYDEDİLMİŞ PROJE ANALİZLERİ VE ÖNERİLER</p>
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-1 gap-4 md:grid-cols-3">
        <Metric icon={<ShieldAlert className="h-4 w-4" />} label="Kritik Riskler" value={criticalCount} tone="rose" />
        <Metric icon={<AlertTriangle className="h-4 w-4" />} label="Erken Uyarılar" value={warningCount} tone="amber" />
        <Metric icon={<Crosshair className="h-4 w-4" />} label="Analiz Edilen Projeler" value={analyzedProjectCount} tone="cyan" />
      </div>

      <div className="relative z-20 flex shrink-0 flex-col gap-3 rounded-xl border border-slate-200 bg-white/80 p-3 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Gemi, proje kodu veya risk ara..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none dark:border-slate-700/50 dark:bg-slate-950/50 dark:text-slate-100" />
          </div>
          <div className="relative min-w-[180px]">
            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select value={riskFilter} onChange={(event) => setRiskFilter(event.target.value)} className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-8 text-sm text-slate-700 focus:border-cyan-500 focus:outline-none dark:border-slate-700/50 dark:bg-slate-950/50 dark:text-slate-300">
              <option value="ALL">Tüm Riskler</option>
              <option value="CRITICAL">Kritik Risk</option>
              <option value="WARNING">Erken Uyarı</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-6 pr-2">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-slate-500">Proje risk analizleri yükleniyor...</div>
        ) : loadError ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">{loadError}</div>
        ) : filteredRisks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center dark:border-slate-800 dark:bg-slate-900/40">
            <ShieldAlert className="mb-4 h-12 w-12 text-slate-300 dark:text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-300">{risks.length ? 'Filtreye Uygun Risk Yok' : 'Kayıtlı Risk Analizi Yok'}</h3>
            <p className="mt-1 text-sm text-slate-500">{risks.length ? 'Arama veya risk filtresini değiştirin.' : 'Proje detayından analiz başlatıldığında riskler burada görünür.'}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <AnimatePresence>
              {filteredRisks.map((risk) => (
                <motion.article key={risk.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                  <div className={`flex items-center justify-between border-b px-5 py-3 ${risk.severity === 'CRITICAL' ? 'border-rose-100 bg-rose-50/30 dark:border-rose-900/30 dark:bg-rose-950/20' : 'border-amber-100 bg-amber-50/30 dark:border-amber-900/30 dark:bg-amber-950/20'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-md ${risk.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-500' : 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-500'}`}>
                        {risk.severity === 'CRITICAL' ? <ShieldAlert className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{risk.title}</span>
                        <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500"><Ship className="h-3 w-3" />{risk.shipName} ({risk.projectCode})</div>
                      </div>
                    </div>
                    <span className={`rounded border px-2 py-1 font-mono text-xs font-bold ${risk.severity === 'CRITICAL' ? 'border-rose-200 text-rose-700 dark:border-rose-800 dark:text-rose-300' : 'border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-300'}`}>{risk.severity} · {risk.category}</span>
                  </div>
                  <div className="flex flex-col divide-y divide-slate-200 md:flex-row md:divide-x md:divide-y-0 dark:divide-slate-800">
                    <div className="flex-1 p-5">
                      <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Tespit Edilen Sorun</h4>
                      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{risk.description}</p>
                    </div>
                    <div className="flex flex-1 flex-col justify-between bg-cyan-50/30 p-5 dark:bg-cyan-950/10">
                      <div>
                        <h4 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-400"><Zap className="h-4 w-4" />AI Çözüm Önerisi</h4>
                        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{risk.recommendation}</p>
                      </div>
                      <button onClick={() => navigate(`/project/${risk.projectCode}`)} className="mt-4 flex w-fit items-center gap-2 rounded-md bg-cyan-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-cyan-500">
                        PROJEYİ AÇ <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: 'rose' | 'amber' | 'cyan' }) {
  const styles = {
    rose: 'border-rose-200 bg-rose-50/50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-950/10 dark:text-rose-400',
    amber: 'border-amber-200 bg-amber-50/50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-950/10 dark:text-amber-400',
    cyan: 'border-cyan-200 bg-cyan-50/50 text-cyan-700 dark:border-cyan-500/30 dark:bg-cyan-950/10 dark:text-cyan-400',
  };
  return <div className={`flex flex-col justify-between rounded-lg border p-4 ${styles[tone]}`}><div className="flex items-center gap-2">{icon}<span className="font-sans text-xs font-bold uppercase tracking-wider">{label}</span></div><div className="mt-2 font-mono text-2xl font-bold">{value}</div></div>;
}
