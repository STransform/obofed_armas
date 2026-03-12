'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import axiosInstance from '@/lib/axios';
import { Search, Download, RefreshCw } from 'lucide-react';

const downloadFile = async (id: string | number, type: string) => {
    return axiosInstance.get(`/transactions/download/${id}/${type}`, {
        responseType: 'blob'
    });
};

export default function FileHistoryPage() {
    const { isAuthenticated } = useAuth();
    const { resolve } = useTranslation();

    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Search and Pagination
    const [filterText, setFilterText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchHistory();
    }, [isAuthenticated]);

    const fetchHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axiosInstance.get('/transactions/file-history');
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
        (resolve(r.orgname) || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (resolve(r.reportype) || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (r.createdBy || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (r.reportstatus || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (r.fiscal_year || r.fiscalYear || '').toString().toLowerCase().includes(filterText.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const currentHistory = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => { setCurrentPage(1); }, [filterText]);

    if (!isAuthenticated) return null;

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
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
                            <div className="relative w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by uploader, type, status..."
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-shadow"
                                    value={filterText}
                                    onChange={e => setFilterText(e.target.value)}
                                />
                            </div>
                            <span className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                                Total: {filtered.length} records
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Upload Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Organization Name</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Uploader</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Report Type</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Budget Year</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Download</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-50">
                                    {loading ? (
                                        <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">Loading historical data...</td></tr>
                                    ) : currentHistory.length === 0 ? (
                                        <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">No historical records found.</td></tr>
                                    ) : (
                                        currentHistory.map((r: any, idx: number) => (
                                            <tr key={r.id || idx} className="hover:bg-indigo-50/30 transition-colors group">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {r.createdDate ? new Date(r.createdDate).toLocaleString() : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {resolve(r.orgname) || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {r.createdBy || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {resolve(r.reportype) || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${r.reportstatus && (r.reportstatus.includes('Approved') || r.reportstatus === 'Submitted') ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-orange-50 text-orange-700 border border-orange-100'}`}>
                                                        <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${r.reportstatus && (r.reportstatus.includes('Approved') || r.reportstatus === 'Submitted') ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                                                        {r.reportstatus || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {r.fiscal_year || r.fiscalYear || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                    <div className="flex justify-end gap-2">
                                                        {r.docname && (
                                                            <button onClick={() => handleDownload(r.id, r.docname)} className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Download Report">
                                                                <Download className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer */}
                        {!loading && filtered.length > 0 && (
                            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    Showing <span className="font-medium text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-gray-900">{Math.min(currentPage * itemsPerPage, filtered.length)}</span> of <span className="font-medium text-gray-900">{filtered.length}</span> results
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 border border-gray-200 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages || totalPages === 0}
                                        className="px-3 py-1 border border-gray-200 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
