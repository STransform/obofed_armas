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
import { SimplePagination } from '@/components/SimplePagination';

const PAGE_SIZE = 5;


export default function OrganizationsPage() {
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

    const [organizations, setOrganizations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterText, setFilterText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState<string | null>(null);

    // Dialogs State
    const [isAddEditOpen, setIsAddEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [formMode, setFormMode] = useState<'new' | 'edit'>('new');

    const [currentOrg, setCurrentOrg] = useState({ id: '', orgname: '', email: '', telephone: '', organizationhead: '', orgtype: '' });
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchOrganizations();
    }, [isAuthenticated]);

    const fetchOrganizations = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/organizations');
            setOrganizations(Array.isArray(res.data) ? res.data : []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch organizations');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAdd = () => {
        setFormMode('new');
        setCurrentOrg({ id: '', orgname: '', email: '', telephone: '', organizationhead: '', orgtype: '' });
        setIsAddEditOpen(true);
    };

    const handleOpenEdit = (org: any) => {
        setFormMode('edit');
        setCurrentOrg({
            id: org.id || '',
            orgname: org.orgname || '',
            email: org.email || '',
            telephone: org.telephone || '',
            organizationhead: org.organizationhead || '',
            orgtype: org.orgtype || ''
        });
        setIsAddEditOpen(true);
    };

    const handleOpenView = (org: any) => {
        setCurrentOrg({
            id: org.id || '',
            orgname: org.orgname || '',
            email: org.email || '',
            telephone: org.telephone || '',
            organizationhead: org.organizationhead || '',
            orgtype: org.orgtype || ''
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
                id: currentOrg.id.trim(),
                orgname: currentOrg.orgname.trim(),
                email: currentOrg.email.trim(),
                telephone: currentOrg.telephone.trim(),
                organizationhead: currentOrg.organizationhead.trim(),
                orgtype: currentOrg.orgtype.trim(),
            };

            if (formMode === 'new') {
                const res = await axiosInstance.post('/organizations', payload);
                setOrganizations([...organizations, res.data]);
            } else {
                const res = await axiosInstance.put(`/organizations/${currentOrg.id}`, payload);
                setOrganizations(organizations.map(o => o.id === currentOrg.id ? res.data : o));
            }
            setIsAddEditOpen(false);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error saving organization');
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await axiosInstance.delete(`/organizations/${deleteId}`);
            setOrganizations(organizations.filter(o => o.id !== deleteId));
            setIsDeleteOpen(false);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error deleting organization');
        }
    };

    const filtered = organizations.filter(o =>
        (o.orgname || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (o.email || '').toLowerCase().includes(filterText.toLowerCase())
    );
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    useEffect(() => {
        setCurrentPage(1);
    }, [filterText]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    if (!isAuthenticated) return null;

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-8 max-w-7xl w-full mx-auto">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{msgs.orgs.title}</h1>
                            <p className="text-sm text-gray-500 mt-1">{msgs.orgs.subtitle}</p>
                        </div>
                        <button
                            onClick={handleOpenAdd}
                            className="bg-[linear-gradient(135deg,#065f46_0%,#0f766e_100%)] hover:bg-[linear-gradient(135deg,#047857_0%,#0f766e_100%)] text-white px-4 py-2 flex items-center rounded-md font-medium transition shadow-sm"
                        >
                            <Plus className="w-4 h-4 mr-2" /> {msgs.orgs.addBtn}
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
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{msgs.table.colNum}</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{msgs.table.colName}</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{msgs.table.colEmail}</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{msgs.table.colTelephone}</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{msgs.table.colAddress}</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{msgs.table.colType}</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{msgs.table.colActions}</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {loading ? (
                                        <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">{msgs.table.loading}</td></tr>
                                    ) : filtered.length === 0 ? (
                                        <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">{msgs.orgs.empty}</td></tr>
                                    ) : (
                                        paginated.map((org, index) => (
                                            <tr key={org.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{((currentPage - 1) * PAGE_SIZE) + index + 1}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{resolve(org.orgname) || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{org.email || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{org.telephone || 'N/A'}</td>
                                                <td className="px-6 py-4 px-2 text-sm text-gray-500 truncate max-w-[200px]">{resolve(org.organizationhead) || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{resolve(org.orgtype) || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button onClick={() => handleOpenView(org)} className="text-indigo-600 hover:text-indigo-900 mx-2" title="View Details"><Eye className="w-4 h-4" /></button>
                                                    <button onClick={() => handleOpenEdit(org)} className="text-amber-600 hover:text-amber-900 mx-2" title="Edit"><Edit className="w-4 h-4" /></button>
                                                    <button onClick={() => handleOpenDelete(org.id)} className="text-red-600 hover:text-red-900 mx-2" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <SimplePagination
                            currentPage={currentPage}
                            totalItems={filtered.length}
                            pageSize={PAGE_SIZE}
                            onPageChange={setCurrentPage}
                            itemLabel="organizations"
                        />
                    </div>
                </main>
            </div>

            {/* Radix Dialog: Add/Edit */}
            <Dialog.Root open={isAddEditOpen} onOpenChange={setIsAddEditOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                    <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 sm:rounded-lg">
                        <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
                            {formMode === 'new' ? msgs.orgs.createTitle : msgs.orgs.editTitle}
                        </Dialog.Title>
                        <form onSubmit={handleSave} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label className="text-right text-sm font-medium">{msgs.orgs.lblOrgCode} <span className="text-red-500">*</span></label>
                                <input required value={currentOrg.id} onChange={e => setCurrentOrg({ ...currentOrg, id: e.target.value })} disabled={formMode === 'edit'} className="col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100" placeholder="e.g. ORG123" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label className="text-right text-sm font-medium">{msgs.table.colName} <span className="text-red-500">*</span></label>
                                <input required value={currentOrg.orgname} onChange={e => setCurrentOrg({ ...currentOrg, orgname: e.target.value })} className="col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500" placeholder="e.g. Ministry of Finance" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label className="text-right text-sm font-medium">{msgs.table.colEmail} <span className="text-red-500">*</span></label>
                                <input required type="email" value={currentOrg.email} onChange={e => setCurrentOrg({ ...currentOrg, email: e.target.value })} className="col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label className="text-right text-sm font-medium">{msgs.table.colTelephone}</label>
                                <input type="tel" value={currentOrg.telephone} onChange={e => setCurrentOrg({ ...currentOrg, telephone: e.target.value })} className="col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label className="text-right text-sm font-medium">{msgs.table.colAddress}</label>
                                <input value={currentOrg.organizationhead} onChange={e => setCurrentOrg({ ...currentOrg, organizationhead: e.target.value })} className="col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label className="text-right text-sm font-medium">{msgs.table.colType} <span className="text-red-500">*</span></label>
                                <input required value={currentOrg.orgtype} onChange={e => setCurrentOrg({ ...currentOrg, orgtype: e.target.value })} className="col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500" placeholder="e.g. Social" />
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
                        <Dialog.Description className="text-sm text-gray-500 mb-6">{msgs.orgs.confirmDelete}</Dialog.Description>
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
                    <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] border bg-white p-6 shadow-lg rounded-lg">
                        <Dialog.Title className="text-lg font-semibold mb-4 border-b pb-2">{msgs.orgs.viewDetails}: {resolve(currentOrg.orgname)}</Dialog.Title>
                        <div className="grid grid-cols-2 gap-6 text-sm mt-4">
                            <div className="border border-gray-100 rounded p-4 bg-gray-50">
                                <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{msgs.orgs.lblOrgCode}</span>
                                <span className="font-medium text-gray-900">{currentOrg.id || 'N/A'}</span>
                            </div>
                            <div className="border border-gray-100 rounded p-4 bg-gray-50">
                                <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{msgs.table.colType}</span>
                                <span className="font-medium text-gray-900">{currentOrg.orgtype || 'N/A'}</span>
                            </div>
                            <div className="border border-gray-100 rounded p-4 bg-gray-50">
                                <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{msgs.table.colEmail}</span>
                                <span className="font-medium text-gray-900">{currentOrg.email || 'N/A'}</span>
                            </div>
                            <div className="border border-gray-100 rounded p-4 bg-gray-50">
                                <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{msgs.table.colTelephone}</span>
                                <span className="font-medium text-gray-900">{currentOrg.telephone || 'N/A'}</span>
                            </div>
                            <div className="col-span-2 border border-gray-100 rounded p-4 bg-gray-50">
                                <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{msgs.table.colAddress}</span>
                                <span className="font-medium text-gray-900">{currentOrg.organizationhead || 'N/A'}</span>
                            </div>
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
