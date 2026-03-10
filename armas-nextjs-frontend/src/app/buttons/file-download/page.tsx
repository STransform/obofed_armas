'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
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
    const { resolve } = useTranslation();

    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Search and Pagination
    const [filterText, setFilterText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Modals
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState<any>(null);

    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [assignees, setAssignees] = useState<any[]>([]);
    const [selectedAssignee, setSelectedAssignee] = useState('');
    const [assignmentReason, setAssignmentReason] = useState('');
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
        setAssignmentReason('');
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
                    params: {
                        auditorUsername: selectedAssignee,
                        ...(assignmentReason ? { assignmentReason } : {})
                    }
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
        (resolve(r.orgname) || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (resolve(r.reportype) || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (r.user || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (r.reportstatus || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (r.fiscal_year || '').toString().toLowerCase().includes(filterText.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const currentReports = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => { setCurrentPage(1); }, [filterText]);

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
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
                            <div className="relative w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by org, type, submitter..."
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-shadow"
                                    value={filterText}
                                    onChange={e => setFilterText(e.target.value)}
                                />
                            </div>
                            <span className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                                Total: {filtered.length} reports
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Organization</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Budget Year</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Report Type</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted By</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-50">
                                    {loading ? (
                                        <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">Loading incoming reports...</td></tr>
                                    ) : currentReports.length === 0 ? (
                                        <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">No incoming reports found.</td></tr>
                                    ) : (
                                        currentReports.map((r: any) => (
                                            <tr key={r.id} className="hover:bg-indigo-50/30 transition-colors group">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {r.createdDate ? new Date(r.createdDate).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {resolve(r.orgname) || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {r.fiscal_year || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {resolve(r.reportype) || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {r.user || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${r.reportstatus === 'Submitted' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-orange-50 text-orange-700 border border-orange-100'}`}>
                                                        <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${r.reportstatus === 'Submitted' ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                                                        {r.reportstatus || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => { setSelectedReport(r); setIsDetailsOpen(true); }} className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="View Details">
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        {r.reportcategory === 'Others' ? (
                                                            <button onClick={() => handleOpenAssign(r, 'approver')} className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors" title="Assign Approver">
                                                                <UserPlus className="w-4 h-4" />
                                                            </button>
                                                        ) : (
                                                            <button onClick={() => handleOpenAssign(r, 'auditor')} className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors" title="Assign Auditor">
                                                                <UserPlus className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        {r.docname && (
                                                            <button onClick={() => handleDownload(r.id, r.docname)} className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" title="Download Report">
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
                        {assignType === 'auditor' && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Reason / Message (Optional)</label>
                                <textarea
                                    className="w-full rounded-md border border-gray-300 py-2.5 px-3 text-sm focus:ring-1 focus:ring-indigo-500 bg-white"
                                    rows={3}
                                    placeholder="Enter a reason or instructions for the auditor..."
                                    value={assignmentReason}
                                    onChange={e => setAssignmentReason(e.target.value)}
                                />
                            </div>
                        )}
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
                            <div><label className="text-gray-500 font-medium">Organization</label><div className="p-2 bg-gray-50 border rounded">{resolve(selectedReport?.orgname) || 'N/A'}</div></div>
                            <div><label className="text-gray-500 font-medium">Budget Year</label><div className="p-2 bg-gray-50 border rounded">{selectedReport?.fiscal_year || 'N/A'}</div></div>
                            <div><label className="text-gray-500 font-medium">Report Type</label><div className="p-2 bg-gray-50 border rounded">{resolve(selectedReport?.reportype) || 'N/A'}</div></div>
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
