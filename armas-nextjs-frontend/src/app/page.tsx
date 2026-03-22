"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
    Globe,
    ChevronDown,
    ArrowRight,
    FileSpreadsheet,
    ShieldCheck,
    FolderOpen,
    Users,
    BarChart2,
    Lock,
    CheckCircle2,
    Building2,
    ChevronRight,
    Target,
    Eye,
    Star,
} from "lucide-react";
import { getMessages, type Lang } from "@/lib/messages";
import { NoticeFeed } from "@/components/NoticeFeed";

const LANGS = [
    { code: "en" as Lang, label: "English", flag: "🇺🇸" },
    { code: "am" as Lang, label: "አማርኛ", flag: "🇪🇹" },
    { code: "om" as Lang, label: "Afaan Oromoo", flag: "🇪🇹" },
];

const PillarIcon = ({ type }: { type: string }) => {
    const cls = "w-6 h-6";
    switch (type) {
        case "report": return <FileSpreadsheet className={cls} />;
        case "audit": return <CheckCircle2 className={cls} />;
        case "docs": return <FolderOpen className={cls} />;
        case "access": return <Lock className={cls} />;
        case "analytics": return <BarChart2 className={cls} />;
        case "security": return <ShieldCheck className={cls} />;
        default: return <Users className={cls} />;
    }
};

const ValueIcon = ({ type }: { type: string }) => {
    const cls = "w-6 h-6";
    switch (type) {
        case "shield": return <ShieldCheck className={cls} />;
        case "users": return <Users className={cls} />;
        case "chart": return <BarChart2 className={cls} />;
        case "globe": return <Globe className={cls} />;
        case "check": return <CheckCircle2 className={cls} />;
        case "lock": return <Lock className={cls} />;
        default: return <Star className={cls} />;
    }
};

const PILLAR_COLORS = [
    "bg-blue-600/10 text-blue-400 border-blue-500/20",
    "bg-violet-600/10 text-violet-400 border-violet-500/20",
    "bg-emerald-600/10 text-emerald-400 border-emerald-500/20",
    "bg-amber-500/10 text-amber-400 border-amber-500/20",
    "bg-cyan-600/10 text-cyan-400 border-cyan-500/20",
    "bg-rose-600/10 text-rose-400 border-rose-500/20",
];

const VALUE_COLORS = [
    { bg: "bg-blue-50", border: "border-blue-100", icon: "text-blue-600", dot: "bg-blue-500" },
    { bg: "bg-emerald-50", border: "border-emerald-100", icon: "text-emerald-600", dot: "bg-emerald-500" },
    { bg: "bg-amber-50", border: "border-amber-100", icon: "text-amber-600", dot: "bg-amber-500" },
    { bg: "bg-violet-50", border: "border-violet-100", icon: "text-violet-600", dot: "bg-violet-500" },
    { bg: "bg-rose-50", border: "border-rose-100", icon: "text-rose-600", dot: "bg-rose-500" },
    { bg: "bg-cyan-50", border: "border-cyan-100", icon: "text-cyan-600", dot: "bg-cyan-500" },
];

const PUBLIC_STATS_CACHE_KEY = "armas_public_stats_cache";
const PUBLIC_STATS_CACHE_TTL_MS = 5 * 60 * 1000;

