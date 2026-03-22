'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import axiosInstance from '@/lib/axios';
import { Pencil, Trash2, Upload, Megaphone } from 'lucide-react';

type NoticeAttachment = {
    id: number;
    fileName: string;
};

type Notice = {
    id: number;
    categories: string[];
    title: string;
    description: string;
    createdAt: string;
    postedByDisplayName: string;
    attachments: NoticeAttachment[];
    comments: { id: number }[];
};

const EMPTY_FORM = {
    categories: ['General'],
    title: '',
    description: '',
};

const CATEGORY_OPTIONS = ['General', 'Announcement', 'Circular', 'Urgent', 'Event'];

export default function NoticesPage() {
    const { isAuthenticated, userRole } = useAuth();
    const [form, setForm] = useState(EMPTY_FORM);
    const [files, setFiles] = useState<File[]>([]);
    const [notices, setNotices] = useState<Notice[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchNotices = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get('/notices');
            setNotices(Array.isArray(res.data) ? res.data : []);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to load notices.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchNotices();
    }, [isAuthenticated]);

    const resetForm = () => {
        setForm(EMPTY_FORM);
        setFiles([]);
        setEditingId(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        const formData = new FormData();
        form.categories.forEach((category) => formData.append('categories', category));
        formData.append('title', form.title);
        formData.append('description', form.description);
        files.forEach(file => formData.append('attachments', file));

        try {
            if (editingId) {
                await axiosInstance.put(`/notices/${editingId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                await axiosInstance.post('/notices', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }
            resetForm();
            await fetchNotices();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to save notice.');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (notice: Notice) => {
        setEditingId(notice.id);
        setForm({
            categories: notice.categories.length > 0 ? notice.categories : ['General'],
            title: notice.title,
            description: notice.description,
        });
        setFiles([]);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this notice?')) return;
        try {
            await axiosInstance.delete(`/notices/${id}`);
            await fetchNotices();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to delete notice.');
        }
    };

    const toggleCategory = (category: string) => {
        setForm((prev) => {
            const exists = prev.categories.includes(category);
            const nextCategories = exists
                ? prev.categories.filter((item) => item !== category)
                : [...prev.categories, category];

            return {
                ...prev,
                categories: nextCategories.length > 0 ? nextCategories : [category],
            };
        });
    };

    if (!isAuthenticated) return null;

    if (userRole !== 'APPROVER' && userRole !== 'ADMIN') {
        return (
            <div className="flex h-screen bg-gray-50 overflow-hidden">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header />
                    <main className="flex-1 overflow-y-auto p-8 max-w-4xl w-full mx-auto">
                        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center shadow-sm">
                            <h1 className="text-2xl font-bold text-amber-900">Notice Management</h1>
                            <p className="mt-3 text-sm leading-6 text-amber-800">
                                Only approver and admin users can manage notices. Authenticated users can still read and comment on notices from the home page.
                            </p>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-8 max-w-7xl w-full mx-auto">
                    <div className="mb-8 flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg">
                            <Megaphone className="h-7 w-7" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Notice Management</h1>
                            <p className="text-sm text-gray-500 mt-1">Publish, update, and organize public notices for authenticated users.</p>
                        </div>
                    </div>

                    {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

                    <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
                        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-xl font-bold text-slate-900">{editingId ? 'Edit Notice' : 'Create Notice'}</h2>
                            {/* <p className="mt-1 text-sm text-slate-500">Approvers can post blog-style notices with attachments.</p> */}

                            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {CATEGORY_OPTIONS.map((category) => {
                                            const checked = form.categories.includes(category);
                                            return (
                                                <label
                                                    key={category}
                                                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                                                        checked
                                                            ? 'border-indigo-300 bg-indigo-50 text-indigo-800'
                                                            : 'border-slate-300 bg-white text-slate-700'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() => toggleCategory(category)}
                                                        className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                                                    />
                                                    <span className="font-medium">{category}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                    <p className="mt-2 text-xs text-slate-500">Select one or more categories for this notice.</p>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
                                    <input
                                        value={form.title}
                                        onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                                        placeholder="Enter notice title"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                                        rows={8}
                                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                                        placeholder="Write the notice body..."
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700">Attachments</label>
                                    <input
                                        type="file"
                                        multiple
                                        onChange={(e) => setFiles(Array.from(e.target.files || []))}
                                        className="w-full text-sm text-slate-500 file:mr-4 file:rounded-xl file:border-0 file:bg-indigo-50 file:px-4 file:py-2.5 file:font-semibold file:text-indigo-700"
                                    />
                                    {editingId && (
                                        <p className="mt-2 text-xs text-slate-500">New uploads will be added to the existing attachments.</p>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    {editingId && (
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                        >
                                            Cancel Edit
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                                    >
                                        <Upload className="h-4 w-4" />
                                        {saving ? 'Saving...' : editingId ? 'Update Notice' : 'Publish Notice'}
                                    </button>
                                </div>
                            </form>
                        </section>

                        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-xl font-bold text-slate-900">Published Notices</h2>
                            <p className="mt-1 text-sm text-slate-500">Manage existing notices without affecting other modules.</p>

                            <div className="mt-6 space-y-4">
                                {loading ? (
                                    <p className="text-sm text-slate-500">Loading notices...</p>
                                ) : notices.length === 0 ? (
                                    <p className="text-sm text-slate-500">No notices published yet.</p>
                                ) : notices.map(notice => (
                                    <article key={notice.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                        <div className="flex flex-wrap items-center gap-2">
                                            {notice.categories.map((category) => (
                                                <span key={`${notice.id}-${category}`} className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-indigo-700">
                                                    {category}
                                                </span>
                                            ))}
                                            <span className="text-xs text-slate-500">{new Date(notice.createdAt).toLocaleString()}</span>
                                        </div>
                                        <h3 className="mt-3 text-lg font-bold text-slate-900">{notice.title}</h3>
                                        <p className="mt-2 line-clamp-4 whitespace-pre-line text-sm leading-6 text-slate-600">{notice.description}</p>
                                        <div className="mt-4 text-xs text-slate-500">
                                            Posted by {notice.postedByDisplayName} | {notice.attachments.length} attachment(s) | {notice.comments.length} comment(s)
                                        </div>
                                        {notice.attachments.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {notice.attachments.map(attachment => (
                                                    <span key={attachment.id} className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs text-slate-600">
                                                        {attachment.fileName}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <div className="mt-4 flex gap-3">
                                            <button
                                                onClick={() => handleEdit(notice)}
                                                className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100"
                                            >
                                                <Pencil className="h-4 w-4" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(notice.id)}
                                                className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Delete
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
}
