'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import axiosInstance from '@/lib/axios';
import { UserCog } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

export default function PendingReportsPage() {
    const { isAuthenticated, userRole } = useAuth();
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

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Organization</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Budget Year</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Report Type</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned Auditor</th>
                                        <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {loading ? (
                                        <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">Loading pending tasks...</td></tr>
                                    ) : tasks.length === 0 ? (
                                        <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">No pending reports currently assigned.</td></tr>
                                    ) : (
                                        tasks.map(t => (
                                            <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.createdDate ? new Date(t.createdDate).toLocaleDateString() : 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${t.reportstatus === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                                        {t.reportstatus || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.organization?.orgname || t.orgname || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.budgetYear?.fiscalYear || t.fiscalYear || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.transactiondocument?.reportype || t.reportype || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{t.user2?.username || t.assignedAuditorUsername || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button onClick={() => handleOpenReassign(t)} className="text-amber-600 hover:text-amber-800 flex items-center justify-end w-full bg-amber-50 px-3 py-1.5 rounded-md border border-amber-200" title="Reassign Task">
                                                        <UserCog className="w-4 h-4 mr-1.5" /> Reassign
                                                    </button>
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
