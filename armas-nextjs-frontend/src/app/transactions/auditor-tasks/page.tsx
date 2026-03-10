'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import axiosInstance from '@/lib/axios';
import { Search, Eye, Download, ClipboardCheck, CheckCircle, XCircle } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

export default function AuditorTasksPage() {
    const { isAuthenticated, userRole } = useAuth();
    const { resolve } = useTranslation();
    // In original code, it checks roles array. Here we assume userRole is the primary role.
    const isSeniorAuditor = userRole === 'SENIOR_AUDITOR';
    const isApprover = userRole === 'APPROVER';

    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Search and Pagination
    const [filterText, setFilterText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Modals
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any>(null);

    const [isFindingsOpen, setIsFindingsOpen] = useState(false);
    const [remarks, setRemarks] = useState('');
    const [responseNeeded, setResponseNeeded] = useState('Pending');
    const [approvers, setApprovers] = useState<any[]>([]);
    const [selectedApprover, setSelectedApprover] = useState('');
    const [supportingDocument, setSupportingDocument] = useState<File | null>(null);

    const [isApproveOpen, setIsApproveOpen] = useState(false);
    const [approvalDocument, setApprovalDocument] = useState<File | null>(null);

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchTasks();
    }, [isAuthenticated, userRole]);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/transactions/tasks');
            const data = Array.isArray(res.data) ? res.data : [];
            console.log("Raw tasks data from /transactions/tasks:", JSON.stringify(data, null, 2));

            // Map response fields to match original armas-frontend getMyTasks() mapping
            const mapped = data.map((task: any) => ({
                id: task.id,
                createdDate: task.createdDate,
                reportstatus: task.reportstatus,
                orgname: task.orgname ?? task.organization?.orgname ?? null,
                fiscalYear: task.fiscal_year ?? task.fiscalYear ?? task.budgetYear?.fiscalYear ?? null,
                reportype: task.reportype ?? task.transactiondocument?.reportype ?? null,
                docname: task.docname,
                supportingDocname: task.supportingDocname ?? null,
                submittedByAuditorUsername: task.submittedByAuditorUsername ?? task.submittedByAuditor?.username ?? null,
                assignedAuditorUsername: task.assignedAuditorUsername ?? null,
                remarks: task.remarks ?? null,
                responseNeeded: task.responseNeeded ?? task.response_needed ?? null,
                reasonOfRejection: task.reason_of_rejection ?? null,
                assignmentReason: task.assignmentReason ?? null,
            }));
            console.log("Mapped tasks:", JSON.stringify(mapped, null, 2));

            let filtered: any[] = [];
            if (isSeniorAuditor) {
                filtered = mapped.filter((t: any) => ['Assigned', 'Rejected'].includes(t.reportstatus));
            } else if (isApprover) {
                // If approver, they shouldn't just be limited to 'Under Review', 'Corrected' locally if the backend already filters them, but let's keep it safe
                filtered = mapped.filter((t: any) => ['Under Review', 'Corrected'].includes(t.reportstatus));
            }
            console.log("Filtered tasks for UI:", JSON.stringify(filtered, null, 2));

            setTasks(filtered);
            if (filtered.length === 0) setError('No tasks available for your role.');
            else setError(null);
        } catch (err: any) {
            console.error("Error fetching tasks:", err);
            setError(err.message || 'Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (id: number, docname: string, type: string) => {
        try {
            const res = await axiosInstance.get(`/transactions/download/${id}/${type}`, { responseType: 'blob' });
            const blob = new Blob([res.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = docname || 'file';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            alert('Failed to download document');
        }
    };

    const handleOpenFindings = async (task: any, isRejection = false) => {
        setSelectedTask(task);
        setRemarks('');
        setResponseNeeded('Pending');
        setSelectedApprover('');
        setSupportingDocument(null);
        try {
            const res = await axiosInstance.get('/transactions/users-by-role/APPROVER');
            setApprovers(Array.isArray(res.data) ? res.data : []);
            setIsFindingsOpen(true);
        } catch (err) {
            alert('Failed to load approvers');
        }
    };

    const submitFindings = async (isRejection = false) => {
        if (!isRejection && (!remarks || !selectedApprover)) return alert('Please fill in all required fields');
        if (isRejection && !remarks) return alert('Please explain the reason for rejection');

        setSubmitting(true);
        const formData = new FormData();
        formData.append('remarks', remarks);

        if (isRejection) {
            if (supportingDocument) formData.append('rejectionDocument', supportingDocument);
            try {
                await axiosInstance.post(`/transactions/reject/${selectedTask.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    params: { reasonOfRejection: remarks }
                });
                setIsFindingsOpen(false);
                fetchTasks();
            } catch (err: any) {
                alert(err.response?.data || 'Failed to reject report');
            }
        } else {
            formData.append('approverUsername', selectedApprover);
            formData.append('responseNeeded', responseNeeded);
            if (supportingDocument) formData.append('supportingDocument', supportingDocument);
            try {
                await axiosInstance.post(`/transactions/submit-findings/${selectedTask.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setIsFindingsOpen(false);
                fetchTasks();
            } catch (err: any) {
                alert(err.response?.data || 'Failed to submit findings');
            }
        }
        setSubmitting(false);
    };

    const submitApprove = async () => {
        setSubmitting(true);
        const formData = new FormData();
        if (approvalDocument) formData.append('approvalDocument', approvalDocument);
        try {
            await axiosInstance.post(`/transactions/approve/${selectedTask.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setIsApproveOpen(false);
            fetchTasks();
        } catch (err: any) {
            alert(err.response?.data || 'Failed to approve report');
        } finally {
            setSubmitting(false);
        }
    };

    const filtered = tasks.filter(t =>
        (resolve(t.orgname) || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (resolve(t.reportype) || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (t.reportstatus || '').toLowerCase().includes(filterText.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const currentTasks = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => { setCurrentPage(1); }, [filterText]);

    if (!isAuthenticated) return null;

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-8 max-w-7xl w-full mx-auto">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">{isSeniorAuditor ? 'Senior Auditor Tasks' : isApprover ? 'Approver Tasks' : 'My Tasks'}</h1>
                        <p className="text-sm text-gray-500 mt-1">Review your assigned active tasks.</p>
                    </div>

                    {error && <div className="mb-4 bg-red-50 text-red-700 p-3 rounded">{error}</div>}

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
                            <div className="relative w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search tasks..."
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-shadow"
                                    value={filterText}
                                    onChange={e => setFilterText(e.target.value)}
                                />
                            </div>
                            <span className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                                Total: {filtered.length} tasks
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Organization</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Report Type</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-50">
                                    {loading ? (
                                        <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">Loading tasks...</td></tr>
                                    ) : currentTasks.length === 0 ? (
                                        <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No tasks found.</td></tr>
                                    ) : (
                                        currentTasks.map((t: any) => (
                                            <tr key={t.id} className="hover:bg-indigo-50/30 transition-colors group">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {t.createdDate ? new Date(t.createdDate).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${t.reportstatus === 'Assigned' || t.reportstatus === 'Under Review' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-orange-50 text-orange-700 border border-orange-100'}`}>
                                                        <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${t.reportstatus === 'Assigned' || t.reportstatus === 'Under Review' ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                                                        {t.reportstatus || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {resolve(t.orgname) || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {resolve(t.reportype) || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                    <div className="flex items-center justify-end gap-2 flex-wrap">
                                                        <button onClick={() => { setSelectedTask(t); setIsDetailsOpen(true); }} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md transition-colors" title="View details">
                                                            <Eye className="w-3.5 h-3.5" />
                                                            Details
                                                        </button>
                                                        {t.docname && (
                                                            <button
                                                                onClick={() => handleDownload(t.id, t.docname, 'original')}
                                                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors"
                                                                title="Download original report uploaded by the organization"
                                                            >
                                                                <Download className="w-3.5 h-3.5" />
                                                                Report
                                                            </button>
                                                        )}
                                                        {t.supportingDocname && (
                                                            <button
                                                                onClick={() => handleDownload(t.id, t.supportingDocname, 'supporting')}
                                                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 rounded-md transition-colors"
                                                                title="Download audit findings uploaded by the Senior Auditor"
                                                            >
                                                                <Download className="w-3.5 h-3.5" />
                                                                Findings
                                                            </button>
                                                        )}
                                                        {isSeniorAuditor && (t.reportstatus === 'Assigned' || t.reportstatus === 'Rejected') && (
                                                            <button onClick={() => handleOpenFindings(t)} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-md transition-colors" title="Submit Findings">
                                                                <ClipboardCheck className="w-3.5 h-3.5" />
                                                                Evaluate
                                                            </button>
                                                        )}
                                                        {isApprover && (t.reportstatus === 'Under Review' || t.reportstatus === 'Corrected') && (
                                                            <>
                                                                <button onClick={() => { setSelectedTask(t); setIsApproveOpen(true); }} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-md transition-colors" title="Approve">
                                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                                    Approve
                                                                </button>
                                                                <button onClick={() => handleOpenFindings(t, true)} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors" title="Reject">
                                                                    <XCircle className="w-3.5 h-3.5" />
                                                                    Reject
                                                                </button>
                                                            </>
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

            {/* Modals for Details, Evaluate, Approve would be here, mapped directly to their Radix forms similarly to previous pages */}
            <Dialog.Root open={isFindingsOpen} onOpenChange={setIsFindingsOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/40" />
                    <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] border bg-white p-6 shadow-lg rounded-lg">
                        <Dialog.Title className="text-lg font-semibold mb-4 border-b pb-2">{isApprover ? 'Reject Report' : 'Submit Audit Findings'}</Dialog.Title>
                        <div className="my-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{isApprover ? 'Rejection Reason' : 'Findings'}</label>
                                <textarea className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500" rows={4} value={remarks} onChange={e => setRemarks(e.target.value)} />
                            </div>
                            {!isApprover && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Response Needed</label>
                                        <select className="w-full rounded-md border border-gray-300 py-2.5 px-3 text-sm" value={responseNeeded} onChange={e => setResponseNeeded(e.target.value)}>
                                            <option value="Pending">Pending</option><option value="Yes">Yes</option><option value="No">No</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Approver</label>
                                        <select className="w-full rounded-md border border-gray-300 py-2.5 px-3 text-sm" value={selectedApprover} onChange={e => setSelectedApprover(e.target.value)}>
                                            <option value="">Select Approver</option>
                                            {approvers.map(a => <option key={a.id} value={a.username}>{a.firstName} {a.lastName} ({a.username})</option>)}
                                        </select>
                                    </div>
                                </>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Supporting Document</label>
                                <input type="file" onChange={e => setSupportingDocument(e.target.files?.[0] || null)} className="text-sm" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setIsFindingsOpen(false)} className="px-4 py-2 border rounded-md text-sm">Cancel</button>
                            <button onClick={() => submitFindings(isApprover)} disabled={submitting} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm">{submitting ? 'Submitting...' : 'Submit'}</button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            <Dialog.Root open={isApproveOpen} onOpenChange={setIsApproveOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/40" />
                    <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] border bg-white p-6 shadow-lg rounded-lg">
                        <Dialog.Title className="text-lg font-semibold mb-4 border-b pb-2">Approve Report</Dialog.Title>
                        <div className="my-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Approval Document (Optional)</label>
                            <input type="file" onChange={e => setApprovalDocument(e.target.files?.[0] || null)} className="text-sm" />
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setIsApproveOpen(false)} className="px-4 py-2 border rounded-md text-sm">Cancel</button>
                            <button onClick={submitApprove} disabled={submitting} className="px-4 py-2 bg-green-600 text-white rounded-md text-sm">{submitting ? 'Approving...' : 'Approve'}</button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            <Dialog.Root open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/40" />
                    <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] border bg-white p-6 shadow-lg rounded-lg">
                        <Dialog.Title className="text-lg font-semibold mb-6 border-b pb-2">Task Details</Dialog.Title>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm mt-4">
                            <div><label className="text-gray-500 font-medium">Organization</label><div className="p-2 bg-gray-50 border rounded">{resolve(selectedTask?.orgname) || 'N/A'}</div></div>
                            <div><label className="text-gray-500 font-medium">Type</label><div className="p-2 bg-gray-50 border rounded">{resolve(selectedTask?.reportype) || 'N/A'}</div></div>
                            <div><label className="text-gray-500 font-medium">Status</label><div className="p-2 bg-gray-50 border rounded">{selectedTask?.reportstatus || 'N/A'}</div></div>
                            <div><label className="text-gray-500 font-medium">Submitted By</label><div className="p-2 bg-gray-50 border rounded">{selectedTask?.submittedByAuditorUsername || selectedTask?.user || 'N/A'}</div></div>
                        </div>

                        {selectedTask?.assignmentReason && (
                            <div className="mt-4 col-span-2">
                                <label className="text-gray-500 font-medium block mb-1">Assignment Reason / Instructions</label>
                                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded text-sm text-indigo-900 whitespace-pre-wrap">
                                    {selectedTask.assignmentReason}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end mt-6 border-t pt-4">
                            <button onClick={() => setIsDetailsOpen(false)} className="px-4 py-2 border rounded-md text-sm font-medium">Close</button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
}
