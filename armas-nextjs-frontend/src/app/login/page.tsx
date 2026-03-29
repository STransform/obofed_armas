'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import axiosInstance from '@/lib/axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getMessages, type Lang } from '@/lib/messages';
import { preloadTranslations } from '@/hooks/useTranslation';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
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

    useEffect(() => {
        router.prefetch('/dashboard');
        preloadTranslations(lang);
        preloadTranslations('en');
    }, [lang, router]);

    const t = getMessages(lang).login;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await axiosInstance.post(
                '/login',
                { username, password },
                { skipAuthRedirect: true }
            );

            const token = response.data.token;
            if (!token) {
                throw new Error('Login response did not include an access token.');
            }

            const role = response.data.roles && response.data.roles.length > 0
                ? response.data.roles[0] : 'USER';

            if (role === 'ADMIN') {
                [
                    '/dashboard',
                    '/buttons/organizations',
                    '/buttons/directorates',
                    '/buttons/documents',
                    '/buttons/budgetyear',
                    '/buttons/users',
                    '/buttons/roles',
                    '/buttons/assign',
                    '/buttons/assign-privileges',
                    '/buttons/translations',
                    '/transactions/advanced-filters',
                ].forEach((href) => router.prefetch(href));
            }

            login(token, role);
            router.replace('/dashboard');
        } catch (err: any) {
            console.error('Login error:', err.response?.data || err.message);
            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                'Login failed. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                * { box-sizing: border-box; margin: 0; padding: 0; }

                /* ══ ROOT ══ */
                .login-root {
                    min-height: 100vh;
                    display: flex;
                    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    overflow: hidden;
                    position: relative;
                    background:
                        radial-gradient(circle at 12% 18%, rgba(52, 211, 153, 0.22) 0%, transparent 26%),
                        radial-gradient(circle at 88% 14%, rgba(251, 191, 36, 0.14) 0%, transparent 22%),
                        linear-gradient(135deg, #042f2e 0%, #064e3b 38%, #0f766e 100%);
                }

                .login-root::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    opacity: 0.12;
                    background-image:
                        linear-gradient(rgba(255,255,255,0.22) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.14) 1px, transparent 1px);
                    background-size: 96px 96px;
                }

                .login-root::after {
                    content: '';
                    position: absolute;
                    inset: auto auto -120px -90px;
                    width: 320px;
                    height: 320px;
                    border-radius: 999px;
                    background: rgba(255, 255, 255, 0.06);
                    filter: blur(18px);
                    pointer-events: none;
                }

                /* ═════════════════════════════════
                   LEFT PANEL  — overlaid on left edge
                ═════════════════════════════════ */
                .login-left {
                    position: absolute;
                    left: 0; top: 0; bottom: 0;
                    width: 360px;
                    z-index: 5;
                    background:
                        linear-gradient(180deg, rgba(2, 44, 34, 0.96) 0%, rgba(4, 78, 59, 0.92) 55%, rgba(6, 95, 70, 0.88) 100%);
                    border-right: 1px solid rgba(255, 255, 255, 0.08);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 36px 28px;
                    overflow: hidden;
                }

                /* Stars on left */
                .left-stars {
                    position: absolute; inset: 0;
                    pointer-events: none;
                    background-image:
                        radial-gradient(1px 1px at 8% 12%, rgba(255,255,255,0.55) 0%, transparent 100%),
                        radial-gradient(1px 1px at 22% 38%, rgba(255,255,255,0.4)  0%, transparent 100%),
                        radial-gradient(1.5px 1.5px at 38% 6%, rgba(255,255,255,0.65) 0%, transparent 100%),
                        radial-gradient(1px 1px at 52% 55%, rgba(255,255,255,0.3)  0%, transparent 100%),
                        radial-gradient(1px 1px at 72% 22%, rgba(255,255,255,0.5)  0%, transparent 100%),
                        radial-gradient(1px 1px at 88% 48%, rgba(255,255,255,0.4)  0%, transparent 100%),
                        radial-gradient(1px 1px at 14% 72%, rgba(255,255,255,0.3)  0%, transparent 100%),
                        radial-gradient(2px 2px at 92% 8%,  rgba(255,255,255,0.65) 0%, transparent 100%),
                        radial-gradient(1px 1px at 60% 88%, rgba(255,255,255,0.4)  0%, transparent 100%),
                        radial-gradient(1px 1px at 30% 93%, rgba(255,255,255,0.45) 0%, transparent 100%),
                        radial-gradient(1px 1px at 78% 78%, rgba(255,255,255,0.3)  0%, transparent 100%),
                        radial-gradient(2px 2px at 18% 58%, rgba(160,200,255,0.5)  0%, transparent 100%);
                }

                /* Gold aura behind logo */
                .left-aura {
                    position: absolute;
                    width: 320px; height: 320px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(251,191,36,0.14) 0%, rgba(16,185,129,0.08) 42%, transparent 72%);
                    top: 50%; left: 50%;
                    transform: translate(-50%, -55%);
                    pointer-events: none;
                }

                /* Grid lines */
                .left-grid {
                    position: absolute; inset: 0;
                    pointer-events: none;
                    opacity: 0.03;
                    background-image:
                        repeating-linear-gradient(0deg,   transparent, transparent 50px, rgba(255,255,255,1) 50px, rgba(255,255,255,1) 51px),
                        repeating-linear-gradient(90deg,  transparent, transparent 50px, rgba(255,255,255,1) 50px, rgba(255,255,255,1) 51px);
                }

                /* ─ Logo image ─ */
                .bureau-logo-img {
                    width: 180px;
                    height: 180px;
                    object-fit: contain;
                    border-radius: 50%;
                    box-shadow:
                        0 0 0 3px rgba(196,152,40,0.35),
                        0 0 30px 10px rgba(196,152,40,0.18),
                        0 0 60px 20px rgba(196,152,40,0.08);
                    animation: logo-pulse 4s ease-in-out infinite;
                    flex-shrink: 0;
                }

                @keyframes logo-pulse {
                    0%, 100% { box-shadow: 0 0 0 3px rgba(196,152,40,0.35), 0 0 30px 10px rgba(196,152,40,0.18), 0 0 60px 20px rgba(196,152,40,0.08); }
                    50%       { box-shadow: 0 0 0 4px rgba(196,152,40,0.55), 0 0 40px 16px rgba(196,152,40,0.3),  0 0 80px 30px rgba(196,152,40,0.12); }
                }

                .bureau-text-block {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    text-align: center;
                    margin-top: 22px;
                }

                .bureau-line-small {
                    font-size: 11px;
                    font-weight: 500;
                    color: rgba(209, 250, 229, 0.72);
                    letter-spacing: 1.5px;
                }
                .bureau-line-amh {
                    font-family: inherit;
                    font-size: 17px;
                    font-weight: 700;
                    color: #fde68a;
                    letter-spacing: 0.5px;
                    margin-top: 2px;
                }
                .gold-bar {
                    width: 52px; height: 2px;
                    background: linear-gradient(90deg, transparent, #fbbf24, transparent);
                    border-radius: 1px;
                    margin: 8px auto;
                }
                .bureau-line-en-sm {
                    font-size: 10px;
                    font-weight: 600;
                    color: rgba(220, 252, 231, 0.6);
                    letter-spacing: 2.5px;
                    text-transform: uppercase;
                }
                .bureau-line-en-lg {
                    font-family: inherit;
                    font-size: 15px;
                    font-weight: 800;
                    color: #ffffff;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    margin-top: 1px;
                }

                /* ARMAS badge at bottom */
                .left-bottom {
                    position: absolute;
                    bottom: 18px; left: 0; right: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                }
                .armas-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: rgba(255,255,255,0.08);
                    border: 1px solid rgba(251,191,36,0.28);
                    border-radius: 20px;
                    padding: 4px 14px;
                }
                .armas-badge span {
                    font-size: 13px;
                    font-weight: 800;
                    color: #fde68a;
                    letter-spacing: 3px;
                }
                .armas-badge-sub {
                    font-size: 10px;
                    color: rgba(220, 252, 231, 0.42);
                    letter-spacing: 0.5px;
                }

                /* ═════════════════════════════════
                   RIGHT PANEL — full width, card centered
                ═════════════════════════════════ */
                .login-right {
                    width: 100%;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                }

                /* Stars (right) */
                .stars {
                    position: absolute; inset: 0;
                    pointer-events: none;
                    background-image:
                        radial-gradient(1px 1px at 10% 15%, rgba(255,255,255,0.62) 0%, transparent 100%),
                        radial-gradient(1px 1px at 25% 35%, rgba(255,255,255,0.42) 0%, transparent 100%),
                        radial-gradient(1.5px 1.5px at 40% 5%, rgba(255,255,255,0.72) 0%, transparent 100%),
                        radial-gradient(1px 1px at 55% 60%, rgba(255,255,255,0.34) 0%, transparent 100%),
                        radial-gradient(1.5px 1.5px at 70% 20%, rgba(251,191,36,0.42) 0%, transparent 100%),
                        radial-gradient(1px 1px at 85% 45%, rgba(255,255,255,0.46) 0%, transparent 100%),
                        radial-gradient(1px 1px at 13% 70%, rgba(255,255,255,0.34) 0%, transparent 100%),
                        radial-gradient(2px 2px at 92% 10%, rgba(255,255,255,0.76) 0%, transparent 100%),
                        radial-gradient(1px 1px at 60% 85%, rgba(255,255,255,0.42) 0%, transparent 100%),
                        radial-gradient(1px 1px at 32% 90%, rgba(220,252,231,0.44) 0%, transparent 100%),
                        radial-gradient(1.5px 1.5px at 78% 75%, rgba(255,255,255,0.28) 0%, transparent 100%),
                        radial-gradient(1px 1px at 48% 48%, rgba(255,255,255,0.24) 0%, transparent 100%),
                        radial-gradient(1px 1px at 5% 50%,  rgba(255,255,255,0.4) 0%, transparent 100%),
                        radial-gradient(2px 2px at 20% 55%, rgba(52,211,153,0.45) 0%, transparent 100%),
                        radial-gradient(1px 1px at 95% 65%, rgba(255,255,255,0.3) 0%, transparent 100%),
                        radial-gradient(1px 1px at 66% 38%, rgba(255,255,255,0.24) 0%, transparent 100%);
                    opacity: 0.9;
                }

                /* ── GLOBE  (original position/size) ── */
                .globe-scene {
                    position: absolute;
                    right: 6%;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 420px;
                    height: 420px;
                }
                .globe {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    background: radial-gradient(circle at 35% 35%,
                        #34d399 0%, #0f766e 32%, #065f46 62%, #022c22 100%);
                    box-shadow:
                        0 0 0 1px rgba(167,243,208,0.18),
                        0 0 40px 6px rgba(16,185,129,0.22),
                        0 0 100px 20px rgba(4,120,87,0.18),
                        inset 0 0 60px 10px rgba(2,44,34,0.45),
                        inset -40px -30px 60px 10px rgba(1,24,18,0.62);
                    position: relative;
                    overflow: hidden;
                    animation: globe-float 6s ease-in-out infinite;
                }
                @keyframes globe-float {
                    0%,100% { transform: translateY(0); }
                    50%     { transform: translateY(-14px); }
                }
                .globe-grid {
                    position: absolute; inset: -10%;
                    border-radius: 50%;
                    background-image:
                        repeating-linear-gradient(0deg,  transparent, transparent 30px, rgba(209,250,229,0.08) 30px, rgba(209,250,229,0.08) 31px),
                        repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(209,250,229,0.08) 30px, rgba(209,250,229,0.08) 31px);
                    animation: globe-spin 18s linear infinite;
                }
                @keyframes globe-spin {
                    0%   { transform: rotateY(0deg)   rotateX(15deg); }
                    100% { transform: rotateY(360deg) rotateX(15deg); }
                }
                .globe-ring { position: absolute; border-radius: 50%; border: 1px solid rgba(209,250,229,0.14); }
                .globe-ring-1 { inset: 0; }
                .globe-ring-2 { inset: 15% 0; border-color: rgba(209,250,229,0.1); }
                .globe-ring-3 { inset: 30% 0; border-color: rgba(209,250,229,0.08); }
                .globe-ring-4 { inset: 0 15%; border-color: rgba(209,250,229,0.1); }
                .globe-atmo {
                    position: absolute; inset: -14px; border-radius: 50%;
                    box-shadow: 0 0 30px 14px rgba(16,185,129,0.14), 0 0 60px 30px rgba(4,120,87,0.1);
                }
                .globe-highlight {
                    position: absolute; top:10%; left:14%; width:38%; height:30%;
                    background: radial-gradient(ellipse, rgba(255,255,255,0.18) 0%, transparent 70%);
                    border-radius: 50%;
                }
                .globe-orbit {
                    position: absolute; inset: -28px; border-radius: 50%;
                    border: 1px dashed rgba(167,243,208,0.2);
                    animation: orbit-spin 12s linear infinite;
                }
                .globe-dot {
                    position: absolute; top:-5px; left:calc(50% - 5px);
                    width:10px; height:10px; border-radius:50%;
                    background: radial-gradient(circle, #fde68a, #f59e0b);
                    box-shadow: 0 0 8px 3px rgba(251,191,36,0.35);
                }
                @keyframes orbit-spin { to { transform: rotate(360deg); } }
                .globe-orbit-2 {
                    position: absolute; inset: -50px; border-radius: 50%;
                    border: 1px dashed rgba(255,255,255,0.12);
                    animation: orbit-spin 20s linear infinite reverse;
                }
                .globe-dot-2 {
                    position: absolute; bottom:-4px; left:calc(50% - 4px);
                    width:8px; height:8px; border-radius:50%;
                    background: radial-gradient(circle, #d1fae5, #34d399);
                    box-shadow: 0 0 6px 2px rgba(52,211,153,0.3);
                }

                /* ── LOGIN CARD ── */
                .login-card {
                    position: relative; z-index: 10;
                    background: linear-gradient(180deg, rgba(4,30,27,0.82) 0%, rgba(2,44,34,0.88) 100%);
                    backdrop-filter: blur(28px);
                    -webkit-backdrop-filter: blur(28px);
                    border: 1px solid rgba(255,255,255,0.12);
                    border-radius: 24px;
                    padding: 48px 48px;
                    width: 460px;
                    box-shadow:
                        0 0 0 1px rgba(4,120,87,0.12),
                        0 24px 80px rgba(1,24,18,0.42),
                        0 0 40px rgba(16,185,129,0.08);
                }
                .card-logo { display:flex; align-items:center; gap:10px; margin-bottom:22px; }
                .card-logo-icon {
                    width:40px; height:40px; border-radius:11px;
                    background: linear-gradient(135deg,#047857,#0f766e);
                    display:flex; align-items:center; justify-content:center;
                    box-shadow: 0 8px 18px rgba(4,120,87,0.3); font-size:17px;
                }
                .card-logo-name { font-size:19px; font-weight:800; color:#fff; letter-spacing:2px; line-height:1; }
                .card-logo-sub  { font-size:10px; font-weight:600; color:rgba(167,243,208,0.7); letter-spacing:3px; text-transform:uppercase; }
                .card-heading { font-size:15px; font-weight:700; color:#e0eaff; margin-bottom:3px; }
                .card-sub     { font-size:12px; color:rgba(220,252,231,0.62); margin-bottom:26px; }
                .field-label  { display:block; font-size:11px; font-weight:600; color:rgba(167,243,208,0.76); letter-spacing:1px; text-transform:uppercase; margin-bottom:6px; }
                .field-wrap   { position:relative; margin-bottom:16px; }
                .field-icon   { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:rgba(167,243,208,0.42); display:flex; pointer-events:none; }
                .field-input  {
                    width:100%; padding:11px 14px 11px 42px;
                    background: rgba(255,255,255,0.08);
                    border: 1px solid rgba(255,255,255,0.12);
                    border-radius:12px; color:#f0fdf4; font-size:14px;
                    font-family:inherit; outline:none;
                    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
                }
                .field-input::placeholder { color:rgba(220,252,231,0.34); }
                .field-input:focus {
                    border-color:rgba(52,211,153,0.55); background:rgba(255,255,255,0.12);
                    box-shadow:0 0 0 3px rgba(16,185,129,0.14);
                }
                .error-box {
                    background:rgba(127,29,29,0.28); border:1px solid rgba(252,165,165,0.28);
                    border-radius:10px; color:#fecaca; font-size:12px;
                    padding:10px 14px; margin-bottom:16px; text-align:center;
                }
                .submit-btn {
                    width:100%; padding:13px; border:none; border-radius:12px;
                    background: linear-gradient(135deg,#f8fafc 0%,#ecfdf5 100%);
                    color:white; font-size:14px; font-weight:700; font-family:inherit;
                    cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;
                    color:#064e3b;
                    box-shadow: 0 12px 26px rgba(2,86,67,0.2), 0 0 0 1px rgba(255,255,255,0.12);
                    transition: transform 0.15s, box-shadow 0.15s, background 0.2s;
                    margin-top:4px; letter-spacing:0.5px;
                }
                .submit-btn:hover {
                    background: linear-gradient(135deg,#ffffff 0%,#d1fae5 100%);
                    box-shadow: 0 16px 30px rgba(2,86,67,0.26), 0 0 0 1px rgba(255,255,255,0.18);
                    transform: translateY(-1px);
                }
                .submit-btn:active  { transform:scale(0.97); }
                .submit-btn:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
                .spinner { width:16px; height:16px; border:2px solid rgba(6,78,59,0.22); border-top-color:#064e3b; border-radius:50%; animation:btn-spin 0.6s linear infinite; }
                @keyframes btn-spin { to { transform:rotate(360deg); } }
                .card-footer {
                    display:flex; justify-content:space-between; align-items:center;
                    margin-top:18px; padding-top:18px;
                    border-top:1px solid rgba(255,255,255,0.12);
                }
                .back-lnk { font-size:12px; font-weight:600; color:rgba(220,252,231,0.72); text-decoration:none; transition:color 0.2s; }
                .back-lnk:hover { color:#ffffff; }
                .secure-badge { display:flex; align-items:center; gap:5px; font-size:11px; font-weight:600; color:rgba(167,243,208,0.58); letter-spacing:0.5px; }

                /* ── Responsive ── */
                @media (max-width: 1100px) {
                    .globe-scene { width:300px; height:300px; right:2%; }
                }
                @media (max-width: 860px) {
                    .login-left  { display: none; }
                    .globe-scene { width:280px; height:280px; right:-20px; top:initial; bottom:-20px; transform:none; opacity:0.35; }
                }
                @media (max-width: 480px) {
                    .login-card  { width:92vw; padding:30px 18px; }
                    .globe-scene { display:none; }
                }
            `}} />

            <div className="login-root">

                {/* ════════════ LEFT PANEL ════════════ */}
                <div className="login-left">
                    <div className="left-stars" />
                    <div className="left-grid" />
                    <div className="left-aura" />

                    {/* Logo image — place your aafb-logo.png in /public */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/aafb-logo.png"
                        alt="Addis Ababa Finance Bureau Logo"
                        className="bureau-logo-img"
                        onError={(e) => {
                            // Fallback if image not found: show initials
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />

                    <div className="bureau-text-block">
                        <span className="bureau-line-small">በአዲስ አበባ ከተማ አስተዳደር</span>
                        <span className="bureau-line-amh">የፋይናንስ ቢሮ</span>
                        <div className="gold-bar" />
                        <span className="bureau-line-en-sm">Addis Ababa City Administration</span>
                        <span className="bureau-line-en-lg">Bureau of Finance</span>
                    </div>

                    <div className="left-bottom">
                        <div className="armas-badge">
                            <span>ARMAS</span>
                        </div>
                        <p className="armas-badge-sub">Audit & Report Management System</p>
                    </div>
                </div>

                {/* ════════════ RIGHT PANEL ════════════ */}
                <div className="login-right">
                    <div className="stars" />

                    {/* Globe animation */}
                    <div className="globe-scene">
                        <div className="globe-orbit-2">
                            <div className="globe-dot-2" />
                        </div>
                        <div className="globe-orbit">
                            <div className="globe-dot" />
                        </div>
                        <div className="globe-atmo" />
                        <div className="globe">
                            <div className="globe-grid" />
                            <div className="globe-ring globe-ring-1" />
                            <div className="globe-ring globe-ring-2" />
                            <div className="globe-ring globe-ring-3" />
                            <div className="globe-ring globe-ring-4" />
                            <div className="globe-highlight" />
                        </div>
                    </div>

                    {/* Login card */}
                    <div className="login-card">
                        <div className="card-logo">
                            <div className="card-logo-icon">🌐</div>
                            <div>
                                <p className="card-logo-name">ARMAS</p>
                                <p className="card-logo-sub">{t.portalSub}</p>
                            </div>
                        </div>

                        <p className="card-heading">{t.heading}</p>
                        <p className="card-sub">{t.subheading}</p>

                        {error && <div className="error-box">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="field-wrap">
                                <label className="field-label">{t.usernameLabel}</label>
                                <div style={{ position: 'relative' }}>
                                    <span className="field-icon">
                                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                                        </svg>
                                    </span>
                                    <input
                                        className="field-input"
                                        type="text"
                                        placeholder={t.usernamePlaceholder}
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        autoComplete="username"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="field-wrap">
                                <label className="field-label">{t.passwordLabel}</label>
                                <div style={{ position: 'relative' }}>
                                    <span className="field-icon">
                                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M18 8h-1V6c0-2.8-2.2-5-5-5S7 3.2 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.7 1.4-3.1 3.1-3.1 1.7 0 3.1 1.4 3.1 3.1v2z" />
                                        </svg>
                                    </span>
                                    <input
                                        className="field-input"
                                        type="password"
                                        placeholder={t.passwordPlaceholder}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        autoComplete="current-password"
                                        required
                                    />
                                </div>
                            </div>

                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading ? (
                                    <><span className="spinner" /> {t.signingIn}</>
                                ) : (
                                    <>
                                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M10 17l5-5-5-5v3H3v4h7v3zm8-14H6v2h12v14H6v2h12c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                                        </svg>
                                        {t.signIn}
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="card-footer">
                            <Link href="/" className="back-lnk">{t.backToHome}</Link>
                            <span className="secure-badge">
                                <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                                </svg>
                                {t.securedBadge}
                            </span>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}
