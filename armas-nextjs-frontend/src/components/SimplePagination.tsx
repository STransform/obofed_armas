'use client';

import { useEffect, useState } from 'react';
import { getMessages, type Lang } from '@/lib/messages';

interface SimplePaginationProps {
    currentPage: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    itemLabel?: string;
}

export function SimplePagination({
    currentPage,
    totalItems,
    pageSize,
    onPageChange,
    itemLabel = 'items',
}: SimplePaginationProps) {
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

    const msgs = getMessages(lang);
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const start = totalItems === 0 ? 0 : ((currentPage - 1) * pageSize) + 1;
    const end = Math.min(currentPage * pageSize, totalItems);

    return (
        <div className="flex flex-col gap-4 border-t border-[var(--line-soft)] bg-[linear-gradient(180deg,#f8fffc_0%,#f3faf6_100%)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-base font-semibold text-[var(--ink-600)]">
                {msgs.table.showing} {start}-{end} {msgs.table.of} {totalItems} {itemLabel}
            </span>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="rounded-2xl border border-[var(--line-soft)] bg-white px-4 py-2.5 text-sm font-bold text-[var(--ink-700)] shadow-[0_8px_16px_rgba(15,23,42,0.04)] transition hover:bg-[var(--surface-2)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {msgs.table.btnPrev}
                </button>
                <span className="rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-[var(--ink-600)] shadow-[0_8px_16px_rgba(15,23,42,0.04)]">
                    {msgs.table.showing} {currentPage} {msgs.table.of} {totalPages}
                </span>
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="rounded-2xl border border-[var(--line-soft)] bg-white px-4 py-2.5 text-sm font-bold text-[var(--ink-700)] shadow-[0_8px_16px_rgba(15,23,42,0.04)] transition hover:bg-[var(--surface-2)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {msgs.table.btnNext}
                </button>
            </div>
        </div>
    );
}
