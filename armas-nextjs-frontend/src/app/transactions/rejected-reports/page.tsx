'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import axiosInstance from '@/lib/axios';
import { Search, Eye, Download, FileEdit, FileSearch } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

export default function RejectedReportsPage() {
    const { isAuthenticated, userRole } = useAuth();
    const isSeniorAuditor = userRole === 'SENIOR_AUDITOR';
    const isApprover = userRole === 'APPROVER';

    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterText, setFilterText] = useState('');

    // Modals
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState<any>(null);

    const [isActionOpen, setIsActionOpen] = useState(false);
    const [actionType, setActionType] = useState('resubmit'); // 'resubmit' or 'evaluate'
    const [remarks, setRemarks] = useState('');
    const [responseNeeded, setResponseNeeded] = useState('Pending');
    const [approvers, setApprovers] = useState<any[]>([]);
    const [selectedApprover, setSelectedApprover] = useState('');
    const [supportingDocument, setSupportingDocument] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchReports();
    }, [isAuthenticated]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/transactions/rejected-reports');
            setReports(Array.isArray(res.data) ? res.data : []);
            if (res.data?.length === 0) setError('No rejected reports available.');
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

    const handleOpenAction = async (report: any, type: string) => {
        setSelectedReport(report);
        setActionType(type);
        setRemarks('');
        setResponseNeeded('Pending');
        setSelectedApprover('');
        setSupportingDocument(null);
        setIsActionOpen(true);

        try {
            const res = await axiosInstance.get('/api/users/role?role=APPROVER');
            setApprovers(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            alert('Failed to load approvers');
        }
    };

    const submitAction = async () => {
        if (!remarks || !selectedApprover || !responseNeeded) return alert('Please fill in all required fields');
        setSubmitting(true);
        const formData = new FormData();
        formData.append('remarks', remarks);
        formData.append('approverUsername', selectedApprover);
        formData.append('responseNeeded', responseNeeded);
        if (supportingDocument) formData.append('supportingDocument', supportingDocument);

        try {
            await axiosInstance.post(`/transactions/submit-findings/${selectedReport.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setIsActionOpen(false);
            fetchReports();
        } catch (err: any) {
            alert(err.response?.data?.error || err.response?.data || 'Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    const filtered = reports.filter(r =>
        (r.organization?.orgname || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (r.transactiondocument?.reportype || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (r.reportstatus || '').toLowerCase().includes(filterText.toLowerCase())
    );

    if (!isAuthenticated) return null;

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-8 max-w-7xl w-full mx-auto">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Rejected Reports</h1>
                        <p className="text-sm text-gray-500 mt-1">Review and evaluate reports that have been rejected.</p>
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
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Response</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {loading ? (
                                        <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Loading reports...</td></tr>
                                    ) : filtered.map(r => (
                                        <tr key={r.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.createdDate ? new Date(r.createdDate).toLocaleDateString() : 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.organization?.orgname || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.transactiondocument?.reportype || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.responseNeeded || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">{r.reportstatus || 'N/A'}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <div className="flex justify-end gap-3">
                                                    <button onClick={() => { setSelectedReport(r); setIsDetailsOpen(true); }} className="text-gray-600 hover:text-indigo-900"><Eye className="w-4 h-4" /></button>
                                                    {r.docname && (
                                                        <button onClick={() => handleDownload(r.id, r.docname, 'original')} className="text-indigo-600 hover:text-indigo-900"><Download className="w-4 h-4" /></button>
                                                    )}
                                                    {isSeniorAuditor && r.reportstatus === 'Rejected' && (
                                                        <button onClick={() => handleOpenAction(r, 'evaluate')} className="text-amber-600 hover:text-amber-900" title="Evaluate"><FileSearch className="w-4 h-4" /></button>
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

            <Dialog.Root open={isActionOpen} onOpenChange={setIsActionOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/40" />
                    <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] border bg-white p-6 shadow-lg rounded-lg">
                        <Dialog.Title className="text-lg font-semibold mb-4 border-b pb-2">{actionType === 'resubmit' ? 'Resubmit Report' : 'Evaluate Report'}</Dialog.Title>
                        <div className="my-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Audit Findings</label>
                                <textarea className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500" rows={4} value={remarks} onChange={e => setRemarks(e.target.value)} />
                            </div>
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Supporting Document</label>
                                <input type="file" onChange={e => setSupportingDocument(e.target.files?.[0] || null)} className="text-sm" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setIsActionOpen(false)} className="px-4 py-2 border rounded-md text-sm">Cancel</button>
                            <button onClick={submitAction} disabled={submitting} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm">{submitting ? 'Submitting...' : 'Submit'}</button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            <Dialog.Root open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/40" />
                    <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] border bg-white p-6 shadow-lg rounded-lg">
                        <Dialog.Title className="text-lg font-semibold mb-6 border-b pb-2">Report Details</Dialog.Title>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm mt-4">
                            <div><label className="text-gray-500 font-medium">Organization</label><div className="p-2 bg-gray-50 border rounded">{selectedReport?.organization?.orgname || 'N/A'}</div></div>
                            <div><label className="text-gray-500 font-medium">Type</label><div className="p-2 bg-gray-50 border rounded">{selectedReport?.transactiondocument?.reportype || 'N/A'}</div></div>
                            <div><label className="text-gray-500 font-medium">Status</label><div className="p-2 bg-gray-50 border rounded">{selectedReport?.reportstatus || 'N/A'}</div></div>
                            <div className="col-span-2"><label className="text-gray-500 font-medium">Rejection Reason</label><div className="p-2 bg-red-50 border border-red-100 rounded text-red-900">{selectedReport?.reasonOfRejection || 'N/A'}</div></div>
                            <div className="col-span-2"><label className="text-gray-500 font-medium">Audit Findings</label><div className="p-2 bg-gray-50 border rounded">{selectedReport?.remarks || 'N/A'}</div></div>
                        </div>
                        <div className="flex justify-end mt-6 border-t pt-4">
                            <button onClick={() => setIsDetailsOpen(false)} className="px-4 py-2 border rounded-md text-sm font-medium">Close</button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

        </div>
    );
}
