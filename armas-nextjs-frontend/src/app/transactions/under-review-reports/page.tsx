'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import axiosInstance from '@/lib/axios';
import { Search, Download, CheckCircle, XCircle } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

export default function UnderReviewReportsPage() {
    const { isAuthenticated, userRole } = useAuth();
    const isApprover = userRole === 'APPROVER';

    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterText, setFilterText] = useState('');

    const [selectedReport, setSelectedReport] = useState<any>(null);
    const [isApproveOpen, setIsApproveOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);

    const [approvalDocument, setApprovalDocument] = useState<File | null>(null);
    const [rejectionDocument, setRejectionDocument] = useState<File | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchReports();
    }, [isAuthenticated]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/transactions/under-review-reports');
            const data = Array.isArray(res.data) ? res.data : [];
            setReports(data.filter(r => r && r.id));
            if (data.length === 0) setError('No reports under review.');
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
            alert(err.response?.data || 'Error approving report');
        } finally {
            setSubmitting(false);
        }
    };

    const submitReject = async () => {
        if (!rejectionReason) return alert('Please outline rejection reason');
        setSubmitting(true);
        const formData = new FormData();
        if (rejectionDocument) formData.append('rejectionDocument', rejectionDocument);
        try {
            await axiosInstance.post(`/transactions/reject/${selectedReport.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                params: { reasonOfRejection: rejectionReason }
            });
            setIsRejectOpen(false);
            setRejectionDocument(null);
            setRejectionReason('');
            fetchReports();
        } catch (err: any) {
            alert(err.response?.data || 'Error rejecting report');
        } finally {
            setSubmitting(false);
        }
    };

    const filtered = reports.filter(r =>
        (r.organization?.orgname || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (r.transactiondocument?.reportype || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (r.remarks || '').toLowerCase().includes(filterText.toLowerCase())
    );

    if (!isAuthenticated) return null;

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-8 max-w-7xl w-full mx-auto">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Under Review Reports</h1>
                        <p className="text-sm text-gray-500 mt-1">Review finalized findings submitted by auditors.</p>
                    </div>

                    {error && <div className="mb-4 bg-red-50 text-red-700 p-3 rounded">{error}</div>}

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b flex items-center justify-between bg-gray-50/50">
                            <div className="relative w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search reports..."
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
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organization</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Report Type</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Audit Findings</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {loading ? (
                                        <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Loading reports...</td></tr>
                                    ) : filtered.map(r => (
                                        <tr key={r.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.createdDate ? new Date(r.createdDate).toLocaleDateString() : 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.organization?.orgname || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.transactiondocument?.reportype || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">{r.remarks || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <div className="flex justify-end gap-3">
                                                    {r.docname && (
                                                        <button onClick={() => handleDownload(r.id, r.docname, 'original')} className="text-gray-600 hover:text-indigo-900" title="Original"><Download className="w-4 h-4" /></button>
                                                    )}
                                                    {r.supportingDocname && (
                                                        <button onClick={() => handleDownload(r.id, r.supportingDocname, 'supporting')} className="text-indigo-600 hover:text-indigo-900" title="Findings"><Download className="w-4 h-4" /></button>
                                                    )}
                                                    {isApprover && (
                                                        <>
                                                            <button onClick={() => { setSelectedReport(r); setIsApproveOpen(true); }} className="text-emerald-600 hover:text-emerald-900" title="Approve"><CheckCircle className="w-4 h-4" /></button>
                                                            <button onClick={() => { setSelectedReport(r); setIsRejectOpen(true); }} className="text-red-600 hover:text-red-900" title="Reject"><XCircle className="w-4 h-4" /></button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
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
        </div>
    );
}
