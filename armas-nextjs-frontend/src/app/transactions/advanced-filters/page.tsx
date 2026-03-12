'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import axiosInstance from '@/lib/axios';
import { Search, Eye, Download } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

// Service methods (Ported from upload_download.js)
const getDocuments = async () => (await axiosInstance.get('/transactions/listdocuments')).data;
const getBudgetYears = async () => (await axiosInstance.get('/transactions/budget-years')).data;

export default function AdvancedFiltersPage() {
    const { isAuthenticated } = useAuth();

    const [filterType, setFilterType] = useState('report-non-senders');
    const [reportype, setReportype] = useState('');
    const [fiscalYear, setFiscalYear] = useState('');
    const [orgId, setOrgId] = useState('');

    const [documents, setDocuments] = useState<any[]>([]);
    const [budgetYears, setBudgetYears] = useState<any[]>([]);
    const [organizations, setOrganizations] = useState<any[]>([]);

    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [filterText, setFilterText] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Dialog state
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchBaselineData();
    }, [isAuthenticated]);

    const fetchBaselineData = async () => {
        setLoading(true);
        try {
            const [docs, years, orgs] = await Promise.all([
                getDocuments(),
                getBudgetYears(),
                axiosInstance.get('/transactions/organizations-with-reports').then(r => r.data)
            ]);

            const docsArr = Array.isArray(docs) ? docs : [];
            const yearsArr = Array.isArray(years) ? years : [];

            setDocuments(docsArr);
            setBudgetYears(yearsArr);
            setOrganizations(Array.isArray(orgs) ? orgs : []);

            if (docsArr.length > 0) setReportype(docsArr[0].reportype || '');
            if (yearsArr.length > 0) setFiscalYear(yearsArr[0].fiscalYear || yearsArr[0].fiscal_year || '');
        } catch (err: any) {
            setError('Failed to fetch baseline configuration data.');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSearching(true);

        try {
            const params: any = { filterType };

            if (filterType !== 'orgs-with-reports') {
                if (!reportype || !fiscalYear) throw new Error('Please select report type and budget year.');
                params.reportype = reportype;
                params.fiscalYear = fiscalYear;
            }
            if (filterType === 'reports-by-org') {
                if (!orgId) throw new Error('Please select an organization.');
                params.orgId = orgId;
            }

            const res = await axiosInstance.get('/transactions/advanced-filters', { params });
            setResults(Array.isArray(res.data) ? res.data : []);
        } catch (err: any) {
            setError(err.message || err.response?.data?.error || 'Search failed.');
        } finally {
            setIsSearching(false);
        }
    };

    const handleOpenView = (item: any) => {
        setSelectedItem(item);
        setIsViewOpen(true);
    };

    const filteredResults = results.filter(item =>
        (item.orgname || '').toLowerCase().includes(filterText.toLowerCase())
    );

    const isReportType = filterType === 'reports-by-org' || filterType === 'feedback-senders';

    if (!isAuthenticated) return null;

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-8 max-w-7xl w-full mx-auto">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Advanced Report Filters</h1>
                            <p className="text-sm text-gray-500 mt-1">Cross-reference reporting behaviors across organizations and documents.</p>
                        </div>
                    </div>

                    {error && <div className="mb-6 bg-red-50 text-red-700 p-3 rounded">{error}</div>}

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                        {loading ? (
                            <div className="text-center text-gray-500 py-4">Loading configurations...</div>
                        ) : (
                            <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Filter Type</label>
                                    <select
                                        className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 bg-gray-50 hover:bg-white transition-colors"
                                        value={filterType}
                                        onChange={e => setFilterType(e.target.value)}
                                    >
                                        <option value="report-non-senders">Report Non-Senders</option>
                                        <option value="reports-by-org">Reports by Organization</option>
                                        <option value="orgs-with-reports">Organizations with Reports</option>
                                        <option value="feedback-non-senders">Feedback Non-Senders</option>
                                        <option value="feedback-senders">Feedback Senders</option>
                                    </select>
                                </div>

                                <div className={filterType === 'orgs-with-reports' ? 'opacity-50 pointer-events-none' : ''}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                                    <select
                                        className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 bg-white"
                                        value={reportype}
                                        onChange={e => setReportype(e.target.value)}
                                    >
                                        <option value="">Select Type</option>
                                        {documents.map(d => <option key={d.id} value={d.reportype}>{d.reportype}</option>)}
                                    </select>
                                </div>

                                <div className={filterType === 'orgs-with-reports' ? 'opacity-50 pointer-events-none' : ''}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget Year</label>
                                    <select
                                        className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 bg-white"
                                        value={fiscalYear}
                                        onChange={e => setFiscalYear(e.target.value)}
                                    >
                                        <option value="">Select Year</option>
                                        {budgetYears.map(y => <option key={y.id} value={y.fiscalYear || y.fiscal_year}>{y.fiscalYear || y.fiscal_year}</option>)}
                                    </select>
                                </div>

                                {filterType === 'reports-by-org' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                                        <select
                                            className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 bg-white"
                                            value={orgId}
                                            onChange={e => setOrgId(e.target.value)}
                                        >
                                            <option value="">Select Org</option>
                                            {organizations.map(o => <option key={o.id} value={o.id}>{o.orgname}</option>)}
                                        </select>
                                    </div>
                                )}

                                <div className={filterType === 'reports-by-org' ? 'md:col-span-4 flex justify-end' : ''}>
                                    <button
                                        type="submit"
                                        disabled={isSearching}
                                        className="w-full bg-indigo-600 text-white rounded-md py-2 px-4 text-sm font-medium hover:bg-indigo-700 transition disabled:bg-indigo-300"
                                    >
                                        {isSearching ? 'Applying...' : 'Apply Filter'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {results.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-4 border-b flex items-center justify-between bg-gray-50/50">
                                <div className="relative w-72">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search results by Organization..."
                                        className="w-full pl-9 pr-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        value={filterText}
                                        onChange={e => setFilterText(e.target.value)}
                                    />
                                </div>
                                <span className="text-sm text-gray-500 font-medium">Total: {filteredResults.length} matches</span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Org. Name</th>
                                            {isReportType && (
                                                <>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget Year</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Type</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                                                </>
                                            )}
                                            {!isReportType && (
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Org. Type</th>
                                            )}
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredResults.length === 0 ? (
                                            <tr><td colSpan={10} className="px-6 py-8 text-center text-gray-500">No matching search query.</td></tr>
                                        ) : (
                                            filteredResults.map((item, idx) => (
                                                <tr key={item.id || idx} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.orgname || 'N/A'}</td>
                                                    {isReportType && (
                                                        <>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.fiscalYear || item.fiscal_year || 'N/A'}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.reportype || 'N/A'}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                <span className="px-2 py-1 bg-gray-100 rounded text-xs border">{item.reportstatus || 'N/A'}</span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.createdBy || 'N/A'}</td>
                                                        </>
                                                    )}
                                                    {!isReportType && (
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.orgtype || 'N/A'}</td>
                                                    )}
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button onClick={() => handleOpenView(item)} className="text-emerald-600 hover:text-emerald-900" title="View Full Details"><Eye className="w-4 h-4 inline-block" /></button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Radix Dialog: View Details */}
            <Dialog.Root open={isViewOpen} onOpenChange={setIsViewOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/40" />
                    <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] border bg-white p-6 shadow-lg rounded-lg">
                        <Dialog.Title className="text-lg font-semibold mb-6 border-b pb-2">Record Filter Information</Dialog.Title>

                        <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm mt-4">
                            <div className="space-y-1">
                                <label className="text-gray-500 font-medium">Organization Name</label>
                                <div className="p-2 bg-gray-50 border rounded">{selectedItem?.orgname || 'N/A'}</div>
                            </div>

                            {isReportType ? (
                                <>
                                    <div className="space-y-1">
                                        <label className="text-gray-500 font-medium">ID Ref</label>
                                        <div className="p-2 bg-gray-50 border rounded">{selectedItem?.id || 'N/A'}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-gray-500 font-medium">Budget Year</label>
                                        <div className="p-2 bg-gray-50 border rounded">{selectedItem?.fiscalYear || selectedItem?.fiscal_year || 'N/A'}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-gray-500 font-medium">Report Type</label>
                                        <div className="p-2 bg-gray-50 border rounded">{selectedItem?.reportype || 'N/A'}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-gray-500 font-medium">Status</label>
                                        <div className="p-2 bg-gray-50 border rounded">{selectedItem?.reportstatus || 'N/A'}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-gray-500 font-medium">Created Date</label>
                                        <div className="p-2 bg-gray-50 border rounded">{selectedItem?.createdDate ? new Date(selectedItem.createdDate).toLocaleDateString() : 'N/A'}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-gray-500 font-medium">Document Name</label>
                                        <div className="p-2 bg-gray-50 border rounded break-all">{selectedItem?.docname || 'N/A'}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-gray-500 font-medium">Created By</label>
                                        <div className="p-2 bg-gray-50 border rounded">{selectedItem?.createdBy || 'N/A'}</div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-1">
                                        <label className="text-gray-500 font-medium">Organization ID</label>
                                        <div className="p-2 bg-gray-50 border rounded">{selectedItem?.id || 'N/A'}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-gray-500 font-medium">Organization Type</label>
                                        <div className="p-2 bg-gray-50 border rounded">{selectedItem?.orgtype || 'N/A'}</div>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="flex justify-end mt-8 border-t pt-4">
                            <button onClick={() => setIsViewOpen(false)} className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800">Close Panel</button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

        </div>
    );
}
