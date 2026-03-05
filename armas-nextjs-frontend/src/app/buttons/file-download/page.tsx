'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import axiosInstance from '@/lib/axios';
import { Search, Eye, UserPlus, Download } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

const downloadFile = async (id: string | number, type: string) => {
    return axiosInstance.get(`/transactions/download/${id}/${type}`, {
        responseType: 'blob'
    });
};

export default function FileDownloadPage() {
    const { isAuthenticated, userRole } = useAuth();

    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterText, setFilterText] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Modals
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState<any>(null);

    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [assignees, setAssignees] = useState<any[]>([]);
    const [selectedAssignee, setSelectedAssignee] = useState('');
    const [assignType, setAssignType] = useState(''); // 'auditor' or 'approver'
    const [assigning, setAssigning] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchReports();
    }, [isAuthenticated]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/transactions/sent-reports');
            const submitted = (Array.isArray(res.data) ? res.data : [])
                .filter((r: any) => r.reportstatus === 'Submitted' || r.reportstatus === 'Under Review');
            setReports(submitted);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (id: number, docname: string, type = 'original') => {
        try {
            const res = await downloadFile(id, type);
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

    const handleOpenAssign = async (report: any, type: string) => {
        setSelectedReport(report);
        setAssignType(type);
        setAssignees([]);
        setSelectedAssignee('');
        setIsAssignOpen(true);

        try {
            const role = type === 'auditor' ? 'SENIOR_AUDITOR' : 'APPROVER';
            const res = await axiosInstance.get(`/transactions/users-by-role/${role}`);
            setAssignees(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            alert('Failed to load users for assignment.');
            setIsAssignOpen(false);
        }
    };

    const submitAssignment = async () => {
        if (!selectedAssignee) return alert('Please select a user');
        setAssigning(true);
        try {
            if (assignType === 'auditor') {
                await axiosInstance.post(`/transactions/assign/${selectedReport.id}`, null, {
                    params: { auditorUsername: selectedAssignee }
                });
            } else {
                await axiosInstance.post(`/transactions/assign-approver/${selectedReport.id}`, null, {
                    params: { approverUsername: selectedAssignee }
                });
            }
            setIsAssignOpen(false);
            fetchReports();
        } catch (err: any) {
            alert(err.response?.data || 'Error assigning user');
        } finally {
            setAssigning(false);
        }
    };

    const filtered = reports.filter(r =>
        (r.orgname || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (r.reportype || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (r.user || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (r.reportstatus || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (r.fiscal_year || '').toString().toLowerCase().includes(filterText.toLowerCase())
    );

    if (!isAuthenticated) return <div className="p-8">Please log in.</div>;

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-8 max-w-7xl w-full mx-auto">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Incoming Reports</h1>
                        <p className="text-sm text-gray-500 mt-1">Review newly submitted reports and assign them to Auditors or Approvers.</p>
                    </div>

                    {error && <div className="mb-4 bg-red-50 text-red-700 p-3 rounded">{error}</div>}

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b flex items-center justify-between bg-gray-50/50">
                            <div className="relative w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by org, type, submitter..."
                                    className="w-full pl-9 pr-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={filterText}
                                    onChange={e => setFilterText(e.target.value)}
                                />
                            </div>
                            <span className="text-sm text-gray-500 font-medium">Total: {filtered.length} reports</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget Year</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Type</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted By</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {loading ? (
                                        <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">Loading incoming reports...</td></tr>
                                    ) : filtered.length === 0 ? (
                                        <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">No pending incoming reports found.</td></tr>
                                    ) : (
                                        filtered.map(r => (
                                            <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.createdDate ? new Date(r.createdDate).toLocaleDateString() : 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.orgname || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.fiscal_year || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.reportype || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.user || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 py-1 flex items-center justify-center rounded text-xs font-medium ${r.reportstatus === 'Submitted' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                                                        {r.reportstatus || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end space-x-3">
                                                        <button onClick={() => { setSelectedReport(r); setIsDetailsOpen(true); }} className="text-indigo-600 hover:text-indigo-900" title="View Details">
                                                            <Eye className="w-5 h-5" />
                                                        </button>
                                                        {r.reportcategory === 'Others' ? (
                                                            <button onClick={() => handleOpenAssign(r, 'approver')} className="text-amber-600 hover:text-amber-900" title="Assign Approver">
                                                                <UserPlus className="w-5 h-5" />
                                                            </button>
                                                        ) : (
                                                            <button onClick={() => handleOpenAssign(r, 'auditor')} className="text-amber-600 hover:text-amber-900" title="Assign Auditor">
                                                                <UserPlus className="w-5 h-5" />
                                                            </button>
                                                        )}
                                                        {r.docname && (
                                                            <button onClick={() => handleDownload(r.id, r.docname)} className="text-emerald-600 hover:text-emerald-900" title="Download Report">
                                                                <Download className="w-5 h-5" />
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
                    </div>
                </main>
            </div>

            {/* Radix Dialog: Assign Auditor / Approver */}
            <Dialog.Root open={isAssignOpen} onOpenChange={setIsAssignOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/40" />
                    <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] border bg-white p-6 shadow-lg rounded-lg">
                        <Dialog.Title className="text-lg font-semibold mb-4 border-b pb-2">Assign {assignType === 'auditor' ? 'Auditor' : 'Approver'}</Dialog.Title>
                        <div className="my-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select {assignType === 'auditor' ? 'Senior Auditor' : 'Approver'}</label>
                            <select
                                className="w-full rounded-md border border-gray-300 py-2.5 px-3 text-sm focus:ring-1 focus:ring-indigo-500 bg-white"
                                value={selectedAssignee}
                                onChange={e => setSelectedAssignee(e.target.value)}
                            >
                                <option value="">Select User</option>
                                {assignees.map(a => (
                                    <option key={a.id} value={a.username}>{a.username} ({a.firstName} {a.lastName})</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setIsAssignOpen(false)} className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50">Cancel</button>
                            <button
                                onClick={submitAssignment}
                                disabled={assigning}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {assigning ? 'Assigning...' : 'Assign User'}
                            </button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            {/* Radix Dialog: View Details */}
            <Dialog.Root open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/40" />
                    <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] border bg-white p-6 shadow-lg rounded-lg">
                        <Dialog.Title className="text-lg font-semibold mb-6 border-b pb-2">Report Details</Dialog.Title>

                        <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm mt-4">
                            <div><label className="text-gray-500 font-medium">Submitted Date</label><div className="p-2 bg-gray-50 border rounded">{selectedReport?.createdDate ? new Date(selectedReport.createdDate).toLocaleDateString() : 'N/A'}</div></div>
                            <div><label className="text-gray-500 font-medium">Organization</label><div className="p-2 bg-gray-50 border rounded">{selectedReport?.orgname || 'N/A'}</div></div>
                            <div><label className="text-gray-500 font-medium">Budget Year</label><div className="p-2 bg-gray-50 border rounded">{selectedReport?.fiscal_year || 'N/A'}</div></div>
                            <div><label className="text-gray-500 font-medium">Report Type</label><div className="p-2 bg-gray-50 border rounded">{selectedReport?.reportype || 'N/A'}</div></div>
                            <div><label className="text-gray-500 font-medium">Category</label><div className="p-2 bg-gray-50 border rounded">{selectedReport?.reportcategory || 'N/A'}</div></div>
                            <div><label className="text-gray-500 font-medium">Submitted By</label><div className="p-2 bg-gray-50 border rounded">{selectedReport?.user || 'N/A'}</div></div>
                            <div><label className="text-gray-500 font-medium">Status</label><div className="p-2 bg-gray-50 border rounded">{selectedReport?.reportstatus || 'N/A'}</div></div>
                        </div>

                        {selectedReport?.docname && (
                            <div className="mt-6 p-4 bg-gray-50 border rounded-md">
                                <label className="text-gray-500 font-medium mb-2 block">Attached Document</label>
                                <button
                                    onClick={() => handleDownload(selectedReport.id, selectedReport.docname)}
                                    className="flex items-center text-indigo-700 bg-indigo-50 border border-indigo-200 px-4 py-2 rounded font-medium hover:bg-indigo-100 transition"
                                >
                                    <Download className="w-4 h-4 mr-2" /> Download Original Document
                                </button>
                            </div>
                        )}

                        <div className="flex justify-end mt-6 border-t pt-4">
                            <button onClick={() => setIsDetailsOpen(false)} className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50">Close</button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

        </div>
    );
}