export default function HomePage() {
    const router = useRouter();
    const [lang, setLang] = useState<Lang>("en");
    const [mounted, setMounted] = useState(false);
    const [dynamicStats, setDynamicStats] = useState<{ [key: string]: string | number }>({
        organizations: "...",
        users: "..."
    });

    useEffect(() => {
        setMounted(true);
        const s = localStorage.getItem("armas_lang") as Lang | null;
        if (s && (s === "en" || s === "am" || s === "om")) setLang(s);

        try {
            const cached = sessionStorage.getItem(PUBLIC_STATS_CACHE_KEY);
            if (cached) {
                const parsed = JSON.parse(cached) as {
                    timestamp: number;
                    data: { [key: string]: string | number };
                };
                if ((Date.now() - parsed.timestamp) < PUBLIC_STATS_CACHE_TTL_MS) {
                    setDynamicStats(parsed.data);
                }
            }
        } catch {
            // Ignore cache parse issues and continue with a fresh fetch.
        }

        const fetchStats = () => {
            fetch(process.env.NEXT_PUBLIC_API_URL + "/transactions/public-stats")
                .then(res => res.json())
                .then(data => {
                    if (data.organizations !== undefined && data.users !== undefined) {
                        setDynamicStats(data);
                        try {
                            sessionStorage.setItem(PUBLIC_STATS_CACHE_KEY, JSON.stringify({
                                timestamp: Date.now(),
                                data,
                            }));
                        } catch {
                            // Ignore storage failures.
                        }
                    }
                })
                .catch(console.error);
        };

        fetchStats();

        if (typeof window !== "undefined" && "requestIdleCallback" in window) {
            const idleId = window.requestIdleCallback(() => router.prefetch("/login"), { timeout: 1000 });
            return () => window.cancelIdleCallback(idleId);
        }

        const timeoutId = globalThis.setTimeout(() => router.prefetch("/login"), 200);
        return () => globalThis.clearTimeout(timeoutId);
    }, [router]);

    const pick = (code: Lang) => {
        setLang(code);
        localStorage.setItem("armas_lang", code);
    };

    if (!mounted) return null;

    const t = getMessages(lang).home;
    const cur = LANGS.find(l => l.code === lang)!;

    return (
        <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans antialiased">

            {/* ── TOP GOV BAR ── */}
            <div className="hidden sm:flex items-center justify-between bg-[#003580] text-[#a8c4e8] text-[11px] font-medium tracking-wide px-6 py-2">
                <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{t.govLabel}</span>
                </div>
                <span>{t.sysLabel}</span>
            </div>

            {/* ── NAV ── */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#003580] to-[#0057c2] flex items-center justify-center shadow-md">
                            <BarChart2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-base font-black tracking-tight text-slate-900 leading-none">ARMAS</p>
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Finance Bureau</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <DropdownMenu.Root>
                            <DropdownMenu.Trigger className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors outline-none">
                                <Globe className="w-4 h-4" />
                                <span className="hidden sm:inline">{cur.label}</span>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Portal>
                                <DropdownMenu.Content align="end" sideOffset={6}
                                    className="bg-white border border-slate-200 rounded-xl shadow-xl p-1 min-w-[160px] animate-in fade-in zoom-in-95 z-50">
                                    {LANGS.map(l => (
                                        <DropdownMenu.Item key={l.code} onClick={() => pick(l.code)}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm cursor-pointer outline-none transition-colors ${lang === l.code ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-700 hover:bg-slate-50"}`}>
                                            <span>{l.flag}</span>
                                            {l.label}
                                        </DropdownMenu.Item>
                                    ))}
                                </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                        </DropdownMenu.Root>

                        <Link href="/login"
                            className="flex items-center gap-2 px-5 py-2 bg-[#003580] hover:bg-[#0057c2] text-white rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md active:scale-95">
                            {t.navLogin}
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1">

                {/* ── HERO ── */}
                <section className="relative bg-gradient-to-br from-[#002060] via-[#003580] to-[#0057c2] text-white overflow-hidden">
                    {/* Subtle grid pattern */}
                    <div className="absolute inset-0 opacity-[0.05] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] pointer-events-none" />
                    {/* Glow orbs */}
                    <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-blue-400/10 blur-[160px] rounded-full pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-400/10 blur-[120px] rounded-full pointer-events-none" />

                    <div className="relative mx-auto max-w-4xl px-5 sm:px-8 py-24 sm:py-36 flex flex-col items-center text-center">

                        <h1 className="text-5xl sm:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-white to-blue-200 font-extrabold leading-[1.1] tracking-tight whitespace-pre-line mb-8 drop-shadow-sm">
                            {t.heroHeadline}
                        </h1>

                        <p className="text-blue-100/90 text-lg sm:text-xl leading-relaxed max-w-3xl mb-12">
                            {t.heroBody}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Link href="/login"
                                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-[#003580] rounded-2xl font-bold text-base hover:bg-blue-50 transition-all shadow-xl shadow-black/20 active:scale-95 hover:-translate-y-1">
                                <ShieldCheck className="w-5 h-5 text-[#003580]" />
                                {t.heroCta}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                            </Link>
                            <p className="text-sm text-blue-300 font-medium flex items-center justify-center gap-2 bg-black/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/5">
                                <Lock className="w-4 h-4" />
                                {t.heroCtaSub}
                            </p>
                        </div>
                    </div>

                </section>

                {/* ── ABOUT THE BUREAU ── */}
                <section className="py-24 px-5 sm:px-8 bg-slate-50 border-b border-slate-200">
                    <div className="mx-auto max-w-7xl">
                        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
                            <p className="text-xs font-bold uppercase tracking-widest text-[#003580] mb-5 flex items-center justify-center gap-3">
                                <span className="h-px w-8 bg-[#003580] inline-block" />
                                {t.aboutLabel}
                                <span className="h-px w-8 bg-[#003580] inline-block" />
                            </p>
                            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-8">
                                {t.aboutTitle}
                            </h2>
                            <p className="text-slate-600 text-lg sm:text-xl leading-relaxed mb-0 max-w-3xl">
                                {t.aboutBody}
                            </p>
                        </div>
                    </div>
                </section>

                {/* ── VISION & MISSION ── */}
                <NoticeFeed />

                <section className="py-24 px-5 sm:px-8 bg-white">
                    <div className="mx-auto max-w-7xl">
                        <div className="text-center mb-16">
                            <p className="text-xs font-bold uppercase tracking-widest text-[#003580] mb-3">Strategic Direction</p>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Our Purpose</h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Vision */}
                            <div className="relative rounded-3xl overflow-hidden group">
                                <div className="bg-gradient-to-br from-[#003580] to-[#0057c2] p-10 h-full text-white hover:shadow-2xl transition-shadow duration-300">
                                    <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <Eye className="w-7 h-7 text-white" />
                                    </div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-2">{t.visionLabel}</p>
                                    <h3 className="text-2xl font-extrabold mb-4">{t.visionTitle}</h3>
                                    <p className="text-blue-100 leading-relaxed text-base">{t.visionBody}</p>
                                </div>
                            </div>

                            {/* Mission */}
                            <div className="relative rounded-3xl overflow-hidden group">
                                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-10 h-full text-white hover:shadow-2xl transition-shadow duration-300">
                                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <Target className="w-7 h-7 text-white" />
                                    </div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">{t.missionLabel}</p>
                                    <h3 className="text-2xl font-extrabold mb-4">{t.missionTitle}</h3>
                                    <p className="text-slate-300 leading-relaxed text-base">{t.missionBody}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── VALUES ── */}
                <section className="py-24 px-5 sm:px-8 bg-slate-50">
                    <div className="mx-auto max-w-7xl">
                        <div className="text-center mb-16">
                            <p className="text-xs font-bold uppercase tracking-widest text-[#003580] mb-3">{t.valuesLabel}</p>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">{t.valuesTitle}</h2>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {t.values.map((v: any, i: number) => {
                                const c = VALUE_COLORS[i];
                                return (
                                    <div key={i} className={`${c.bg} rounded-2xl p-7 border ${c.border} hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group`}>
                                        <div className={`w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-5 shadow-sm ${c.icon} group-hover:scale-110 transition-transform duration-300`}>
                                            <ValueIcon type={v.icon} />
                                        </div>
                                        <div className={`flex items-center gap-2 mb-3`}>
                                            <div className={`w-2 h-2 rounded-full ${c.dot}`} />
                                            <h3 className="text-base font-bold text-slate-900">{v.title}</h3>
                                        </div>
                                        <p className="text-sm text-slate-600 leading-relaxed">{v.body}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ── PILLARS ── */}
                <section className="py-24 px-5 sm:px-8 bg-[#002060] relative overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.04] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] pointer-events-none" />
                    <div className="mx-auto max-w-7xl relative">
                        <div className="text-center mb-14">
                            <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3">{t.capLabel}</p>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{t.trustTitle}</h2>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {t.pillars.map((p: any, i: number) => (
                                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-7 hover:bg-white/8 hover:border-white/20 hover:-translate-y-1 transition-all duration-300 group">
                                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-5 ${PILLAR_COLORS[i]} group-hover:scale-110 transition-transform duration-300`}>
                                        <PillarIcon type={p.icon} />
                                    </div>
                                    <h3 className="text-base font-bold text-white mb-2">{p.title}</h3>
                                    <p className="text-sm text-slate-400 leading-relaxed">{p.body}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── CTA BAND ── */}
                <section className="bg-gradient-to-r from-[#003580] to-[#0057c2] py-20 px-5 sm:px-8 relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full translate-x-48 -translate-y-48 pointer-events-none" />
                    <div className="mx-auto max-w-3xl text-center relative">
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">{t.ctaBannerHeadline}</h2>
                        <p className="text-blue-200 mb-10 text-lg">{t.ctaBannerBody}</p>
                        <Link href="/login"
                            className="inline-flex items-center gap-3 px-10 py-4 bg-white text-[#003580] font-bold rounded-xl text-sm hover:bg-blue-50 transition-all shadow-2xl active:scale-95 hover:shadow-blue-900/30">
                            <ShieldCheck className="w-5 h-5" />
                            {t.ctaBannerBtn}
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </section>
            </main>

            {/* ── FOOTER ── */}
            <footer className="bg-[#001845] text-slate-400 text-xs py-8 px-5 sm:px-8">
                <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-md bg-[#003580] flex items-center justify-center">
                            <BarChart2 className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-white">ARMAS</span>
                    </div>
                    <p className="text-center text-slate-500">{t.footer}</p>
                </div>
            </footer>

        </div>
    );
}
