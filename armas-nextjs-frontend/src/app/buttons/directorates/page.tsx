'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import axiosInstance from '@/lib/axios';
import { Search, Plus, Edit, Trash2, Eye } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useTranslation } from '@/hooks/useTranslation';
import { getMessages, type Lang } from '@/lib/messages';

export default function DirectoratesPage() {
    const { isAuthenticated } = useAuth();
    const { resolve } = useTranslation();

    const [lang, setLang] = useState<Lang>('en');
    useEffect(() => {
        const s = localStorage.getItem('armas_lang') as Lang | null;
        if (s && (s === 'en' || s === 'am' || s === 'om')) setLang(s);
        const handler = () => {
            const v = localStorage.getItem('armas_lang') as Lang | null;
            if (v && (v === 'en' || v === 'am' || v === 'om')) setLang(v);
        };
        window.addEventListener('storage', handler);
        return () => window.removeEventListener('storage', handler);
    }, []);
    const msgs = getMessages(lang);

    const [directorates, setDirectorates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterText, setFilterText] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Dialogs State
    const [isAddEditOpen, setIsAddEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [formMode, setFormMode] = useState<'new' | 'edit'>('new');

    const [currentDir, setCurrentDir] = useState({ id: '', directoratename: '', telephone: '', email: '' });
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchDirectorates();
    }, [isAuthenticated]);

    const fetchDirectorates = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/directorates');
            setDirectorates(Array.isArray(res.data) ? res.data : []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch directorates');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAdd = () => {
        setFormMode('new');
        setCurrentDir({ id: '', directoratename: '', telephone: '', email: '' });
        setIsAddEditOpen(true);
    };

    const handleOpenEdit = (dir: any) => {
        setFormMode('edit');
        setCurrentDir({ id: dir.id || '', directoratename: dir.directoratename || '', telephone: dir.telephone || '', email: dir.email || '' });
        setIsAddEditOpen(true);
    };

    const handleOpenView = (dir: any) => {
        setCurrentDir({ id: dir.id || '', directoratename: dir.directoratename || '', telephone: dir.telephone || '', email: dir.email || '' });
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
                directoratename: currentDir.directoratename.trim(),
                telephone: currentDir.telephone.trim() || null,
                email: currentDir.email.trim() || null,
            };

            if (formMode === 'new') {
                const res = await axiosInstance.post('/directorates', payload);
                setDirectorates([...directorates, res.data]);
            } else {
                const res = await axiosInstance.put(`/directorates/${currentDir.id}`, payload);
                setDirectorates(directorates.map(d => d.id === currentDir.id ? res.data : d));
            }
            setIsAddEditOpen(false);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error saving directorate');
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await axiosInstance.delete(`/directorates/${deleteId}`);
            setDirectorates(directorates.filter(d => d.id !== deleteId));
            setIsDeleteOpen(false);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error deleting directorate');
        }
    };

    const filtered = directorates.filter(d =>
        (d.directoratename || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (d.email || '').toLowerCase().includes(filterText.toLowerCase())
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
                            <h1 className="text-3xl font-bold text-gray-900">{msgs.dirs.title}</h1>
                            <p className="text-sm text-gray-500 mt-1">{msgs.dirs.subtitle}</p>
                        </div>
                        <button
                            onClick={handleOpenAdd}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 flex items-center rounded-md font-medium transition shadow-sm"
                        >
                            <Plus className="w-4 h-4 mr-2" /> {msgs.dirs.addBtn}
                        </button>
                    </div>

                    {error && <div className="mb-4 bg-red-50 text-red-700 p-3 rounded">{error}</div>}

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b flex items-center justify-between bg-gray-50/50">
                            <div className="relative w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={msgs.table.search}
                                    className="w-full pl-9 pr-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={filterText}
                                    onChange={e => setFilterText(e.target.value)}
                                />
                            </div>
                            <span className="text-sm text-gray-500 font-medium">{msgs.table.total}: {filtered.length} {msgs.table.entries}</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{msgs.table.colDirName}</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{msgs.table.colTelephone}</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{msgs.table.colEmail}</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{msgs.table.colActions}</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {loading ? (
                                        <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">{msgs.table.loading}</td></tr>
                                    ) : filtered.length === 0 ? (
                                        <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">{msgs.dirs.empty}</td></tr>
                                    ) : (
                                        filtered.map(dir => (
                                            <tr key={dir.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{resolve(dir.directoratename) || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dir.telephone || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dir.email || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button onClick={() => handleOpenView(dir)} className="text-indigo-600 hover:text-indigo-900 mx-2" title="View Details"><Eye className="w-4 h-4" /></button>
                                                    <button onClick={() => handleOpenEdit(dir)} className="text-amber-600 hover:text-amber-900 mx-2" title="Edit"><Edit className="w-4 h-4" /></button>
                                                    <button onClick={() => handleOpenDelete(dir.id)} className="text-red-600 hover:text-red-900 mx-2" title="Delete"><Trash2 className="w-4 h-4" /></button>
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
                            {formMode === 'new' ? msgs.dirs.createTitle : msgs.dirs.editTitle}
                        </Dialog.Title>
                        <form onSubmit={handleSave} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label className="text-right text-sm font-medium">{msgs.table.colName} <span className="text-red-500">*</span></label>
                                <input required value={currentDir.directoratename} onChange={e => setCurrentDir({ ...currentDir, directoratename: e.target.value })} className="col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500" placeholder="e.g. Finance" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label className="text-right text-sm font-medium">{msgs.table.colTelephone}</label>
                                <input type="tel" value={currentDir.telephone} onChange={e => setCurrentDir({ ...currentDir, telephone: e.target.value })} className="col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label className="text-right text-sm font-medium">{msgs.table.colEmail}</label>
                                <input type="email" value={currentDir.email} onChange={e => setCurrentDir({ ...currentDir, email: e.target.value })} className="col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500" />
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setIsAddEditOpen(false)} className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50">{msgs.table.btnCancel}</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">{msgs.table.btnSave}</button>
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
                        <Dialog.Title className="text-lg font-semibold mb-2">{msgs.table.confirmDeletion}</Dialog.Title>
                        <Dialog.Description className="text-sm text-gray-500 mb-6">{msgs.dirs.confirmDelete}</Dialog.Description>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setIsDeleteOpen(false)} className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50">{msgs.table.btnCancel}</button>
                            <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700">{msgs.table.btnDelete}</button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            {/* Radix Dialog: View Details */}
            <Dialog.Root open={isViewOpen} onOpenChange={setIsViewOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/40" />
                    <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] border bg-white p-6 shadow-lg rounded-lg">
                        <Dialog.Title className="text-lg font-semibold mb-4 border-b pb-2">{msgs.dirs.viewDetails}</Dialog.Title>
                        <div className="space-y-4 text-sm mt-4">
                            <div className="flex border-b pb-2"><span className="w-1/3 font-medium text-gray-500">{msgs.table.lblId}:</span> <span className="w-2/3 text-gray-900">{currentDir.id}</span></div>
                            <div className="flex border-b pb-2"><span className="w-1/3 font-medium text-gray-500">{msgs.table.colName}:</span> <span className="w-2/3 text-gray-900">{resolve(currentDir.directoratename)}</span></div>
                            <div className="flex border-b pb-2"><span className="w-1/3 font-medium text-gray-500">{msgs.table.colTelephone}:</span> <span className="w-2/3 text-gray-900">{currentDir.telephone || 'N/A'}</span></div>
                            <div className="flex"><span className="w-1/3 font-medium text-gray-500">{msgs.table.colEmail}:</span> <span className="w-2/3 text-gray-900">{currentDir.email || 'N/A'}</span></div>
                        </div>
                        <div className="flex justify-end mt-6">
                            <button onClick={() => setIsViewOpen(false)} className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800">{msgs.table.btnClose}</button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
}
