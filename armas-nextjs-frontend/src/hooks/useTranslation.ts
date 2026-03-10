/**
 * useTranslation - optimized version
 *
 * Changes from original:
 * 1. Persists the translation dictionary in sessionStorage so it survives
 *    page navigations without firing new API requests.
 * 2. Module-level in-memory cache still used as a faster hot-path.
 * 3. English dict is reused when lang === 'en' (no duplicate request).
 */

import { useEffect, useState, useCallback } from 'react';
import axiosInstance from '@/lib/axios';

type Dict = Record<string, string>;

const SESSION_KEY = 'armas_trans_';

// Module-level in-memory cache (reset on hot reload, but that's fine)
const memCache: Record<string, Dict> = {};
const pendingRequests: Record<string, Promise<Dict>> = {};

function getCachedDict(lang: string): Dict | null {
    if (memCache[lang] && Object.keys(memCache[lang]).length > 0) {
        return memCache[lang];
    }
    try {
        const stored = sessionStorage.getItem(SESSION_KEY + lang);
        if (stored) {
            const parsed = JSON.parse(stored) as Dict;
            if (Object.keys(parsed).length > 0) {
                memCache[lang] = parsed;
                return parsed;
            }
        }
    } catch { /* ignore */ }
    return null;
}

async function loadDict(lang: string): Promise<Dict> {
    const cached = getCachedDict(lang);
    if (cached) return cached;

    if (!pendingRequests[lang]) {
        pendingRequests[lang] = axiosInstance
            .get('/transactions/translations', { params: { lang } })
            .then(r => {
                const data: Dict = r.data || {};
                memCache[lang] = data;
                try { sessionStorage.setItem(SESSION_KEY + lang, JSON.stringify(data)); } catch { /* ignore */ }
                delete pendingRequests[lang];
                return data;
            })
            .catch(() => {
                delete pendingRequests[lang];
                return {} as Dict;
            });
    }
    return pendingRequests[lang];
}

export function useTranslation() {
    const lang = (typeof window !== 'undefined'
        ? localStorage.getItem('armas_lang')
        : null) || 'en';

    // Initialize synchronously from cache if available
    const [dict, setDict] = useState<Dict>(() => getCachedDict(lang) ?? {});
    const [enDict, setEnDict] = useState<Dict>(() => getCachedDict('en') ?? {});

    useEffect(() => {
        let cancelled = false;

        loadDict(lang).then(d => {
            if (!cancelled) setDict(d);
        });

        // Only load English dict separately when lang is not English
        if (lang !== 'en') {
            loadDict('en').then(d => {
                if (!cancelled) setEnDict(d);
            });
        } else {
            // Reuse the same dict for English fallback
            loadDict(lang).then(d => {
                if (!cancelled) setEnDict(d);
            });
        }

        return () => { cancelled = true; };
    }, [lang]);

    const resolve = useCallback(
        (value: string | null | undefined): string => {
            if (!value) return '';
            const parts = value.split('.');
            if (parts.length < 3) return value;

            const resolved = dict[value];
            if (resolved !== undefined) return resolved;

            const enResolved = enDict[value];
            if (enResolved !== undefined) return enResolved;

            const idSegment = parts[1];
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(idSegment);
            return isUuid ? idSegment.substring(0, 8) : idSegment;
        },
        [dict, enDict]
    );

    return { resolve, dict };
}
