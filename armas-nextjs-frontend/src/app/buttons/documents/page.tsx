'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import axiosInstance from '@/lib/axios';
import { Search, Plus, Edit, Trash2, Eye } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useTranslation } from '@/hooks/useTranslation';

export default function ReportTypePage() {
    const { isAuthenticated } = useAuth();
    const { resolve } = useTranslation();

    const [documents, setDocuments] = useState<any[]>([]);
    const [directorates, setDirectorates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterText, setFilterText] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Dialogs State
    const [isAddEditOpen, setIsAddEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [formMode, setFormMode] = useState<'new' | 'edit'>('new');

    const [currentDoc, setCurrentDoc] = useState({ id: '', reportype: '', directorateId: '' });
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchData();
    }, [isAuthenticated]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [dirRes, docRes] = await Promise.all([
                axiosInstance.get('/directorates'),
                axiosInstance.get('/documents')
            ]);
            setDirectorates(Array.isArray(dirRes.data) ? dirRes.data : []);
            setDocuments(Array.isArray(docRes.data) ? docRes.data : []);

            if (dirRes.data.length === 0) {
                setError('No directorates available. Please add a directorate first.');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAdd = () => {
        setFormMode('new');
        setCurrentDoc({ id: '', reportype: '', directorateId: '' });
        setIsAddEditOpen(true);
    };

    const handleOpenEdit = (doc: any) => {
        setFormMode('edit');
        setCurrentDoc({
            id: doc.id || '',
            reportype: doc.reportype || '',
            directorateId: doc.directorate?.id || ''
        });
        setIsAddEditOpen(true);
    };

    const handleOpenView = (doc: any) => {
        setCurrentDoc({
            id: doc.id || '',
            reportype: doc.reportype || '',
            directorateId: doc.directoratename || doc.directorate?.directoratename || ''
        });
        setIsViewOpen(true);
    };

    const handleOpenDelete = (id: string) => {
        setDeleteId(id);
        setIsDeleteOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                reportype: currentDoc.reportype.trim(),
                directorateId: currentDoc.directorateId
            };

            if (formMode === 'new') {
                await axiosInstance.post('/documents', payload);
            } else {
                await axiosInstance.put(`/documents/${currentDoc.id}`, payload);
            }
            setIsAddEditOpen(false);
            await fetchData(); // Re-fetch to get updated directorate names from backend
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error saving report type');
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await axiosInstance.delete(`/documents/${deleteId}`);
            setDocuments(documents.filter(d => d.id !== deleteId));
            setIsDeleteOpen(false);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error deleting report type');
        }
    };

    const getDirectorateName = (idOrName: string) => {
        // First try to find by id
        const byId = directorates.find(d => String(d.id) === String(idOrName));
        if (byId) return byId.directoratename;
        // Otherwise it might already be the name itself
        return idOrName || 'N/A';
    };

    const filtered = documents.filter(d =>
        (d.reportype || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (d.directoratename || d.directorate?.directoratename || '').toLowerCase().includes(filterText.toLowerCase())
    );

    if (!isAuthenticated) return null;

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-8 max-w-7xl w-full mx-auto">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Report Types</h1>
                            <p className="text-sm text-gray-500 mt-1">Manage master reporting schemas tied to directorates.</p>
                        </div>
                        <button
                            onClick={handleOpenAdd}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 flex items-center rounded-md font-medium transition shadow-sm"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Add Report Type
                        </button>
                    </div>

                    {error && <div className="mb-4 bg-red-50 text-red-700 p-3 rounded">{error}</div>}

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b flex items-center justify-between bg-gray-50/50">
                            <div className="relative w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search reports or directorates..."
                                    className="w-full pl-9 pr-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={filterText}
                                    onChange={e => setFilterText(e.target.value)}
                                />
                            </div>
                            <span className="text-sm text-gray-500 font-medium">Total: {filtered.length} entries</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Type</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Directorate</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {loading ? (
                                        <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-500">Loading records...</td></tr>
                                    ) : filtered.length === 0 ? (
                                        <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-500">No report types found.</td></tr>
                                    ) : (
                                        filtered.map(doc => (
                                            <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{resolve(doc.reportype) || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{resolve(doc.directoratename || doc.directorate?.directoratename) || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button onClick={() => handleOpenView(doc)} className="text-indigo-600 hover:text-indigo-900 mx-2" title="View Details"><Eye className="w-4 h-4" /></button>
                                                    <button onClick={() => handleOpenEdit(doc)} className="text-amber-600 hover:text-amber-900 mx-2" title="Edit"><Edit className="w-4 h-4" /></button>
                                                    <button onClick={() => handleOpenDelete(doc.id)} className="text-red-600 hover:text-red-900 mx-2" title="Delete"><Trash2 className="w-4 h-4" /></button>
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

            {/* Radix Dialog: Add/Edit */}
            <Dialog.Root open={isAddEditOpen} onOpenChange={setIsAddEditOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                    <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 sm:rounded-lg">
                        <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
                            {formMode === 'new' ? 'Create Report Type' : 'Edit Report Type'}
                        </Dialog.Title>
                        <form onSubmit={handleSave} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label className="text-right text-sm font-medium">Type Name <span className="text-red-500">*</span></label>
                                <input required value={currentDoc.reportype} onChange={e => setCurrentDoc({ ...currentDoc, reportype: e.target.value })} className="col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500" placeholder="e.g. Monthly Finance Report" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label className="text-right text-sm font-medium">Directorate <span className="text-red-500">*</span></label>
                                <select required value={currentDoc.directorateId} onChange={e => setCurrentDoc({ ...currentDoc, directorateId: e.target.value })} className="col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 bg-white">
                                    <option value="" disabled>Select Directorate</option>
                                    {directorates.map(d => (
                                        <option key={d.id} value={d.id}>{resolve(d.directoratename)}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setIsAddEditOpen(false)} className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Save</button>
                            </div>
                        </form>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            {/* Radix Dialog: Confirm Delete */}
            <Dialog.Root open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/40" />
                    <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-sm translate-x-[-50%] translate-y-[-50%] border bg-white p-6 shadow-lg rounded-lg">
                        <Dialog.Title className="text-lg font-semibold mb-2">Confirm Deletion</Dialog.Title>
                        <Dialog.Description className="text-sm text-gray-500 mb-6">Are you sure you want to delete this report type? This action cannot be undone.</Dialog.Description>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setIsDeleteOpen(false)} className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50">Cancel</button>
                            <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700">Delete</button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            {/* Radix Dialog: View Details */}
            <Dialog.Root open={isViewOpen} onOpenChange={setIsViewOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/40" />
                    <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-sm translate-x-[-50%] translate-y-[-50%] border bg-white p-6 shadow-lg rounded-lg">
                        <Dialog.Title className="text-lg font-semibold mb-4 border-b pb-2">Report Details</Dialog.Title>
                        <div className="space-y-4 text-sm mt-4">
                            <div className="flex border-b pb-2"><span className="w-1/3 font-medium text-gray-500">ID:</span> <span className="w-2/3 text-gray-900">{currentDoc.id}</span></div>
                            <div className="flex border-b pb-2"><span className="w-1/3 font-medium text-gray-500">Report Type:</span> <span className="w-2/3 text-gray-900">{resolve(currentDoc.reportype)}</span></div>
                            <div className="flex"><span className="w-1/3 font-medium text-gray-500">Directorate:</span> <span className="w-2/3 text-gray-900">{resolve(getDirectorateName(currentDoc.directorateId))}</span></div>
                        </div>
                        <div className="flex justify-end mt-6">
                            <button onClick={() => setIsViewOpen(false)} className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800">Close</button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
}
