import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Lightbulb, 
  FileText, 
  Key, 
  Settings as SettingsIcon,
  Menu,
  HelpCircle,
  Grid3x3,
  Bell,
  RefreshCw,
  ChevronDown,
  LogOut,
  TrendingUp,
  Users,
  Clock,
  Workflow,
  Book,
  History,
  FileCheck,
  DollarSign,
  CreditCard,
  Plus,
  Edit2,
  Trash2,
  X,
  Save
} from 'lucide-react';
import { isAuthenticated, getUser, logout, isAdmin, getToken } from '@/utils/auth';
import { useToast } from '@/components/ui/use-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

// Chat Flow Page Component
const ChatFlowPage = () => {
  const [flows, setFlows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFlow, setEditingFlow] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', description: '', nodes: '[]', edges: '[]', isActive: true });
  const { toast } = useToast();

  useEffect(() => {
    fetchFlows();
  }, []);

  const fetchFlows = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/chatflow`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFlows(data);
      }
    } catch (err) {
      console.error('Error fetching flows:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingFlow(null);
    setFormData({ name: '', description: '', nodes: '[]', edges: '[]', isActive: true });
    setShowModal(true);
  };

  const handleEdit = (flow: any) => {
    setEditingFlow(flow);
    setFormData({
      name: flow.name,
      description: flow.description || '',
      nodes: flow.nodes || '[]',
      edges: flow.edges || '[]',
      isActive: flow.isActive
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const token = getToken();
      const payload = {
        ...formData,
        nodes: JSON.parse(formData.nodes),
        edges: JSON.parse(formData.edges)
      };

      const url = editingFlow 
        ? `${API_BASE_URL}/api/chatflow/${editingFlow.id}`
        : `${API_BASE_URL}/api/chatflow`;
      const method = editingFlow ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast({ title: 'Success', description: `Chat flow ${editingFlow ? 'updated' : 'created'} successfully.` });
        setShowModal(false);
        fetchFlows();
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to save chat flow.', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this chat flow?')) return;
    
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/chatflow/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        toast({ title: 'Success', description: 'Chat flow deleted successfully.' });
        fetchFlows();
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete chat flow.', variant: 'destructive' });
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-800">Chat Flow</h1>
        </div>
        <button onClick={handleCreate} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Flow
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {flows.map((flow) => (
          <div key={flow.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">{flow.name}</h3>
              <span className={`px-2 py-1 rounded text-xs ${flow.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                {flow.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            {flow.description && <p className="text-sm text-gray-600 mb-4">{flow.description}</p>}
            <div className="flex gap-2">
              <button onClick={() => handleEdit(flow)} className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center justify-center gap-2">
                <Edit2 className="w-4 h-4" /> Edit
              </button>
              <button onClick={() => handleDelete(flow.id)} className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{editingFlow ? 'Edit' : 'Create'} Chat Flow</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Nodes (JSON)</label>
                <textarea value={formData.nodes} onChange={(e) => setFormData({ ...formData, nodes: e.target.value })} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Edges (JSON)</label>
                <textarea value={formData.edges} onChange={(e) => setFormData({ ...formData, edges: e.target.value })} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} id="flowActive" />
                <label htmlFor="flowActive" className="text-sm">Active</label>
              </div>
              <div className="flex gap-2">
                <button onClick={handleSave} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> Save
                </button>
                <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Intent Page Component
const IntentPage = () => {
  const [intents, setIntents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingIntent, setEditingIntent] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', description: '', examples: '', responses: '', isActive: true });
  const { toast } = useToast();

  useEffect(() => {
    fetchIntents();
  }, []);

  const fetchIntents = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/intent`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIntents(data);
      }
    } catch (err) {
      console.error('Error fetching intents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingIntent(null);
    setFormData({ name: '', description: '', examples: '', responses: '', isActive: true });
    setShowModal(true);
  };

  const handleEdit = (intent: any) => {
    setEditingIntent(intent);
    setFormData({
      name: intent.name,
      description: intent.description || '',
      examples: intent.examples?.join('\n') || '',
      responses: intent.responses?.join('\n') || '',
      isActive: intent.isActive
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const token = getToken();
      const payload = {
        ...formData,
        examples: formData.examples.split('\n').filter(e => e.trim()),
        responses: formData.responses.split('\n').filter(r => r.trim())
      };

      const url = editingIntent 
        ? `${API_BASE_URL}/api/intent/${editingIntent.id}`
        : `${API_BASE_URL}/api/intent`;
      const method = editingIntent ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast({ title: 'Success', description: `Intent ${editingIntent ? 'updated' : 'created'} successfully.` });
        setShowModal(false);
        fetchIntents();
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to save intent.', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this intent?')) return;
    
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/intent/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        toast({ title: 'Success', description: 'Intent deleted successfully.' });
        fetchIntents();
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete intent.', variant: 'destructive' });
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Lightbulb className="w-6 h-6 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-800">Intent</h1>
        </div>
        <button onClick={handleCreate} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Intent
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {intents.map((intent) => (
          <div key={intent.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">{intent.name}</h3>
              <span className={`px-2 py-1 rounded text-xs ${intent.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                {intent.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            {intent.description && <p className="text-sm text-gray-600 mb-4">{intent.description}</p>}
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 mb-1">Examples: {intent.examples?.length || 0}</p>
              <p className="text-xs font-medium text-gray-500">Responses: {intent.responses?.length || 0}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(intent)} className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center justify-center gap-2">
                <Edit2 className="w-4 h-4" /> Edit
              </button>
              <button onClick={() => handleDelete(intent.id)} className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{editingIntent ? 'Edit' : 'Create'} Intent</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Examples (one per line)</label>
                <textarea value={formData.examples} onChange={(e) => setFormData({ ...formData, examples: e.target.value })} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Responses (one per line)</label>
                <textarea value={formData.responses} onChange={(e) => setFormData({ ...formData, responses: e.target.value })} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} id="intentActive" />
                <label htmlFor="intentActive" className="text-sm">Active</label>
              </div>
              <div className="flex gap-2">
                <button onClick={handleSave} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> Save
                </button>
                <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Reports Page Component
const ReportsPage = () => {
  const [stats, setStats] = useState<any>(null);
  const [sessions, setSessions] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7days' | 'month'>('7days');

  useEffect(() => {
    fetchReports();
  }, [timeRange]);

  const fetchReports = async () => {
    try {
      const token = getToken();
      const [statsRes, sessionsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/reports/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/reports/sessions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json();
        setSessions(sessionsData);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-100">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">{stats?.totalUsers?.toLocaleString() || '0'}</h3>
          <p className="text-sm text-gray-600">Total Users</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-100">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">{stats?.activeUsers?.toLocaleString() || '0'}</h3>
          <p className="text-sm text-gray-600">Active Users (30d)</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-orange-100">
              <CreditCard className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">{stats?.totalTransactions?.toLocaleString() || '0'}</h3>
          <p className="text-sm text-gray-600">Total Transactions</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-100">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">RWF {stats?.totalRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</h3>
          <p className="text-sm text-gray-600">Total Revenue</p>
        </div>
      </div>

      {/* Sessions Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Chat Sessions Trend</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange('7days')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${timeRange === '7days' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${timeRange === 'month' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Month
            </button>
          </div>
        </div>
        <div className="h-64 flex items-end justify-between gap-2">
          {sessions?.trend?.map((item: any, index: number) => {
            const height = (item.count / 100) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-purple-100 rounded-t-lg relative group">
                  <div className="bg-purple-600 rounded-t-lg transition-all" style={{ height: `${height}%` }}>
                    {index === 3 && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-purple-600 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-600 mt-2">{item.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction Status Breakdown */}
      {stats?.transactionsByStatus && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Transaction Status</h2>
          <div className="space-y-3">
            {stats.transactionsByStatus.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 capitalize">{item.status}</span>
                <span className="text-sm font-semibold text-gray-800">{item._count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Knowledge Base Page Component
const KnowledgeBasePage = () => {
  const [knowledge, setKnowledge] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({ title: '', content: '', category: '', tags: '', isActive: true });
  const { toast } = useToast();

  useEffect(() => {
    fetchKnowledge();
  }, []);

  const fetchKnowledge = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/knowledge`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setKnowledge(data);
      }
    } catch (err) {
      console.error('Error fetching knowledge:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({ title: '', content: '', category: '', tags: '', isActive: true });
    setShowModal(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      content: item.content,
      category: item.category || '',
      tags: item.tags?.join(', ') || '',
      isActive: item.isActive
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const token = getToken();
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
      };

      const url = editingItem 
        ? `${API_BASE_URL}/api/knowledge/${editingItem.id}`
        : `${API_BASE_URL}/api/knowledge`;
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast({ title: 'Success', description: `Knowledge base item ${editingItem ? 'updated' : 'created'} successfully.` });
        setShowModal(false);
        fetchKnowledge();
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to save knowledge base item.', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this knowledge base item?')) return;
    
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/knowledge/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        toast({ title: 'Success', description: 'Knowledge base item deleted successfully.' });
        fetchKnowledge();
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete knowledge base item.', variant: 'destructive' });
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Key className="w-6 h-6 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-800">Knowledge Base</h1>
        </div>
        <button onClick={handleCreate} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Knowledge
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {knowledge.map((item) => (
          <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">{item.title}</h3>
              <span className={`px-2 py-1 rounded text-xs ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                {item.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            {item.category && <p className="text-xs text-purple-600 mb-2">{item.category}</p>}
            <p className="text-sm text-gray-600 mb-4 line-clamp-3">{item.content}</p>
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {item.tags.map((tag: string, idx: number) => (
                  <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">{tag}</span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => handleEdit(item)} className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center justify-center gap-2">
                <Edit2 className="w-4 h-4" /> Edit
              </button>
              <button onClick={() => handleDelete(item.id)} className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{editingItem ? 'Edit' : 'Create'} Knowledge Base Item</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Title</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Content</label>
                <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={6} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Category</label>
                <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Tags (comma separated)</label>
                <input type="text" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} id="kbActive" />
                <label htmlFor="kbActive" className="text-sm">Active</label>
              </div>
              <div className="flex gap-2">
                <button onClick={handleSave} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> Save
                </button>
                <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Chatbot Settings Page Component
const ChatbotSettingsPage = () => {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSetting, setEditingSetting] = useState<any>(null);
  const [formData, setFormData] = useState({ key: '', value: '', description: '' });
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSetting(null);
    setFormData({ key: '', value: '', description: '' });
    setShowModal(true);
  };

  const handleEdit = (setting: any) => {
    setEditingSetting(setting);
    setFormData({
      key: setting.key,
      value: setting.value,
      description: setting.description || ''
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const token = getToken();
      const url = editingSetting 
        ? `${API_BASE_URL}/api/settings/${editingSetting.key}`
        : `${API_BASE_URL}/api/settings`;
      const method = editingSetting ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast({ title: 'Success', description: `Setting ${editingSetting ? 'updated' : 'created'} successfully.` });
        setShowModal(false);
        fetchSettings();
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to save setting.', variant: 'destructive' });
    }
  };

  const handleDelete = async (key: string) => {
    if (!window.confirm('Are you sure you want to delete this setting?')) return;
    
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/settings/${key}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        toast({ title: 'Success', description: 'Setting deleted successfully.' });
        fetchSettings();
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete setting.', variant: 'destructive' });
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SettingsIcon className="w-6 h-6 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-800">Chatbot Settings</h1>
        </div>
        <button onClick={handleCreate} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Setting
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {settings.map((setting) => (
              <tr key={setting.key} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{setting.key}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{setting.value}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{setting.description || '-'}</td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(setting)} className="text-purple-600 hover:text-purple-700">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(setting.key)} className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{editingSetting ? 'Edit' : 'Create'} Setting</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Key</label>
                <input 
                  type="text" 
                  value={formData.key} 
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                  disabled={!!editingSetting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Value</label>
                <textarea 
                  value={formData.value} 
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })} 
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Description</label>
                <input 
                  type="text" 
                  value={formData.description} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={handleSave} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> Save
                </button>
                <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState('dashboard');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const authData = getUser();
    if (!authData || !isAuthenticated()) {
      toast({ 
        title: 'Access Denied', 
        description: 'Please log in to access the admin dashboard.',
        variant: 'destructive'
      });
      navigate('/auth');
      return;
    }
    
    if (!isAdmin()) {
      toast({ 
        title: 'Access Denied', 
        description: 'You do not have admin privileges.',
        variant: 'destructive'
      });
      navigate('/chatbot');
      return;
    }
    
    setUser(authData);
    setLoading(false);
  }, [navigate, toast]);

  const handleLogout = () => {
    logout();
    toast({ title: 'Logged out', description: 'You have been successfully logged out.' });
    navigate('/');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chatflow', label: 'Chat flow', icon: MessageSquare },
    { id: 'intent', label: 'Intent', icon: Lightbulb },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'knowledge', label: 'Knowledge Based', icon: Key },
    { id: 'settings', label: 'Chatbot Settings', icon: SettingsIcon },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
  ];

  // Mock data
  const stats = [
    { label: 'Chat Sessions', value: '12,508', icon: MessageSquare, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Total Users', value: '11,432', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Total Messages', value: '26,235', icon: FileText, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: 'Avg. Session Time', value: '1h 30 min', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  const quickLinks = [
    { 
      title: 'Flows', 
      description: 'Manage flows by view, edit, and add.', 
      icon: Workflow, 
      onClick: () => setActivePage('chatflow') 
    },
    { 
      title: 'Intents', 
      description: 'You can view, edit or add new Intents.', 
      icon: Lightbulb, 
      onClick: () => setActivePage('intent') 
    },
    { 
      title: 'Knowledge Base', 
      description: 'Train your chatbot for better result.', 
      icon: Book, 
      onClick: () => setActivePage('knowledge') 
    },
    { 
      title: 'Chat History', 
      description: 'You can view the chat history.', 
      icon: History, 
      onClick: () => setActivePage('reports') 
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const ActiveIcon = navItems.find(item => item.id === activePage)?.icon || LayoutDashboard;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">C</span>
            </div>
            {sidebarOpen && <span className="text-gray-800 font-semibold">chatbot</span>}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  isActive
                    ? 'bg-purple-50 text-purple-600 border-r-2 border-purple-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-purple-600' : 'text-gray-500'}`} />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <HelpCircle className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Grid3x3 className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
            
            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg"
              >
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                {sidebarOpen && (
                  <>
                    <span className="text-sm font-medium text-gray-700">{user?.name || 'User'}</span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </>
                )}
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activePage === 'dashboard' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-lg ${stat.bg}`}>
                          <Icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</h3>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Trend Graph */}
                <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-800">Trend of User Sessions</h2>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium">
                        Last 7 Days
                      </button>
                      <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                        Month
                      </button>
                    </div>
                  </div>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => {
                      const heights = [15, 12, 30, 50, 38, 60, 55];
                      const height = (heights[index] / 100) * 100;
                      return (
                        <div key={day} className="flex-1 flex flex-col items-center">
                          <div className="w-full bg-purple-100 rounded-t-lg relative group">
                            <div
                              className="bg-purple-600 rounded-t-lg transition-all"
                              style={{ height: `${height}%` }}
                            >
                              {index === 3 && (
                                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-purple-600 rounded-full border-2 border-white"></div>
                              )}
                            </div>
                          </div>
                          <span className="text-xs text-gray-600 mt-2">{day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Links */}
                <div className="space-y-4">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Links</h2>
                    <div className="space-y-3">
                      {quickLinks.map((link, index) => {
                        const Icon = link.icon;
                        return (
                          <button
                            key={index}
                            onClick={link.onClick}
                            className="w-full p-4 bg-gray-50 hover:bg-purple-50 rounded-lg border border-gray-200 hover:border-purple-200 transition-all text-left group"
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200">
                                <Icon className="w-5 h-5 text-purple-600" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium text-gray-800 mb-1">{link.title}</h3>
                                <p className="text-xs text-gray-600">{link.description}</p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Help & Documentation */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Help & Documentation</h2>
                    <button className="w-full p-4 bg-gray-50 hover:bg-purple-50 rounded-lg border border-gray-200 hover:border-purple-200 transition-all text-left group">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200">
                          <FileCheck className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">
                            Click to view the documentation for understanding the flow and configuration for ease of use.
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pricing Page */}
          {activePage === 'pricing' && <PricingPage />}

          {/* Transactions Page */}
          {activePage === 'transactions' && <TransactionsPage />}

          {/* Chat Flow Page */}
          {activePage === 'chatflow' && <ChatFlowPage />}

          {/* Intent Page */}
          {activePage === 'intent' && <IntentPage />}

          {/* Reports Page */}
          {activePage === 'reports' && <ReportsPage />}

          {/* Knowledge Base Page */}
          {activePage === 'knowledge' && <KnowledgeBasePage />}

          {/* Chatbot Settings Page */}
          {activePage === 'settings' && <ChatbotSettingsPage />}
        </main>
      </div>
    </div>
  );
};

// Pricing Page Component
const PricingPage = () => {
  const [pricingPlans, setPricingPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', price: '', duration: 'monthly', features: '', isActive: true });
  const { toast } = useToast();

  useEffect(() => {
    fetchPricingPlans();
  }, []);

  const fetchPricingPlans = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/pricing`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPricingPlans(data);
      }
    } catch (err) {
      console.error('Error fetching pricing plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPlan(null);
    setFormData({ name: '', price: '', duration: 'monthly', features: '', isActive: true });
    setShowModal(true);
  };

  const handleEdit = (plan: any) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price.toString(),
      duration: plan.duration,
      features: plan.features.join('\n'),
      isActive: plan.isActive
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const token = getToken();
      const featuresArray = formData.features.split('\n').filter(f => f.trim());
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        features: featuresArray
      };

      const url = editingPlan 
        ? `${API_BASE_URL}/api/pricing/${editingPlan.id}`
        : `${API_BASE_URL}/api/pricing`;
      const method = editingPlan ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast({ title: 'Success', description: `Pricing plan ${editingPlan ? 'updated' : 'created'} successfully.` });
        setShowModal(false);
        fetchPricingPlans();
      } else {
        throw new Error('Failed to save');
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to save pricing plan.', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this pricing plan?')) return;
    
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/pricing/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        toast({ title: 'Success', description: 'Pricing plan deleted successfully.' });
        fetchPricingPlans();
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete pricing plan.', variant: 'destructive' });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DollarSign className="w-6 h-6 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-800">Pricing</h1>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Pricing Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pricingPlans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
              <span className={`px-2 py-1 rounded text-xs ${plan.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                {plan.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="mb-4">
              <span className="text-3xl font-bold text-gray-800">RWF {plan.price.toLocaleString()}</span>
              <span className="text-gray-600">/{plan.duration}</span>
            </div>
            <ul className="space-y-2 mb-4">
              {plan.features.map((feature: string, idx: number) => (
                <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-600 rounded-full"></span>
                  {feature}
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(plan)}
                className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center justify-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(plan.id)}
                className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{editingPlan ? 'Edit' : 'Create'} Pricing Plan</h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Price</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Duration</label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="lifetime">Lifetime</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Features (one per line)</label>
                <textarea
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  id="isActive"
                />
                <label htmlFor="isActive" className="text-sm">Active</label>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Transactions Page Component
const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [formData, setFormData] = useState({ userId: '', amount: '', type: 'subscription', status: 'pending', description: '' });
  const [users, setUsers] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchTransactions();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    // In a real app, you'd fetch users from an API
    // For now, we'll use mock data or get from auth
    setUsers([]);
  };

  const fetchTransactions = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/transactions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTransaction(null);
    setFormData({ userId: '', amount: '', type: 'subscription', status: 'pending', description: '' });
    setShowModal(true);
  };

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction);
    setFormData({
      userId: transaction.userId,
      amount: transaction.amount.toString(),
      type: transaction.type,
      status: transaction.status,
      description: transaction.description || ''
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const token = getToken();
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      const url = editingTransaction 
        ? `${API_BASE_URL}/api/transactions/${editingTransaction.id}`
        : `${API_BASE_URL}/api/transactions`;
      const method = editingTransaction ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast({ title: 'Success', description: `Transaction ${editingTransaction ? 'updated' : 'created'} successfully.` });
        setShowModal(false);
        fetchTransactions();
      } else {
        throw new Error('Failed to save');
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to save transaction.', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/transactions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        toast({ title: 'Success', description: 'Transaction deleted successfully.' });
        fetchTransactions();
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete transaction.', variant: 'destructive' });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CreditCard className="w-6 h-6 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Transaction
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{transaction.id.substring(0, 8)}...</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {transaction.user?.fullName || transaction.userId}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">RWF {transaction.amount.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-gray-900 capitalize">{transaction.type}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    transaction.status === 'completed' ? 'bg-green-100 text-green-700' :
                    transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {transaction.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(transaction)}
                      className="text-purple-600 hover:text-purple-700"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{editingTransaction ? 'Edit' : 'Create'} Transaction</h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">User ID</label>
                <input
                  type="text"
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Amount</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="subscription">Subscription</option>
                  <option value="payment">Payment</option>
                  <option value="refund">Refund</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
