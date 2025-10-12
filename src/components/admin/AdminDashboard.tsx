import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, BookOpen, Download, Clock, TrendingUp, Calendar } from 'lucide-react';

interface Stats {
  totalUsers: number;
  activeLoans: number;
  totalBooks: number;
  todayCheckIns: number;
  totalResources: number;
  totalDownloads: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeLoans: 0,
    totalBooks: 0,
    todayCheckIns: 0,
    totalResources: 0,
    totalDownloads: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminStats();
    loadRecentActivity();
  }, []);

  const loadAdminStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [
        usersData,
        loansData,
        booksData,
        attendanceData,
        resourcesData,
        downloadsData,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase
          .from('book_loans')
          .select('id', { count: 'exact' })
          .eq('status', 'borrowed'),
        supabase.from('physical_books').select('id', { count: 'exact' }),
        supabase
          .from('attendance_logs')
          .select('id', { count: 'exact' })
          .gte('check_in_time', today.toISOString()),
        supabase.from('digital_resources').select('id', { count: 'exact' }),
        supabase.from('resource_access_logs').select('id', { count: 'exact' }),
      ]);

      setStats({
        totalUsers: usersData.count || 0,
        activeLoans: loansData.count || 0,
        totalBooks: booksData.count || 0,
        todayCheckIns: attendanceData.count || 0,
        totalResources: resourcesData.count || 0,
        totalDownloads: downloadsData.count || 0,
      });
    } catch (error) {
      console.error('Error loading admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivity = async () => {
    try {
      const { data: attendance } = await supabase
        .from('attendance_logs')
        .select('*, profiles(full_name)')
        .order('check_in_time', { ascending: false })
        .limit(5);

      setRecentActivity(attendance || []);
    } catch (error) {
      console.error('Error loading recent activity:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002F6C]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
        <p className="text-gray-600">Overview of library operations and analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-[#002F6C]" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Users</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Active Loans</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.activeLoans}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Books</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalBooks}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <Clock className="w-6 h-6 text-red-600" />
            </div>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Today's Check-ins</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.todayCheckIns}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Digital Resources</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalResources}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-teal-100 rounded-lg">
              <Download className="w-6 h-6 text-teal-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Downloads</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalDownloads}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Library Check-ins</h3>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No recent activity</p>
            ) : (
              recentActivity.map(activity => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#002F6C] rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {(activity.profiles as any)?.full_name || 'Unknown User'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.check_in_time).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-600">{activity.purpose || 'Study'}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-[#002F6C] text-white rounded-lg hover:bg-[#001f4d] transition">
              Manage Physical Books
            </button>
            <button className="w-full text-left px-4 py-3 bg-[#002F6C] text-white rounded-lg hover:bg-[#001f4d] transition">
              Manage Digital Resources
            </button>
            <button className="w-full text-left px-4 py-3 bg-[#002F6C] text-white rounded-lg hover:bg-[#001f4d] transition">
              View All Loans
            </button>
            <button className="w-full text-left px-4 py-3 bg-[#002F6C] text-white rounded-lg hover:bg-[#001f4d] transition">
              Generate Reports
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#002F6C] to-[#004a9c] rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">System Health</h3>
            <p className="text-sm text-gray-200">All systems operational</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">99.9%</div>
            <p className="text-sm text-gray-200">Uptime</p>
          </div>
        </div>
      </div>
    </div>
  );
}
