'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import axiosInstance from '@/lib/axios';
import { Search, Download, RefreshCw } from 'lucide-react';

const downloadFile = async (id: string | number, type: string) => {
    return axiosInstance.get(`/transactions/download/${id}/${type}`, {
        responseType: 'blob'
    });
};

export default function FileHistoryPage() {
    const { isAuthenticated } = useAuth();

    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterText, setFilterText] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchHistory();
    }, [isAuthenticated]);

    const fetchHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axiosInstance.get('/transactions/history');
            const valid = Array.isArray(res.data) ? res.data.filter(i => i && i.id) : [];
            setHistory(valid);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to load file history');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (id: number, docname: string) => {
        try {
            const res = await downloadFile(id, 'original');
            const blob = new Blob([res.data]);
            if (blob.size === 0) throw new Error('Empty file received');

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = docname || 'file';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err: any) {
            alert('Failed to download document: ' + (err.message || 'Error'));
        }
    };

    const filtered = history.filter(r =>
        (r.orgname || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (r.reportype || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (r.createdBy || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (r.reportstatus || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (r.fiscal_year || r.fiscalYear || '').toString().toLowerCase().includes(filterText.toLowerCase())
    );

    if (!isAuthenticated) return <div className="p-8">Please log in.</div>;

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-8 max-w-7xl w-full mx-auto">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">File History</h1>
                            <p className="text-sm text-gray-500 mt-1">Review the audit trail of all transactions and uploaded reports.</p>
                        </div>
                        <button onClick={fetchHistory} className="text-gray-500 hover:text-indigo-600 flex items-center bg-white border px-3 py-1.5 rounded-md shadow-sm text-sm font-medium transition-colors">
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
                        </button>
                    </div>

                    {error && <div className="mb-4 bg-red-50 text-red-700 p-3 rounded">{error}</div>}

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b flex items-center justify-between bg-gray-50/50">
                            <div className="relative w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by uploader, type, status..."
                                    className="w-full pl-9 pr-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={filterText}
                                    onChange={e => setFilterText(e.target.value)}
                                />
                            </div>
                            <span className="text-sm text-gray-500 font-medium">Total: {filtered.length} records</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization Name</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploader</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Type</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget Year</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Download</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {loading ? (
                                        <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">Loading historical data...</td></tr>
                                    ) : filtered.length === 0 ? (
                                        <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">No historical records found.</td></tr>
                                    ) : (
                                        filtered.map((r, idx) => (
                                            <tr key={r.id || idx} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.createdDate ? new Date(r.createdDate).toLocaleString() : 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.orgname || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.createdBy || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.reportype || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 py-1 flex items-center justify-center rounded text-xs font-medium ${r.reportstatus === 'Submitted' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                                                        {r.reportstatus || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.fiscal_year || r.fiscalYear || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    {r.docname && (
                                                        <button onClick={() => handleDownload(r.id, r.docname)} className="text-emerald-600 hover:text-emerald-900 flex items-center justify-end w-full" title="Download Report">
                                                            <Download className="w-5 h-5 mr-1" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
