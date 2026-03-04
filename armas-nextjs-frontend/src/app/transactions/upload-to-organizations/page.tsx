'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import axiosInstance from '@/lib/axios';

export default function UploadToOrganizationsPage() {
    const { isAuthenticated } = useAuth();

    const [organizations, setOrganizations] = useState<any[]>([]);
    const [selectedOrganizations, setSelectedOrganizations] = useState<string[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchOrgs();
    }, [isAuthenticated]);

    const fetchOrgs = async () => {
        try {
            const res = await axiosInstance.get('/transactions/organizations-with-reports');
            setOrganizations(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            setError('Failed to load organizations.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!file) return setError('Please select a letter attachment.');
        if (selectedOrganizations.length === 0) return setError('Please select at least one target organization.');

        setLoading(true);
        const formData = new FormData();
        formData.append('letter', file);
        formData.append('organizationIds', JSON.stringify(selectedOrganizations.map(id => parseInt(id, 10))));

        try {
            await axiosInstance.post('/transactions/dispatch-letter', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSuccess('Central dispatch successfully completed.');
            setFile(null);
            setSelectedOrganizations([]);
            (e.target as HTMLFormElement).reset();
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Dispatch failed.');
        } finally {
            setLoading(false);
        }
    };

    const toggleOrg = (id: string) => {
        setSelectedOrganizations(prev =>
            prev.includes(id) ? prev.filter(orgId => orgId !== id) : [...prev, id]
        );
    };

    if (!isAuthenticated) return <div className="p-8">Please log in.</div>;

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-8 max-w-4xl w-full mx-auto">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Upload to Organizations</h1>
                        <p className="text-sm text-gray-500 mt-1">Multi-cast formal letters and dispatch them to the selected reporting entities concurrently.</p>
                    </div>

                    {error && <div className="mb-4 bg-red-50 text-red-700 p-4 rounded-md border border-red-200">{error}</div>}
                    {success && <div className="mb-4 bg-green-50 text-green-700 p-4 rounded-md border border-green-200">{success}</div>}

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">1. Select Target Organizations</label>
                                <div className="border border-gray-300 rounded-md p-4 bg-gray-50 max-h-60 overflow-y-auto space-y-2">
                                    {organizations.length === 0 ? <span className="text-gray-500 text-sm">No organizations available.</span> : organizations.map(org => (
                                        <label key={org.id} className="flex items-center space-x-3 p-2 hover:bg-white rounded border border-transparent hover:border-gray-200 transition-colors cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedOrganizations.includes(org.id.toString())}
                                                onChange={() => toggleOrg(org.id.toString())}
                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                            />
                                            <span className="text-sm text-gray-900 font-medium">{org.orgname}</span>
                                        </label>
                                    ))}
                                </div>
                                <div className="mt-2 text-sm text-gray-500">
                                    {selectedOrganizations.length} selected.
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">2. Attach Dispatch Document</label>
                                <input
                                    type="file"
                                    onChange={e => setFile(e.target.files?.[0] || null)}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                                <p className="mt-2 text-xs text-gray-500">PDF, DOCX formats. Maximum size 500MB.</p>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading || organizations.length === 0}
                                    className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-md shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                                >
                                    {loading ? 'Dispatching...' : 'Dispatch Letter to Selected'}
                                </button>
                            </div>

                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
}
