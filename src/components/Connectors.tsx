import React, { useState } from 'react';
import { 
  Search, ExternalLink, Plus, Zap, ShoppingCart, CreditCard, Users, Database, 
  Globe, Mail, MessageSquare, BarChart, Layout, FileText, Phone, Send, 
  Hash, Github, Trello, CheckSquare, Table, Layers, DollarSign, Briefcase, 
  Share2, ShieldCheck, Activity, Bell, Sparkles
} from 'lucide-react';

interface Connector {
  id: string;
  name: string;
  description: string;
  category: 'ecommerce' | 'payments' | 'crm' | 'tools' | 'marketing' | 'analytics' | 'ai';
  icon: React.ReactNode;
  color: string;
  url?: string;
}

const CONNECTORS: Connector[] = [
  // AI & Agents
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Advanced multimodal AI for content generation and analysis.',
    category: 'ai',
    icon: <Sparkles size={24} />,
    color: 'bg-amber-500',
    url: 'https://ai.google.dev/'
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4o for text generation, vision, and complex reasoning.',
    category: 'ai',
    icon: <Sparkles size={24} />,
    color: 'bg-emerald-600',
    url: 'https://platform.openai.com/'
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    description: 'High-performance AI with a focus on safety and long context.',
    category: 'ai',
    icon: <Sparkles size={24} />,
    color: 'bg-orange-700',
    url: 'https://www.anthropic.com/api'
  },
  {
    id: 'stability',
    name: 'Stability AI',
    description: 'Generate and edit high-quality images for your storefront.',
    category: 'ai',
    icon: <Sparkles size={24} />,
    color: 'bg-indigo-700',
    url: 'https://stability.ai/api'
  },

  // E-commerce
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'Sync products, orders, and customers from your Shopify store.',
    category: 'ecommerce',
    icon: <ShoppingCart size={24} />,
    color: 'bg-green-600',
    url: 'https://shopify.dev/docs/api/admin-rest'
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    description: 'Connect your WordPress-based store to automate order processing.',
    category: 'ecommerce',
    icon: <ShoppingCart size={24} />,
    color: 'bg-purple-700',
    url: 'https://woocommerce.github.io/woocommerce-rest-api-docs/'
  },
  {
    id: 'bigcommerce',
    name: 'BigCommerce',
    description: 'Enterprise-grade e-commerce API for high-volume storefronts.',
    category: 'ecommerce',
    icon: <ShoppingCart size={24} />,
    color: 'bg-blue-800',
    url: 'https://developer.bigcommerce.com/api-docs'
  },
  {
    id: 'amazon',
    name: 'Amazon Seller',
    description: 'Manage your Amazon listings and orders via SP-API.',
    category: 'ecommerce',
    icon: <ShoppingCart size={24} />,
    color: 'bg-orange-400',
    url: 'https://developer-docs.amazon.com/sp-api/'
  },

  // Payments
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Process payments and manage subscriptions globally.',
    category: 'payments',
    icon: <CreditCard size={24} />,
    color: 'bg-indigo-500',
    url: 'https://stripe.com/docs/api'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Accept payments via PayPal, Venmo, and credit cards.',
    category: 'payments',
    icon: <DollarSign size={24} />,
    color: 'bg-blue-600',
    url: 'https://developer.paypal.com/docs/api/overview/'
  },
  {
    id: 'adyen',
    name: 'Adyen',
    description: 'Unified commerce payments for global businesses.',
    category: 'payments',
    icon: <ShieldCheck size={24} />,
    color: 'bg-green-400',
    url: 'https://docs.adyen.com/api-explorer'
  },
  {
    id: 'square',
    name: 'Square',
    description: 'Connect your physical and digital sales data.',
    category: 'payments',
    icon: <Layout size={24} />,
    color: 'bg-slate-900',
    url: 'https://developer.squareup.com/reference/square'
  },

  // CRM
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Sync customer data and marketing leads automatically.',
    category: 'crm',
    icon: <Users size={24} />,
    color: 'bg-orange-500',
    url: 'https://developers.hubspot.com/docs/api/overview'
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'The world\'s #1 CRM for sales and customer service.',
    category: 'crm',
    icon: <Globe size={24} />,
    color: 'bg-sky-500',
    url: 'https://developer.salesforce.com/docs/apis'
  },
  {
    id: 'zendesk',
    name: 'Zendesk',
    description: 'Manage support tickets and customer conversations.',
    category: 'crm',
    icon: <MessageSquare size={24} />,
    color: 'bg-emerald-600',
    url: 'https://developer.zendesk.com/api-reference/'
  },
  {
    id: 'intercom',
    name: 'Intercom',
    description: 'Real-time customer messaging and support platform.',
    category: 'crm',
    icon: <MessageSquare size={24} />,
    color: 'bg-blue-500',
    url: 'https://developers.intercom.com/intercom-api-reference/'
  },

  // Marketing
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Automate email marketing campaigns and list management.',
    category: 'marketing',
    icon: <Mail size={24} />,
    color: 'bg-yellow-500',
    url: 'https://mailchimp.com/developer/'
  },
  {
    id: 'klaviyo',
    name: 'Klaviyo',
    description: 'E-commerce marketing automation for email and SMS.',
    category: 'marketing',
    icon: <Send size={24} />,
    color: 'bg-green-600',
    url: 'https://developers.klaviyo.com/en/reference/api_overview'
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'Reliable transactional and marketing email delivery.',
    category: 'marketing',
    icon: <Mail size={24} />,
    color: 'bg-blue-400',
    url: 'https://docs.sendgrid.com/api-reference/how-to-use-the-sendgrid-v3-api'
  },
  {
    id: 'facebook-ads',
    name: 'Meta Ads',
    description: 'Manage Facebook and Instagram advertising campaigns.',
    category: 'marketing',
    icon: <Share2 size={24} />,
    color: 'bg-blue-700',
    url: 'https://developers.facebook.com/docs/marketing-apis/'
  },

  // Tools & Productivity
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send notifications to your team for new orders or alerts.',
    category: 'tools',
    icon: <Hash size={24} />,
    color: 'bg-purple-500',
    url: 'https://api.slack.com/'
  },
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    description: 'Sync your storefront data to spreadsheets for reporting.',
    category: 'tools',
    icon: <Table size={24} />,
    color: 'bg-green-600',
    url: 'https://developers.google.com/sheets/api'
  },
  {
    id: 'airtable',
    name: 'Airtable',
    description: 'Connect your low-code database to your commerce flow.',
    category: 'tools',
    icon: <Layers size={24} />,
    color: 'bg-blue-500',
    url: 'https://airtable.com/api'
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Manage your product roadmap and inventory in Notion.',
    category: 'tools',
    icon: <FileText size={24} />,
    color: 'bg-slate-800',
    url: 'https://developers.notion.com/'
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Trigger workflows based on code changes or issues.',
    category: 'tools',
    icon: <Github size={24} />,
    color: 'bg-slate-900',
    url: 'https://docs.github.com/en/rest'
  },
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'Send SMS notifications and manage voice calls.',
    category: 'tools',
    icon: <Phone size={24} />,
    color: 'bg-red-600',
    url: 'https://www.twilio.com/docs/usage/api'
  },

  // Analytics
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    description: 'Track storefront performance and user behavior.',
    category: 'analytics',
    icon: <BarChart size={24} />,
    color: 'bg-blue-500',
    url: 'https://developers.google.com/analytics'
  },
  {
    id: 'mixpanel',
    name: 'Mixpanel',
    description: 'Deep product analytics for user behavior tracking.',
    category: 'analytics',
    icon: <Activity size={24} />,
    color: 'bg-purple-600',
    url: 'https://developer.mixpanel.com/reference/overview'
  },

  // Custom
  {
    id: 'fakestore',
    name: 'FakeStore API',
    description: 'Perfect for testing e-commerce flows with mock data.',
    category: 'tools',
    icon: <Database size={24} />,
    color: 'bg-slate-500',
    url: 'https://fakestoreapi.com/products'
  },
  {
    id: 'custom-api',
    name: 'Custom HTTP',
    description: 'Connect to any REST API with custom headers and methods.',
    category: 'tools',
    icon: <Globe size={24} />,
    color: 'bg-indigo-600',
  }
];

