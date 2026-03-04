'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import axiosInstance from '@/lib/axios';
import { Bell, LogOut, UserCircle } from 'lucide-react';

function timeAgo(dateStr: string): string {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
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

export function Header() {
    const { userRole, logout } = useAuth();
    const router = useRouter();

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isArchiver = userRole === 'ARCHIVER';
    const isSeniorAuditor = userRole === 'SENIOR_AUDITOR';
    const isApprover = userRole === 'APPROVER';
    const isUser = userRole === 'USER';
    const isManager = userRole === 'MANAGER';

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await axiosInstance.get('/transactions/notifications');
            const all: Notification[] = Array.isArray(res.data) ? res.data : [];
            const unread = all.filter(n => !n.isRead).sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setNotifications(unread);
            setUnreadCount(unread.length);
        } catch {
            // silently fail — don't disrupt the UI
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 5000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Close dropdown when clicking outside
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

    const roleLabel: Record<string, string> = {
        ADMIN: 'Administrator',
        USER: 'User',
        ARCHIVER: 'Archiver',
        SENIOR_AUDITOR: 'Senior Auditor',
        APPROVER: 'Approver',
        MANAGER: 'Manager',
    };

    return (
        <header className="bg-white border-b border-gray-200 shadow-sm z-10">
            <div className="px-6 h-16 flex items-center justify-between">
                {/* Left: page context */}
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">ARMAS</span>
                    <span className="text-gray-300">/</span>
                    <span className="text-sm font-medium text-gray-700">
                        {roleLabel[userRole || ''] || userRole}
                    </span>
                </div>

                {/* Right: bell + user + logout */}
                <div className="flex items-center space-x-3">

                    {/* Notification Bell */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsOpen(prev => !prev)}
                            className="relative p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            aria-label="Notifications"
                        >
                            <Bell className="w-5 h-5 text-gray-500" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {isOpen && (
                            <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden z-50">
                                <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-white">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
                                            {unreadCount} unread
                                        </span>
                                    )}
                                </div>

                                <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                                    {notifications.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                                            <Bell className="w-8 h-8 mb-2 opacity-30" />
                                            <p className="text-sm">No new notifications</p>
                                        </div>
                                    ) : (
                                        notifications.map(n => (
                                            <button
                                                key={n.id}
                                                onClick={() => handleNotificationClick(n)}
                                                className="w-full text-left px-4 py-3 hover:bg-indigo-50 transition-colors"
                                            >
                                                <p className="text-sm font-semibold text-gray-800 truncate">{n.title || 'Notification'}</p>
                                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message || ''}</p>
                                                {n.createdAt && (
                                                    <p className="text-[10px] text-gray-400 mt-1">
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

                    {/* Divider */}
                    <div className="h-6 w-px bg-gray-200" />

                    {/* User chip */}
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <UserCircle className="w-5 h-5 text-indigo-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 hidden sm:block">
                            {roleLabel[userRole || ''] || userRole}
                        </span>
                    </div>

                    {/* Logout */}
                    <button
                        onClick={logout}
                        className="flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
