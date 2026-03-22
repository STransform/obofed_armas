'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import axiosInstance from '@/lib/axios';
import { getMessages, type Lang } from '@/lib/messages';

export default function UploadToOrganizationsPage() {
    const { isAuthenticated } = useAuth();
    const [lang, setLang] = useState<Lang>('en');

    const [organizations, setOrganizations] = useState<any[]>([]);
    const [selectedOrganizations, setSelectedOrganizations] = useState<string[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

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

    const msgs = getMessages(lang).uploadToOrganizationsPage;

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchOrgs();
    }, [isAuthenticated]);

    const fetchOrgs = async () => {
        try {
            const [dispatchRes, orgsRes, usersRes] = await Promise.allSettled([
                axiosInstance.get('/transactions/dispatch-organizations', {
                    params: { _: Date.now() }
                }),
                axiosInstance.get('/organizations', {
                    params: { _: Date.now() }
                }),
                axiosInstance.get('/users', {
                    params: { _: Date.now() }
                })
            ]);

            const dispatchOrganizations =
                dispatchRes.status === 'fulfilled' && Array.isArray(dispatchRes.value.data)
                    ? dispatchRes.value.data
                    : [];

            const allOrganizations =
                orgsRes.status === 'fulfilled' && Array.isArray(orgsRes.value.data)
                    ? orgsRes.value.data
                    : [];

            const usersDerivedOrganizations =
                usersRes.status === 'fulfilled' && Array.isArray(usersRes.value.data)
                    ? usersRes.value.data
                        .map((user: any) => user?.organization)
                        .filter((org: any): org is { id: string; orgname?: string | null } => Boolean(org?.id))
                    : [];

            const mergedOrganizations = [...dispatchOrganizations, ...allOrganizations, ...usersDerivedOrganizations]
                .filter((org): org is { id: string; orgname?: string | null } => Boolean(org?.id))
                .reduce<{ id: string; orgname?: string | null }[]>((acc, org) => {
                    const existing = acc.find(item => item.id === org.id);
                    if (!existing) {
                        acc.push(org);
                    } else if ((!existing.orgname || existing.orgname === existing.id) && org.orgname) {
                        existing.orgname = org.orgname;
                    }
                    return acc;
                }, [])
                .sort((left, right) => {
                    const leftName = left.orgname || left.id;
                    const rightName = right.orgname || right.id;
                    return leftName.localeCompare(rightName);
                });

            setOrganizations(mergedOrganizations);
            setError(mergedOrganizations.length === 0 ? msgs.noOrganizationsReturned : null);
        } catch (err) {
            setError(msgs.failedToLoadOrganizations);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!file) return setError(msgs.selectLetterAttachment);
        if (selectedOrganizations.length === 0) return setError(msgs.selectAtLeastOneOrganization);

        setLoading(true);
        const formData = new FormData();
        formData.append('letter', file);
        formData.append('organizationIds', JSON.stringify(selectedOrganizations));

        try {
            await axiosInstance.post('/transactions/dispatch-letter', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSuccess(msgs.dispatchSuccess);
            setFile(null);
            setSelectedOrganizations([]);
            (e.target as HTMLFormElement).reset();
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || msgs.dispatchFailed);
        } finally {
            setLoading(false);
        }
    };

    const toggleOrg = (id: string) => {
        setSelectedOrganizations(prev =>
            prev.includes(id) ? prev.filter(orgId => orgId !== id) : [...prev, id]
        );
    };

    if (!isAuthenticated) return null;

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-8 max-w-4xl w-full mx-auto">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">{msgs.title}</h1>
                        <p className="text-sm text-gray-500 mt-1">{msgs.subtitle}</p>
                    </div>

                    {error && <div className="mb-4 bg-red-50 text-red-700 p-4 rounded-md border border-red-200">{error}</div>}
                    {success && <div className="mb-4 bg-green-50 text-green-700 p-4 rounded-md border border-green-200">{success}</div>}

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{msgs.selectTargetOrganizations}</label>
                                <div className="border border-gray-300 rounded-md p-4 bg-gray-50 max-h-60 overflow-y-auto space-y-2">
                                    {organizations.length === 0 ? <span className="text-gray-500 text-sm">{msgs.noOrganizationsAvailable}</span> : organizations.map(org => (
                                        <label key={org.id} className="flex items-center space-x-3 p-2 hover:bg-white rounded border border-transparent hover:border-gray-200 transition-colors cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedOrganizations.includes(org.id.toString())}
                                                onChange={() => toggleOrg(org.id.toString())}
                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                            />
                                            <span className="text-sm text-gray-900 font-medium">{org.orgname || org.id}</span>
                                        </label>
                                    ))}
                                </div>
                                <div className="mt-2 text-sm text-gray-500">
                                    {selectedOrganizations.length} {msgs.selectedCount}
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{msgs.attachDispatchDocument}</label>
                                <input
                                    type="file"
                                    onChange={e => setFile(e.target.files?.[0] || null)}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                                <p className="mt-2 text-xs text-gray-500">{msgs.attachmentHint}</p>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading || organizations.length === 0}
                                    className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-md shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                                >
                                    {loading ? msgs.dispatching : msgs.dispatchButton}
                                </button>
                            </div>

                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
}
