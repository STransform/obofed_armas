'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import axiosInstance from '@/lib/axios';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { getMessages, type Lang } from '@/lib/messages';
import { preloadTranslations } from '@/hooks/useTranslation';

const EMPTY_GLOBAL_STATS = {
    totalOrganizations: 0,
    totalReportTypes: 0,
    totalUsers: 0,
};

const COLORS = ['#013A6B', '#dc3545'];

export default function Dashboard() {
    const { isAuthenticated, userRole, logout } = useAuth();

    // Core data state
    const [globalStats, setGlobalStats] = useState(EMPTY_GLOBAL_STATS);
    const [budgetYears, setBudgetYears] = useState<any[]>([]);
    const [selectedFiscalYear, setSelectedFiscalYear] = useState('');
    const [reportTypeStats, setReportTypeStats] = useState<any>({});

    const [lang, setLang] = useState<Lang>('en');
    useEffect(() => {
        const s = localStorage.getItem('armas_lang') as Lang | null;
        if (s && (s === 'en' || s === 'am' || s === 'om')) setLang(s);
        const handler = () => {
            const v = localStorage.getItem('armas_lang') as Lang | null;
            if (v && (v === 'en' || v === 'am' || v === 'om')) setLang(v);
        };
        window.addEventListener('storage', handler);
        return () => window.removeEventListener('storage', handler);
    }, []);

    useEffect(() => {
        preloadTranslations(lang);
        preloadTranslations('en');
    }, [lang]);
    const msgs = getMessages(lang);

    // UI state
    const [globalLoading, setGlobalLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initial mount fetches
    useEffect(() => {
        if (!isAuthenticated) return;

        let isMounted = true;
        setGlobalLoading(true);

        const fetchGlobalData = async () => {
            try {
                const [statsRes, yearsRes] = await Promise.all([
                    axiosInstance.get('/transactions/global-stats').catch(() => ({ data: EMPTY_GLOBAL_STATS })),
                    axiosInstance.get('/transactions/budget-years').catch(() => ({ data: [] }))
                ]);

                if (isMounted) {
                    setGlobalStats(statsRes.data || EMPTY_GLOBAL_STATS);

                    const years = Array.isArray(yearsRes.data) ? yearsRes.data : [];
                    setBudgetYears(years);
                    if (years.length > 0) {
                        setSelectedFiscalYear(years[0].fiscalYear);
                    }
                }
            } catch (err: any) {
                if (isMounted) setError('Failed to load global data: ' + err.message);
            } finally {
                if (isMounted) setGlobalLoading(false);
            }
        };

        fetchGlobalData();
        return () => { isMounted = false; };
    }, [isAuthenticated]);

    // Fetch stats for specific fiscal year
    useEffect(() => {
        if (!selectedFiscalYear || !isAuthenticated) return;

        let isMounted = true;
        setStatsLoading(true);

        axiosInstance.get(`/transactions/dashboard-stats?fiscalYear=${selectedFiscalYear}`)
            .then((res) => {
                if (isMounted) {
                    setReportTypeStats(res.data?.reportTypeStats || {});
                    setError(null);
                }
            })
            .catch((err) => {
                if (isMounted) {
                    setReportTypeStats({});
                    let msg = 'Failed to load specific stats.';
                    if (err.response?.status === 404) msg = `No statistics available for ${selectedFiscalYear}`;
                    if (err.response?.status === 403) msg = `Permission denied.`;
                    setError(msg);
                }
            })
            .finally(() => {
                if (isMounted) setStatsLoading(false);
            });

        return () => { isMounted = false; };
    }, [selectedFiscalYear, isAuthenticated]);

    if (!isAuthenticated) return null;

    if (globalLoading) {
        return (
            <div className="flex h-screen bg-gray-50 overflow-hidden">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header />
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-gray-500 text-lg animate-pulse">Loading ARMAS ecosystem...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-8 max-w-7xl w-full mx-auto">
                    {/* Header Section */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">{msgs.dashboard.welcome}, {userRole}</h1>
                        <p className="text-gray-500 mt-2">{msgs.dashboard.execOverview}</p>
                    </div>

                    {error && budgetYears.length === 0 && (
                        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-md border border-red-200">
                            {error}
                        </div>
                    )}

                    {/* Global Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-600 transition hover:-translate-y-1">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{msgs.dashboard.totalOrgs}</h3>
                            <p className="text-4xl font-extrabold text-gray-900 mt-2">{globalStats.totalOrganizations}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emerald-500 transition hover:-translate-y-1">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{msgs.dashboard.totalReportTypes}</h3>
                            <p className="text-4xl font-extrabold text-gray-900 mt-2">{globalStats.totalReportTypes}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-amber-500 transition hover:-translate-y-1">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{msgs.dashboard.activeUsers}</h3>
                            <p className="text-4xl font-extrabold text-gray-900 mt-2">{globalStats.totalUsers}</p>
                        </div>
                    </div>

                    {/* Filters Row */}
                    <div className="bg-white rounded-lg shadow p-6 mb-8 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">{msgs.dashboard.fiscalAnalysis}</h2>
                            <p className="text-sm text-gray-500">{msgs.dashboard.fiscalDesc}</p>
                        </div>
                        <div className="w-64">
                            <label className="block text-sm font-medium text-gray-700 mb-1">{msgs.dashboard.selectYear}</label>
                            <select
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                value={selectedFiscalYear}
                                onChange={(e) => setSelectedFiscalYear(e.target.value)}
                                disabled={budgetYears.length === 0 || statsLoading}
                            >
                                {budgetYears.length === 0 && <option value="">No years found</option>}
                                {budgetYears.map((b_year) => (
                                    <option key={b_year.id} value={b_year.fiscalYear}>
                                        {b_year.fiscalYear} ({b_year.startDate} - {b_year.endDate})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Charts Area */}
                    {statsLoading ? (
                        <div className="h-64 flex items-center justify-center">
                            <p className="text-gray-500 animate-pulse">Loading stats for {selectedFiscalYear}...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-amber-50 text-amber-800 p-4 rounded-md border border-amber-200 text-center">
                            {error}
                        </div>
                    ) : Object.keys(reportTypeStats).length === 0 ? (
                        <div className="text-center p-12 bg-white rounded-lg shadow text-gray-500 border border-dashed">
                            No report type data available for this fiscal year.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-8">
                            {Object.entries(reportTypeStats).map(([reportType, counts]: any, index) => {
                                const chartData = [
                                    { name: 'Senders', value: counts.senders || 0 },
                                    { name: 'Non-Senders', value: counts.nonSenders || 0 }
                                ];

                                return (
                                    <div key={index} className="bg-white rounded-lg shadow overflow-hidden">
                                        <div className="bg-slate-50 border-b px-6 py-4">
                                            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                                <span className="w-2 h-6 bg-indigo-500 rounded mr-3"></span>
                                                {reportType} Compliance
                                            </h3>
                                        </div>
                                        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            {/* Bar Chart */}
                                            <div className="h-72">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                                        <YAxis axisLine={false} tickLine={false} />
                                                        <RechartsTooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                                            {chartData.map((entry, idx) => (
                                                                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>

                                            {/* Pie Chart */}
                                            <div className="h-72">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={chartData}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={60}
                                                            outerRadius={100}
                                                            paddingAngle={5}
                                                            dataKey="value"
                                                        >
                                                            {chartData.map((entry, idx) => (
                                                                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                                        <Legend verticalAlign="bottom" height={36} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
