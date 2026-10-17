import { useMemo, useState, useCallback, useEffect } from 'react';
import { ReactFlow, Background, Controls, Handle, Position, ReactFlowProvider, useReactFlow } from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { Clock, Users, AlertOctagon, CheckCircle2, Activity } from 'lucide-react';
import TaskDetailDrawer from './TaskDetailDrawer';

// 1. ÖZEL DÜĞÜM TASARIMI (Aynı)
const TaskNode = ({ data }: { data: any }) => {
  const isCritical = data.isCritical;

  const getStatusStyles = () => {
    switch (data.status) {
      case 'COMPLETED': return 'border-emerald-500/50 bg-emerald-950/20 text-emerald-500';
      case 'IN_PROGRESS': return 'border-cyan-500/50 bg-cyan-950/20 text-cyan-400';
      case 'DELAYED': return 'border-amber-500/50 bg-amber-950/20 text-amber-500';
      case 'BLOCKED': return 'border-rose-500/80 bg-rose-950/30 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse';
      default: return 'border-slate-700 bg-slate-900/50 text-slate-400';
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
    <div className={`relative w-64 rounded-lg border-2 p-3 backdrop-blur-md transition-all hover:scale-105 ${getStatusStyles()} ${isCritical && data.status !== 'COMPLETED' ? 'border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]' : ''}`}>
      <Handle type="target" position={Position.Left} className="!h-3 !w-3 !border-2 !border-slate-900 !bg-slate-400" />
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between">
          <span className="font-sans text-sm font-bold text-slate-100">{data.label}</span>
          <StatusIcon />
        </div>
        <div className="flex items-center gap-4 border-t border-slate-700/50 pt-2 font-mono text-xs text-slate-300">
          <div className="flex items-center gap-1"><Users className="h-3 w-3 text-slate-500" />{data.team}</div>
          <div className="flex items-center gap-1"><Clock className="h-3 w-3 text-slate-500" />{data.duration}</div>
          {isCritical && <span className="ml-auto rounded bg-rose-500/20 px-1.5 py-0.5 text-[9px] font-bold text-rose-400">KRİTİK</span>}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!h-3 !w-3 !border-2 !border-slate-900 !bg-cyan-500" />
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

const initialNodes: Node[] = [
  { id: '1', type: 'taskNode', position: { x: 0, y: 0 }, data: { label: 'Yüzey Hazırlığı & Kumlama', status: 'COMPLETED', duration: '3 Gün', team: 4, isCritical: true } },
  { id: '2', type: 'taskNode', position: { x: 0, y: 0 }, data: { label: 'Astar Boya Uygulaması', status: 'IN_PROGRESS', duration: '2 Gün', team: 2, isCritical: true } },
  { id: '3', type: 'taskNode', position: { x: 0, y: 0 }, data: { label: 'Pervane Şaft İncelemesi', status: 'DELAYED', duration: '5 Gün', team: 3, isCritical: false } },
  { id: '4', type: 'taskNode', position: { x: 0, y: 0 }, data: { label: 'Ana Katman Epoksi', status: 'BLOCKED', duration: '4 Gün', team: 5, isCritical: true } },
  { id: '5', type: 'taskNode', position: { x: 0, y: 0 }, data: { label: 'Kalite Kontrol (Boya)', status: 'PENDING', duration: '1 Gün', team: 1, isCritical: true } },
];
const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#f43f5e', strokeWidth: 3 } },
  { id: 'e1-3', source: '1', target: '3', animated: false, style: { stroke: '#475569', strokeWidth: 2 } },
  { id: 'e2-4', source: '2', target: '4', animated: true, style: { stroke: '#f43f5e', strokeWidth: 3 } },
  { id: 'e4-5', source: '4', target: '5', animated: true, style: { stroke: '#f43f5e', strokeWidth: 3, strokeDasharray: '5,5' } },
];
const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);

// YENİ: 3. İÇ KAMERA BİLEŞENİ (ReactFlowProvider sarmalaması gerektiği için)
function FlowContent({ focusedNodeId }: { focusedNodeId: string | null }) {
  const nodeTypes = useMemo(() => ({ taskNode: TaskNode }), []);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const { setCenter } = useReactFlow(); // Kamera kontrol motoru

  // Kamera Hareketi Efekti
  useEffect(() => {
    if (focusedNodeId) {
      const targetNode = layoutedNodes.find(n => n.id === focusedNodeId);
      if (targetNode) {
        // Düğümün merkez koordinatlarına git (260w/100h)
        const x = targetNode.position.x + 130;
        const y = targetNode.position.y + 50;
        setCenter(x, y, { zoom: 1.5, duration: 1200 }); // 1.2s uçuş animasyonu
      }
    }
  }, [focusedNodeId, setCenter]);

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedTask(node.data);
  }, []);

  return (
    <>
      <ReactFlow
        nodes={layoutedNodes} edges={layoutedEdges} nodeTypes={nodeTypes}
        onNodeClick={onNodeClick} fitView className="bg-slate-950" proOptions={{ hideAttribution: true }}
      >
        <Background gap={40} color="#1e293b" size={1.5} />
        <Controls className="overflow-hidden rounded-md border border-slate-800 !bg-slate-900 shadow-[0_0_15px_rgba(0,0,0,0.5)] [&_button]:!border-b [&_button]:!border-slate-800 [&_button]:!bg-slate-900 [&_button]:!fill-slate-400 hover:[&_button]:!bg-slate-800 hover:[&_button]:!fill-cyan-400 last:[&_button]:!border-none" />
      </ReactFlow>
      <TaskDetailDrawer isOpen={!!selectedTask} task={selectedTask} onClose={() => setSelectedTask(null)} />
    </>
  );
}

// 4. DIŞA AKTARILAN ANA BİLEŞEN
export default function CriticalPathGraph({ focusedNodeId }: { focusedNodeId: string | null }) {
  return (
    <div className="h-full w-full">
      <ReactFlowProvider>
        <FlowContent focusedNodeId={focusedNodeId} />
      </ReactFlowProvider>
    </div>
  );
}