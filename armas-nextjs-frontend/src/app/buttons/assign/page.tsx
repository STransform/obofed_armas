'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import axiosInstance from '@/lib/axios';
import { Search, Plus } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

export default function AssignRolePage() {
    const { isAuthenticated } = useAuth();

    const [users, setUsers] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterText, setFilterText] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Dialogs State
    const [isAssignOpen, setIsAssignOpen] = useState(false);

    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchData();
    }, [isAuthenticated]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, rolesRes] = await Promise.all([
                axiosInstance.get('/users'),
                axiosInstance.get('/roles')
            ]);
            const validUsers = Array.isArray(usersRes.data) ? usersRes.data.filter(u => u && u.id && u.username) : [];
            setUsers(validUsers);
            setRoles(Array.isArray(rolesRes.data) ? rolesRes.data : []);

            if (validUsers.length === 0) {
                setError('No valid users found.');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.response?.data || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAssign = (user: any) => {
        setSelectedUser(user);
        setSelectedRoleIds(user.roles ? user.roles.map((r: any) => r.id.toString()) : []);
        setIsAssignOpen(true);
    };

    const handleRoleChange = (id: string) => {
        setSelectedRoleIds(prev =>
            prev.includes(id) ? prev.filter(rId => rId !== id) : [...prev, id]
        );
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser || selectedRoleIds.length === 0) {
            alert('Please select at least one role.');
            return;
        }

        try {
            const payload = selectedRoleIds.map(id => parseInt(id, 10));
            const res = await axiosInstance.post(`/roles/assign/user/${selectedUser.id}`, payload);

            setUsers(users.map(u => u.id === res.data.id ? res.data : u));
            setIsAssignOpen(false);
        } catch (err: any) {
            alert(err.response?.data?.message || err.response?.data || 'Error assigning roles');
        }
    };

    const filtered = users.filter(u =>
        (u.username || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (u.roles || []).some((r: any) => (r.description || '').toLowerCase().includes(filterText.toLowerCase()))
    );

    if (!isAuthenticated) return <div className="p-8">Please log in.</div>;

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-8 max-w-7xl w-full mx-auto">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Assign Roles</h1>
                            <p className="text-sm text-gray-500 mt-1">Assign system permissions to active users.</p>
                        </div>
                    </div>

                    {error && <div className="mb-4 bg-red-50 text-red-700 p-3 rounded">{error}</div>}

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b flex items-center justify-between bg-gray-50/50">
                            <div className="relative w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by username or role..."
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
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Roles</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {loading ? (
                                        <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">Loading records...</td></tr>
                                    ) : filtered.length === 0 ? (
                                        <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">No users found.</td></tr>
                                    ) : (
                                        filtered.map((u, idx) => (
                                            <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{idx + 1}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.username || 'N/A'}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500 flex flex-wrap gap-1">
                                                    {u.roles && u.roles.length > 0
                                                        ? u.roles.map((r: any) => <span key={r.id} className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs border border-indigo-100">{r.description}</span>)
                                                        : <span className="text-gray-400 italic">None</span>}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button onClick={() => handleOpenAssign(u)} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                                                        <Plus className="w-3 h-3 mr-1" /> Assign Role
                                                    </button>
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

            {/* Radix Dialog: Assign Role */}
            <Dialog.Root open={isAssignOpen} onOpenChange={setIsAssignOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                    <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 sm:rounded-lg">
                        <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">
                            Assign Role(s) to @{selectedUser?.username}
                        </Dialog.Title>
                        <form onSubmit={handleSave} className="grid gap-4 py-4">
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                {roles.length > 0 ? (
                                    roles.map(role => (
                                        <div key={role.id} className="flex items-center">
                                            <input
                                                id={`role-${role.id}`}
                                                type="checkbox"
                                                checked={selectedRoleIds.includes(role.id.toString())}
                                                onChange={() => handleRoleChange(role.id.toString())}
                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor={`role-${role.id}`} className="ml-3 block text-sm font-medium text-gray-700">
                                                {role.description}
                                            </label>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">No roles available.</p>
                                )}
                            </div>
                            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setIsAssignOpen(false)} className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50">Cancel</button>
                                <button type="submit" disabled={selectedRoleIds.length === 0} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed">Assign Selected</button>
                            </div>
                        </form>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
}
