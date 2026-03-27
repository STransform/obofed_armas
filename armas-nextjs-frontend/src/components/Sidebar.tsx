'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import {
    Building2, Users, FileText, Calculator, Shell, Lock, CheckCircle,
    XOctagon, Clock, Edit3, UploadCloud, DownloadCloud, ClipboardList,
    LayoutDashboard, Filter, ShieldCheck, Briefcase, ChevronRight,
    UserCog, Languages, Landmark, BadgeCheck
} from 'lucide-react';
import { getMessages, type Lang } from '@/lib/messages';

const roleColors: Record<string, { badge: string; dot: string }> = {
    ADMIN: { badge: 'bg-sky-100 text-sky-800', dot: 'bg-sky-600' },
    USER: { badge: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-600' },
    ARCHIVER: { badge: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500' },
    SENIOR_AUDITOR: { badge: 'bg-violet-100 text-violet-800', dot: 'bg-violet-600' },
    APPROVER: { badge: 'bg-rose-100 text-rose-800', dot: 'bg-rose-600' },
    MANAGER: { badge: 'bg-cyan-100 text-cyan-800', dot: 'bg-cyan-600' },
};

export function Sidebar() {
    const { userRole } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

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

    const msgs = getMessages(lang).sidebar;
    const s = msgs.sections;
    const it = msgs.items;

    const isAdmin = userRole === 'ADMIN';
    const isUser = userRole === 'USER';
    const isSeniorAuditor = userRole === 'SENIOR_AUDITOR';
    const isArchiver = userRole === 'ARCHIVER';
    const isApprover = userRole === 'APPROVER';
    const isManager = userRole === 'MANAGER';

    const commonItems = [{ name: it.dashboard, href: '/dashboard', icon: LayoutDashboard }];

    const userItems = [
        { name: it.outgoingReports, href: '/buttons/file-upload', icon: UploadCloud },
        { name: it.incomingLetters, href: '/buttons/letter-download', icon: DownloadCloud },
        { name: it.fileHistory, href: '/file-history', icon: ClipboardList },
    ];

    const managerItems = [
        { name: it.viewLetters, href: '/transactions/letters', icon: FileText },
    ];

    const adminManageItems = [
        { name: it.organizations, href: '/buttons/organizations', icon: Building2 },
        { name: it.directorates, href: '/buttons/directorates', icon: Briefcase },
        { name: it.reportType, href: '/buttons/documents', icon: FileText },
        { name: it.budgetYear, href: '/buttons/budgetyear', icon: Calculator },
    ];

    const adminUserItems = [
        { name: it.users, href: '/buttons/users', icon: Users },
        { name: it.roles, href: '/buttons/roles', icon: Shell },
        { name: it.assignRole, href: '/buttons/assign', icon: UserCog },
        { name: it.assignPrivileges, href: '/buttons/assign-privileges', icon: Lock },
        { name: it.translations, href: '/buttons/translations', icon: Languages },
        { name: it.notices || 'Notices', href: '/transactions/notices', icon: FileText },
    ];

    const uploadorgItems = isApprover ? [
        { name: it.uploadToOrganizations || 'Upload to Organizations', href: '/transactions/upload-to-organizations', icon: UploadCloud },
        { name: it.notices || 'Notices', href: '/transactions/notices', icon: FileText }
    ] : [];

    const archiverItems = isArchiver ? [
        { name: it.incomingReports, href: '/buttons/file-download', icon: DownloadCloud },
        { name: it.approvedReports, href: '/transactions/approved-reports', icon: CheckCircle },
        { name: it.pendingReports, href: '/transactions/pending-reports', icon: ClipboardList },
    ] : [];

    const auditorApproverItems = isSeniorAuditor || isApprover ? [
        { name: it.assignedTasks, href: '/transactions/auditor-tasks', icon: ClipboardList },
        { name: it.rejectedReports, href: '/transactions/rejected-reports', icon: XOctagon },
        { name: it.approvedReports, href: '/transactions/approved-reports', icon: CheckCircle },
        { name: it.underReview, href: '/transactions/under-review-reports', icon: Clock },
        { name: it.correctedReports, href: '/transactions/corrected-reports', icon: Edit3 },
    ] : [];

    const advancedFiltersItem = isAdmin || isApprover || isArchiver || isSeniorAuditor ? [
        { name: it.advancedFilters, href: '/transactions/advanced-filters', icon: Filter }
    ] : [];

    useEffect(() => {
        const hrefs = ['/dashboard'];

        if (isUser) hrefs.push('/buttons/file-upload', '/buttons/letter-download', '/file-history');
        if (isManager) hrefs.push('/transactions/letters');
        if (isAdmin) {
            hrefs.push(
                '/buttons/organizations',
                '/buttons/directorates',
                '/buttons/documents',
                '/buttons/budgetyear',
                '/buttons/users',
                '/buttons/roles',
                '/buttons/assign',
                '/buttons/assign-privileges',
                '/buttons/translations',
                '/transactions/notices',
                '/transactions/advanced-filters'
            );
        }
        if (isArchiver) {
            hrefs.push(
                '/buttons/file-download',
                '/transactions/approved-reports',
                '/transactions/pending-reports',
                '/transactions/advanced-filters'
            );
        }
        if (isSeniorAuditor || isApprover) {
            hrefs.push(
                '/transactions/auditor-tasks',
                '/transactions/rejected-reports',
                '/transactions/approved-reports',
                '/transactions/under-review-reports',
                '/transactions/corrected-reports',
                '/transactions/advanced-filters'
            );
        }
        if (isApprover) hrefs.push('/transactions/upload-to-organizations', '/transactions/notices');

        const uniqueHrefs = Array.from(new Set(hrefs));
        const prefetchRoutes = () => {
            uniqueHrefs.forEach((href) => router.prefetch(href));
        };

        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
            const idleId = window.requestIdleCallback(prefetchRoutes, { timeout: 1500 });
            return () => window.cancelIdleCallback(idleId);
        }

        const timeoutId = globalThis.setTimeout(prefetchRoutes, 300);
        return () => globalThis.clearTimeout(timeoutId);
    }, [isAdmin, isApprover, isArchiver, isManager, isSeniorAuditor, isUser, router]);

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

    const roleInfo = roleColors[userRole || ''] || { badge: 'bg-slate-100 text-slate-700', dot: 'bg-slate-500' };
    const roleLabel = msgs.roles[userRole as keyof typeof msgs.roles] || userRole || 'Unknown';

    const renderSection = (title: string, items: { name: string; href: string; icon: any }[]) => {
        if (items.length === 0) return null;
        return (
            <section className="mb-7">
                <div className="mb-3 px-4">
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--ink-400)]">
                        {title}
                    </p>
                </div>
                <ul className="space-y-1.5">
                    {items.map(item => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`group mx-3 flex items-center justify-between rounded-2xl px-4 py-3.5 text-[15px] font-semibold transition-all duration-200 ${active
                                        ? 'bg-[linear-gradient(135deg,#065f46_0%,#0f766e_100%)] text-white shadow-[0_18px_30px_rgba(6,95,70,0.22)]'
                                        : 'text-[var(--ink-600)] hover:bg-[var(--surface-2)] hover:text-[var(--ink-900)]'
                                        }`}
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${active ? 'bg-white/10' : 'bg-white shadow-[0_6px_18px_rgba(15,23,42,0.06)]'}`}>
                                            <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-[var(--brand-700)] group-hover:text-[var(--brand-800)]'}`} />
                                        </div>
                                        <span className="leading-5">{item.name}</span>
                                    </div>
                                    <ChevronRight className={`h-4 w-4 transition ${active ? 'translate-x-0 text-white/80' : 'text-[var(--ink-300)] group-hover:translate-x-0.5 group-hover:text-[var(--brand-700)]'}`} />
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </section>
        );
    };

    return (
        <aside data-armas-shell="true" className="flex h-screen w-[320px] flex-col overflow-hidden border-r border-[var(--line-soft)] bg-[linear-gradient(180deg,#f8fffc_0%,#f3faf6_46%,#edf7f1_100%)] shadow-[18px_0_48px_rgba(15,23,42,0.06)]">
            <div className="border-b border-[var(--line-soft)] px-5 py-5">
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#064e3b_0%,#0f766e_100%)] shadow-[0_18px_30px_rgba(6,95,70,0.2)]">
                        <ShieldCheck className="h-7 w-7 text-white" />
                    </div>
                    <div>
                        <p className="font-display text-2xl font-black tracking-tight text-[var(--ink-900)]">ARMAS</p>
                        <p className="text-xs font-bold uppercase tracking-[0.28em] text-[var(--ink-500)]">{msgs.logoSub}</p>
                    </div>
                </div>

                <div className="mt-5 rounded-3xl border border-[var(--line-soft)] bg-white p-4 shadow-[0_12px_24px_rgba(15,23,42,0.05)]">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--ink-400)]">{msgs.institutionLabel}</p>
                            <p className="mt-2 text-lg font-bold text-[var(--ink-900)]">{msgs.institutionName}</p>
                            <p className="mt-1 text-sm text-[var(--ink-500)]">{msgs.institutionSub}</p>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--surface-2)] text-[var(--brand-800)]">
                            <Landmark className="h-5 w-5" />
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${roleInfo.dot}`} />
                        <span className={`inline-flex rounded-full px-3 py-1.5 text-sm font-bold ${roleInfo.badge}`}>
                            {roleLabel}
                        </span>
                    </div>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-1 py-5">
                {renderSection(s.main, commonItems)}
                {isUser && renderSection(s.myActions, userItems)}
                {isManager && renderSection(s.managerActions, managerItems)}

                {isAdmin && (
                    <>
                        {renderSection(s.manageOrganization, adminManageItems)}
                        {renderSection(s.manageAccess, adminUserItems)}
                    </>
                )}

                {(isArchiver || isSeniorAuditor || isApprover) && renderSection(
                    s.reportsTransactions,
                    [...archiverItems, ...auditorApproverItems]
                )}

                {uploadorgItems.length > 0 && renderSection(s.organizationActions, uploadorgItems)}
                {advancedFiltersItem.length > 0 && renderSection(s.reporting, advancedFiltersItem)}
            </nav>

            <div className="border-t border-[var(--line-soft)] px-5 py-4">
                <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_10px_20px_rgba(15,23,42,0.04)]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--surface-2)] text-[var(--brand-800)]">
                        <BadgeCheck className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-[var(--ink-800)]">{msgs.integrityTitle}</p>
                        <p className="text-xs text-[var(--ink-500)]">{msgs.footer}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
