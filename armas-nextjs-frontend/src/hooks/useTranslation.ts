/**
 * useTranslation
 *
 * Fetches the active locale's dynamic translation dictionary from the
 * translation-service and exposes a `resolve(key)` helper.
 *
 * Usage:
 *   const { resolve } = useTranslation();
 *   ...
 *   <td>{resolve(org.orgname)}</td>
 *
 * For any value that does NOT look like a translation key (no dots, or
 * doesn't match "<entityName>.<id>.<field>") it is returned as-is.
 */

import { useEffect, useState, useCallback } from 'react';
import axiosInstance from '@/lib/axios';

type Dict = Record<string, string>;

// Module-level cache so simultaneous components share one request
let cachedLang = '';
let cachedDict: Dict = {};
let pendingPromise: Promise<Dict> | null = null;

let cachedEnDict: Dict = {};
let pendingEnPromise: Promise<Dict> | null = null;

async function loadEnDict(): Promise<Dict> {
    if (Object.keys(cachedEnDict).length > 0) return cachedEnDict;
    if (!pendingEnPromise) {
        pendingEnPromise = axiosInstance
            .get('/transactions/translations', { params: { lang: 'en' } })
            .then(r => {
                cachedEnDict = r.data || {};
                pendingEnPromise = null;
                return cachedEnDict;
            })
            .catch(() => {
                pendingEnPromise = null;
                return {} as Dict;
            });
    }
    return pendingEnPromise;
}

async function loadDict(lang: string): Promise<Dict> {
    if (lang === cachedLang && Object.keys(cachedDict).length > 0) {
        return cachedDict;
    }
    if (!pendingPromise || lang !== cachedLang) {
        cachedLang = lang;
        cachedDict = {};
        pendingPromise = axiosInstance
            .get('/transactions/translations', { params: { lang } })
            .then(r => {
                cachedDict = r.data || {};
                pendingPromise = null;
                return cachedDict;
            })
            .catch(() => {
                pendingPromise = null;
                return {} as Dict;
            });
    }
    return pendingPromise!;
}

export function useTranslation() {
    const [dict, setDict] = useState<Dict>(cachedDict);
    const [enDict, setEnDict] = useState<Dict>(cachedEnDict);

    useEffect(() => {
        const lang = (typeof window !== 'undefined'
            ? localStorage.getItem('armas_lang')
            : null) || 'en';

        loadDict(lang).then(d => {
            setDict({ ...d });
            // When locale IS English, reuse the same dict as the English fallback
            if (lang === 'en') setEnDict({ ...d });
        });
        // Always also load the English dictionary for the fallback
        loadEnDict().then(d => setEnDict({ ...d }));
    }, []);

    /**
     * Resolves a value that might be a translation key.
     * A "key" looks like "someentity.ID.fieldname" — at least two dots.
     * If the value looks like a key but has no entry in the dictionary,
     * we fall back to the English dictionary, then to a smart display
     * of the middle segment (entity ID) rather than the raw key.
     */
    const resolve = useCallback(
        (value: string | null | undefined): string => {
            if (!value) return '';
            // Only attempt resolution if the string looks like a translation key
            const parts = value.split('.');
            if (parts.length < 3) return value;          // not a key pattern → return as-is

            // 1. Try the current locale dictionary
            const resolved = dict[value];
            if (resolved !== undefined) return resolved;

            // 2. Try the English fallback dictionary
            const enResolved = enDict[value];
            if (enResolved !== undefined) return enResolved;

            // 3. Smart fallback: use the entity-ID segment (middle part)
            // e.g. 'organization.BSC.orgname' → 'BSC'
            // e.g. 'document.70114647-6725-4372-8da3-ef6587d99a95.reportype' → '70114647' (short)
            const idSegment = parts[1];
            // If the ID looks like a UUID, show only the first 8 chars for readability
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(idSegment);
            return isUuid ? idSegment.substring(0, 8) : idSegment;
        },
        [dict, enDict]
    );

    return { resolve, dict };
}
