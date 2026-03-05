'use client';

import { useEffect, useState, Suspense } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import axiosInstance from '@/lib/axios';
import { Search, Download } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function LettersList() {
    const { isAuthenticated } = useAuth();
    const [letters, setLetters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterText, setFilterText] = useState('');

    const searchParams = useSearchParams();
    const type = searchParams.get('type');
    const isDispatched = type === 'dispatched';

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchLetters();
    }, [isAuthenticated, type]);

    const fetchLetters = async () => {
        setLoading(true);
        try {
            const endpoint = type ? `/transactions/letters?type=${type}` : '/transactions/letters';
            const res = await axiosInstance.get(endpoint);
            const validLetters = Array.isArray(res.data) ? res.data.filter(l =>
                l && l.id && l.lastModifiedBy && (l.letterDocname || l.docname) && (isDispatched ? l.reportcategory === 'Letter' : true)
            ) : [];
            setLetters(validLetters);
            if (validLetters.length === 0) setError(isDispatched ? 'No dispatched letters found.' : 'No letters sent to your organization.');
            else setError(null);
        } catch (err: any) {
            setError(err.response?.status === 403 ? 'Access denied. Organization assignment required.' : err.message || 'Failed to load letters');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (id: number, docname: string) => {
        try {
            const res = await axiosInstance.get(`/transactions/download/${id}/letter`, { responseType: 'blob' });
            const blob = new Blob([res.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = docname || `letter-${id}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            alert('Failed to download letter');
        }
    };

    const filtered = letters.filter(l =>
        (l.lastModifiedBy || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (l.letterDocname || l.docname || '').toLowerCase().includes(filterText.toLowerCase())
    );

    if (!isAuthenticated) return null;

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-8 max-w-7xl w-full mx-auto">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">{isDispatched ? 'Dispatched Letters' : 'Letters Sent to Organization'}</h1>
                        <p className="text-sm text-gray-500 mt-1">Review formalized correspondence.</p>
                    </div>

                    {error && <div className="mb-4 bg-red-50 text-red-700 p-3 rounded">{error}</div>}

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b flex items-center justify-between bg-gray-50/50">
                            <div className="relative w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search letter titles..."
                                    className="w-full pl-9 pr-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                                    value={filterText}
                                    onChange={e => setFilterText(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sender</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Letter Name</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {loading ? (
                                        <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">Loading letters...</td></tr>
                                    ) : filtered.length === 0 ? (
                                        <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">No letters matched.</td></tr>
                                    ) : filtered.map(l => (
                                        <tr key={l.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{l.lastModifiedDate ? new Date(l.lastModifiedDate).toLocaleString() : 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{l.lastModifiedBy || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{l.letterDocname || l.docname || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <button onClick={() => handleDownload(l.id, l.letterDocname || l.docname)} className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded inline-flex items-center">
                                                    <Download className="w-4 h-4 mr-1.5" /> Download
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default function ViewLettersPage() {
    return (
        <Suspense fallback={<div className="p-8">Loading view...</div>}>
            <LettersList />
        </Suspense>
    );
}
