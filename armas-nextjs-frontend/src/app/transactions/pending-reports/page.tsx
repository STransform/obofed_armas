'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import axiosInstance from '@/lib/axios';
import { UserCog } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

export default function PendingReportsPage() {
    const { isAuthenticated, userRole } = useAuth();
    const { resolve } = useTranslation();
    const isArchiver = userRole === 'ARCHIVER';

    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Reassign Modal
    const [isReassignOpen, setIsReassignOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [auditors, setAuditors] = useState<any[]>([]);
    const [selectedAuditor, setSelectedAuditor] = useState('');
    const [reassigning, setReassigning] = useState(false);

    // Search and Pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        if (!isAuthenticated || !isArchiver) return;
        fetchPendingTasks();
    }, [isAuthenticated, isArchiver]);

    const fetchPendingTasks = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/transactions/sent-reports');
            const data = Array.isArray(res.data) ? res.data : [];
            const assigned = data.filter((t: any) => t && t.id && ['Assigned', 'Rejected'].includes(t.reportstatus));
            setTasks(assigned);
        } catch (err: any) {
            setError(err.message || 'Failed to load pending tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenReassign = async (task: any) => {
        setSelectedTask(task);
        setSelectedAuditor('');
        setIsReassignOpen(true);

        try {
            const res = await axiosInstance.get('/transactions/users-by-role/SENIOR_AUDITOR');
            setAuditors(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            alert('Failed to load senior auditors');
            setIsReassignOpen(false);
        }
    };

    const submitReassign = async () => {
        if (!selectedAuditor) return alert('Please select a Senior Auditor');
        setReassigning(true);
        try {
            await axiosInstance.post(`/transactions/reassign/${selectedTask.id}`, null, {
                params: { newAuditorUsername: selectedAuditor }
            });
            setIsReassignOpen(false);
            fetchPendingTasks();
        } catch (err: any) {
            alert(err.response?.data || 'Error reassigning task');
        } finally {
            setReassigning(false);
        }
    };

    // Filter and Pagination Logic
    const filteredTasks = tasks.filter(t => {
        const org = resolve(t.organization?.orgname || t.orgname || '').toLowerCase();
        const rpt = resolve(t.transactiondocument?.reportype || t.reportype || '').toLowerCase();
        const aud = (t.user2?.username || t.assignedAuditorUsername || '').toLowerCase();
        const stat = (t.reportstatus || '').toLowerCase();
        const search = searchTerm.toLowerCase();
        return org.includes(search) || rpt.includes(search) || aud.includes(search) || stat.includes(search);
    });

    const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
    const currentTasks = filteredTasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Reset pagination when search changes
    useEffect(() => { setCurrentPage(1); }, [searchTerm]);

    if (!isAuthenticated) return <div className="p-8">Please log in.</div>;
    if (!isArchiver) return <div className="p-8 text-red-600">Unauthorized access. ARCHIVER role required.</div>;

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-8 max-w-7xl w-full mx-auto">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Pending Assigned Reports</h1>
                        <p className="text-sm text-gray-500 mt-1">Review your dispatched tasks and reassign them to different Senior Auditors if needed.</p>
                    </div>

                    {error && <div className="mb-4 bg-red-50 text-red-700 p-3 rounded">{error}</div>}

                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
                        <div className="relative w-72">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search org, type, auditor..."
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-shadow"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <span className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                            Total: {filteredTasks.length} reports
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Organization</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Budget Year</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Report Type</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned Auditor</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-50">
                                {loading ? (
                                    <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">Loading pending tasks...</td></tr>
                                ) : currentTasks.length === 0 ? (
                                    <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">No pending reports currently assigned.</td></tr>
                                ) : (
                                    currentTasks.map(t => (
                                        <tr key={t.id} className="hover:bg-indigo-50/30 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {t.createdDate ? new Date(t.createdDate).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {resolve(t.organization?.orgname || t.orgname || '') || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                    {t.budgetYear?.fiscalYear || t.fiscalYear || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {resolve(t.transactiondocument?.reportype || t.reportype || '') || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex items-center">
                                                    <div className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold mr-2">
                                                        {(t.user2?.username || t.assignedAuditorUsername || '?').charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-medium text-gray-700">{t.user2?.username || t.assignedAuditorUsername || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${t.reportstatus === 'Rejected' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                                                    {t.reportstatus === 'Rejected' ? (
                                                        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-red-500"></span>
                                                    ) : (
                                                        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-blue-500"></span>
                                                    )}
                                                    {t.reportstatus || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <button onClick={() => handleOpenReassign(t)} className="inline-flex items-center justify-center px-3 py-1.5 border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-md font-medium text-xs transition-colors">
                                                    <UserCog className="w-3.5 h-3.5 mr-1" /> Reassign
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    {!loading && filteredTasks.length > 0 && (
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                Showing <span className="font-medium text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-gray-900">{Math.min(currentPage * itemsPerPage, filteredTasks.length)}</span> of <span className="font-medium text-gray-900">{filteredTasks.length}</span> results
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
                </main>
            </div>

            {/* Radix Dialog: Reassign Task */}
            <Dialog.Root open={isReassignOpen} onOpenChange={setIsReassignOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/40" />
                    <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] border bg-white p-6 shadow-lg rounded-lg">
                        <Dialog.Title className="text-lg font-semibold mb-4 border-b pb-2">Reassign Senior Auditor</Dialog.Title>
                        <div className="my-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select new Senior Auditor:</label>
                            <select
                                className="w-full rounded-md border border-gray-300 py-2.5 px-3 text-sm focus:ring-1 focus:ring-indigo-500 bg-white"
                                value={selectedAuditor}
                                onChange={e => setSelectedAuditor(e.target.value)}
                            >
                                <option value="">Select Auditor</option>
                                {auditors.map(a => (
                                    <option key={a.id} value={a.username}>{a.firstName} {a.lastName} ({a.username})</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setIsReassignOpen(false)} className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50">Cancel</button>
                            <button
                                onClick={submitReassign}
                                disabled={reassigning || !selectedAuditor}
                                className="px-4 py-2 bg-amber-600 text-white rounded-md text-sm font-medium hover:bg-amber-700 disabled:opacity-50"
                            >
                                {reassigning ? 'Reassigning...' : 'Transfer Task'}
                            </button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

        </div>
    );
}
