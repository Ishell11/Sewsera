// src/app/pages/tailor/TailorDashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { TrendingUp, Briefcase, Star, Clock, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Layout } from '../../components/Layout';
import { useApp } from '../../context/AppContext';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const C = { primary: '#C4623F', dark: '#1A2B3C', teal: '#2A9D8F', gold: '#C89558', bg: '#F5F0E8' };

const STATUS_CONFIG = {
  in_progress: { label: 'In Progress', color: C.teal, bg: '#E8F8F6' },
  pending: { label: 'Pending', color: '#F59E0B', bg: '#FFFBEB' },
  completed: { label: 'Completed', color: '#10B981', bg: '#ECFDF5' },
};

interface Job {
  id: string;
  service: string;
  client: string;
  amount: number;
  status: string;
  progress: number;
  deadline: string;
}

interface Earning {
  day: string;
  amount: number;
}

// Sample weekly earnings (can be fetched from a separate collection or computed)
const EARNINGS_DATA = [
  { day: 'Mon', amount: 2500 },
  { day: 'Tue', amount: 3200 },
  { day: 'Wed', amount: 2800 },
  { day: 'Thu', amount: 4100 },
  { day: 'Fri', amount: 3800 },
  { day: 'Sat', amount: 2900 },
  { day: 'Sun', amount: 0 },
];

export default function TailorDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const weeklyTotal = EARNINGS_DATA.reduce((s, d) => s + d.amount, 0);
  const activeJobs = jobs.filter(j => j.status !== 'completed').length;

  useEffect(() => {
    if (!currentUser?.uid) return;
    const fetchTailorData = async () => {
      try {
        const jobsQuery = query(collection(db, 'jobs'), where('tailorId', '==', currentUser.uid));
        const jobsSnap = await getDocs(jobsQuery);
        const jobsList = jobsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
        setJobs(jobsList);
      } catch (error) {
        console.error("Error fetching tailor jobs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTailorData();
  }, [currentUser]);

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <div className="max-w-2xl mx-auto md:max-w-4xl px-4 md:px-8 py-5">
        {/* Welcome */}
        <div className="mb-5">
          <p className="text-sm text-gray-500">Good day,</p>
          <h2 className="text-xl" style={{ color: C.dark }}>Welcome, {currentUser?.name?.split(' ')[0]}!</h2>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'This Week', value: `₱${weeklyTotal.toLocaleString()}`, icon: <TrendingUp size={18} />, color: C.primary, bg: '#FDF5F2' },
            { label: 'Active Jobs', value: activeJobs, icon: <Briefcase size={18} />, color: C.teal, bg: '#E8F8F6' },
            { label: 'Avg. Rating', value: '4.9★', icon: <Star size={18} />, color: C.gold, bg: '#FDF7EC' },
            { label: 'Response', value: '< 1 hr', icon: <Clock size={18} />, color: C.dark, bg: '#F5F0E8' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg, color: s.color }}>
                {s.icon}
              </div>
              <p className="text-xl" style={{ color: C.dark }}>{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Earnings Chart */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 style={{ color: C.dark }}>Weekly Earnings</h3>
              <p className="text-xs text-gray-400 mt-0.5">₱{weeklyTotal.toLocaleString()} this week</p>
            </div>
            <div className="px-2 py-1 rounded-lg bg-green-50 text-green-600 text-xs flex items-center gap-1">
              <TrendingUp size={11} /> +12%
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={EARNINGS_DATA} barSize={28}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <YAxis hide />
              <Tooltip
                formatter={(v: number) => [`₱${v.toLocaleString()}`, 'Earnings']}
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
              />
              <Bar dataKey="amount" fill={C.primary} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Jobs */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ color: C.dark }}>Recent Jobs</h3>
            <button onClick={() => navigate('/tailor/jobs')} className="flex items-center gap-1 text-sm" style={{ color: C.primary }}>
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {jobs.slice(0, 3).map(job => {
              const cfg = STATUS_CONFIG[job.status as keyof typeof STATUS_CONFIG];
              return (
                <div key={job.id} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm" style={{ color: C.dark }}>{job.service}</p>
                      <p className="text-xs text-gray-400">{job.client}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm" style={{ color: C.primary }}>₱{job.amount.toLocaleString()}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                  {job.status === 'in_progress' && (
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{job.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${job.progress}%`, background: C.teal }} />
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2">Due: {job.deadline}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}