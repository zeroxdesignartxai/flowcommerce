import React, { useState, useEffect } from 'react';
import WorkflowEditor from './components/WorkflowEditor';
import Connectors from './components/Connectors';
import AiAssistant from './components/AiAssistant';
import { Layout, Share2, Settings, ShoppingBag, Zap, LogIn, LogOut, Grid, Sparkles, X, Loader2, BarChart3 } from 'lucide-react';
import { auth, db } from './firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { GoogleGenAI } from "@google/genai";
import { Toaster } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const ANALYTICS_DATA = [
  { name: 'Mon', syncs: 40, errors: 2 },
  { name: 'Tue', syncs: 30, errors: 1 },
  { name: 'Wed', syncs: 65, errors: 5 },
  { name: 'Thu', syncs: 45, errors: 0 },
  { name: 'Fri', syncs: 90, errors: 3 },
  { name: 'Sat', syncs: 70, errors: 1 },
  { name: 'Sun', syncs: 85, errors: 2 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'editor' | 'store' | 'settings' | 'connectors' | 'analytics'>('editor');
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [storeTheme, setStoreTheme] = useState({
    primaryColor: '#4f46e5',
    fontFamily: 'Inter',
    headerStyle: 'minimal',
    layout: 'grid', // 'grid' | 'bento' | 'list'
    slogan: 'Your products, powered by AI.'
  });
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isGeneratingTheme, setIsGeneratingTheme] = useState(false);
  const [pendingConnector, setPendingConnector] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setProducts([]);
      return;
    }
    const q = query(collection(db, 'products'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const generateTheme = async () => {
    setIsGeneratingTheme(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a modern e-commerce store theme configuration in JSON format. 
        Include: primaryColor (hex), fontFamily (one of: Inter, Playfair Display, Space Grotesk, Montserrat), 
        headerStyle (one of: minimal, bold, centered), and a catchy slogan.
        Return ONLY the JSON object.`
      });
      
      const theme = JSON.parse(response.text.replace(/```json|```/g, '').trim());
      setStoreTheme(theme);
    } catch (error) {
      console.error('Failed to generate theme:', error);
    } finally {
      setIsGeneratingTheme(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Zap className="animate-pulse text-indigo-600" size={48} /></div>;

  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl mb-6">
          <Zap size={32} fill="currentColor" />
        </div>
        <h1 className="text-4xl font-black tracking-tight mb-2 text-slate-900">FlowCommerce</h1>
        <p className="text-slate-500 mb-8 max-w-md text-center">The visual workflow engine for modern e-commerce. Connect any API to your storefront in minutes.</p>
        <button 
          onClick={handleLogin}
          className="flex items-center gap-3 px-8 py-4 bg-white border border-slate-200 rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:border-indigo-200 transition-all group"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white text-slate-900 font-sans">
      {/* Header */}
      <header className="h-16 border-b border-slate-200 flex items-center justify-between px-6 shrink-0 bg-white z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Zap size={24} fill="currentColor" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">FlowCommerce</h1>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">API Workflow Engine</p>
          </div>
        </div>

        <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'editor' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Share2 size={18} /> Workflow
          </button>
          <button 
            onClick={() => setActiveTab('connectors')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'connectors' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Grid size={18} /> Connectors
          </button>
          <button 
            onClick={() => setActiveTab('store')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'store' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <ShoppingBag size={18} /> Storefront
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'analytics' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <BarChart3 size={18} /> Analytics
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'settings' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Settings size={18} /> Settings
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-800">{user.displayName}</p>
            <button onClick={handleLogout} className="text-[10px] text-indigo-600 font-bold hover:underline">Sign Out</button>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
            <img src={user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`} alt="User" referrerPolicy="no-referrer" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'editor' && (
          <div className="w-full h-full">
            <WorkflowEditor 
              pendingConnector={pendingConnector} 
              onConnectorAdded={() => setPendingConnector(null)} 
            />
          </div>
        )}

        {activeTab === 'connectors' && (
          <div className="w-full h-full">
            <Connectors onAdd={(c) => {
              setPendingConnector(c);
              setActiveTab('editor');
            }} />
          </div>
        )}
        
        {activeTab === 'store' && (
          <div className="flex h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto p-8 max-w-6xl mx-auto">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight" style={{ fontFamily: storeTheme.fontFamily }}>Your Storefront</h2>
                  <p className="text-slate-500 italic">{storeTheme.slogan}</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsCustomizing(!isCustomizing)}
                    className="px-6 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2"
                  >
                    <Settings size={18} /> Customize
                  </button>
                  <button className="px-6 py-2 text-white rounded-xl font-medium shadow-lg transition-all" style={{ backgroundColor: storeTheme.primaryColor }}>
                    Publish Store
                  </button>
                </div>
              </div>
              
              <div className={
                storeTheme.layout === 'bento' 
                  ? "grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[300px]" 
                  : storeTheme.layout === 'list'
                  ? "flex flex-col gap-4"
                  : "grid grid-cols-1 md:grid-cols-3 gap-6"
              }>
                {products.length === 0 ? (
                  <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <ShoppingBag size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-medium">No products synced yet. Run a workflow to populate your store.</p>
                  </div>
                ) : (
                  products.map((product, idx) => (
                    <div 
                      key={product.id} 
                      className={`group bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col ${
                        storeTheme.layout === 'bento' && (idx % 5 === 0 ? 'md:col-span-2 md:row-span-2' : '')
                      } ${
                        storeTheme.layout === 'list' ? 'md:flex-row h-48' : ''
                      }`}
                    >
                      <div className={`bg-slate-100 relative overflow-hidden ${
                        storeTheme.layout === 'list' ? 'w-48 h-full' : 'aspect-square'
                      }`}>
                        <img 
                          src={product.image || `https://picsum.photos/seed/${product.id}/600/600`} 
                          alt={product.title} 
                          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-slate-800 line-clamp-1">{product.title}</h3>
                            <span className="font-bold text-indigo-600" style={{ color: storeTheme.primaryColor }}>${product.price}</span>
                          </div>
                          <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                            {product.description || 'Synced from your API workflow.'}
                          </p>
                        </div>
                        <button className="w-full py-2.5 bg-slate-50 text-slate-800 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {isCustomizing && (
              <div className="w-80 bg-white border-l border-slate-200 shadow-2xl z-20 flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <Sparkles size={18} className="text-amber-500" />
                    <h3 className="font-bold text-slate-800">Store Customizer</h3>
                  </div>
                  <button onClick={() => setIsCustomizing(false)} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-400">
                    <X size={18} />
                  </button>
                </div>
                <div className="p-5 space-y-6">
                  <button 
                    onClick={generateTheme}
                    disabled={isGeneratingTheme}
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                  >
                    {isGeneratingTheme ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    {isGeneratingTheme ? 'Generating...' : 'AI Theme Generator'}
                  </button>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Primary Color</label>
                      <div className="flex gap-2">
                        <input 
                          type="color" 
                          value={storeTheme.primaryColor}
                          onChange={(e) => setStoreTheme(prev => ({ ...prev, primaryColor: e.target.value }))}
                          className="w-10 h-10 rounded-lg cursor-pointer"
                        />
                        <input 
                          type="text" 
                          value={storeTheme.primaryColor}
                          onChange={(e) => setStoreTheme(prev => ({ ...prev, primaryColor: e.target.value }))}
                          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Font Family</label>
                      <select 
                        value={storeTheme.fontFamily}
                        onChange={(e) => setStoreTheme(prev => ({ ...prev, fontFamily: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                      >
                        <option value="Inter">Inter (Modern)</option>
                        <option value="Playfair Display">Playfair Display (Elegant)</option>
                        <option value="Space Grotesk">Space Grotesk (Tech)</option>
                        <option value="Montserrat">Montserrat (Classic)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Store Layout</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['grid', 'bento', 'list'].map(l => (
                          <button
                            key={l}
                            onClick={() => setStoreTheme(prev => ({ ...prev, layout: l }))}
                            className={`py-2 text-[10px] font-bold uppercase rounded-lg border transition-all ${storeTheme.layout === l ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-indigo-200'}`}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Store Slogan</label>
                      <textarea 
                        value={storeTheme.slogan}
                        onChange={(e) => setStoreTheme(prev => ({ ...prev, slogan: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Workflow Settings</h2>
            <div className="space-y-6">
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Zap size={18} className="text-indigo-600" /> Execution Engine
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">Auto-retry on failure</p>
                      <p className="text-xs text-slate-500">Automatically retry API calls if they fail.</p>
                    </div>
                    <div className="w-12 h-6 bg-indigo-600 rounded-full relative">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">Log all transactions</p>
                      <p className="text-xs text-slate-500">Keep a detailed history of every API request.</p>
                    </div>
                    <div className="w-12 h-6 bg-slate-200 rounded-full relative">
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <h3 className="font-bold mb-4">API Credentials</h3>
                <div className="space-y-3">
                  <input 
                    type="password" 
                    placeholder="Global API Key" 
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <p className="text-[10px] text-slate-400 italic">
                    Keys are encrypted and stored securely in your private vault.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="p-8 max-w-6xl mx-auto h-full overflow-y-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight">Command Center</h2>
              <p className="text-slate-500">Real-time insights into your commerce automation.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total Syncs</p>
                <p className="text-3xl font-bold text-slate-900">1,284</p>
                <p className="text-xs text-green-500 font-bold mt-2">↑ 12% from last week</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Success Rate</p>
                <p className="text-3xl font-bold text-slate-900">99.2%</p>
                <p className="text-xs text-green-500 font-bold mt-2">Stable</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">AI Tokens</p>
                <p className="text-3xl font-bold text-slate-900">42.5k</p>
                <p className="text-xs text-slate-400 font-bold mt-2">Current billing cycle</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Active Flows</p>
                <p className="text-3xl font-bold text-slate-900">8</p>
                <p className="text-xs text-indigo-500 font-bold mt-2">All systems normal</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-6">Workflow Activity</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={ANALYTICS_DATA}>
                      <defs>
                        <linearGradient id="colorSyncs" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Area type="monotone" dataKey="syncs" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorSyncs)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-6">Error Distribution</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ANALYTICS_DATA}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Line type="monotone" dataKey="errors" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <AiAssistant />
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
