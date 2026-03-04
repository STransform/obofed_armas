'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
    Building2, Users, FileText, Calculator, Shell, Lock, CheckCircle,
    XOctagon, Clock, Edit3, UploadCloud, DownloadCloud, ClipboardList,
    LayoutDashboard, Filter, ShieldCheck, Briefcase, ChevronRight,
    UserCog, Languages
} from 'lucide-react';

const roleColors: Record<string, { label: string; bg: string; text: string }> = {
    ADMIN: { label: 'Administrator', bg: 'bg-violet-500/20', text: 'text-violet-300' },
    USER: { label: 'User', bg: 'bg-sky-500/20', text: 'text-sky-300' },
    ARCHIVER: { label: 'Archiver', bg: 'bg-amber-500/20', text: 'text-amber-300' },
    SENIOR_AUDITOR: { label: 'Senior Auditor', bg: 'bg-emerald-500/20', text: 'text-emerald-300' },
    APPROVER: { label: 'Approver', bg: 'bg-rose-500/20', text: 'text-rose-300' },
    MANAGER: { label: 'Manager', bg: 'bg-cyan-500/20', text: 'text-cyan-300' },
};

export function Sidebar() {
    const { userRole } = useAuth();
    const pathname = usePathname();

    const isAdmin = userRole === 'ADMIN';
    const isUser = userRole === 'USER';
    const isSeniorAuditor = userRole === 'SENIOR_AUDITOR';
    const isArchiver = userRole === 'ARCHIVER';
    const isApprover = userRole === 'APPROVER';
    const isManager = userRole === 'MANAGER';

    const commonItems = [{ name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }];

    const userItems = [
        { name: 'Outgoing Reports', href: '/buttons/file-upload', icon: UploadCloud },
        { name: 'Incoming Letters', href: '/buttons/letter-download', icon: DownloadCloud },
        { name: 'File History', href: '/file-history', icon: ClipboardList },
    ];

    const managerItems = [
        { name: 'View Letters', href: '/transactions/letters', icon: FileText },
    ];

    const adminManageItems = [
        { name: 'Organizations', href: '/buttons/organizations', icon: Building2 },
        { name: 'Directorates', href: '/buttons/directorates', icon: Briefcase },
        { name: 'Report Type', href: '/buttons/documents', icon: FileText },
        { name: 'Budget Year', href: '/buttons/budgetyear', icon: Calculator },
    ];

    const adminUserItems = [
        { name: 'Users', href: '/buttons/users', icon: Users },
        { name: 'Roles', href: '/buttons/roles', icon: Shell },
        { name: 'Assign Role', href: '/buttons/assign', icon: UserCog },
        { name: 'Assign Privileges', href: '/buttons/assign-privileges', icon: Lock },
        { name: 'Translations', href: '/buttons/translations', icon: Languages },
    ];

    const uploadorgItems = isApprover ? [
        { name: 'Upload to Organizations', href: '/transactions/upload-to-organizations', icon: UploadCloud }
    ] : [];

    const archiverItems = isArchiver ? [
        { name: 'Incoming Reports', href: '/buttons/file-download', icon: DownloadCloud },
        { name: 'Approved Reports', href: '/transactions/approved-reports', icon: CheckCircle },
        { name: 'Pending Reports', href: '/transactions/pending-reports', icon: ClipboardList },
    ] : [];

    const auditorApproverItems = isSeniorAuditor || isApprover ? [
        { name: 'Assigned Tasks', href: '/transactions/auditor-tasks', icon: ClipboardList },
        { name: 'Rejected Reports', href: '/transactions/rejected-reports', icon: XOctagon },
        { name: 'Approved Reports', href: '/transactions/approved-reports', icon: CheckCircle },
        { name: 'Under Review', href: '/transactions/under-review-reports', icon: Clock },
        { name: 'Corrected Reports', href: '/transactions/corrected-reports', icon: Edit3 },
    ] : [];

    const advancedFiltersItem = isAdmin || isApprover || isArchiver || isSeniorAuditor ? [
        { name: 'Advanced Filters', href: '/transactions/advanced-filters', icon: Filter }
    ] : [];

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

    const roleInfo = roleColors[userRole || ''] || { label: userRole || 'Unknown', bg: 'bg-slate-500/20', text: 'text-slate-300' };

    const renderSection = (title: string, items: { name: string; href: string; icon: any }[]) => {
        if (items.length === 0) return null;
        return (
            <div className="mb-5">
                <p className="px-4 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    {title}
                </p>
                <ul className="space-y-0.5">
                    {items.map(item => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        return (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    className={`group flex items-center justify-between px-4 py-2.5 rounded-lg mx-2 text-sm font-medium transition-all duration-150 ${active
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
                                        : 'text-slate-400 hover:bg-slate-700/60 hover:text-slate-100'
                                        }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <Icon className={`h-4 w-4 flex-shrink-0 ${active ? 'text-indigo-200' : 'text-slate-500 group-hover:text-slate-300'}`} />
                                        <span>{item.name}</span>
                                    </div>
                                    {active && <ChevronRight className="h-3 w-3 text-indigo-300 opacity-70" />}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    };

    return (
        <div className="flex flex-col w-64 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 h-screen overflow-y-auto flex-shrink-0 shadow-2xl">

            {/* Logo */}
            <div className="flex items-center h-16 px-5 shrink-0 border-b border-slate-700/60">
                <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/50">
                        <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <span className="font-extrabold text-lg text-white tracking-tight leading-none">ARMAS</span>
                        <p className="text-[9px] text-slate-500 uppercase tracking-widest leading-none mt-0.5">Audit & Report Mgmt</p>
                    </div>
                </div>
            </div>

            {/* Role badge */}
            <div className="px-5 py-3 border-b border-slate-700/40">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${roleInfo.bg} ${roleInfo.text}`}>
                    {roleInfo.label}
                </span>
            </div>

            {/* Nav */}
            <nav className="flex-1 py-4 overflow-y-auto">
                {renderSection('Main', commonItems)}

                {isUser && renderSection('My Actions', userItems)}
                {isManager && renderSection('Manager Actions', managerItems)}

                {isAdmin && (
                    <>
                        {renderSection('Manage Organization', adminManageItems)}
                        {renderSection('Manage Access', adminUserItems)}
                    </>
                )}

                {(isArchiver || isSeniorAuditor || isApprover) && renderSection(
                    'Reports & Transactions',
                    [...archiverItems, ...auditorApproverItems]
                )}

                {uploadorgItems.length > 0 && renderSection('Organization Actions', uploadorgItems)}
                {advancedFiltersItem.length > 0 && renderSection('Reporting', advancedFiltersItem)}
            </nav>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-slate-700/40 shrink-0">
                <p className="text-[10px] text-slate-600 text-center">ARMAS System © 2026</p>
            </div>
        </div>
    );
}
