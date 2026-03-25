import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, { 
  addEdge, 
  Background, 
  Controls, 
  Connection, 
  Edge, 
  Node,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Panel,
  OnNodesChange,
  applyNodeChanges
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ApiNode, StoreNode, TransformNode, AiNode } from './CustomNodes';
import { Play, Save, Plus, X, ChevronRight, Info, Loader2, Sparkles, Zap } from 'lucide-react';
import axios from 'axios';
import { db, auth } from '../firebase';
import { collection, addDoc, setDoc, doc, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { GoogleGenAI } from "@google/genai";

const nodeTypes = {
  api: ApiNode,
  store: StoreNode,
  transform: TransformNode,
  ai: AiNode,
};

import confetti from 'canvas-confetti';
import { toast } from 'sonner';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'api',
    position: { x: 100, y: 100 },
    data: { label: 'Product Fetcher', method: 'GET', url: 'https://fakestoreapi.com/products' },
  },
  {
    id: '2',
    type: 'ai',
    position: { x: 400, y: 100 },
    data: { 
      label: 'AI Optimizer', 
      model: 'gemini-3-flash-preview',
      prompt: 'Summarize these products and generate a catchy marketing slogan for each.'
    },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
];

const SAMPLE_DATA = [
  { id: 1, name: "Classic T-Shirt", price: 25.99, category: "Apparel", stock: 100 },
  { id: 2, name: "Leather Wallet", price: 45.00, category: "Accessories", stock: 50 },
  { id: 3, name: "Wireless Headphones", price: 129.99, category: "Electronics", stock: 25 }
];

const TransformPreview = ({ mapping }: { mapping: string }) => {
  const [preview, setPreview] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        if (!mapping || mapping.trim() === '') {
          setPreview(null);
          setError(null);
          return;
        }
        
        // Basic safety check and execution
        // We expect something like: return data.map(item => ({ ... }))
        // Or just the function body if we wrap it
        const functionBody = mapping.includes('return') ? mapping : `return ${mapping}`;
        const transformFn = new Function('data', functionBody);
        const result = transformFn(SAMPLE_DATA);
        setPreview(result);
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setPreview(null);
      }
    }, 300); // Debounce

    return () => clearTimeout(timeoutId);
  }, [mapping]);

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transformation Preview</label>
      <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 overflow-hidden">
        {error ? (
          <div className="text-red-400 text-[10px] font-mono whitespace-pre-wrap">Error: {error}</div>
        ) : preview ? (
          <pre className="text-indigo-300 text-[10px] font-mono max-h-40 overflow-y-auto scrollbar-hide">
            {JSON.stringify(preview, null, 2)}
          </pre>
        ) : (
          <div className="text-slate-600 text-[10px] italic">Enter mapping logic to see preview...</div>
        )}
      </div>
      <p className="text-[9px] text-slate-400 italic">Previewing with sample product data.</p>
    </div>
  );
};

