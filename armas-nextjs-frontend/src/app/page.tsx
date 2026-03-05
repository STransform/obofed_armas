"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
} from "lucide-react";

type Lang = "en" | "am" | "om";

const LANGS = [
    { code: "en" as Lang, label: "English", flag: "🇺🇸" },
    { code: "am" as Lang, label: "አማርኛ", flag: "🇪🇹" },
    { code: "om" as Lang, label: "Afaan Oromoo", flag: "🇪🇹" },
];

const T = {
    en: {
        govLabel: "Federal Democratic Republic of Ethiopia",
        sysLabel: "Ministry of Finance — ARMAS Portal",
        navLogin: "Staff Login",
        heroEyebrow: "Integrated Government Platform",
        heroHeadline: "One Portal for All\nInstitutional Operations",
        heroBody:
            "ARMAS streamlines reporting, audit oversight, document management, and access control into a single authorised ecosystem — enabling faster decisions and full accountability across all directorates.",
        heroCta: "Access Secure Portal",
        heroCtaSub: "Authorised personnel only",
        trustTitle: "Why institutions rely on ARMAS",
        pillars: [
            {
                icon: "report",
                title: "Centralised Reporting",
                body: "Submit, review, and approve institutional reports from all departments through a single, auditable pipeline.",
            },
            {
                icon: "audit",
                title: "Full Audit Trails",
                body: "Every action is timestamped and logged in an immutable record, ensuring complete accountability.",
            },
            {
                icon: "docs",
                title: "Task Management System",
                body: "Secure archiving, versioning, and dispatch of critical institutional documents and correspondence.",
            },
            {
                icon: "access",
                title: "Role-Based Access",
                body: "Fine-grained permissions ensure each user sees and does exactly what their role requires — nothing more.",
            },
            {
                icon: "analytics",
                title: "Real-Time Analytics",
                body: "Executive dashboards surface the metrics that matter, updated in real time across all reporting units.",
            },
            {
                icon: "security",
                title: "Enterprise Security",
                body: "AES-256 encryption, multi-factor authentication, and ISO 27001-aligned controls protect every record.",
            },
        ],
        statsLabel: "Platform at a glance",
        stats: [
            { value: "99.9%", label: "Uptime SLA" },
            { value: "AES-256", label: "Encryption" },
            { value: "ISO 27001", label: "Compliance" },
            { value: "Tier IV", label: "Data Centre" },
        ],
        capLabel: "Platform Capabilities",
        portalTitle: "ARMAS Services",
        portalOnline: "● Online",
        portalServices: ["Reporting Engine", "Audit & Compliance", "Document Management", "Access Control"],
        portalNote: "Login required to access all modules",
        ctaBannerHeadline: "Ready to get started?",
        ctaBannerBody: "Access the ARMAS portal with your institutional credentials.",
        ctaBannerBtn: "Sign In to Portal",
        footer: "© 2026 ARMAS — Federal Democratic Republic of Ethiopia. All rights reserved.",
    },
    am: {
        govLabel: "የኢትዮጵያ ፌዴራላዊ ዲሞክራሲያዊ ሪፐብሊክ",
        sysLabel: "የፋይናንስ ሚኒስቴር — ARMAS ፖርታል",
        navLogin: "ለሠራተኞች ግባ",
        heroEyebrow: "የተዋሃደ የመንግሥት መድረክ",
        heroHeadline: "ሁሉም የተቋም ሥራዎች\nበአንድ ፖርታል",
        heroBody:
            "ARMAS ሪፖርቶችን፣ ኦዲትን፣ ሰነዶችን እና የፍቃድ ቁጥጥርን በአንድ ሥርዓት ውስጥ ያዋህዳል — ተጠያቂነትን ያረጋግጣል።",
        heroCta: "ወደ ፖርታሉ ይግቡ",
        heroCtaSub: "ለፈቃድ ያላቸው ሠራተኞች ብቻ",
        trustTitle: "ለምን ተቋማት ARMAS ያምናሉ",
        pillars: [
            { icon: "report", title: "ማዕከላዊ ሪፖርቲንግ", body: "ሁሉም ሪፖርቶች በአንድ ሥርዓት ውስጥ ይቀርባሉ፣ ይከለካላሉ፣ ይጸድቃሉ።" },
            { icon: "audit", title: "ሙሉ የኦዲት ምዝገባ", body: "እያንዳንዱ ድርጊት ሊለወጥ በማይችል ምዝገባ ይቀዳል።" },
            { icon: "docs", title: "የሰነድ አስተዳደር", body: "ሰነዶችን ደህና ማስቀመጥ፣ ስሪቶችን መቆጣጠር እና ማሰራጨት።" },
            { icon: "access", title: "በሚና ላይ ፍቃድ", body: "ዝርዝር የሚና ፍቃድ — ሠራተኛው የሚፈልገውን ብቻ ያገኛል።" },
            { icon: "analytics", title: "ምስላዊ ትንታኔ", body: "የስራ አስፈጻሚ ዳሽቦርዶች ዋና ዋና ቁጥሮችን ወቅታዊ ያሳያሉ።" },
            { icon: "security", title: "ከፍተኛ ደህንነት", body: "AES-256 ምስጠራ እና ISO 27001 ተኳሃኝ ቁጥጥሮች።" },
        ],
        statsLabel: "ፕሌትፎርሙ በአጭሩ",
        stats: [
            { value: "99.9%", label: "የሥራ ሰዓት" },
            { value: "AES-256", label: "ምስጠራ" },
            { value: "ISO 27001", label: "ተኳሃኝነት" },
            { value: "Tier IV", label: "ዳታ ማዕከል" },
        ],
        capLabel: "የፕሌትፎርም አቅሞች",
        portalTitle: "ARMAS አገልግሎቶች",
        portalOnline: "● በሥራ ላይ",
        portalServices: ["የሪፖርት ሞተር", "ኦዲት እና ተኳሃኝነት", "የሰነድ አስተዳደር", "የፍቃድ ቁጥጥር"],
        portalNote: "ሁሉንም ሞጁሎች ለመጠቀም ግቡ",
        ctaBannerHeadline: "ለመጀመር ዝግጁ ነዎት?",
        ctaBannerBody: "በተቋም ምስክርነቶ ARMAS ፖርታልን ይጠቀሙ።",
        ctaBannerBtn: "ወደ ፖርታሉ ይግቡ",
        footer: "© 2026 ARMAS — የኢትዮጵያ ፌዴራላዊ ዲሞክራሲያዊ ሪፐብሊክ። ሁሉም መብቶች ተጠብቀዋል።",
    },
    om: {
        govLabel: "Rippaabiliika Dimookiraatawaa Federaalaa Itoophiyaa",
        sysLabel: "Ministeera Maallaqaa — Marsariitii ARMAS",
        navLogin: "Hojjettootaaf Seeni",
        heroEyebrow: "Marsariitii Mootummaa Tokkummaa",
        heroHeadline: "Hojii Dhaabbataa Hunda\nMarsariitii Tokko Keessatti",
        heroBody:
            "ARMAS gabaasaa, odiitii, sanadoota, fi to'annoo hayyamaa giddugala tokko keessatti walitti fidee qindeessa — itti gaafatamummaa mirkaneessa.",
        heroCta: "Marsariitii Nageenyi Qabu Seeni",
        heroCtaSub: "Hojjettoota hayyamaman qofaaf",
        trustTitle: "Maaliif dhaabbatoonni ARMAS amanuu?",
        pillars: [
            { icon: "report", title: "Gabaasaa Giddugalaa", body: "Gabaasoonni hundi sirna to'annaa tokko keessa dhihaatu, ilaalamu, fi mirkanaa'u." },
            { icon: "audit", title: "Galmee Odiitii Guutuu", body: "Hojiin hundi yeroo isaa fi ragaa waliin galmaa'a — jijjiiramuu hin danda'u." },
            { icon: "docs", title: "Bulchiinsa Sanadootaa", body: "Sanadoota kuusuu, jijjiiramuu to'achuu fi raabsuuf nageenyi ni kennamaaf." },
            { icon: "access", title: "Hayyama Gahee Irratti", body: "Hayyamni addaa — hojjettaan gahee isaa barbaachisu qofa argata." },
            { icon: "analytics", title: "Xiinxala Yeroo Dhugaa", body: "Daashboordiin raawwataa lakkoofsoota murteessoo, haaromfamu agarsiisa." },
            { icon: "security", title: "Nageenyaa Sadarkaa Ol'aanaa", body: "Icciitii AES-256 fi too'annoo ISO 27001 wajjin walsimu." },
        ],
        statsLabel: "Marsariitiin akka gabaabsetti",
        stats: [
            { value: "99.9%", label: "Yeroo Hojii" },
            { value: "AES-256", label: "Icciitii" },
            { value: "ISO 27001", label: "Hordoffii" },
            { value: "Tier IV", label: "Giddugala Ragaa" },
        ],
        capLabel: "Dandeettiwwan Marsariitii",
        portalTitle: "Tajaajiloota ARMAS",
        portalOnline: "● Hojii Irratti",
        portalServices: ["Sirna Gabaasaa", "Odiitii fi Hordoffii", "Bulchiinsa Sanadootaa", "To'annoo Hayyamaa"],
        portalNote: "Moduuloota hundaa argachuuf seeni",
        ctaBannerHeadline: "Jalqabuu qophii dha?",
        ctaBannerBody: "Eenyummeessaa dhaabbataa keessan fayyadamuun seenaa.",
        ctaBannerBtn: "Marsariitii Seeni",
        footer: "© 2026 ARMAS — Rippaabiliika Dimookiraatawaa Federaalaa Itoophiyaa. Mirgi hunduu eegamaadha.",
    },
};

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

