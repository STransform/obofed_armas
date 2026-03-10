'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import axiosInstance from '@/lib/axios';
import { Search, Eye, Download, CheckCircle, XCircle } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

export default function CorrectedReportsPage() {
    const { isAuthenticated, userRole } = useAuth();
    const { resolve } = useTranslation();
    const isApprover = userRole === 'APPROVER';

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

    const [isApproveOpen, setIsApproveOpen] = useState(false);
    const [approvalDocument, setApprovalDocument] = useState<File | null>(null);

    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [rejectionDocument, setRejectionDocument] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchReports();
    }, [isAuthenticated]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/transactions/corrected-reports');
            setReports(Array.isArray(res.data) ? res.data : []);
            if (res.data?.length === 0) setError('No corrected reports available.');
            else setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to load reports');
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

    const submitApprove = async () => {
        setSubmitting(true);
        const formData = new FormData();
        if (approvalDocument) formData.append('approvalDocument', approvalDocument);

        try {
            await axiosInstance.post(`/transactions/approve/${selectedReport.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setIsApproveOpen(false);
            setApprovalDocument(null);
            fetchReports();
        } catch (err: any) {
            alert(err.response?.data?.error || err.response?.data || 'Approval failed');
        } finally {
            setSubmitting(false);
        }
    };

    const submitReject = async () => {
        if (!rejectionReason) {
            alert('Reason for rejection is required');
            return;
        }

        setSubmitting(true);
        const formData = new FormData();
        formData.append('reason', rejectionReason);
        if (rejectionDocument) formData.append('rejectionDocument', rejectionDocument);

        try {
            await axiosInstance.post(`/transactions/reject/${selectedReport.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setIsRejectOpen(false);
            setRejectionReason('');
            setRejectionDocument(null);
            fetchReports();
        } catch (err: any) {
            alert(err.response?.data?.error || err.response?.data || 'Rejection failed');
        } finally {
            setSubmitting(false);
        }
    };


    const filtered = reports.filter(r =>
        (resolve(r.organization?.orgname) || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (resolve(r.transactiondocument?.reportype) || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (r.createdBy || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (r.responseNeeded || '').toLowerCase().includes(filterText.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const currentReports = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => { setCurrentPage(1); }, [filterText]);

    if (!isAuthenticated) return null;

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-8 max-w-7xl w-full mx-auto">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Corrected Reports</h1>
                        <p className="text-sm text-gray-500 mt-1">Review corrected reports waiting for approval.</p>
                    </div>

                    {error && <div className="mb-4 bg-red-50 text-red-700 p-3 rounded">{error}</div>}

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
                            <div className="relative w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search reports..."
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
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Organization</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Report Type</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created By</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Response</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-50">
                                    {loading ? (
                                        <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">Loading reports...</td></tr>
                                    ) : currentReports.length === 0 ? (
                                        <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">No corrected reports available.</td></tr>
                                    ) : (
                                        currentReports.map((r: any) => (
                                            <tr key={r.id} className="hover:bg-indigo-50/30 transition-colors group">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {r.createdDate ? new Date(r.createdDate).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {resolve(r.organization?.orgname) || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {resolve(r.transactiondocument?.reportype) || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {r.createdBy || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {r.responseNeeded || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                    <div className="flex items-center justify-end gap-2 flex-wrap">
                                                        <button onClick={() => { setSelectedReport(r); setIsDetailsOpen(true); }} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md transition-colors" title="View Details">
                                                            <Eye className="w-3.5 h-3.5" />
                                                            Details
                                                        </button>
                                                        {r.docname && (
                                                            <button onClick={() => handleDownload(r.id, r.docname, 'original')} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors" title="Download Report">
                                                                <Download className="w-3.5 h-3.5" />
                                                                Report
                                                            </button>
                                                        )}
                                                        {r.supportingDocname && (
                                                            <button onClick={() => handleDownload(r.id, r.supportingDocname, 'supporting')} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 rounded-md transition-colors" title="Download Findings">
                                                                <Download className="w-3.5 h-3.5" />
                                                                Findings
                                                            </button>
                                                        )}
                                                        {isApprover && r.reportstatus === 'Corrected' && (
                                                            <>
                                                                <button onClick={() => { setSelectedReport(r); setIsApproveOpen(true); }} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors" title="Approve">
                                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                                    Approve
                                                                </button>
                                                                <button onClick={() => { setSelectedReport(r); setIsRejectOpen(true); }} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors" title="Reject">
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

            <Dialog.Root open={isApproveOpen} onOpenChange={setIsApproveOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/40" />
                    <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] border bg-white p-6 shadow-lg rounded-lg">
                        <Dialog.Title className="text-lg font-semibold mb-4 border-b pb-2">Approve Report</Dialog.Title>
                        <div className="my-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Internal Approval Letter (Optional)</label>
                            <input type="file" onChange={e => setApprovalDocument(e.target.files?.[0] || null)} className="w-full text-sm" />
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setIsApproveOpen(false)} className="px-4 py-2 border rounded-md text-sm">Cancel</button>
                            <button onClick={submitApprove} disabled={submitting} className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm">{submitting ? 'Approving...' : 'Approve'}</button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            <Dialog.Root open={isRejectOpen} onOpenChange={setIsRejectOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/40" />
                    <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] border bg-white p-6 shadow-lg rounded-lg">
                        <Dialog.Title className="text-lg font-semibold mb-4 border-b pb-2">Reject Report</Dialog.Title>
                        <div className="my-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Rejection</label>
                                <textarea className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500" rows={4} value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Attach Rejection Document (Optional)</label>
                                <input type="file" onChange={e => setRejectionDocument(e.target.files?.[0] || null)} className="w-full text-sm" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setIsRejectOpen(false)} className="px-4 py-2 border rounded-md text-sm">Cancel</button>
                            <button onClick={submitReject} disabled={submitting} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm">{submitting ? 'Rejecting...' : 'Reject'}</button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>


            {/* Details Modal */}
            <Dialog.Root open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/40" />
                    <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-3xl translate-x-[-50%] translate-y-[-50%] border bg-white p-6 shadow-lg rounded-lg max-h-[90vh] overflow-y-auto">
                        <Dialog.Title className="text-xl font-semibold mb-4 border-b pb-2">Report Details</Dialog.Title>
                        {selectedReport && (
                            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase">Date</label>
                                    <div className="mt-1 text-sm text-gray-900 border p-2 rounded-md bg-gray-50">
                                        {selectedReport.createdDate ? new Date(selectedReport.createdDate).toLocaleDateString() : 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase">Organization</label>
                                    <div className="mt-1 text-sm text-gray-900 border p-2 rounded-md bg-gray-50">
                                        {resolve(selectedReport.organization?.orgname) || 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase">Budget Year</label>
                                    <div className="mt-1 text-sm text-gray-900 border p-2 rounded-md bg-gray-50">
                                        {selectedReport.fiscal_year || selectedReport.budgetYear?.fiscalYear || 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase">Report Type</label>
                                    <div className="mt-1 text-sm text-gray-900 border p-2 rounded-md bg-gray-50">
                                        {resolve(selectedReport.transactiondocument?.reportype) || 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase">Created By</label>
                                    <div className="mt-1 text-sm text-gray-900 border p-2 rounded-md bg-gray-50">
                                        {selectedReport.createdBy || 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase">Auditor</label>
                                    <div className="mt-1 text-sm text-gray-900 border p-2 rounded-md bg-gray-50">
                                        {selectedReport.submittedByAuditorUsername || 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase">Response Needed</label>
                                    <div className="mt-1 text-sm text-gray-900 border p-2 rounded-md bg-gray-50">
                                        {selectedReport.responseNeeded || 'N/A'}
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase">Audit Findings (Remarks)</label>
                                    <div className="mt-1 text-sm text-gray-900 border p-2 rounded-md bg-gray-50 min-h-[60px] whitespace-pre-wrap">
                                        {selectedReport.remarks || 'No remarks available'}
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
                            <button onClick={() => setIsDetailsOpen(false)} className="px-5 py-2 border rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">Close</button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

        </div>
    );
}
