"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Plus, Edit, Trash2, Eye, Languages, Home, ChevronRight, FileText, Database, FileJson, AlertCircle, CheckCircle2, ArrowLeft, Save, Globe } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useTranslation } from '@/hooks/useTranslation';
import axiosInstance from "../../../lib/axios";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { flattenMessages } from "@/lib/messages";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
interface LangStats {
    code: string;
    name: string;
    nativeName: string;
    totalKeys: number;
    translated: number;
    untranslated: number;
    progress: number;
}

interface TranslationRow {
    key: string;
    en: string;
    target: string;
    isDirty: boolean;
    source: "static" | "dynamic";
}

type FilterType = "all" | "untranslated" | "translated";

const LANGUAGES: Record<string, { name: string; nativeName: string; flag: string }> = {
    am: { name: "Amharic", nativeName: "አማርኛ", flag: "🇪🇹" },
    om: { name: "Afaan Oromoo", nativeName: "Afaan Oromoo", flag: "🇪🇹" },
};

// ──────────────────────────────────────────────
// Progress bar component
// ──────────────────────────────────────────────
function ProgressBar({ value }: { value: number }) {
    const color =
        value >= 80 ? "bg-emerald-500" : value >= 50 ? "bg-amber-500" : "bg-red-500";
    return (
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
                className={`h-2 rounded-full transition-all duration-500 ${color}`}
                style={{ width: `${value}%` }}
            />
        </div>
    );
}