const PILLAR_COLORS = [
    "bg-blue-600/10 text-blue-400 border-blue-500/20",
    "bg-violet-600/10 text-violet-400 border-violet-500/20",
    "bg-emerald-600/10 text-emerald-400 border-emerald-500/20",
    "bg-amber-500/10 text-amber-400 border-amber-500/20",
    "bg-cyan-600/10 text-cyan-400 border-cyan-500/20",
    "bg-rose-600/10 text-rose-400 border-rose-500/20",
];

export default function HomePage() {
    const [lang, setLang] = useState<Lang>("en");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const s = localStorage.getItem("armas_lang") as Lang | null;
        if (s && s in T) setLang(s);
    }, []);

    const pick = (code: Lang) => {
        setLang(code);
        localStorage.setItem("armas_lang", code);
    };

    if (!mounted) return null;
    const t = T[lang];
    const cur = LANGS.find(l => l.code === lang)!;

    return (
        <div className="min-h-screen flex flex-col bg-[#f5f6f8] text-slate-900 font-sans antialiased">

            {/* ── TOP GOV BAR ── */}
            <div className="hidden sm:flex items-center justify-between bg-[#1a2744] text-[#8fa8d0] text-[11px] font-medium tracking-wide px-6 py-2">
                <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{t.govLabel}</span>
                </div>
                <span>{t.sysLabel}</span>
            </div>

            {/* ── NAV ── */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-8 h-16 flex items-center justify-between">
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#1a3fa8] flex items-center justify-center">
                            <BarChart2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-base font-black tracking-tight text-slate-900 leading-none">ARMAS</p>
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Gov Portal</p>
                        </div>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Language */}
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

                        {/* Login */}
                        <Link href="/login"
                            className="flex items-center gap-2 px-4 py-2 bg-[#1a3fa8] hover:bg-[#1535c7] text-white rounded-lg text-sm font-semibold transition-colors shadow-sm">
                            {t.navLogin}
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1">

                {/* ── HERO ── */}
                <section className="relative bg-[#1a2744] text-white overflow-hidden">
                    {/* Subtle pattern */}
                    <div className="absolute inset-0 opacity-[0.04] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] pointer-events-none" />
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 blur-[140px] rounded-full pointer-events-none" />

                    <div className="relative mx-auto max-w-7xl px-5 sm:px-8 py-24 sm:py-32 grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left */}
                        <div>
                            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-300 mb-6">
                                <span className="h-px w-8 bg-blue-400" />
                                {t.heroEyebrow}
                            </p>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-white whitespace-pre-line mb-6">
                                {t.heroHeadline}
                            </h1>

                            <p className="text-slate-300 text-lg leading-relaxed max-w-lg mb-10">
                                {t.heroBody}
                            </p>

                            <div className="flex flex-col sm:flex-row items-start gap-4">
                                <Link href="/login"
                                    className="group inline-flex items-center gap-3 px-7 py-3.5 bg-white text-[#1a2744] rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors shadow-lg shadow-black/20 active:scale-95">
                                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                                    {t.heroCta}
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <p className="text-xs text-slate-400 font-medium self-center sm:self-auto mt-2 sm:mt-0 flex items-center gap-1.5">
                                    <Lock className="w-3.5 h-3.5" />
                                    {t.heroCtaSub}
                                </p>
                            </div>
                        </div>

                        {/* Right — portal preview card */}
                        <div className="hidden lg:block">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                                <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/10">
                                    <p className="font-semibold text-sm text-white">{t.portalTitle}</p>
                                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">{t.portalOnline}</span>
                                </div>
                                <div className="space-y-3">
                                    {t.portalServices.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${["bg-blue-600/20", "bg-violet-600/20", "bg-emerald-600/20", "bg-amber-500/20"][i]}`}>
                                                    <PillarIcon type={["report", "audit", "docs", "access"][i]} />
                                                </div>
                                                <span className="text-sm font-medium text-slate-200">{item}</span>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-slate-500" />
                                        </div>
                                    ))}
                                </div>
                                <p className="mt-5 text-center text-xs text-slate-500">{t.portalNote}</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats strip */}
                    <div className="relative border-t border-white/10 bg-[#152035]/60">
                        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-5 grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-white/10">
                            {t.stats.map((s, i) => (
                                <div key={i} className="flex flex-col items-center py-2 px-4">
                                    <span className="text-xl font-black text-white">{s.value}</span>
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── PILLARS ── */}
                <section className="py-24 px-5 sm:px-8 bg-[#f5f6f8]">
                    <div className="mx-auto max-w-7xl">
                        <div className="text-center mb-14">
                            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">{t.capLabel}</p>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">{t.trustTitle}</h2>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {t.pillars.map((p, i) => (
                                <div key={i} className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group">
                                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-5 ${PILLAR_COLORS[i]} group-hover:scale-110 transition-transform`}>
                                        <PillarIcon type={p.icon} />
                                    </div>
                                    <h3 className="text-base font-bold text-slate-900 mb-2">{p.title}</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">{p.body}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── CTA BAND ── */}
                <section className="bg-[#1a3fa8] py-16 px-5 sm:px-8">
                    <div className="mx-auto max-w-3xl text-center">
                        <h2 className="text-3xl font-extrabold text-white mb-3">{t.ctaBannerHeadline}</h2>
                        <p className="text-blue-200 mb-8 text-lg">{t.ctaBannerBody}</p>
                        <Link href="/login"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#1a3fa8] font-bold rounded-xl text-sm hover:bg-blue-50 transition-colors shadow-lg active:scale-95">
                            {t.ctaBannerBtn}
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </section>
            </main>

            {/* ── FOOTER ── */}
            <footer className="bg-[#1a2744] text-slate-400 text-xs py-8 px-5 sm:px-8">
                <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-md bg-[#1a3fa8] flex items-center justify-center">
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
