import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Download, FileText, BookOpen, GraduationCap, FileQuestion } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type DigitalResource = Database['public']['Tables']['digital_resources']['Row'];

const resourceTypeIcons = {
  ebook: BookOpen,
  journal: FileText,
  past_question: FileQuestion,
  lecture_note: GraduationCap,
};

export function ELibrary() {
  const { profile } = useAuth();
  const [resources, setResources] = useState<DigitalResource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      const { data, error } = await supabase
        .from('digital_resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('Error loading resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (resource: DigitalResource) => {
    if (!profile) return;

    try {
      await supabase.from('resource_access_logs').insert({
        resource_id: resource.id,
        user_id: profile.id,
        access_type: 'download',
      });

      await supabase
        .from('digital_resources')
        .update({ download_count: resource.download_count + 1 })
        .eq('id', resource.id);

      window.open(resource.file_url, '_blank');
    } catch (error) {
      console.error('Error logging download:', error);
    }
  };

  const categories = ['all', ...new Set(resources.map(r => r.category))];
  const types = [
    { value: 'all', label: 'All Types' },
    { value: 'ebook', label: 'E-Books' },
    { value: 'journal', label: 'Journals' },
    { value: 'past_question', label: 'Past Questions' },
    { value: 'lecture_note', label: 'Lecture Notes' },
  ];

  const filteredResources = resources.filter(resource => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (resource.course_code && resource.course_code.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || resource.resource_type === selectedType;
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">E-Library</h2>
        <p className="text-gray-600">Access digital resources anytime, anywhere</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-3 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by title, author, or course code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002F6C] focus:border-transparent outline-none"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002F6C] focus:border-transparent outline-none"
          >
            {types.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002F6C] focus:border-transparent outline-none"
          >
            <option value="all">All Categories</option>
            {categories.slice(1).map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002F6C]"></div>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No resources found matching your criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map(resource => {
              const Icon = resourceTypeIcons[resource.resource_type];
              return (
                <div
                  key={resource.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition"
                >
                  <div className="flex gap-4 mb-4">
                    <div className="w-16 h-20 bg-gradient-to-br from-[#002F6C] to-[#004a9c] rounded flex items-center justify-center flex-shrink-0">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                        {resource.title}
                      </h3>
                      <p className="text-sm text-gray-600">{resource.author}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {resource.resource_type.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                        {resource.category}
                      </span>
                    </div>

                    {resource.course_code && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Course:</span> {resource.course_code}
                      </p>
                    )}

                    {resource.department && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Department:</span> {resource.department}
                      </p>
                    )}

                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      {resource.download_count} downloads
                    </p>
                  </div>

                  {resource.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {resource.description}
                    </p>
                  )}

                  <button
                    onClick={() => handleDownload(resource)}
                    className="w-full bg-[#002F6C] text-white py-2 rounded-lg hover:bg-[#001f4d] transition flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {types.slice(1).map(type => {
          const Icon = resourceTypeIcons[type.value as keyof typeof resourceTypeIcons];
          const count = resources.filter(r => r.resource_type === type.value).length;
          return (
            <div
              key={type.value}
              className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition"
              onClick={() => setSelectedType(type.value)}
            >
              <Icon className="w-8 h-8 text-[#002F6C] mb-2" />
              <p className="text-sm font-medium text-gray-900">{type.label}</p>
              <p className="text-2xl font-bold text-gray-900">{count}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
