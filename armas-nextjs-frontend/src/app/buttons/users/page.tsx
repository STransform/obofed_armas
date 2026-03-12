'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import axiosInstance from '@/lib/axios';
import { Search, Plus, Edit, Trash2, Eye, KeyRound } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

export default function UsersPage() {
    const { isAuthenticated } = useAuth();

    const [users, setUsers] = useState<any[]>([]);
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [directorates, setDirectorates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterText, setFilterText] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Dialogs State
    const [isAddEditOpen, setIsAddEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isResetPwdOpen, setIsResetPwdOpen] = useState(false);
    const [formMode, setFormMode] = useState<'new' | 'edit'>('new');

    const [currentUser, setCurrentUser] = useState({ id: '', firstName: '', lastName: '', username: '', password: '', confirmPassword: '', organizationId: '', directorateId: '' });
    const [resetPwdState, setResetPwdState] = useState({ newPassword: '', confirmPassword: '' });
    const [activeId, setActiveId] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchData();
    }, [isAuthenticated]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, orgsRes, dirsRes] = await Promise.all([
                axiosInstance.get('/users'),
                axiosInstance.get('/organizations'),
                axiosInstance.get('/directorates'),
            ]);
            setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
            setOrganizations(Array.isArray(orgsRes.data) ? orgsRes.data : []);
            setDirectorates(Array.isArray(dirsRes.data) ? dirsRes.data : []);
        } catch (err: any) {
            setError(err.response?.data?.message || err.response?.data || 'Failed to fetch users context');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAdd = () => {
        setFormMode('new');
        setCurrentUser({ id: '', firstName: '', lastName: '', username: '', password: '', confirmPassword: '', organizationId: '', directorateId: '' });
        setIsAddEditOpen(true);
    };

    const handleOpenEdit = (user: any) => {
        setFormMode('edit');
        setCurrentUser({
            id: user.id || '',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            username: user.username || '',
            password: '',
            confirmPassword: '',
            organizationId: user.organization?.id || '',
            directorateId: user.directorate?.id || ''
        });
        setIsAddEditOpen(true);
    };

    const handleOpenView = (user: any) => {
        setCurrentUser({
            id: user.id || '',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            username: user.username || '',
            password: '', confirmPassword: '',
            organizationId: user.organization?.id || '',
            directorateId: user.directorate?.id || ''
        });
        setIsViewOpen(true);
    };

    const handleOpenResetPwd = (id: string) => {
        setActiveId(id);
        setResetPwdState({ newPassword: '', confirmPassword: '' });
        setIsResetPwdOpen(true);
    };

    const handleOpenDelete = (id: string) => {
        setActiveId(id);
        setIsDeleteOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (currentUser.password && currentUser.password !== currentUser.confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        try {
            const payload = {
                firstName: currentUser.firstName.trim(),
                lastName: currentUser.lastName.trim(),
                username: currentUser.username.trim(),
                organizationId: currentUser.organizationId || null,
                directorateId: currentUser.directorateId || null,
                role: 'USER',
                ...(currentUser.password ? {
                    password: currentUser.password.trim(),
                    confirmPassword: currentUser.confirmPassword.trim()
                } : {})
            };

            if (formMode === 'new') {
                const res = await axiosInstance.post('/users', payload);
                const fullUser = await axiosInstance.get(`/users/${res.data.id}`);
                setUsers([...users, fullUser.data]);
            } else {
                const editPayload = { ...payload, id: currentUser.id, organization: payload.organizationId ? { id: payload.organizationId } : null, directorate: payload.directorateId ? { id: payload.directorateId } : null };
                delete editPayload.organizationId;
                delete editPayload.directorateId;
                delete editPayload.role;
                await axiosInstance.put(`/users/${currentUser.id}`, editPayload);
                const updatedUser = await axiosInstance.get(`/users/${currentUser.id}`);
                setUsers(users.map(u => u.id === currentUser.id ? updatedUser.data : u));
            }
            setIsAddEditOpen(false);
        } catch (err: any) {
            alert(err.response?.data?.message || err.response?.data?.error || 'Error saving user');
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (resetPwdState.newPassword !== resetPwdState.confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            await axiosInstance.post(`/users/${activeId}/reset-password`, {
                newPassword: resetPwdState.newPassword.trim(),
                confirmPassword: resetPwdState.confirmPassword.trim()
            });
            setIsResetPwdOpen(false);
            alert('Password reset successfully');
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to reset password');
        }
    }

    const handleDelete = async () => {
        if (!activeId) return;
        try {
            await axiosInstance.delete(`/users/${activeId}`);
            setUsers(users.filter(u => u.id !== activeId));
            setIsDeleteOpen(false);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Error deleting user');
        }
    };

    const filtered = users.filter(u =>
        (u.username || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (u.firstName || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (u.lastName || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (u.organization?.orgname || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (u.directorate?.directoratename || '').toLowerCase().includes(filterText.toLowerCase())
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
                            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                            <p className="text-sm text-gray-500 mt-1">Manage admin identity accounts across organizations.</p>
                        </div>
                        <button
                            onClick={handleOpenAdd}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 flex items-center rounded-md font-medium transition shadow-sm"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Add User
                        </button>
                    </div>

                    {error && <div className="mb-4 bg-red-50 text-red-700 p-3 rounded">{error}</div>}

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b flex items-center justify-between bg-gray-50/50">
                            <div className="relative w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search names, usernames, or orgs..."
                                    className="w-full pl-9 pr-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={filterText}
                                    onChange={e => setFilterText(e.target.value)}
                                />
                            </div>
                            <span className="text-sm text-gray-500 font-medium">Total: {filtered.length} users</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Directorate</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {loading ? (
                                        <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Loading records...</td></tr>
                                    ) : filtered.length === 0 ? (
                                        <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No users found.</td></tr>
                                    ) : (
                                        filtered.map((u) => (
                                            <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.firstName} {u.lastName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.username}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.organization?.orgname || u.orgname || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.directorate?.directoratename || u.directoratename || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button onClick={() => handleOpenView(u)} className="text-indigo-600 hover:text-indigo-900 mx-2" title="View"><Eye className="w-4 h-4" /></button>
                                                    <button onClick={() => handleOpenEdit(u)} className="text-teal-600 hover:text-teal-900 mx-2" title="Edit"><Edit className="w-4 h-4" /></button>
                                                    <button onClick={() => handleOpenResetPwd(u.id)} className="text-yellow-600 hover:text-yellow-900 mx-2" title="Reset Password"><KeyRound className="w-4 h-4" /></button>
                                                    <button onClick={() => handleOpenDelete(u.id)} className="text-red-600 hover:text-red-900 mx-2" title="Delete"><Trash2 className="w-4 h-4" /></button>
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

            {/* Radix Dialog: Add/Edit User */}
            <Dialog.Root open={isAddEditOpen} onOpenChange={setIsAddEditOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                    <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 sm:rounded-lg">
                        <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
                            {formMode === 'new' ? 'New User Identity' : 'Edit User Identity'}
                        </Dialog.Title>
                        <form onSubmit={handleSave} className="grid grid-cols-2 gap-4 py-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">First Name <span className="text-red-500">*</span></label>
                                <input required value={currentUser.firstName} onChange={e => setCurrentUser({ ...currentUser, firstName: e.target.value })} className="flex h-10 w-full rounded-md border px-3 text-sm focus:ring-1 focus:ring-indigo-500" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Last Name <span className="text-red-500">*</span></label>
                                <input required value={currentUser.lastName} onChange={e => setCurrentUser({ ...currentUser, lastName: e.target.value })} className="flex h-10 w-full rounded-md border px-3 text-sm focus:ring-1 focus:ring-indigo-500" />
                            </div>
                            <div className="space-y-1 col-span-2">
                                <label className="text-sm font-medium text-gray-700">Username <span className="text-red-500">*</span></label>
                                <input required value={currentUser.username} onChange={e => setCurrentUser({ ...currentUser, username: e.target.value })} className="flex h-10 w-full rounded-md border px-3 text-sm focus:ring-1 focus:ring-indigo-500" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Password {(formMode === 'new') && <span className="text-red-500">*</span>}</label>
                                <input type="password" required={formMode === 'new'} value={currentUser.password} onChange={e => setCurrentUser({ ...currentUser, password: e.target.value })} className="flex h-10 w-full rounded-md border px-3 text-sm focus:ring-1 focus:ring-indigo-500" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Confirm Password {(formMode === 'new') && <span className="text-red-500">*</span>}</label>
                                <input type="password" required={formMode === 'new' || currentUser.password.length > 0} value={currentUser.confirmPassword} onChange={e => setCurrentUser({ ...currentUser, confirmPassword: e.target.value })} className="flex h-10 w-full rounded-md border px-3 text-sm focus:ring-1 focus:ring-indigo-500" />
                            </div>

                            <div className="space-y-1 pt-2 border-t col-span-2 mt-2"></div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Organization</label>
                                <select value={currentUser.organizationId} onChange={e => setCurrentUser({ ...currentUser, organizationId: e.target.value })} className="flex h-10 w-full rounded-md border px-3 text-sm focus:ring-1 focus:ring-indigo-500 bg-white">
                                    <option value="">Select Organization</option>
                                    {organizations.map(o => <option key={o.id} value={o.id}>{o.orgname}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Directorate</label>
                                <select value={currentUser.directorateId} onChange={e => setCurrentUser({ ...currentUser, directorateId: e.target.value })} className="flex h-10 w-full rounded-md border px-3 text-sm focus:ring-1 focus:ring-indigo-500 bg-white">
                                    <option value="">Select Directorate</option>
                                    {directorates.map(d => <option key={d.id} value={d.id}>{d.directoratename}</option>)}
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 mt-4 col-span-2 border-t pt-4">
                                <button type="button" onClick={() => setIsAddEditOpen(false)} className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Save Identity</button>
                            </div>
                        </form>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            {/* Radix Dialog: Confirm Reset Password */}
            <Dialog.Root open={isResetPwdOpen} onOpenChange={setIsResetPwdOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/40" />
                    <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] border bg-white p-6 shadow-lg rounded-lg">
                        <Dialog.Title className="text-lg font-semibold mb-2">Reset Password</Dialog.Title>
                        <Dialog.Description className="text-sm text-gray-500 mb-6">Force a new security password for this user's account.</Dialog.Description>

                        <form onSubmit={handleResetPassword}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                    <input type="password" required value={resetPwdState.newPassword} onChange={e => setResetPwdState({ ...resetPwdState, newPassword: e.target.value })} className="flex h-10 w-full rounded-md border px-3 text-sm focus:ring-1 focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                    <input type="password" required value={resetPwdState.confirmPassword} onChange={e => setResetPwdState({ ...resetPwdState, confirmPassword: e.target.value })} className="flex h-10 w-full rounded-md border px-3 text-sm focus:ring-1 focus:ring-indigo-500" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsResetPwdOpen(false)} className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-yellow-600 text-white rounded-md text-sm font-medium hover:bg-yellow-700">Execute Reset</button>
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
                        <Dialog.Title className="text-lg font-semibold mb-2">Confirm Delete User</Dialog.Title>
                        <Dialog.Description className="text-sm text-gray-500 mb-6">Are you sure you want to permanently delete this user? This action cannot be undone.</Dialog.Description>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setIsDeleteOpen(false)} className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50">Cancel</button>
                            <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700">Delete</button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            {/* Radix Dialog: View Info */}
            <Dialog.Root open={isViewOpen} onOpenChange={setIsViewOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/40" />
                    <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] border bg-white p-6 shadow-lg rounded-lg">
                        <Dialog.Title className="text-lg font-semibold mb-4 border-b pb-2">User Record</Dialog.Title>
                        <div className="space-y-3 text-sm mt-4">
                            <div className="flex border-b border-gray-100 pb-2"><span className="w-1/3 font-medium text-gray-500">ID System Token:</span> <span className="w-2/3 text-gray-900">{currentUser.id}</span></div>
                            <div className="flex border-b border-gray-100 pb-2"><span className="w-1/3 font-medium text-gray-500">First Name:</span> <span className="w-2/3 text-gray-900">{currentUser.firstName}</span></div>
                            <div className="flex border-b border-gray-100 pb-2"><span className="w-1/3 font-medium text-gray-500">Last Name:</span> <span className="w-2/3 text-gray-900">{currentUser.lastName}</span></div>
                            <div className="flex border-b border-gray-100 pb-2"><span className="w-1/3 font-medium text-gray-500">Username:</span> <span className="w-2/3 text-gray-900">{currentUser.username}</span></div>
                            <div className="flex border-b border-gray-100 pb-2"><span className="w-1/3 font-medium text-gray-500">Organization ID:</span> <span className="w-2/3 text-gray-900">{currentUser.organizationId || 'NONE'}</span></div>
                            <div className="flex"><span className="w-1/3 font-medium text-gray-500">Directorate ID:</span> <span className="w-2/3 text-gray-900">{currentUser.directorateId || 'NONE'}</span></div>
                        </div>
                        <div className="flex justify-end mt-6">
                            <button onClick={() => setIsViewOpen(false)} className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800">Close Window</button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

        </div>
    );
}