// ──────────────────────────────────────────────
// Level 1 — Language Selection Page
// ──────────────────────────────────────────────
function LanguageSelectionView({ onSelect }: { onSelect: (lang: string) => void }) {
    const [stats, setStats] = useState<LangStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch English as the base truth for total keys
                const [enDynamicRes, enStaticRaw] = await Promise.all([
                    axiosInstance.get('/transactions/translations', { params: { lang: 'en' } }),
                    fetch('/api/messages?lang=en').then(r => r.json())
                ]);

                const enDynamic = enDynamicRes.data || {};
                const enStatic = flattenMessages(enStaticRaw);

                const enDynamicKeys = Object.keys(enDynamic);
                const enStaticKeys = Object.keys(enStatic);
                const totalKeys = enDynamicKeys.length + enStaticKeys.length;

                const newStats: LangStats[] = [];

                // Fetch target languages to calculate stats
                for (const code of Object.keys(LANGUAGES)) {
                    const [targetDynamicRes, targetStaticRaw] = await Promise.all([
                        axiosInstance.get('/transactions/translations', { params: { lang: code } }),
                        fetch(`/api/messages?lang=${code}`).then(r => r.json())
                    ]);

                    const targetDynamic = targetDynamicRes.data || {};
                    const targetStatic = flattenMessages(targetStaticRaw);

                    let translatedCount = 0;

                    enDynamicKeys.forEach(key => {
                        const val = targetDynamic[key];
                        if (val && val.trim() !== '') translatedCount++;
                    });

                    enStaticKeys.forEach(key => {
                        const val = targetStatic[key];
                        if (val && val.trim() !== '') translatedCount++;
                    });

                    const untranslatedCount = totalKeys - translatedCount;
                    const progress = totalKeys > 0 ? Math.round((translatedCount / totalKeys) * 100) : 0;

                    newStats.push({
                        code,
                        name: LANGUAGES[code].name,
                        nativeName: LANGUAGES[code].nativeName,
                        totalKeys,
                        translated: translatedCount,
                        untranslated: untranslatedCount,
                        progress
                    });
                }

                setStats(newStats);
            } catch (err) {
                console.error("Failed to load language stats", err);
                setError("Failed to load translation statistics.");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-slate-500 flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    Loading language statistics...
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-xl text-primary">
                        <Languages size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Translation Management</h1>
                        <p className="text-slate-500 text-sm mt-0.5">
                            Manage application strings for all supported languages
                        </p>
                    </div>
                </div>
            </div>

            <nav className="flex items-center gap-1.5 text-sm text-slate-500">
                <Home size={14} />
                <span>Home</span>
                <ChevronRight size={14} />
                <span className="text-slate-900 font-medium">Language Selection</span>
            </nav>

            {error && (
                <div className="p-4 rounded-lg flex items-center gap-2 bg-red-50 text-red-700 border border-red-200">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                    <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">
                        Available Languages
                    </h2>
                </div>

                <div className="hidden md:grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <span>Language</span>
                    <span>Progress</span>
                    <span>Translated</span>
                    <span>Untranslated</span>
                    <span>Total Keys</span>
                </div>

                <div className="divide-y divide-slate-100">
                    {stats.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => onSelect(lang.code)}
                            className="w-full text-left px-6 py-5 hover:bg-slate-50 transition-colors group"
                        >
                            <div className="md:hidden space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">
                                            {LANGUAGES[lang.code]?.flag}
                                        </span>
                                        <div>
                                            <div className="font-semibold text-slate-900 group-hover:text-primary transition-colors">
                                                {lang.name}
                                            </div>
                                            <div className="text-xs text-slate-500">{lang.nativeName}</div>
                                        </div>
                                    </div>
                                    <span className={`text-sm font-bold ${lang.progress >= 80 ? "text-emerald-600" : lang.progress >= 50 ? "text-amber-600" : "text-red-600"}`}>
                                        {lang.progress}%
                                    </span>
                                </div>
                                <ProgressBar value={lang.progress} />
                                <div className="flex gap-4 text-xs text-slate-500">
                                    <span className="text-emerald-600 font-medium">{lang.translated} translated</span>
                                    <span className="text-red-500">{lang.untranslated} missing</span>
                                    <span>{lang.totalKeys} total</span>
                                </div>
                            </div>

                            <div className="hidden md:grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-4 items-center">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{LANGUAGES[lang.code]?.flag}</span>
                                    <div>
                                        <div className="font-semibold text-slate-900 group-hover:text-primary transition-colors">
                                            {lang.name}
                                        </div>
                                        <div className="text-xs text-slate-500">{lang.nativeName}</div>
                                    </div>
                                </div>
                                <div className="space-y-1.5 pr-8">
                                    <ProgressBar value={lang.progress} />
                                    <span className={`text-xs font-bold ${lang.progress >= 80 ? "text-emerald-600" : lang.progress >= 50 ? "text-amber-600" : "text-red-600"}`}>
                                        {lang.progress}%
                                    </span>
                                </div>
                                <span className="text-emerald-600 font-semibold">{lang.translated}</span>
                                <span className="text-red-500 font-semibold">{lang.untranslated}</span>
                                <span className="text-slate-600">{lang.totalKeys}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────
// Level 2 — Per-Language Editor
// ──────────────────────────────────────────────
function TranslationEditorView({
    langCode,
    onBack,
}: {
    langCode: string;
    onBack: () => void;
}) {
    const langMeta = LANGUAGES[langCode] || { name: langCode, nativeName: langCode, flag: "🌐" };

    const [rows, setRows] = useState<TranslationRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [filter, setFilter] = useState<FilterType>("untranslated");
    const [sourceFilter, setSourceFilter] = useState<"all" | "static" | "dynamic">("all");
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Add New Key Modal State
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newKey, setNewKey] = useState("");
    const [newValue, setNewValue] = useState("");

    // Load translations
    useEffect(() => {
        setLoading(true);
        Promise.all([
            axiosInstance.get('/transactions/translations', { params: { lang: 'en' } }),
            fetch('/api/messages?lang=en').then(r => r.json()),
            axiosInstance.get(`/transactions/translations`, { params: { lang: langCode } }),
            fetch(`/api/messages?lang=${langCode}`).then(r => r.json())
        ]).then(([enDynamicRes, enStaticRaw, targetDynamicRes, targetStaticRaw]) => {
            const enDynamic = enDynamicRes.data || {};
            const enStatic = flattenMessages(enStaticRaw);
            const targetDynamic = targetDynamicRes.data || {};
            const targetStatic = flattenMessages(targetStaticRaw);

            const parsed: TranslationRow[] = [];

            Object.keys(enStatic).forEach(key => {
                parsed.push({
                    key,
                    en: enStatic[key] || "",
                    target: targetStatic[key] || "",
                    isDirty: false,
                    source: "static"
                });
            });

            Object.keys(enDynamic).forEach(key => {
                parsed.push({
                    key,
                    en: enDynamic[key] || "",
                    target: targetDynamic[key] || "",
                    isDirty: false,
                    source: "dynamic"
                });
            });

            setRows(parsed);
        }).catch(() => {
            setStatus({ type: "error", text: "Failed to load translations." });
        }).finally(() => {
            setLoading(false);
        });
    }, [langCode]);

    const handleEdit = useCallback((key: string, value: string) => {
        setRows((prev) =>
            prev.map((r) => (r.key === key ? { ...r, target: value, isDirty: true } : r))
        );
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setStatus(null);
        const dirtyRows = rows.filter((r) => r.isDirty);
        if (dirtyRows.length === 0) {
            setStatus({ type: "success", text: "No changes to save." });
            setSaving(false);
            return;
        }

        const dirtyStatic = dirtyRows.filter(r => r.source === "static");
        const dirtyDynamic = dirtyRows.filter(r => r.source === "dynamic");

        try {
            const promises = [];

            if (dirtyStatic.length > 0) {
                const staticUpdates: Record<string, string> = {};
                dirtyStatic.forEach(r => { staticUpdates[r.key] = r.target; });
                promises.push(
                    fetch(`/api/messages?lang=${langCode}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(staticUpdates)
                    }).then(r => {
                        if (!r.ok) throw new Error("Failed to save static translations");
                    })
                );
            }

            if (dirtyDynamic.length > 0) {
                const dynamicUpdates: Record<string, string> = {};
                dirtyDynamic.forEach(r => { dynamicUpdates[r.key] = r.target; });
                promises.push(
                    axiosInstance.post('/transactions/translations', dynamicUpdates, {
                        params: { lang: langCode }
                    })
                );
            }

            await Promise.all(promises);

            setRows((prev) => prev.map((r) => ({ ...r, isDirty: false })));
            setStatus({ type: "success", text: `${dirtyRows.length} strings saved successfully!` });
            setTimeout(() => setStatus(null), 4000);
        } catch {
            setStatus({ type: "error", text: "Failed to save. Please try again." });
        } finally {
            setSaving(false);
        }
    };

    const handleAddNewKey = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKey.trim() || !newValue.trim()) return;

        const key = newKey.trim();
        // Check if key already exists in rows to avoid duplicates
        const existingRow = rows.find(r => r.key === key);
        if (existingRow) {
            alert(`Key "${key}" already exists. Please edit it instead.`);
            return;
        }

        const newRow: TranslationRow = {
            key,
            en: "", // Added dynamically, English is likely empty
            target: newValue.trim(),
            source: "dynamic",
            isDirty: true
        };

        setRows([newRow, ...rows]);
        setIsAddOpen(false);
        setNewKey("");
        setNewValue("");
        setStatus({ type: "success", text: `Added key: ${key}. Remember to save changes.` });
        setTimeout(() => setStatus(null), 4000);
    };

    const filteredRows = rows.filter((r) => {
        const matchesSearch =
            !search ||
            r.key.toLowerCase().includes(search.toLowerCase()) ||
            r.en.toLowerCase().includes(search.toLowerCase()) ||
            r.target.toLowerCase().includes(search.toLowerCase());

        if (!matchesSearch) return false;

        if (sourceFilter !== "all" && r.source !== sourceFilter) return false;

        if (filter === "translated") return r.target.trim() !== "";
        if (filter === "untranslated") return r.target.trim() === "";
        return true;
    });

    const dirtyCount = rows.filter((r) => r.isDirty).length;
    const translatedCount = rows.filter((r) => r.target.trim() !== "").length;
    const progress = rows.length > 0 ? Math.round((translatedCount / rows.length) * 100) : 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-slate-500 flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    Loading {langMeta.name} translations...
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-4 pt-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-xl text-primary">
                            <Languages size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">
                                Translate into {langMeta.name}
                                <span className="ml-2 text-sm font-normal text-slate-500">({langMeta.nativeName})</span>
                            </h1>
                            <div className="flex items-center gap-3 mt-1">
                                <ProgressBar value={progress} />
                                <span className={`text-xs font-bold whitespace-nowrap ${progress >= 80 ? "text-emerald-600" : progress >= 50 ? "text-amber-600" : "text-red-600"}`}>
                                    {progress}% ({translatedCount}/{rows.length})
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                        >
                            <ArrowLeft size={16} />
                            Back
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving || dirtyCount === 0}
                            className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Save size={16} />
                            {saving ? "Saving..." : dirtyCount > 0 ? `Save Changes (${dirtyCount})` : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>

            <nav className="flex items-center gap-1.5 text-sm text-slate-500">
                <Home size={14} />
                <span>Home</span>
                <ChevronRight size={14} />
                <button onClick={onBack} className="hover:text-primary transition-colors">Translations</button>
                <ChevronRight size={14} />
                <span className="text-slate-900 font-medium">{langMeta.name}</span>
                <ChevronRight size={14} />
                <span className="text-slate-500">Progress: {progress}%</span>
            </nav>

            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-amber-800">
                    <FileText size={16} />
                    <span className="font-medium">Managing both Static & Dynamic strings</span>
                </div>
                <div className="flex gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-white/60 px-2 py-1 rounded border border-amber-200/50">
                        <FileJson size={14} className="text-amber-600" />
                        messages/{langCode}.json
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-white/60 px-2 py-1 rounded border border-amber-200/50">
                        <Database size={14} className="text-amber-600" />
                        Database
                    </span>
                </div>
            </div>

            {status && (
                <div className={`p-4 rounded-lg flex items-center gap-2 ${status.type === "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
                    {status.type === "error" ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                    <span className="font-medium">{status.text}</span>
                </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                <div className="flex flex-col xl:flex-row gap-3 items-start xl:items-center justify-between">
                    <div className="flex flex-col lg:flex-row gap-3 w-full xl:w-auto">
                        <div className="relative w-full lg:w-80">
                            <input
                                type="text"
                                placeholder="Search keys or text..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                            />
                        </div>

                        <div className="flex gap-2 shrink-0">
                            <button
                                onClick={() => setIsAddOpen(true)}
                                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
                            >
                                <Plus size={16} />
                                Add Key
                            </button>
                        </div>

                        <div className="flex gap-3">
                            <div className="flex items-center bg-slate-100 p-1 rounded-lg text-sm">
                                {(["all", "untranslated", "translated"] as FilterType[]).map((f) => {
                                    const label =
                                        f === "all"
                                            ? `All (${rows.length})`
                                            : f === "untranslated"
                                                ? `Untranslated (${rows.length - translatedCount})`
                                                : `Translated (${translatedCount})`;
                                    return (
                                        <button
                                            key={f}
                                            onClick={() => setFilter(f)}
                                            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${filter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                                        >
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex items-center bg-slate-100 p-1 rounded-lg text-sm">
                                <button
                                    onClick={() => setSourceFilter("all")}
                                    className={`px-3 py-1.5 rounded-md font-medium transition-colors ${sourceFilter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                                >
                                    All Sources
                                </button>
                                <button
                                    onClick={() => setSourceFilter("static")}
                                    className={`px-3 py-1.5 rounded-md font-medium transition-colors ${sourceFilter === "static" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                                >
                                    Static
                                </button>
                                <button
                                    onClick={() => setSourceFilter("dynamic")}
                                    className={`px-3 py-1.5 rounded-md font-medium transition-colors ${sourceFilter === "dynamic" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                                >
                                    Dynamic
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="text-xs text-slate-400">
                        Showing {filteredRows.length} of {rows.length} strings
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-10">
                <div className="grid grid-cols-[1fr_1fr_auto] md:grid-cols-[1.2fr_1.5fr_1fr_auto] gap-0 border-b border-slate-200 bg-slate-50">
                    <div className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-r border-slate-200">
                        Original (English)
                    </div>
                    <div className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-r border-slate-200">
                        {langMeta.name}
                    </div>
                    <div className="hidden md:block px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-r border-slate-200">
                        Key & Source
                    </div>
                    <div className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
                        Status
                    </div>
                </div>

                <div className="divide-y divide-slate-100">
                    {filteredRows.length === 0 ? (
                        <div className="px-6 py-16 text-center">
                            <Globe className="mx-auto text-slate-300 mb-3" size={40} />
                            <p className="text-slate-500 font-medium">No strings found</p>
                            <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filter</p>
                        </div>
                    ) : (
                        filteredRows.map((row) => {
                            const isTranslated = row.target.trim() !== "";
                            return (
                                <div
                                    key={row.key}
                                    className={`grid grid-cols-[1fr_1fr_auto] md:grid-cols-[1.2fr_1.5fr_1fr_auto] gap-0 hover:bg-slate-50/50 transition-colors ${row.isDirty ? "bg-amber-50/40" : ""}`}
                                >
                                    <div className="px-4 py-4 border-r border-slate-100">
                                        <p className="text-slate-800 text-sm leading-relaxed font-medium">
                                            {row.en || <span className="text-slate-400 italic">Empty</span>}
                                        </p>
                                    </div>

                                    <div className="px-4 py-4 border-r border-slate-100">
                                        <textarea
                                            value={row.target}
                                            onChange={(e) => handleEdit(row.key, e.target.value)}
                                            rows={2}
                                            dir="auto"
                                            placeholder={`Translate to ${langMeta.name}...`}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-y text-sm transition-colors ${row.isDirty ? "border-amber-400 bg-amber-50/50" : "border-slate-300"}`}
                                        />
                                    </div>

                                    <div className="hidden md:block px-4 py-4 border-r border-slate-100">
                                        <div className="flex flex-col items-start gap-1">
                                            <code className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded block break-all">
                                                {row.key}
                                            </code>
                                            {row.source === "static" ? (
                                                <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                                    <FileJson size={10} /> Static
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                                    <Database size={10} /> Dynamic
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="px-4 py-4 flex items-start justify-center pt-5">
                                        {row.isDirty ? (
                                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-amber-200" title="Unsaved changes" />
                                        ) : isTranslated ? (
                                            <CheckCircle2 size={18} className="text-emerald-500" aria-label="Translated" />
                                        ) : (
                                            <span className="w-2.5 h-2.5 rounded-full bg-red-400" title="Untranslated" />
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Radix Dialog: Add New Key */}
            <Dialog.Root open={isAddOpen} onOpenChange={setIsAddOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40 transition-opacity" />
                    <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] border bg-white p-6 shadow-xl sm:rounded-xl">
                        <Dialog.Title className="text-lg font-bold text-slate-900 mb-1">
                            Add New Translation Key
                        </Dialog.Title>
                        <Dialog.Description className="text-sm text-slate-500 mb-5">
                            Manually register a missing dynamic translation key.
                        </Dialog.Description>

                        <form onSubmit={handleAddNewKey} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Translation Key <span className="text-red-500">*</span>
                                </label>
                                <input
                                    autoFocus
                                    required
                                    value={newKey}
                                    onChange={e => setNewKey(e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                    placeholder="e.g. organization.BSC.orgname"
                                />
                                <p className="text-xs text-slate-500 mt-1">Found in the application when translations are missing.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    {langMeta.name} Translation <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    required
                                    value={newValue}
                                    onChange={e => setNewValue(e.target.value)}
                                    rows={3}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
                                    placeholder={`Enter the translation in ${langMeta.name}...`}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAddOpen(false)}
                                    className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 shadow-sm"
                                >
                                    Add Translation
                                </button>
                            </div>
                        </form>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

        </div>
    );
}

function TranslationsController() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const lang = searchParams.get("lang");

    const selectLang = (code: string) => {
        router.push(`?lang=${code}`);
    };

    const goBack = () => {
        router.push("?");
    };

    if (lang && LANGUAGES[lang]) {
        return <TranslationEditorView langCode={lang} onBack={goBack} />;
    }

    return <LanguageSelectionView onSelect={selectLang} />;
}

export default function TranslationsPage() {
    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-6 w-full">
                    <Suspense fallback={
                        <div className="flex items-center justify-center h-64">
                            <div className="text-slate-500 flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                Loading...
                            </div>
                        </div>
                    }>
                        <TranslationsController />
                    </Suspense>
                </main>
            </div>
        </div>
    );
}
