import { useMemo, useState, useCallback, useEffect } from 'react';
import { ReactFlow, Background, Controls, Handle, Position, ReactFlowProvider, useReactFlow } from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { Clock, Users, AlertOctagon, CheckCircle2, Activity } from 'lucide-react';
import TaskDetailDrawer from './TaskDetailDrawer';
import { useTheme } from '@/contexts/ThemeContext'; // YENİ: Tema eklendi

// 1. ÖZEL DÜĞÜM TASARIMI (ESKİ EFSANE TASARIM + BEYAZ TEMA UYUMU)
const TaskNode = ({ data }: { data: any }) => {
  const isCritical = data.isCritical;
  const { theme } = useTheme();

  const getStatusStyles = () => {
    if (theme === 'light') {
      switch (data.status) {
        case 'COMPLETED': return 'border-emerald-300 bg-emerald-50 text-emerald-700 shadow-sm';
        case 'IN_PROGRESS': return 'border-cyan-300 bg-cyan-50 text-cyan-700 shadow-sm';
        case 'DELAYED': return 'border-amber-300 bg-amber-50 text-amber-700 shadow-sm';
        case 'BLOCKED': return 'border-rose-400 bg-rose-50 text-rose-700 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse';
        default: return 'border-slate-200 bg-white text-slate-600 shadow-sm';
      }
    } else {
      switch (data.status) {
        case 'COMPLETED': return 'border-emerald-500/50 bg-emerald-950/20 text-emerald-500';
        case 'IN_PROGRESS': return 'border-cyan-500/50 bg-cyan-950/20 text-cyan-400';
        case 'DELAYED': return 'border-amber-500/50 bg-amber-950/20 text-amber-500';
        case 'BLOCKED': return 'border-rose-500/80 bg-rose-950/30 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse';
        default: return 'border-slate-700 bg-slate-900/50 text-slate-400';
      }
    }
  };

  const StatusIcon = () => {
    switch (data.status) {
      case 'COMPLETED': return <CheckCircle2 className="h-4 w-4" />;
      case 'IN_PROGRESS': return <Activity className="h-4 w-4" />;
      case 'DELAYED': return <Clock className="h-4 w-4" />;
      case 'BLOCKED': return <AlertOctagon className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className={`relative w-64 rounded-lg border-2 p-3 backdrop-blur-md transition-all hover:scale-105 ${getStatusStyles()} ${isCritical && data.status !== 'COMPLETED' ? (theme === 'light' ? 'border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)]' : 'border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]') : ''}`}>
      <Handle type="target" position={Position.Left} className={`!h-3 !w-3 !border-2 ${theme === 'light' ? '!border-white !bg-slate-400' : '!border-slate-900 !bg-slate-400'}`} />
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between">
          <span className={`font-sans text-sm font-bold ${theme === 'light' ? 'text-slate-800' : 'text-slate-100'}`}>{data.label}</span>
          <StatusIcon />
        </div>
        <div className={`flex items-center gap-4 border-t pt-2 font-mono text-xs ${theme === 'light' ? 'border-slate-200 text-slate-500' : 'border-slate-700/50 text-slate-300'}`}>
          <div className="flex items-center gap-1"><Users className="h-3 w-3 opacity-70" />{data.team}</div>
          <div className="flex items-center gap-1"><Clock className="h-3 w-3 opacity-70" />{data.duration}</div>
          {isCritical && <span className={`ml-auto rounded px-1.5 py-0.5 text-[9px] font-bold ${theme === 'light' ? 'bg-rose-100 text-rose-600' : 'bg-rose-500/20 text-rose-400'}`}>KRİTİK</span>}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className={`!h-3 !w-3 !border-2 ${theme === 'light' ? '!border-white !bg-cyan-500' : '!border-slate-900 !bg-cyan-500'}`} />
    </div>
  );
};

// 2. DAGRE HİZALAMASI (Aynı)
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
  dagreGraph.setGraph({ rankdir: direction, nodesep: 50, ranksep: 100 });
  nodes.forEach((node) => dagreGraph.setNode(node.id, { width: 260, height: 100 }));
  edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));
  dagre.layout(dagreGraph);
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return { ...node, position: { x: nodeWithPosition.x - 130, y: nodeWithPosition.y - 50 } };
  });
  return { nodes: layoutedNodes, edges };
};

// 3. İÇ KAMERA BİLEŞENİ
function FlowContent({ focusedNodeId, tasks, dependencies, onTaskUpdated }: any) {
  const { theme } = useTheme();
  const nodeTypes = useMemo(() => ({ taskNode: TaskNode }), []);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const { setCenter } = useReactFlow();

  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    const nodes: Node[] = tasks.map((task: any) => ({
      id: task.id,
      type: 'taskNode',
      position: { x: 0, y: 0 },
      data: {
        label: task.name,
        status: task.status,
        duration: `${Number(task.estimatedHours ?? 0) / 8} Gün`,
        team: task.assignedUsers?.length ?? 0,
        isCritical: task.isCritical ?? false,
      },
    }));
    const edges: Edge[] = dependencies.map(({ predecessor, successor }: any) => ({
      id: `${predecessor.id}-${successor.id}`,
      source: predecessor.id,
      target: successor.id,
      animated: true,
      style: { stroke: theme === 'light' ? '#94a3b8' : '#475569', strokeWidth: 2 },
    }));
    return getLayoutedElements(nodes, edges);
  }, [tasks, dependencies, theme]);

  useEffect(() => {
    if (focusedNodeId) {
      const targetNode = layoutedNodes.find(n => n.id === focusedNodeId);
      if (targetNode) {
        setCenter(targetNode.position.x + 130, targetNode.position.y + 50, { zoom: 1.5, duration: 1200 });
      }
    }
  }, [focusedNodeId, setCenter, layoutedNodes]);

  const onNodeClick = useCallback((_: any, node: Node) => {
    const task = tasks.find(({ id }: any) => id === node.id);
    if (task) setSelectedTask({ ...node.data, ...task, label: task.name });
  }, [tasks]);

  return (
    <>
      {/* TEMA CSS OVERRIDE */}
      <style>{`
        .react-flow { background-color: transparent !important; }
        .react-flow__controls-button {
          background-color: ${theme === 'dark' ? '#1e293b' : '#ffffff'} !important;
          fill: ${theme === 'dark' ? '#cbd5e1' : '#475569'} !important;
          border-bottom: 1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'} !important;
        }
        .react-flow__controls-button:hover { background-color: ${theme === 'dark' ? '#334155' : '#f1f5f9'} !important; }
      `}</style>
      <ReactFlow nodes={layoutedNodes} edges={layoutedEdges} nodeTypes={nodeTypes} onNodeClick={onNodeClick} fitView proOptions={{ hideAttribution: true }}>
        <Background gap={40} color={theme === 'dark' ? '#334155' : '#cbd5e1'} size={1.5} />
        <Controls className="overflow-hidden rounded-md border border-slate-200 shadow-sm dark:border-slate-800 dark:shadow-[0_0_15px_rgba(0,0,0,0.5)]" />
      </ReactFlow>
      <TaskDetailDrawer isOpen={!!selectedTask} task={selectedTask} onClose={() => setSelectedTask(null)} onTaskUpdated={onTaskUpdated} />
    </>
  );
}

// 4. DIŞA AKTARILAN ANA BİLEŞEN
export default function CriticalPathGraph(props: any) {
  return (
    <div className="h-full w-full">
      <ReactFlowProvider>
        <FlowContent {...props} />
      </ReactFlowProvider>
    </div>
  );
}