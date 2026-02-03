import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import Card from './shared/Card';
import Modal from './shared/Modal';
import Button from './shared/Button';

interface ReportTemplate {
  id?: number;
  template_name: string;
  template_code: string;
  template_image_url: string;
  thumbnail_url: string | null;
  description: string;
  category: string;
  is_active: boolean;
  is_default: boolean;
  is_premium: boolean;
  display_order: number;
  content_area_config?: any;
}

interface UserReportPreference {
  id: number;
  user_id: string;
  template_id: number | null;
  report_type: string;
  custom_settings: any;
  created_at: string;
  updated_at: string;
}

const ReportTemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [preferences, setPreferences] = useState<UserReportPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'templates' | 'preferences'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  
  // Create/Edit State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formTemplate, setFormTemplate] = useState<ReportTemplate | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // --- UTILITY: GOOGLE DRIVE URL CONVERTER ---
  const convertDriveUrl = (url: string): string => {
    if (!url || !url.includes('drive.google.com')) return url;
    
    // Extract ID using multiple patterns
    const idMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                    url.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
                    url.match(/\/d\/([a-zA-Z0-9_-]+)\//);
                    
    if (idMatch && idMatch[1]) {
      const embedUrl = `https://drive.google.com/uc?export=view&id=${idMatch[1]}`;
      if (url !== embedUrl) {
        showToast("✓ URL converted to embeddable format");
        return embedUrl;
      }
    }
    return url;
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch templates
  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('report_templates')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setTemplates(data || []);
    } catch (err: any) {
      setError(`Error fetching templates: ${err.message}`);
      console.error(err);
    }
  };

  // Fetch preferences
  const fetchPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('user_report_preferences')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPreferences(data || []);
    } catch (err: any) {
      setError(`Error fetching preferences: ${err.message}`);
      console.error(err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchTemplates(), fetchPreferences()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const toggleTemplateStatus = async (id: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('report_templates')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      await fetchTemplates();
    } catch (err: any) {
      setError(`Error updating template: ${err.message}`);
    }
  };

  const setDefaultTemplate = async (id: number) => {
    try {
      await supabase.from('report_templates').update({ is_default: false }).neq('id', 0);
      const { error } = await supabase.from('report_templates').update({ is_default: true }).eq('id', id);
      if (error) throw error;
      await fetchTemplates();
    } catch (err: any) {
      setError(`Error setting default: ${err.message}`);
    }
  };

  const handleOpenForm = (template: ReportTemplate | null = null) => {
    setFormTemplate(template || {
      template_name: '',
      template_code: '',
      template_image_url: '',
      thumbnail_url: '',
      description: '',
      category: 'General',
      is_active: true,
      is_default: false,
      is_premium: false,
      display_order: templates.length + 1
    });
    setIsFormOpen(true);
  };

  const handleSaveTemplate = async () => {
    if (!formTemplate) return;
    setLoading(true);
    try {
      const { id, ...payload } = formTemplate;
      let res;
      if (id) {
        res = await supabase.from('report_templates').update(payload).eq('id', id);
      } else {
        res = await supabase.from('report_templates').insert([payload]);
      }
      if (res.error) throw res.error;
      setIsFormOpen(false);
      await fetchTemplates();
      showToast("✓ Template Manifested");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && templates.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-10 right-10 z-[100] bg-green-900 border border-green-400 text-white px-6 py-3 rounded-full shadow-2xl animate-fade-in-up font-bold">
          {toast}
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-amber-500 font-cinzel tracking-widest uppercase">
          📄 Decree Template Manager
        </h1>
        <Button onClick={() => handleOpenForm()} className="bg-amber-600 hover:bg-amber-500">
          + New Template
        </Button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-700">
        <button
          className={`px-6 py-3 font-semibold transition-colors uppercase text-xs tracking-widest ${
            activeTab === 'templates'
              ? 'border-b-2 border-amber-500 text-amber-500'
              : 'text-gray-500 hover:text-amber-200'
          }`}
          onClick={() => setActiveTab('templates')}
        >
          📋 Templates ({templates.length})
        </button>
        <button
          className={`px-6 py-3 font-semibold transition-colors uppercase text-xs tracking-widest ${
            activeTab === 'preferences'
              ? 'border-b-2 border-amber-500 text-amber-500'
              : 'text-gray-500 hover:text-amber-200'
          }`}
          onClick={() => setActiveTab('preferences')}
        >
          ⚙️ User Preferences ({preferences.length})
        </button>
      </div>

      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map((template) => (
            <Card
              key={template.id}
              className={`overflow-hidden border-2 transition-all ${
                template.is_default ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'border-gray-800'
              }`}
            >
              <div className="relative h-56 bg-black group">
                <img
                  src={template.thumbnail_url || template.template_image_url}
                  alt={template.template_name}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                
                <div className="absolute top-2 right-2 flex gap-2">
                  {template.is_default && (
                    <span className="bg-amber-500 text-black px-2 py-0.5 rounded text-[9px] font-black uppercase">Default</span>
                  )}
                  {template.is_premium && (
                    <span className="bg-purple-600 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase">Premium</span>
                  )}
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-cinzel font-black text-amber-100 mb-1 truncate">{template.template_name}</h3>
                <p className="text-[10px] text-gray-500 font-mono mb-3">{template.template_code}</p>
                <p className="text-xs text-gray-400 font-lora mb-5 line-clamp-2 italic">{template.description}</p>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenForm(template)}
                    className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-amber-200 text-[10px] font-black uppercase tracking-widest rounded transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleTemplateStatus(template.id!, template.is_active)}
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded transition-all ${
                      template.is_active ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40' : 'bg-green-900/20 text-green-400 hover:bg-green-900/40'
                    }`}
                  >
                    {template.is_active ? 'Disable' : 'Enable'}
                  </button>
                </div>
                {!template.is_default && template.is_active && (
                  <button
                    onClick={() => setDefaultTemplate(template.id!)}
                    className="w-full mt-2 py-2 bg-amber-900/20 text-amber-500 text-[9px] font-black uppercase tracking-widest rounded border border-amber-500/20 hover:bg-amber-900/40"
                  >
                    Set as Default
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* FORM MODAL */}
      <Modal isVisible={isFormOpen} onClose={() => setIsFormOpen(false)}>
        <div className="p-8 bg-[#0F0F23] text-amber-50 font-lora max-h-[90vh] overflow-y-auto custom-scrollbar border border-amber-500/30 rounded-xl">
          <h2 className="text-2xl font-cinzel font-black text-amber-400 mb-6 uppercase tracking-widest">
            {formTemplate?.id ? 'Edit Decree Format' : 'Manifest New Format'}
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-black tracking-widest text-gray-500 mb-1">Name</label>
              <input 
                className="w-full bg-black border border-gray-800 rounded p-3 text-sm focus:border-amber-500 outline-none"
                value={formTemplate?.template_name || ''}
                onChange={e => setFormTemplate(prev => prev ? ({...prev, template_name: e.target.value}) : null)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-black tracking-widest text-gray-500 mb-1">Unique Code</label>
                <input 
                  className="w-full bg-black border border-gray-800 rounded p-3 text-xs font-mono focus:border-amber-500 outline-none"
                  value={formTemplate?.template_code || ''}
                  onChange={e => setFormTemplate(prev => prev ? ({...prev, template_code: e.target.value.toUpperCase()}) : null)}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-black tracking-widest text-gray-500 mb-1">Category</label>
                <input 
                  className="w-full bg-black border border-gray-800 rounded p-3 text-xs focus:border-amber-500 outline-none"
                  value={formTemplate?.category || ''}
                  onChange={e => setFormTemplate(prev => prev ? ({...prev, category: e.target.value}) : null)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-black tracking-widest text-gray-500 mb-1">Image URL (Main)</label>
              <input 
                className="w-full bg-black border border-gray-800 rounded p-3 text-xs focus:border-amber-500 outline-none"
                value={formTemplate?.template_image_url || ''}
                onChange={e => setFormTemplate(prev => prev ? ({...prev, template_image_url: e.target.value}) : null)}
                onBlur={e => setFormTemplate(prev => prev ? ({...prev, template_image_url: convertDriveUrl(e.target.value)}) : null)}
                placeholder="Google Drive, Unsplash, or CDN link"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-black tracking-widest text-gray-500 mb-1">Thumbnail URL (Optional)</label>
              <input 
                className="w-full bg-black border border-gray-800 rounded p-3 text-xs focus:border-amber-500 outline-none"
                value={formTemplate?.thumbnail_url || ''}
                onChange={e => setFormTemplate(prev => prev ? ({...prev, thumbnail_url: e.target.value}) : null)}
                onBlur={e => setFormTemplate(prev => prev ? ({...prev, thumbnail_url: convertDriveUrl(e.target.value)}) : null)}
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-black tracking-widest text-gray-500 mb-1">Description</label>
              <textarea 
                className="w-full bg-black border border-gray-800 rounded p-3 text-xs h-20 focus:border-amber-500 outline-none"
                value={formTemplate?.description || ''}
                onChange={e => setFormTemplate(prev => prev ? ({...prev, description: e.target.value}) : null)}
              />
            </div>

            <div className="flex gap-6 items-center py-4 border-t border-gray-800">
               <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formTemplate?.is_premium || false}
                    onChange={e => setFormTemplate(prev => prev ? ({...prev, is_premium: e.target.checked}) : null)}
                    className="accent-amber-500"
                  />
                  <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Premium Decree</span>
               </label>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <Button onClick={handleSaveTemplate} className="flex-1 bg-amber-600 hover:bg-amber-500 uppercase tracking-[0.2em] text-[10px]">
              Commit to Registry
            </Button>
            <button onClick={() => setIsFormOpen(false)} className="px-6 text-xs text-gray-500 uppercase font-bold">
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <Card className="bg-black/40 border-gray-800 rounded-xl overflow-hidden">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Seeker ID</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Protocol</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Config</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-amber-100/70">
              {preferences.map((pref) => (
                <tr key={pref.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-xs font-mono truncate max-w-[150px]">{pref.user_id}</td>
                  <td className="px-6 py-4">
                    <span className="bg-amber-900/40 text-amber-400 px-2 py-1 rounded text-[9px] font-black uppercase tracking-tighter border border-amber-500/20">
                      {pref.report_type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <pre className="text-[9px] bg-black/60 p-2 rounded max-w-xs overflow-auto font-mono text-cyan-400">
                      {JSON.stringify(pref.custom_settings, null, 2)}
                    </pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};

export default ReportTemplateManager;