export function WorkflowEditor({ pendingConnector, onConnectorAdded }: { pendingConnector?: any, onConnectorAdded?: () => void }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [magicPrompt, setMagicPrompt] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  // Handle pending connector from App.tsx
  useEffect(() => {
    if (pendingConnector) {
      const id = `${Date.now()}`;
      let newNode: Node;

      if (pendingConnector.category === 'ai') {
        newNode = {
          id,
          type: 'ai',
          position: { x: 250, y: 150 },
          data: { 
            label: pendingConnector.name, 
            model: pendingConnector.id === 'gemini' ? 'gemini-3-flash-preview' : 'gpt-4o',
            prompt: 'Process the input data and return a structured JSON response.'
          },
        };
      } else {
        newNode = {
          id,
          type: 'api',
          position: { x: 250, y: 150 },
          data: { 
            label: pendingConnector.name, 
            url: pendingConnector.url || 'https://api.example.com',
            method: 'GET',
            headers: {},
            body: {}
          },
        };
      }

      setNodes((nds) => nds.concat(newNode));
      onConnectorAdded?.();
    }
  }, [pendingConnector, setNodes, onConnectorAdded]);

  // Load existing workflow on mount
  useEffect(() => {
    const loadWorkflow = async () => {
      if (!auth.currentUser) return;
      const q = query(collection(db, 'workflows'), where('uid', '==', auth.currentUser.uid));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setNodes(data.nodes || initialNodes);
        setEdges(data.edges || initialEdges);
      }
    };
    loadWorkflow();
  }, []);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = (_: any, node: Node) => {
    setSelectedNode(node);
  };

  const updateNodeData = (id: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, ...newData } };
        }
        return node;
      })
    );
    
    if (selectedNode?.id === id) {
      setSelectedNode(prev => prev ? ({ ...prev, data: { ...prev.data, ...newData } }) : null);
    }
  };

  const addNode = (type: string) => {
    const id = `${Date.now()}`;
    const newNode: Node = {
      id,
      type,
      position: { x: 200, y: 200 },
      data: { 
        label: `New ${type.toUpperCase()}`,
        method: 'GET',
        url: '',
        config: {}
      },
    };
    setNodes((nds) => nds.concat(newNode));
    setSelectedNode(newNode);
  };

  const onSaveWorkflow = async () => {
    if (!auth.currentUser) return;
    setIsSaving(true);
    try {
      const workflowData = {
        id: 'default-workflow',
        name: 'My Workflow',
        nodes,
        edges,
        uid: auth.currentUser.uid,
        createdAt: Date.now()
      };
      await setDoc(doc(db, 'workflows', `${auth.currentUser.uid}_default`), workflowData);
      setLogs(prev => [...prev, 'Workflow saved to cloud.']);
    } catch (error: any) {
      setLogs(prev => [...prev, `Save Error: ${error.message}`]);
    } finally {
      setIsSaving(false);
    }
  };

  const onRunWorkflow = async () => {
    if (!auth.currentUser) return;
    setIsRunning(true);
    setLogs(['Starting workflow execution...']);
    
    // Reset node statuses and edge animations
    setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, status: 'idle' } })));
    setEdges(eds => eds.map(e => ({ ...e, animated: false })));
    
    try {
      let lastResult: any = null;
      
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        
        // Update node status to running
        setNodes(nds => nds.map(n => n.id === node.id ? { ...n, data: { ...n.data, status: 'running' } } : n));
        
        // Animate incoming edges
        setEdges(eds => eds.map(e => e.target === node.id ? { ...e, animated: true } : e));
        
        setLogs(prev => [...prev, `Executing node: ${node.data.label}...`]);
        
        if (node.type === 'api') {
          const response = await axios.post('/api/proxy', {
            url: node.data.url,
            method: node.data.method,
            headers: node.data.headers || {},
            data: node.data.body || {}
          });
          lastResult = response.data;
          setLogs(prev => [...prev, `Success: Received ${Array.isArray(lastResult) ? lastResult.length : 'object'} results.`]);
        }

        if (node.type === 'ai') {
          setLogs(prev => [...prev, `AI Agent: Processing with ${node.data.model || 'Gemini'}...`]);
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          
          const prompt = `${node.data.prompt || 'Analyze this data'}\n\nData: ${JSON.stringify(lastResult)}`;
          const result = await ai.models.generateContent({
            model: node.data.model || 'gemini-3-flash-preview',
            contents: prompt
          });
          
          try {
            lastResult = JSON.parse(result.text.replace(/```json|```/g, '').trim());
          } catch {
            lastResult = result.text;
          }
          setLogs(prev => [...prev, `AI Success: Generated response.`]);
        }

        if (node.type === 'transform') {
          setLogs(prev => [...prev, 'Transforming data...']);
          try {
            const mapping = node.data.mapping || 'return data';
            const functionBody = mapping.includes('return') ? mapping : `return ${mapping}`;
            const transformFn = new Function('data', functionBody);
            lastResult = transformFn(lastResult);
            setLogs(prev => [...prev, 'Transformation successful.']);
          } catch (err: any) {
            throw new Error(`Transformation failed: ${err.message}`);
          }
        }
        
        if (node.type === 'store' && lastResult) {
          setLogs(prev => [...prev, 'Syncing data to storefront...']);
          const batch = writeBatch(db);
          const productsToSync = Array.isArray(lastResult) ? lastResult.slice(0, 10) : [lastResult];
          
          for (const item of productsToSync) {
            const productRef = doc(collection(db, 'products'));
            batch.set(productRef, {
              id: String(item.id || Math.random()),
              title: item.title || item.name || 'Untitled Product',
              price: Number(item.price || 0),
              description: item.description || '',
              image: item.image || item.thumbnail || '',
              category: item.category || 'General',
              uid: auth.currentUser.uid
            });
          }
          await batch.commit();
          setLogs(prev => [...prev, `Storefront updated with ${productsToSync.length} items.`]);
        }
        
        // Update node status to success
        setNodes(nds => nds.map(n => n.id === node.id ? { ...n, data: { ...n.data, status: 'success' } } : n));
        
        await new Promise(r => setTimeout(r, 800));
      }
      
      setLogs(prev => [...prev, 'Workflow completed successfully.']);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#818cf8', '#c7d2fe']
      });
      toast.success('Workflow executed successfully!');
    } catch (error: any) {
      setLogs(prev => [...prev, `Execution Error: ${error.message}`]);
      toast.error(`Execution failed: ${error.message}`);
    } finally {
      setIsRunning(false);
      setEdges(eds => eds.map(e => ({ ...e, animated: false })));
    }
  };

  const onMagicGenerate = async () => {
    if (!magicPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Generate a React Flow workflow for an e-commerce automation platform.
      The user wants: "${magicPrompt}"
      
      Return ONLY a JSON object with "nodes" and "edges" arrays.
      Nodes must have types: "api", "ai", "transform", or "store".
      Example node data: { label: "Fetch Products", url: "https://fakestoreapi.com/products", method: "GET" }
      Example edge: { id: "e1-2", source: "1", target: "2", animated: true }
      
      The workflow should generally end with a "store" node.
      Make sure the IDs are unique strings.`;

      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      const workflow = JSON.parse(result.text);
      
      // Position nodes nicely
      const positionedNodes = workflow.nodes.map((n: any, i: number) => ({
        ...n,
        position: n.position || { x: 250, y: i * 150 + 50 },
        data: { ...n.data, status: 'idle' }
      }));

      setNodes(positionedNodes);
      setEdges(workflow.edges || []);
      toast.success('AI Workflow generated!');
      setMagicPrompt('');
    } catch (err: any) {
      toast.error('Failed to generate workflow');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full h-full bg-slate-50 relative flex overflow-hidden">
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background color="#cbd5e1" gap={20} />
          <Controls />
          
          <Panel position="top-left" className="bg-white p-3 rounded-2xl shadow-2xl border border-slate-200 w-80 flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={18} className="text-amber-500" />
              <h3 className="font-bold text-slate-800 text-sm">Magic Generator</h3>
            </div>
            <div className="relative">
              <textarea 
                value={magicPrompt}
                onChange={(e) => setMagicPrompt(e.target.value)}
                placeholder="Describe your workflow... (e.g., 'Sync Shopify products and translate to Spanish')"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs resize-none focus:ring-2 focus:ring-indigo-500/20 outline-none"
                rows={3}
              />
              <button 
                onClick={onMagicGenerate}
                disabled={isGenerating || !magicPrompt.trim()}
                className="absolute bottom-2 right-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
              </button>
            </div>
          </Panel>

          <Panel position="top-right" className="flex gap-2 bg-white p-2 rounded-xl shadow-xl border border-slate-200">
            <button 
              onClick={() => addNode('api')}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs font-bold uppercase tracking-wider"
            >
              <Plus size={14} /> API
            </button>
            <button 
              onClick={() => addNode('transform')}
              className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-xs font-bold uppercase tracking-wider"
            >
              <Plus size={14} /> Transform
            </button>
            <button 
              onClick={() => addNode('ai')}
              className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors text-xs font-bold uppercase tracking-wider"
            >
              <Sparkles size={14} /> AI Agent
            </button>
            <button 
              onClick={() => addNode('store')}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-xs font-bold uppercase tracking-wider"
            >
              <Plus size={14} /> Store
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1" />
            <button 
              onClick={onRunWorkflow}
              disabled={isRunning}
              className={`flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${isRunning ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
            >
              {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />} {isRunning ? 'Running...' : 'Run'}
            </button>
            <button 
              onClick={onSaveWorkflow}
              disabled={isSaving}
              className="flex items-center gap-1 px-4 py-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors text-xs font-bold uppercase tracking-wider shadow-sm"
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
            </button>
          </Panel>

          {/* Execution Logs */}
          <Panel position="bottom-left" className="w-80 max-h-40 overflow-y-auto bg-slate-900 text-slate-300 p-3 rounded-xl shadow-2xl font-mono text-[10px] border border-slate-800">
            <div className="flex justify-between items-center mb-2 border-b border-slate-800 pb-1">
              <span className="text-slate-500 font-bold uppercase tracking-widest">Execution Logs</span>
              <button onClick={() => setLogs([])} className="hover:text-white transition-colors">Clear</button>
            </div>
            {logs.length === 0 ? (
              <p className="italic text-slate-600">No logs to display.</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="mb-1 flex gap-2">
                  <span className="text-indigo-500">[{new Date().toLocaleTimeString()}]</span>
                  <span>{log}</span>
                </div>
              ))
            )}
          </Panel>
        </ReactFlow>
      </div>

      {/* Configuration Sidebar */}
      {selectedNode && (
        <div className="w-80 bg-white border-l border-slate-200 shadow-2xl z-20 flex flex-col animate-in slide-in-from-right duration-300">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${selectedNode.type === 'api' ? 'bg-blue-500' : selectedNode.type === 'store' ? 'bg-green-500' : 'bg-purple-500'}`} />
              <h3 className="font-bold text-slate-800">Configure Node</h3>
            </div>
            <button 
              onClick={() => setSelectedNode(null)}
              className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-400"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Node Label</label>
              <input 
                type="text" 
                value={selectedNode.data.label}
                onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
              />
            </div>

            {selectedNode.type === 'ai' && (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Model</label>
                  <select 
                    value={selectedNode.data.model || 'gemini-3-flash-preview'}
                    onChange={(e) => updateNodeData(selectedNode.id, { model: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
                  >
                    <option value="gemini-3-flash-preview">Gemini 3.1 Flash</option>
                    <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Prompt / Instruction</label>
                  <textarea 
                    rows={4}
                    placeholder="e.g. Generate a creative product description based on the input data. Return JSON format."
                    value={selectedNode.data.prompt}
                    onChange={(e) => updateNodeData(selectedNode.id, { prompt: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm resize-none"
                  />
                </div>
              </>
            )}

            {selectedNode.type === 'api' && (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">HTTP Method</label>
                  <select 
                    value={selectedNode.data.method}
                    onChange={(e) => updateNodeData(selectedNode.id, { method: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Endpoint URL</label>
                  <input 
                    type="text" 
                    placeholder="https://api.example.com/v1/..."
                    value={selectedNode.data.url}
                    onChange={(e) => updateNodeData(selectedNode.id, { url: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-mono"
                  />
                </div>
              </>
            )}

            {selectedNode.type === 'transform' && (
              <div className="space-y-4">
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex gap-3">
                  <Info size={20} className="text-purple-600 shrink-0" />
                  <p className="text-[10px] text-purple-700 leading-relaxed">
                    Use JSON mapping to transform incoming data to your store's format.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mapping Logic (JS)</label>
                  <textarea 
                    placeholder="return data.map(item => ({ ... }))"
                    value={selectedNode.data.mapping || ''}
                    onChange={(e) => updateNodeData(selectedNode.id, { mapping: e.target.value })}
                    className="w-full h-32 px-3 py-2 bg-slate-900 text-indigo-300 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs font-mono"
                  />
                </div>
                <TransformPreview mapping={selectedNode.data.mapping || ''} />
              </div>
            )}

            {selectedNode.type === 'store' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Collection</label>
                  <input 
                    type="text" 
                    value="products"
                    disabled
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500"
                  />
                </div>
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                  <p className="text-[10px] text-green-700 font-medium">
                    This node will automatically sync processed data to your FlowCommerce storefront.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <button 
              onClick={() => {
                setNodes(nds => nds.filter(n => n.id !== selectedNode.id));
                setSelectedNode(null);
              }}
              className="w-full py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-100 transition-colors"
            >
              Delete Node
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WorkflowEditorWrapper({ pendingConnector, onConnectorAdded }: { pendingConnector?: any, onConnectorAdded?: () => void }) {
  return (
    <ReactFlowProvider>
      <WorkflowEditor pendingConnector={pendingConnector} onConnectorAdded={onConnectorAdded} />
    </ReactFlowProvider>
  );
}
