'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import axiosInstance from '@/lib/axios';
import { Search, Eye, Download, UploadCloud } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

const downloadFile = async (id: string | number, type: string) => {
    return axiosInstance.get(`/transactions/download/${id}/${type}`, {
        responseType: 'blob'
    });
};

export default function ApprovedReportsPage() {
    const { isAuthenticated, userRole } = useAuth();
    const isArchiver = userRole === 'ARCHIVER';

    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterText, setFilterText] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Modals
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState<any>(null);

    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [letterFile, setLetterFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchReports();
    }, [isAuthenticated]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/transactions/approved-reports');
            setReports(Array.isArray(res.data) ? res.data : []);
        } catch (err: any) {
            setError(err.message || 'Failed to load approved reports');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (id: number, docname: string, type = 'supporting') => {
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

    const handleOpenUpload = (report: any) => {
        setSelectedReport(report);
        setLetterFile(null);
        setIsUploadOpen(true);
    };

    const submitLetterUpload = async () => {
        if (!letterFile) return alert('Please select a file to upload');
        setUploading(true);

        const formData = new FormData();
        formData.append('file', letterFile);

        try {
            await axiosInstance.post(`/transactions/upload-letter/${selectedReport.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setIsUploadOpen(false);
            fetchReports();
        } catch (err: any) {
            alert(err.response?.data || 'Failed to upload letter');
        } finally {
            setUploading(false);
        }
    };

    const filtered = reports.filter(r =>
        (r.orgname || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (r.reportype || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (r.submittedByAuditorUsername || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (r.reportstatus || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (r.fiscalYear || '').toString().toLowerCase().includes(filterText.toLowerCase())
    );

    if (!isAuthenticated) return <div className="p-8">Please log in.</div>;

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-8 max-w-7xl w-full mx-auto">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Approved Reports</h1>
                        <p className="text-sm text-gray-500 mt-1">Review finalized reports, download findings, and dispatch letters.</p>
                    </div>

                    {error && <div className="mb-4 bg-red-50 text-red-700 p-3 rounded">{error}</div>}

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b flex items-center justify-between bg-gray-50/50">
                            <div className="relative w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by org, type, auditor..."
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
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget Year</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Type</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {loading ? (
                                        <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Loading approved reports...</td></tr>
                                    ) : filtered.length === 0 ? (
                                        <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No approved reports found.</td></tr>
                                    ) : (
                                        filtered.map(r => (
                                            <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.createdDate ? new Date(r.createdDate).toLocaleDateString() : 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.orgname || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.fiscalYear || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.reportype || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 py-1 flex items-center justify-center rounded text-xs font-medium bg-green-100 text-green-800`}>
                                                        {r.reportstatus || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end space-x-3">
                                                        <button onClick={() => { setSelectedReport(r); setIsDetailsOpen(true); }} className="text-gray-600 hover:text-indigo-900" title="View Details">
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        {r.docname && (
                                                            <button onClick={() => handleDownload(r.id, r.docname, 'original')} className="text-gray-600 hover:text-indigo-900" title="Download Report">
                                                                <Download className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        {r.supportingDocname && (
                                                            <button onClick={() => handleDownload(r.id, r.supportingDocname, 'supporting')} className="text-indigo-600 hover:text-indigo-900" title="Download Findings">
                                                                <Download className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        {isArchiver && r.reportstatus === 'Approved' && r.letterDocname && (
                                                            <button onClick={() => handleDownload(r.id, r.letterDocname, 'letter')} className="text-emerald-600 hover:text-emerald-900" title="Download Letter">
                                                                <Download className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        {isArchiver && r.reportstatus === 'Approved' && !r.letterDocname && (
                                                            <button onClick={() => handleOpenUpload(r)} className="text-amber-600 hover:text-amber-900" title="Upload Final Letter">
                                                                <UploadCloud className="w-4 h-4" />
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

            {/* Radix Dialog: Upload Letter */}
            <Dialog.Root open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/40" />
                    <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] border bg-white p-6 shadow-lg rounded-lg">
                        <Dialog.Title className="text-lg font-semibold mb-4 border-b pb-2">Upload Dispatch Letter</Dialog.Title>
                        <div className="my-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Letter File (PDF/DOCX)</label>
                            <input
                                type="file"
                                onChange={e => setLetterFile(e.target.files?.[0] || null)}
                                className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            />
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setIsUploadOpen(false)} className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50">Cancel</button>
                            <button
                                onClick={submitLetterUpload}
                                disabled={uploading || !letterFile}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {uploading ? 'Uploading...' : 'Upload Letter'}
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
                        <Dialog.Title className="text-lg font-semibold mb-6 border-b pb-2">Approved Report Summary</Dialog.Title>

                        <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm mt-4">
                            <div><label className="text-gray-500 font-medium">Date</label><div className="p-2 bg-gray-50 border rounded">{selectedReport?.createdDate ? new Date(selectedReport.createdDate).toLocaleDateString() : 'N/A'}</div></div>
                            <div><label className="text-gray-500 font-medium">Status</label><div className="p-2 bg-gray-50 border rounded">{selectedReport?.reportstatus || 'N/A'}</div></div>
                            <div><label className="text-gray-500 font-medium">Organization</label><div className="p-2 bg-gray-50 border rounded">{selectedReport?.orgname || 'N/A'}</div></div>
                            <div><label className="text-gray-500 font-medium">Budget Year</label><div className="p-2 bg-gray-50 border rounded">{selectedReport?.fiscalYear || 'N/A'}</div></div>
                            <div><label className="text-gray-500 font-medium">Report Type</label><div className="p-2 bg-gray-50 border rounded">{selectedReport?.reportype || 'N/A'}</div></div>
                            <div><label className="text-gray-500 font-medium">Auditor</label><div className="p-2 bg-gray-50 border rounded">{selectedReport?.submittedByAuditorUsername || 'N/A'}</div></div>
                            <div><label className="text-gray-500 font-medium">Approver</label><div className="p-2 bg-gray-50 border rounded">{selectedReport?.lastModifiedBy || 'N/A'}</div></div>
                            <div><label className="text-gray-500 font-medium">Archiver</label><div className="p-2 bg-gray-50 border rounded">{selectedReport?.assignedByUsername || 'N/A'}</div></div>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                            {selectedReport?.docname && (
                                <button onClick={() => handleDownload(selectedReport.id, selectedReport.docname, 'original')} className="flex items-center text-gray-700 bg-gray-100 border px-3 py-1.5 rounded font-medium hover:bg-gray-200 text-sm">
                                    <Download className="w-4 h-4 mr-2" /> Original Report
                                </button>
                            )}
                            {selectedReport?.supportingDocname && (
                                <button onClick={() => handleDownload(selectedReport.id, selectedReport.supportingDocname, 'supporting')} className="flex items-center text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded font-medium hover:bg-indigo-100 text-sm">
                                    <Download className="w-4 h-4 mr-2" /> Audit Findings
                                </button>
                            )}
                            {selectedReport?.letterDocname && (
                                <button onClick={() => handleDownload(selectedReport.id, selectedReport.letterDocname, 'letter')} className="flex items-center text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded font-medium hover:bg-emerald-100 text-sm">
                                    <Download className="w-4 h-4 mr-2" /> Dispatch Letter
                                </button>
                            )}
                        </div>

                        <div className="flex justify-end mt-6 border-t pt-4">
                            <button onClick={() => setIsDetailsOpen(false)} className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50">Close</button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

        </div>
    );
}
