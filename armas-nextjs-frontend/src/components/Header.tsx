'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import axiosInstance from '@/lib/axios';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Bell, LogOut, UserCircle, Building2, ShieldCheck, Globe, ChevronDown } from 'lucide-react';
import { getMessages, type Lang } from '@/lib/messages';
import { useTranslation } from '@/hooks/useTranslation';

const NOTIFICATIONS_CACHE_KEY = 'armas_notifications_cache';
const NOTIFICATIONS_CACHE_TTL_MS = 30 * 1000;
const CURRENT_USER_CACHE_KEY = 'armas_current_user_cache';
const LANGS = [
    { code: 'en' as Lang, label: 'English', flag: 'EN' },
    { code: 'am' as Lang, label: 'Amharic', flag: 'AM' },
    { code: 'om' as Lang, label: 'Afaan Oromoo', flag: 'OM' },
];

function timeAgo(dateStr: string): string {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function readFreshNotificationsCache(): {
    notifications: Notification[];
    unreadCount: number;
} | null {
    try {
        const raw = sessionStorage.getItem(NOTIFICATIONS_CACHE_KEY);
        if (!raw) return null;

        const cached = JSON.parse(raw) as {
            timestamp: number;
            notifications: Notification[];
            unreadCount: number;
        };

        if ((Date.now() - cached.timestamp) > NOTIFICATIONS_CACHE_TTL_MS) return null;

        return {
            notifications: Array.isArray(cached.notifications) ? cached.notifications : [],
            unreadCount: typeof cached.unreadCount === 'number' ? cached.unreadCount : 0,
        };
    } catch {
        return null;
    }
}

interface Notification {
    id: number;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    entityType: string;
    entityId: number;
    context: string;
}

interface CurrentUserSummary {
    username?: string | null;
    orgname?: string | null;
}

export function Header() {
    const { userRole, logout } = useAuth();
    const router = useRouter();
    const { resolve } = useTranslation();

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<CurrentUserSummary | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

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

    const msgs = getMessages(lang).header;
    const currentLang = LANGS.find(item => item.code === lang) || LANGS[0];

    const isArchiver = userRole === 'ARCHIVER';
    const isSeniorAuditor = userRole === 'SENIOR_AUDITOR';
    const isApprover = userRole === 'APPROVER';
    const isUser = userRole === 'USER';
    const isManager = userRole === 'MANAGER';

    useEffect(() => {
        try {
            const raw = sessionStorage.getItem(CURRENT_USER_CACHE_KEY);
            if (!raw) return;
            const cached = JSON.parse(raw) as CurrentUserSummary;
            setCurrentUser(cached);
        } catch {
            // Ignore broken cache and fetch fresh user info.
        }
    }, []);

    useEffect(() => {
        let cancelled = false;

        const loadCurrentUser = async () => {
            try {
                const res = await axiosInstance.get('/users/me');
                if (cancelled) return;

                const nextUser: CurrentUserSummary = {
                    username: res.data?.username || null,
                    orgname: res.data?.orgname || res.data?.organization?.orgname || null,
                };
                setCurrentUser(nextUser);
                try {
                    sessionStorage.setItem(CURRENT_USER_CACHE_KEY, JSON.stringify(nextUser));
                } catch {
                    // Ignore storage failures.
                }
            } catch {
                if (!cancelled) {
                    setCurrentUser(null);
                }
            }
        };

        loadCurrentUser();
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        const cached = readFreshNotificationsCache();
        if (cached) {
            setNotifications(cached.notifications);
            setUnreadCount(cached.unreadCount);
        }
    }, []);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await axiosInstance.get('/transactions/notifications');
            const all: Notification[] = Array.isArray(res.data) ? res.data : [];
            const unread = all.filter(n => !n.isRead).sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setNotifications(unread);
            setUnreadCount(unread.length);
            try {
                sessionStorage.setItem(NOTIFICATIONS_CACHE_KEY, JSON.stringify({
                    timestamp: Date.now(),
                    notifications: unread,
                    unreadCount: unread.length,
                }));
            } catch {
                // Ignore storage failures.
            }
        } catch {
            // silently fail - don't disrupt the UI
        }
    }, []);

    useEffect(() => {
        let cleanupPrefetch: (() => void) | undefined;
        const cached = readFreshNotificationsCache();
        if (!cached) {
            fetchNotifications();
        } else if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
            const idleId = window.requestIdleCallback(() => fetchNotifications(), { timeout: 2000 });
            cleanupPrefetch = () => window.cancelIdleCallback(idleId);
        } else {
            const timeoutId = globalThis.setTimeout(() => fetchNotifications(), 1500);
            cleanupPrefetch = () => globalThis.clearTimeout(timeoutId);
        }

        const interval = setInterval(fetchNotifications, 120000);
        return () => {
            cleanupPrefetch?.();
            clearInterval(interval);
        };
    }, [fetchNotifications]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = async (n: Notification) => {
        try {
            await axiosInstance.put(`/transactions/notifications/${n.id}/read`);
        } catch { /* ignore */ }

        setIsOpen(false);
        fetchNotifications();

        const id = n.entityId;
        if (n.entityType !== 'MasterTransaction') { router.push('/dashboard'); return; }

        if (isArchiver) {
            if (n.context === 'report_uploaded') router.push(`/buttons/file-download?taskId=${id}`);
            else if (n.context === 'task_approved') router.push(`/transactions/approved-reports?taskId=${id}`);
            else if (n.context === 'letter_uploaded') router.push(`/transactions/letters?taskId=${id}`);
            else router.push('/dashboard');
        } else if (isSeniorAuditor && n.context === 'task_assigned') {
            router.push(`/transactions/auditor-tasks?taskId=${id}`);
        } else if (isApprover && n.context === 'task_evaluated') {
            router.push(`/transactions/auditor-tasks?taskId=${id}`);
        } else if ((isUser || isManager) && n.context === 'letter_uploaded') {
            router.push(`/transactions/letters?taskId=${id}`);
        } else {
            router.push('/dashboard');
        }
    };

    const usernameLabel = currentUser?.username || (msgs.roles[userRole as keyof typeof msgs.roles] || userRole);
    const orgLabel = currentUser?.orgname ? resolve(currentUser.orgname) || currentUser.orgname : null;
    const pickLanguage = (code: Lang) => {
        setLang(code);
        localStorage.setItem('armas_lang', code);
        window.dispatchEvent(new Event('storage'));
    };

    return (
        <header className="sticky top-0 z-10 border-b border-[var(--line-soft)] bg-white/88 backdrop-blur-xl">
            <div className="flex min-h-[92px] items-center justify-between gap-4 px-6 py-4">
                <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#064e3b_0%,#0f766e_100%)] shadow-[0_16px_30px_rgba(6,95,70,0.18)]">
                        <ShieldCheck className="h-7 w-7 text-white" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--brand-700)]">{msgs.bureauName}</p>
                        <h1 className="truncate font-display text-2xl font-black tracking-tight text-[var(--ink-900)]">
                            {usernameLabel}
                        </h1>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[var(--ink-500)]">
                            <span className="inline-flex items-center gap-1">
                                <Building2 className="h-4 w-4" />
                                {msgs.departmentLabel}
                            </span>
                            {orgLabel && (
                                <>
                                    <span className="text-[var(--ink-300)]">|</span>
                                    <span className="truncate font-medium text-[var(--ink-600)]">{orgLabel}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger className="hidden items-center gap-2 rounded-2xl border border-[var(--line-soft)] bg-white px-4 py-3 text-sm font-bold text-[var(--ink-700)] shadow-[0_10px_18px_rgba(15,23,42,0.04)] transition hover:border-[var(--brand-300)] hover:text-[var(--brand-800)] lg:flex">
                            <Globe className="h-4 w-4" />
                            <span>{currentLang.flag}</span>
                            <span>{currentLang.label}</span>
                            <ChevronDown className="h-4 w-4 text-[var(--ink-400)]" />
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                            <DropdownMenu.Content
                                align="end"
                                sideOffset={8}
                                className="min-w-[180px] rounded-2xl border border-[var(--line-soft)] bg-white p-2 shadow-2xl"
                            >
                                {LANGS.map(item => (
                                    <DropdownMenu.Item
                                        key={item.code}
                                        onClick={() => pickLanguage(item.code)}
                                        className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-sm outline-none transition ${lang === item.code ? 'bg-[var(--brand-50)] font-bold text-[var(--brand-800)]' : 'text-[var(--ink-700)] hover:bg-[var(--surface-2)]'}`}
                                    >
                                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-2)] text-xs font-black">
                                            {item.flag}
                                        </span>
                                        {item.label}
                                    </DropdownMenu.Item>
                                ))}
                            </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                    </DropdownMenu.Root>

                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsOpen(prev => !prev)}
                            className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--line-soft)] bg-[var(--surface-1)] text-[var(--ink-600)] transition hover:border-[var(--brand-300)] hover:text-[var(--brand-800)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-300)]"
                            aria-label={msgs.notifications}
                        >
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <span className="absolute right-1.5 top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {isOpen && (
                            <div className="absolute right-0 mt-3 w-[26rem] overflow-hidden rounded-[1.5rem] border border-[var(--line-soft)] bg-white shadow-[0_28px_70px_rgba(15,23,42,0.16)]">
                                <div className="bg-[linear-gradient(135deg,#064e3b_0%,#0f766e_100%)] px-5 py-4 text-white">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-bold">{msgs.notifications}</h3>
                                        {unreadCount > 0 && (
                                            <span className="rounded-full bg-white/12 px-3 py-1 text-xs font-black uppercase tracking-[0.16em]">
                                                {unreadCount} {msgs.unread}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="max-h-96 overflow-y-auto divide-y divide-[var(--line-soft)]">
                                    {notifications.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center px-6 py-12 text-[var(--ink-400)]">
                                            <Bell className="mb-3 h-9 w-9 opacity-40" />
                                            <p className="text-base font-semibold">{msgs.noNotifications}</p>
                                        </div>
                                    ) : (
                                        notifications.map(n => (
                                            <button
                                                key={n.id}
                                                onClick={() => handleNotificationClick(n)}
                                                className="w-full px-5 py-4 text-left transition hover:bg-[var(--surface-2)]"
                                            >
                                                <p className="text-base font-bold text-[var(--ink-900)]">{n.title || 'Notification'}</p>
                                                <p className="mt-1 text-sm leading-6 text-[var(--ink-500)]">{n.message || ''}</p>
                                                {n.createdAt && (
                                                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-700)]">
                                                        {timeAgo(n.createdAt)}
                                                    </p>
                                                )}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="hidden h-10 w-px bg-[var(--line-soft)] sm:block" />

                    <div className="hidden items-center gap-3 rounded-2xl border border-[var(--line-soft)] bg-white px-4 py-2.5 shadow-[0_10px_18px_rgba(15,23,42,0.04)] sm:flex">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--surface-2)]">
                            <UserCircle className="h-6 w-6 text-[var(--brand-700)]" />
                        </div>
                        <div>
                            <p className="text-base font-bold text-[var(--ink-900)]">{usernameLabel}</p>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-400)]">
                                {msgs.roles[userRole as keyof typeof msgs.roles] || userRole}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 transition hover:bg-rose-100"
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="hidden sm:inline">{msgs.logout}</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
