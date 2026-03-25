import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Globe, Database, Cpu, Settings2, Sparkles } from 'lucide-react';

const StatusIndicator = ({ status }: { status?: 'idle' | 'running' | 'success' | 'error' }) => {
  if (status === 'running') return <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />;
  if (status === 'success') return <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]" />;
  if (status === 'error') return <div className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]" />;
  return <div className="w-2 h-2 bg-slate-300 rounded-full" />;
};

export const AiNode = memo(({ data }: NodeProps) => {
  return (
    <div className="px-4 py-3 shadow-lg rounded-xl bg-white border-2 border-amber-500 min-w-[220px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-amber-500" />
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">AI Agent</p>
            <p className="text-sm font-semibold text-slate-800">{data.label}</p>
          </div>
        </div>
        <StatusIndicator status={data.status} />
      </div>
      <div className="space-y-2">
        <div className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded italic border border-amber-100">
          "{data.prompt || 'Generate product description...'}"
        </div>
        <div className="flex justify-between items-center text-[9px] font-bold text-amber-600 uppercase tracking-tighter">
          <span>Model: {data.model || 'Gemini 3.1 Flash'}</span>
          <span className="bg-amber-100 px-1 rounded">Active</span>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-amber-500" />
    </div>
  );
});

export const ApiNode = memo(({ data }: NodeProps) => {
  return (
    <div className="px-4 py-3 shadow-lg rounded-xl bg-white border-2 border-blue-500 min-w-[200px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500" />
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
            <Globe size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">API Connector</p>
            <p className="text-sm font-semibold text-slate-800">{data.label}</p>
          </div>
        </div>
        <StatusIndicator status={data.status} />
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>Method</span>
          <span className="font-mono text-blue-500 font-bold">{data.method || 'POST'}</span>
        </div>
        <div className="text-[10px] text-slate-500 truncate bg-slate-50 p-1 rounded">
          {data.url || 'https://api.example.com'}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500" />
    </div>
  );
});

export const StoreNode = memo(({ data }: NodeProps) => {
  return (
    <div className="px-4 py-3 shadow-lg rounded-xl bg-white border-2 border-green-500 min-w-[200px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-green-500" />
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg text-green-600">
            <Database size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-green-600 uppercase tracking-wider">Store Action</p>
            <p className="text-sm font-semibold text-slate-800">{data.label}</p>
          </div>
        </div>
        <StatusIndicator status={data.status} />
      </div>
      <div className="text-[10px] text-slate-500 bg-slate-50 p-1 rounded">
        Collection: <span className="text-green-600 font-medium">products</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-green-500" />
    </div>
  );
});

export const TransformNode = memo(({ data }: NodeProps) => {
  return (
    <div className="px-4 py-3 shadow-lg rounded-xl bg-white border-2 border-purple-500 min-w-[200px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-purple-500" />
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
            <Cpu size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">Transform</p>
            <p className="text-sm font-semibold text-slate-800">{data.label}</p>
          </div>
        </div>
        <StatusIndicator status={data.status} />
      </div>
      <div className="flex items-center gap-1 text-[10px] text-slate-500">
        <Settings2 size={12} />
        <span>Mapping data fields...</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-purple-500" />
    </div>
  );
});
