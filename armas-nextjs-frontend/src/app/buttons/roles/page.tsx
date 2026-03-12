'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import axiosInstance from '@/lib/axios';
import { Search, Plus } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

export default function RolesPage() {
    const { isAuthenticated } = useAuth();

    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterText, setFilterText] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Dialogs State
    const [isAddOpen, setIsAddOpen] = useState(false);

    const [newRole, setNewRole] = useState({ description: '', details: '', privileges: [] });

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchRoles();
    }, [isAuthenticated]);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/roles');
            setRoles(Array.isArray(res.data) ? res.data : []);
        } catch (err: any) {
            setError(err.response?.data?.message || err.response?.data || 'Failed to fetch roles');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAdd = () => {
        setNewRole({ description: '', details: '', privileges: [] });
        setIsAddOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                description: newRole.description.trim(),
                details: newRole.details.trim(),
                privileges: []
            };

            const res = await axiosInstance.post('/roles', payload);
            setRoles([...roles, res.data]);
            setIsAddOpen(false);
        } catch (err: any) {
            alert(err.response?.data?.message || err.response?.data || 'Error creating role');
        }
    };

    const filtered = roles.filter(r =>
        (r.description || '').toLowerCase().includes(filterText.toLowerCase())
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
                            <h1 className="text-3xl font-bold text-gray-900">Roles</h1>
                            <p className="text-sm text-gray-500 mt-1">Manage system user roles.</p>
                        </div>
                        <button
                            onClick={handleOpenAdd}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 flex items-center rounded-md font-medium transition shadow-sm"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Add Role
                        </button>
                    </div>

                    {error && <div className="mb-4 bg-red-50 text-red-700 p-3 rounded">{error}</div>}

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b flex items-center justify-between bg-gray-50/50">
                            <div className="relative w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search specific roles..."
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
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {loading ? (
                                        <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-500">Loading records...</td></tr>
                                    ) : filtered.length === 0 ? (
                                        <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-500">No roles found.</td></tr>
                                    ) : (
                                        filtered.map((role, idx) => (
                                            <tr key={role.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{idx + 1}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{role.description || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.details || 'N/A'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>

            {/* Radix Dialog: Add Role */}
            <Dialog.Root open={isAddOpen} onOpenChange={setIsAddOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                    <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 sm:rounded-lg">
                        <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
                            Create System Role
                        </Dialog.Title>
                        <form onSubmit={handleSave} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label className="text-right text-sm font-medium">Description <span className="text-red-500">*</span></label>
                                <input required value={newRole.description} onChange={e => setNewRole({ ...newRole, description: e.target.value })} className="col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500" placeholder="e.g. MANAGER" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label className="text-right text-sm font-medium">Details</label>
                                <input value={newRole.details} onChange={e => setNewRole({ ...newRole, details: e.target.value })} className="col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500" placeholder="e.g. Manager role with specific access" />
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Save</button>
                            </div>
                        </form>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
}
