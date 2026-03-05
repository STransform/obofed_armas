const fs = require('fs');
const path = require('path');

const routes = [
    '/buttons/organizations',
    '/buttons/directorates',
    '/buttons/documents',
    '/buttons/budgetyear',
    '/buttons/users',
    '/buttons/roles',
    '/buttons/assign',
    '/buttons/assign-privileges',
    '/buttons/file-upload',
    '/buttons/file-download',
    '/buttons/letter-download',
    '/transactions/letters',
    '/transactions/upload-to-organizations',
    '/transactions/approved-reports',
    '/transactions/pending-reports',
    '/transactions/auditor-tasks',
    '/transactions/rejected-reports',
    '/transactions/under-review-reports',
    '/transactions/corrected-reports',
    '/transactions/advanced-filters',
    '/file-history'
];

const basePath = path.join(__dirname, 'src', 'app');

const template = (title) => `'use client';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';

export default function Page() {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return <div className="p-8">Please log in.</div>;

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-8 max-w-7xl w-full mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">${title}</h1>
                    <div className="bg-white p-6 rounded-lg shadow border border-gray-100 flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900">Module Under Construction</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                This page is actively being ported to Next.js. Expect functionality here soon!
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};
`;

routes.forEach(route => {
    const dir = path.join(basePath, route);
    fs.mkdirSync(dir, { recursive: true });

    // Convert /buttons/file-upload to File Upload
    const segments = route.split('/');
    const lastSegment = segments[segments.length - 1];
    const title = lastSegment.split('-').map(word => Math.max(word.length, 1) ? word[0].toUpperCase() + word.slice(1) : word).join(' ');

    fs.writeFileSync(path.join(dir, 'page.tsx'), template(title));
});

console.log('Successfully scaffolded ' + routes.length + ' Next.js pages.');
