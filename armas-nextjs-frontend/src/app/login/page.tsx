'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import axiosInstance from '@/lib/axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getMessages, type Lang } from '@/lib/messages';

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

    const t = getMessages(lang).login;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await axiosInstance.post('/login', { username, password });
            const token = response.data.token;
            const role = response.data.roles && response.data.roles.length > 0
                ? response.data.roles[0] : 'USER';
            login(token, role);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;600;700;800&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }

                /* ── ROOT: full-page side-by-side ── */
                .login-root {
                    min-height: 100vh;
                    display: flex;
                    font-family: 'Inter', sans-serif;
                    overflow: hidden;
                    position: relative;
                }

                /* ══════════════════════════════════
                   LEFT PANEL  — compact bureau branding
                ══════════════════════════════════ */
                .login-left {
                    width: 360px;
                    flex-shrink: 0;
                    background: radial-gradient(ellipse at 40% 35%, #003a85 0%, #001a50 45%, #000a28 100%);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 36px 28px;
                    position: relative;
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
                    background: radial-gradient(circle, rgba(196,152,40,0.08) 0%, transparent 70%);
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
                    color: rgba(160,200,255,0.6);
                    letter-spacing: 1.5px;
                }
                .bureau-line-amh {
                    font-family: 'Outfit', sans-serif;
                    font-size: 17px;
                    font-weight: 700;
                    color: #f0cc50;
                    letter-spacing: 0.5px;
                    margin-top: 2px;
                }
                .gold-bar {
                    width: 52px; height: 2px;
                    background: linear-gradient(90deg, transparent, #c49828, transparent);
                    border-radius: 1px;
                    margin: 8px auto;
                }
                .bureau-line-en-sm {
                    font-size: 10px;
                    font-weight: 600;
                    color: rgba(160,200,255,0.5);
                    letter-spacing: 2.5px;
                    text-transform: uppercase;
                }
                .bureau-line-en-lg {
                    font-family: 'Outfit', sans-serif;
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
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(196,152,40,0.25);
                    border-radius: 20px;
                    padding: 4px 14px;
                }
                .armas-badge span {
                    font-size: 13px;
                    font-weight: 800;
                    color: #f0cc50;
                    letter-spacing: 3px;
                }
                .armas-badge-sub {
                    font-size: 10px;
                    color: rgba(100,140,200,0.4);
                    letter-spacing: 0.5px;
                }

                /* ══════════════════════════════════
                   RIGHT PANEL — globe + login card
                ══════════════════════════════════ */
                .login-right {
                    flex: 1;
                    background: radial-gradient(ellipse at 60% 40%, #0d1f4e 0%, #060d1f 55%, #000510 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                    min-height: 100vh;
                }

                /* Stars (right) */
                .stars {
                    position: absolute; inset: 0;
                    pointer-events: none;
                    background-image:
                        radial-gradient(1px 1px at 10% 15%, rgba(255,255,255,0.8) 0%, transparent 100%),
                        radial-gradient(1px 1px at 25% 35%, rgba(255,255,255,0.6) 0%, transparent 100%),
                        radial-gradient(1.5px 1.5px at 40% 5%, rgba(255,255,255,0.9) 0%, transparent 100%),
                        radial-gradient(1px 1px at 55% 60%, rgba(255,255,255,0.5) 0%, transparent 100%),
                        radial-gradient(1.5px 1.5px at 70% 20%, rgba(255,255,255,0.7) 0%, transparent 100%),
                        radial-gradient(1px 1px at 85% 45%, rgba(255,255,255,0.6) 0%, transparent 100%),
                        radial-gradient(1px 1px at 13% 70%, rgba(255,255,255,0.5) 0%, transparent 100%),
                        radial-gradient(2px 2px at 92% 10%, rgba(255,255,255,0.9) 0%, transparent 100%),
                        radial-gradient(1px 1px at 60% 85%, rgba(255,255,255,0.6) 0%, transparent 100%),
                        radial-gradient(1px 1px at 32% 90%, rgba(255,255,255,0.7) 0%, transparent 100%),
                        radial-gradient(1.5px 1.5px at 78% 75%, rgba(255,255,255,0.5) 0%, transparent 100%),
                        radial-gradient(1px 1px at 48% 48%, rgba(255,255,255,0.4) 0%, transparent 100%),
                        radial-gradient(1px 1px at 5% 50%,  rgba(255,255,255,0.6) 0%, transparent 100%),
                        radial-gradient(2px 2px at 20% 55%, rgba(160,200,255,0.6) 0%, transparent 100%),
                        radial-gradient(1px 1px at 95% 65%, rgba(255,255,255,0.5) 0%, transparent 100%),
                        radial-gradient(1px 1px at 66% 38%, rgba(255,255,255,0.4) 0%, transparent 100%);
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
                        #1a4fa8 0%, #0d2d6e 35%, #061430 70%, #020810 100%);
                    box-shadow:
                        0 0 0 1px rgba(100,160,255,0.2),
                        0 0 40px 6px rgba(30,80,200,0.25),
                        0 0 100px 20px rgba(10,40,140,0.2),
                        inset 0 0 60px 10px rgba(0,20,80,0.6),
                        inset -40px -30px 60px 10px rgba(0,0,30,0.7);
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
                        repeating-linear-gradient(0deg,  transparent, transparent 30px, rgba(120,180,255,0.07) 30px, rgba(120,180,255,0.07) 31px),
                        repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(120,180,255,0.07) 30px, rgba(120,180,255,0.07) 31px);
                    animation: globe-spin 18s linear infinite;
                }
                @keyframes globe-spin {
                    0%   { transform: rotateY(0deg)   rotateX(15deg); }
                    100% { transform: rotateY(360deg) rotateX(15deg); }
                }
                .globe-ring { position: absolute; border-radius: 50%; border: 1px solid rgba(100,160,255,0.12); }
                .globe-ring-1 { inset: 0; }
                .globe-ring-2 { inset: 15% 0; border-color: rgba(100,160,255,0.09); }
                .globe-ring-3 { inset: 30% 0; border-color: rgba(100,160,255,0.07); }
                .globe-ring-4 { inset: 0 15%; border-color: rgba(100,160,255,0.09); }
                .globe-atmo {
                    position: absolute; inset: -14px; border-radius: 50%;
                    box-shadow: 0 0 30px 14px rgba(40,100,255,0.18), 0 0 60px 30px rgba(20,60,200,0.10);
                }
                .globe-highlight {
                    position: absolute; top:10%; left:14%; width:38%; height:30%;
                    background: radial-gradient(ellipse, rgba(255,255,255,0.12) 0%, transparent 70%);
                    border-radius: 50%;
                }
                .globe-orbit {
                    position: absolute; inset: -28px; border-radius: 50%;
                    border: 1px dashed rgba(80,140,255,0.2);
                    animation: orbit-spin 12s linear infinite;
                }
                .globe-dot {
                    position: absolute; top:-5px; left:calc(50% - 5px);
                    width:10px; height:10px; border-radius:50%;
                    background: radial-gradient(circle, #60aaff, #1a4fa8);
                    box-shadow: 0 0 8px 3px rgba(80,160,255,0.5);
                }
                @keyframes orbit-spin { to { transform: rotate(360deg); } }
                .globe-orbit-2 {
                    position: absolute; inset: -50px; border-radius: 50%;
                    border: 1px dashed rgba(80,140,255,0.1);
                    animation: orbit-spin 20s linear infinite reverse;
                }
                .globe-dot-2 {
                    position: absolute; bottom:-4px; left:calc(50% - 4px);
                    width:8px; height:8px; border-radius:50%;
                    background: radial-gradient(circle, #a0c8ff, #2060c0);
                    box-shadow: 0 0 6px 2px rgba(80,140,255,0.4);
                }

                /* ── LOGIN CARD ── */
                .login-card {
                    position: relative; z-index: 10;
                    background: rgba(8,18,42,0.85);
                    backdrop-filter: blur(28px);
                    -webkit-backdrop-filter: blur(28px);
                    border: 1px solid rgba(80,140,255,0.2);
                    border-radius: 24px;
                    padding: 42px 38px;
                    width: 380px;
                    box-shadow:
                        0 0 0 1px rgba(40,90,200,0.1),
                        0 24px 80px rgba(0,0,40,0.6),
                        0 0 40px rgba(20,60,200,0.12);
                }
                .card-logo { display:flex; align-items:center; gap:10px; margin-bottom:22px; }
                .card-logo-icon {
                    width:40px; height:40px; border-radius:11px;
                    background: linear-gradient(135deg,#1a4fa8,#0d2d6e);
                    display:flex; align-items:center; justify-content:center;
                    box-shadow: 0 4px 14px rgba(26,79,168,0.5); font-size:17px;
                }
                .card-logo-name { font-size:19px; font-weight:800; color:#fff; letter-spacing:2px; line-height:1; }
                .card-logo-sub  { font-size:10px; font-weight:600; color:#4a80d4; letter-spacing:3px; text-transform:uppercase; }
                .card-heading { font-size:15px; font-weight:700; color:#e0eaff; margin-bottom:3px; }
                .card-sub     { font-size:12px; color:#4a6090; margin-bottom:26px; }
                .field-label  { display:block; font-size:11px; font-weight:600; color:#4a7acc; letter-spacing:1px; text-transform:uppercase; margin-bottom:6px; }
                .field-wrap   { position:relative; margin-bottom:16px; }
                .field-icon   { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:#3a6090; display:flex; pointer-events:none; }
                .field-input  {
                    width:100%; padding:11px 14px 11px 42px;
                    background: rgba(20,40,100,0.35);
                    border: 1px solid rgba(60,100,200,0.2);
                    border-radius:12px; color:#e0eaff; font-size:14px;
                    font-family:inherit; outline:none;
                    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
                }
                .field-input::placeholder { color:rgba(100,140,210,0.4); }
                .field-input:focus {
                    border-color:rgba(80,140,255,0.5); background:rgba(20,50,120,0.4);
                    box-shadow:0 0 0 3px rgba(40,100,255,0.1);
                }
                .error-box {
                    background:rgba(200,30,30,0.15); border:1px solid rgba(220,50,50,0.3);
                    border-radius:10px; color:#fca5a5; font-size:12px;
                    padding:10px 14px; margin-bottom:16px; text-align:center;
                }
                .submit-btn {
                    width:100%; padding:13px; border:none; border-radius:12px;
                    background: linear-gradient(135deg,#1a4fa8 0%,#0d2d6e 100%);
                    color:white; font-size:14px; font-weight:700; font-family:inherit;
                    cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;
                    box-shadow: 0 4px 20px rgba(26,79,168,0.5), 0 0 0 1px rgba(80,140,255,0.2);
                    transition: transform 0.15s, box-shadow 0.15s, background 0.2s;
                    margin-top:4px; letter-spacing:0.5px;
                }
                .submit-btn:hover {
                    background: linear-gradient(135deg,#2060c0 0%,#1335a0 100%);
                    box-shadow: 0 6px 28px rgba(26,79,168,0.65), 0 0 0 1px rgba(80,160,255,0.35);
                    transform: translateY(-1px);
                }
                .submit-btn:active  { transform:scale(0.97); }
                .submit-btn:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
                .spinner { width:16px; height:16px; border:2px solid rgba(255,255,255,0.3); border-top-color:white; border-radius:50%; animation:btn-spin 0.6s linear infinite; }
                @keyframes btn-spin { to { transform:rotate(360deg); } }
                .card-footer {
                    display:flex; justify-content:space-between; align-items:center;
                    margin-top:18px; padding-top:18px;
                    border-top:1px solid rgba(60,100,200,0.15);
                }
                .back-lnk { font-size:12px; font-weight:600; color:#3a6090; text-decoration:none; transition:color 0.2s; }
                .back-lnk:hover { color:#80b0ff; }
                .secure-badge { display:flex; align-items:center; gap:5px; font-size:11px; font-weight:600; color:#2a5090; letter-spacing:0.5px; }

                /* ── Responsive ── */
                @media (max-width: 1100px) {
                    .globe-scene { width:300px; height:300px; right:2%; }
                }
                @media (max-width: 860px) {
                    .login-left  { display:none; }
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
