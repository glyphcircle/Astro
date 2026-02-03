import React, { useState, useEffect } from 'react';
import supabase from '../services/supabaseClient'; // ✅ CORRECT IMPORT PATH

interface ReportTemplate {
  id: number;
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
  content_area_config: any;
  created_at: string;
  updated_at: string;
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

  // Fetch templates
  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('report_formats')
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

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchTemplates(), fetchPreferences()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Toggle template active status
  const toggleTemplateStatus = async (id: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('report_formats')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      await fetchTemplates(); // Refresh
    } catch (err: any) {
      setError(`Error updating template: ${err.message}`);
    }
  };

  // Toggle default template
  const setDefaultTemplate = async (id: number) => {
    try {
      // First, set all templates to non-default
      await supabase
        .from('report_formats')
        .update({ is_default: false })
        .neq('id', 0); // Update all

      // Then set the selected one as default
      const { error } = await supabase
        .from('report_formats')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;
      await fetchTemplates(); // Refresh
    } catch (err: any) {
      setError(`Error setting default: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-amber-800 mb-6">
        📄 Report Template Manager
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-300">
        <button
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'templates'
              ? 'border-b-2 border-amber-600 text-amber-800'
              : 'text-gray-600 hover:text-amber-700'
          }`}
          onClick={() => setActiveTab('templates')}
        >
          📋 Templates ({templates.length})
        </button>
        <button
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'preferences'
              ? 'border-b-2 border-amber-600 text-amber-800'
              : 'text-gray-600 hover:text-amber-700'
          }`}
          onClick={() => setActiveTab('preferences')}
        >
          ⚙️ User Preferences ({preferences.length})
        </button>
      </div>

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`bg-white rounded-lg shadow-lg overflow-hidden border-2 ${
                  template.is_default
                    ? 'border-amber-500'
                    : template.is_active
                    ? 'border-gray-200'
                    : 'border-red-300 opacity-60'
                }`}
              >
                {/* Template Image Preview */}
                <div className="relative h-64 bg-gray-100">
                  <img
                    src={template.thumbnail_url || template.template_image_url}
                    alt={template.template_name}
                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setSelectedTemplate(template)}
                  />
                  {template.is_default && (
                    <div className="absolute top-2 right-2 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      ⭐ DEFAULT
                    </div>
                  )}
                  {template.is_premium && (
                    <div className="absolute top-2 left-2 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                      👑 PREMIUM
                    </div>
                  )}
                  {!template.is_active && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">INACTIVE</span>
                    </div>
                  )}
                </div>

                {/* Template Info */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    {template.template_name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2 font-mono">
                    {template.template_code}
                  </p>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {template.description}
                  </p>

                  {/* Metadata */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {template.category}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      Order: {template.display_order}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleTemplateStatus(template.id, template.is_active)}
                      className={`flex-1 px-3 py-2 rounded text-sm font-semibold ${
                        template.is_active
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {template.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    {!template.is_default && template.is_active && (
                      <button
                        onClick={() => setDefaultTemplate(template.id)}
                        className="flex-1 px-3 py-2 bg-amber-100 text-amber-700 rounded text-sm font-semibold hover:bg-amber-200"
                      >
                        Set Default
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Template ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Custom Settings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {preferences.map((pref) => (
                <tr key={pref.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {pref.user_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {pref.report_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {pref.template_id || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <pre className="text-xs bg-gray-50 p-2 rounded max-w-xs overflow-auto">
                      {JSON.stringify(pref.custom_settings, null, 2)}
                    </pre>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(pref.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedTemplate && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedTemplate(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden">
            <button
              onClick={() => setSelectedTemplate(null)}
              className="absolute top-4 right-4 bg-white text-gray-800 rounded-full w-10 h-10 flex items-center justify-center font-bold text-xl hover:bg-gray-100 z-10"
            >
              ×
            </button>
            <img
              src={selectedTemplate.template_image_url}
              alt={selectedTemplate.template_name}
              className="w-full h-full object-contain"
            />
            <div className="p-4 bg-white">
              <h3 className="text-xl font-bold text-gray-800">
                {selectedTemplate.template_name}
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                {selectedTemplate.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportTemplateManager;
