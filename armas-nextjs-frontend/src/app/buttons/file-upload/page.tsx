'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import axiosInstance from '@/lib/axios';

const uploadFile = async (file: File, reportcategory: string, budgetYearId: number, transactiondocumentid: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('reportcategory', reportcategory);
    formData.append('budgetYearId', budgetYearId.toString());
    formData.append('transactiondocumentid', transactiondocumentid);
    return axiosInstance.post('/transactions/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

export default function FileUploadPage() {
    const { isAuthenticated } = useAuth();
    const { resolve } = useTranslation();

    const [documents, setDocuments] = useState<any[]>([]);
    const [budgetYears, setBudgetYears] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        reportcategory: 'Report',
        budgetYearId: '',
        transactiondocumentid: '',
    });
    const [file, setFile] = useState<File | null>(null);
    const [loadingConfig, setLoadingConfig] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchBaselineData();
    }, [isAuthenticated]);

    const fetchBaselineData = async () => {
        setLoadingConfig(true);
        try {
            const [docsRes, yearsRes] = await Promise.all([
                axiosInstance.get('/transactions/listdocuments'),
                axiosInstance.get('/transactions/budget-years')
            ]);

            const docs = Array.isArray(docsRes.data) ? docsRes.data : [];
            const years = Array.isArray(yearsRes.data) ? yearsRes.data : [];

            setDocuments(docs);
            setBudgetYears(years);

            setFormData(prev => ({
                ...prev,
                transactiondocumentid: docs.length > 0 ? String(docs[0].id) : '',
                budgetYearId: years.length > 0 ? String(years[0].id) : ''
            }));
        } catch (err: any) {
            setError('Failed to load system configuration data.');
        } finally {
            setLoadingConfig(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        const maxSize = 500 * 1024 * 1024; // 500MB
        if (selectedFile.size > maxSize) {
            setError('File size exceeds the maximum limit of 500MB');
            setFile(null);
            e.target.value = '';
        } else {
            setFile(selectedFile);
            setError('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!file) return setError('Please select a file');
        if (!formData.budgetYearId) return setError('Please select a budget year');
        if (!formData.transactiondocumentid) return setError('Please select a report type');

        setIsUploading(true);
        try {
            await uploadFile(file, formData.reportcategory, Number(formData.budgetYearId), formData.transactiondocumentid);
            setSuccess('File uploaded successfully!');
            setFile(null);

            const fileInput = document.getElementById('file-upload-input') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

        } catch (err: any) {
            setError(err.response?.data?.error || err.response?.data?.message || err.message || 'File upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    if (!isAuthenticated) return null;

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-8 max-w-4xl w-full mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Upload Your Reports</h1>
                        <p className="text-sm text-gray-500 mt-1">Submit documents and feedback to the central system.</p>
                    </div>

                    {error && <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-md border border-red-200">{error}</div>}
                    {success && <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-md border border-green-200">{success}</div>}

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
                        {loadingConfig ? (
                            <div className="text-center text-gray-500 py-12">Loading upload configurations...</div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Report Category</label>
                                        <select
                                            name="reportcategory"
                                            value={formData.reportcategory}
                                            onChange={handleChange}
                                            className="w-full rounded-md border border-gray-300 py-2.5 px-3 text-sm focus:ring-1 focus:ring-indigo-500"
                                        >
                                            <option value="Report">Report</option>
                                            <option value="Feedback">Feedback</option>
                                            <option value="Others">Others</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Budget Year <span className="text-red-500">*</span></label>
                                        <select
                                            name="budgetYearId"
                                            value={formData.budgetYearId}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-md border border-gray-300 py-2.5 px-3 text-sm focus:ring-1 focus:ring-indigo-500 bg-white"
                                        >
                                            <option value="">Select Budget Year</option>
                                            {budgetYears.map(year => (
                                                <option key={year.id} value={year.id}>{year.fiscalYear || year.fiscal_year}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Report Type <span className="text-red-500">*</span></label>
                                        <select
                                            name="transactiondocumentid"
                                            value={formData.transactiondocumentid}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-md border border-gray-300 py-2.5 px-3 text-sm focus:ring-1 focus:ring-indigo-500 bg-white"
                                        >
                                            <option value="">Select Report Type</option>
                                            {documents.map(doc => (
                                                <option key={doc.id} value={doc.id}>{resolve(doc.reportype)}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Choose File <span className="text-red-500">*</span></label>
                                        <input
                                            type="file"
                                            id="file-upload-input"
                                            onChange={handleFileChange}
                                            required
                                            className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Maximum file size: 500MB</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isUploading}
                                        className="bg-indigo-600 text-white px-6 py-2.5 rounded-md font-medium hover:bg-indigo-700 transition disabled:bg-indigo-300 shadow-sm"
                                    >
                                        {isUploading ? 'Uploading...' : 'Submit Report'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