export default function Connectors({ onAdd }: { onAdd: (connector: Connector) => void }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filtered = CONNECTORS.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                         c.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || c.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'ecommerce', name: 'E-commerce' },
    { id: 'payments', name: 'Payments' },
    { id: 'crm', name: 'CRM' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'tools', name: 'Tools' },
    { id: 'analytics', name: 'Analytics' },
    { id: 'ai', name: 'AI & Agents' },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto h-full overflow-y-auto">
      <div className="mb-10">
        <h2 className="text-4xl font-black tracking-tight mb-2">Connector Hub</h2>
        <p className="text-slate-500 text-lg">Browse and connect your favorite e-commerce tools and APIs.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search connectors..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeCategory === cat.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-200'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(connector => (
          <div key={connector.id} className="group bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <div className={`w-14 h-14 ${connector.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                {connector.icon}
              </div>
              {connector.url && (
                <a 
                  href={connector.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  <ExternalLink size={18} />
                </a>
              )}
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2">{connector.name}</h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              {connector.description}
            </p>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => onAdd(connector)}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-900 rounded-2xl font-bold hover:bg-indigo-600 hover:text-white transition-all group/btn"
              >
                <Plus size={18} className="group-hover/btn:rotate-90 transition-transform" />
                Add to Flow
              </button>
              <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-colors">
                <Zap size={18} />
              </button>
            </div>
          </div>
        ))}
        
        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <Search size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium text-lg">No connectors found matching your search.</p>
            <button 
              onClick={() => { setSearch(''); setActiveCategory('all'); }}
              className="mt-4 text-indigo-600 font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
