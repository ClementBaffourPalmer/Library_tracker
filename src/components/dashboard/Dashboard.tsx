import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Clock, BookOpen, Download, Calendar, CheckCircle } from 'lucide-react';

export function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    activeLoans: 0,
    resourcesAccessed: 0,
    lastCheckIn: null as string | null,
    dueBooks: 0,
  });
  const [checkedIn, setCheckedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    if (!profile) return;

    try {
      const [loansData, accessLogsData, attendanceData] = await Promise.all([
        supabase
          .from('book_loans')
          .select('*')
          .eq('user_id', profile.id)
          .eq('status', 'borrowed'),
        supabase
          .from('resource_access_logs')
          .select('*')
          .eq('user_id', profile.id),
        supabase
          .from('attendance_logs')
          .select('*')
          .eq('user_id', profile.id)
          .order('check_in_time', { ascending: false })
          .limit(1),
      ]);

      const activeLoans = loansData.data?.length || 0;
      const dueBooks = loansData.data?.filter(loan => {
        const dueDate = new Date(loan.due_date);
        const today = new Date();
        return dueDate < today;
      }).length || 0;

      const lastCheckIn = attendanceData.data?.[0]?.check_in_time || null;
      const isCheckedIn = attendanceData.data?.[0]?.check_out_time === null;

      setStats({
        activeLoans,
        resourcesAccessed: accessLogsData.data?.length || 0,
        lastCheckIn,
        dueBooks,
      });
      setCheckedIn(isCheckedIn);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('attendance_logs')
        .insert({
          user_id: profile.id,
          purpose: 'Study',
        });

      if (error) throw error;

      setCheckedIn(true);
      loadDashboardData();
    } catch (error) {
      console.error('Error checking in:', error);
    }
  };

  const handleCheckOut = async () => {
    if (!profile) return;

    try {
      const { data: latestLog } = await supabase
        .from('attendance_logs')
        .select('*')
        .eq('user_id', profile.id)
        .is('check_out_time', null)
        .order('check_in_time', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!latestLog) return;

      const { error } = await supabase
        .from('attendance_logs')
        .update({ check_out_time: new Date().toISOString() })
        .eq('id', latestLog.id);

      if (error) throw error;

      setCheckedIn(false);
      loadDashboardData();
    } catch (error) {
      console.error('Error checking out:', error);
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
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          Welcome back, {profile?.full_name}!
        </h2>
        <p className="text-gray-600">
          {profile?.role === 'student' ? `Student ID: ${profile.student_id}` : `Staff ID: ${profile.staff_id}`}
        </p>
      </div>

      <div className="bg-gradient-to-r from-[#002F6C] to-[#004a9c] rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Library Attendance</h3>
            <p className="text-sm text-gray-200">
              {checkedIn ? 'You are currently checked in' : 'Check in to track your library visit'}
            </p>
            {stats.lastCheckIn && (
              <p className="text-xs text-gray-300 mt-1">
                Last visit: {new Date(stats.lastCheckIn).toLocaleString()}
              </p>
            )}
          </div>
          <button
            onClick={checkedIn ? handleCheckOut : handleCheckIn}
            className={`px-6 py-3 rounded-lg font-medium transition flex items-center gap-2 ${
              checkedIn
                ? 'bg-white text-[#002F6C] hover:bg-gray-100'
                : 'bg-[#C8102E] text-white hover:bg-[#a00d24]'
            }`}
          >
            {checkedIn ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Check Out
              </>
            ) : (
              <>
                <Clock className="w-5 h-5" />
                Check In
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-[#002F6C]" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Active Loans</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.activeLoans}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Download className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Resources Accessed</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.resourcesAccessed}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Due Soon</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.dueBooks}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <Clock className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Status</h3>
          <p className="text-lg font-semibold text-gray-900">
            {checkedIn ? 'Checked In' : 'Not in Library'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition">
              Browse Physical Books
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition">
              Explore E-Library
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition">
              View My Loans
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition">
              Search Resources
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-[#002F6C] rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Library Check-in</p>
                <p className="text-xs text-gray-500">
                  {stats.lastCheckIn
                    ? new Date(stats.lastCheckIn).toLocaleString()
                    : 'No recent activity'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
