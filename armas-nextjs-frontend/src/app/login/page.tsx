'use client';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import axiosInstance from '@/lib/axios';
import Link from 'next/link';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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
            window.location.href = '/dashboard';
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

                * { box-sizing: border-box; margin: 0; padding: 0; }

                .login-root {
                    min-height: 100vh;
                    background: radial-gradient(ellipse at 60% 40%, #0d1f4e 0%, #060d1f 55%, #000510 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Inter', sans-serif;
                    overflow: hidden;
                    position: relative;
                }

                /* ── Stars ── */
                .stars {
                    position: absolute;
                    inset: 0;
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
                        radial-gradient(1px 1px at 5% 50%, rgba(255,255,255,0.6) 0%, transparent 100%),
                        radial-gradient(2px 2px at 20% 55%, rgba(160,200,255,0.6) 0%, transparent 100%),
                        radial-gradient(1px 1px at 95% 65%, rgba(255,255,255,0.5) 0%, transparent 100%),
                        radial-gradient(1px 1px at 66% 38%, rgba(255,255,255,0.4) 0%, transparent 100%);
                }

                /* ── Globe wrapper ── */
                .globe-scene {
                    position: absolute;
                    right: 8%;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 480px;
                    height: 480px;
                }

                .globe {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    background: radial-gradient(circle at 35% 35%,
                        #1a4fa8 0%,
                        #0d2d6e 35%,
                        #061430 70%,
                        #020810 100%);
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
                    0%, 100% { transform: translateY(0); }
                    50%       { transform: translateY(-14px); }
                }

                /* Rotating grid lines */
                .globe-grid {
                    position: absolute;
                    inset: -10%;
                    border-radius: 50%;
                    background-image:
                        repeating-linear-gradient(0deg,   transparent, transparent 30px, rgba(120,180,255,0.07) 30px, rgba(120,180,255,0.07) 31px),
                        repeating-linear-gradient(90deg,  transparent, transparent 30px, rgba(120,180,255,0.07) 30px, rgba(120,180,255,0.07) 31px);
                    animation: globe-spin 18s linear infinite;
                }
                @keyframes globe-spin {
                    0%   { transform: rotateY(0deg) rotateX(15deg); }
                    100% { transform: rotateY(360deg) rotateX(15deg); }
                }

                /* Equator + meridian circles */
                .globe-ring {
                    position: absolute;
                    border-radius: 50%;
                    border: 1px solid rgba(100,160,255,0.12);
                }
                .globe-ring-1 { inset: 0; }
                .globe-ring-2 { inset: 15% 0; border-color: rgba(100,160,255,0.09); }
                .globe-ring-3 { inset: 30% 0; border-color: rgba(100,160,255,0.07); }
                .globe-ring-4 { inset: 0 15%; border-color: rgba(100,160,255,0.09); }

                /* Atmosphere glow */
                .globe-atmo {
                    position: absolute;
                    inset: -14px;
                    border-radius: 50%;
                    background: transparent;
                    box-shadow: 0 0 30px 14px rgba(40,100,255,0.18), 0 0 60px 30px rgba(20,60,200,0.10);
                    pointer-events: none;
                }

                /* Highlight */
                .globe-highlight {
                    position: absolute;
                    top: 10%; left: 14%;
                    width: 38%; height: 30%;
                    background: radial-gradient(ellipse, rgba(255,255,255,0.12) 0%, transparent 70%);
                    border-radius: 50%;
                    pointer-events: none;
                }

                /* Orbiting dot */
                .globe-orbit {
                    position: absolute;
                    inset: -28px;
                    border-radius: 50%;
                    border: 1px dashed rgba(80,140,255,0.2);
                    animation: orbit-spin 12s linear infinite;
                }
                .globe-dot {
                    position: absolute;
                    top: -5px; left: calc(50% - 5px);
                    width: 10px; height: 10px;
                    border-radius: 50%;
                    background: radial-gradient(circle, #60aaff, #1a4fa8);
                    box-shadow: 0 0 8px 3px rgba(80,160,255,0.5);
                }
                @keyframes orbit-spin {
                    to { transform: rotate(360deg); }
                }
                .globe-orbit-2 {
                    position: absolute;
                    inset: -50px;
                    border-radius: 50%;
                    border: 1px dashed rgba(80,140,255,0.1);
                    animation: orbit-spin 20s linear infinite reverse;
                }
                .globe-dot-2 {
                    position: absolute;
                    bottom: -4px; left: calc(50% - 4px);
                    width: 8px; height: 8px;
                    border-radius: 50%;
                    background: radial-gradient(circle, #a0c8ff, #2060c0);
                    box-shadow: 0 0 6px 2px rgba(80,140,255,0.4);
                }

                /* ── Login card ── */
                .login-card {
                    position: relative;
                    z-index: 10;
                    background: rgba(8,18,42,0.82);
                    backdrop-filter: blur(28px);
                    -webkit-backdrop-filter: blur(28px);
                    border: 1px solid rgba(80,140,255,0.2);
                    border-radius: 24px;
                    padding: 44px 40px;
                    width: 380px;
                    box-shadow:
                        0 0 0 1px rgba(40,90,200,0.1),
                        0 24px 80px rgba(0,0,40,0.6),
                        0 0 40px rgba(20,60,200,0.12);
                }

                .card-logo {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 24px;
                }
                .card-logo-icon {
                    width: 42px; height: 42px;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #1a4fa8, #0d2d6e);
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 4px 16px rgba(26,79,168,0.5);
                    font-size: 18px;
                }
                .card-logo-text { line-height: 1; }
                .card-logo-name {
                    font-size: 20px;
                    font-weight: 800;
                    color: #fff;
                    letter-spacing: 2px;
                }
                .card-logo-sub {
                    font-size: 10px;
                    font-weight: 600;
                    color: #4a80d4;
                    letter-spacing: 3px;
                    text-transform: uppercase;
                }
                .card-heading {
                    font-size: 15px;
                    font-weight: 700;
                    color: #e0eaff;
                    margin-bottom: 4px;
                }
                .card-sub {
                    font-size: 12px;
                    color: #4a6090;
                    margin-bottom: 28px;
                }
                .field-label {
                    display: block;
                    font-size: 11px;
                    font-weight: 600;
                    color: #4a7acc;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    margin-bottom: 7px;
                }
                .field-wrap {
                    position: relative;
                    margin-bottom: 18px;
                }
                .field-icon {
                    position: absolute;
                    left: 14px; top: 50%;
                    transform: translateY(-50%);
                    color: #3a6090;
                    display: flex;
                    pointer-events: none;
                }
                .field-input {
                    width: 100%;
                    padding: 12px 14px 12px 42px;
                    background: rgba(20,40,100,0.35);
                    border: 1px solid rgba(60,100,200,0.2);
                    border-radius: 12px;
                    color: #e0eaff;
                    font-size: 14px;
                    font-family: inherit;
                    outline: none;
                    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
                }
                .field-input::placeholder { color: rgba(100,140,210,0.4); }
                .field-input:focus {
                    border-color: rgba(80,140,255,0.5);
                    background: rgba(20,50,120,0.4);
                    box-shadow: 0 0 0 3px rgba(40,100,255,0.1);
                }
                .error-box {
                    background: rgba(200,30,30,0.15);
                    border: 1px solid rgba(220,50,50,0.3);
                    border-radius: 10px;
                    color: #fca5a5;
                    font-size: 12px;
                    padding: 10px 14px;
                    margin-bottom: 18px;
                    text-align: center;
                }
                .submit-btn {
                    width: 100%;
                    padding: 13px;
                    border: none;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #1a4fa8 0%, #0d2d6e 100%);
                    color: white;
                    font-size: 14px;
                    font-weight: 700;
                    font-family: inherit;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    box-shadow: 0 4px 20px rgba(26,79,168,0.5), 0 0 0 1px rgba(80,140,255,0.2);
                    transition: transform 0.15s, box-shadow 0.15s, background 0.2s;
                    margin-top: 4px;
                    letter-spacing: 0.5px;
                }
                .submit-btn:hover {
                    background: linear-gradient(135deg, #2060c0 0%, #1335a0 100%);
                    box-shadow: 0 6px 28px rgba(26,79,168,0.65), 0 0 0 1px rgba(80,160,255,0.35);
                    transform: translateY(-1px);
                }
                .submit-btn:active { transform: scale(0.97); }
                .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
                .spinner {
                    width: 16px; height: 16px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: btn-spin 0.6s linear infinite;
                }
                @keyframes btn-spin { to { transform: rotate(360deg); } }
                .card-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 1px solid rgba(60,100,200,0.15);
                }
                .back-lnk {
                    font-size: 12px;
                    font-weight: 600;
                    color: #3a6090;
                    text-decoration: none;
                    transition: color 0.2s;
                }
                .back-lnk:hover { color: #80b0ff; }
                .secure-badge {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 11px;
                    font-weight: 600;
                    color: #2a5090;
                    letter-spacing: 0.5px;
                }

                /* Responsive: hide globe on small screens */
                @media (max-width: 860px) {
                    .globe-scene { display: none; }
                    .login-card { width: 340px; padding: 32px 28px; }
                }
                @media (max-width: 420px) {
                    .login-card { width: 96vw; padding: 28px 20px; }
                }
            `}</style>

            <div className="login-root">
                <div className="stars" />

                {/* ── 3D GLOBE ── */}
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

                {/* ── LOGIN CARD ── */}
                <div className="login-card">
                    {/* Logo */}
                    <div className="card-logo">
                        <div className="card-logo-icon">🌐</div>
                        <div className="card-logo-text">
                            <p className="card-logo-name">ARMAS</p>
                            <p className="card-logo-sub">Portal</p>
                        </div>
                    </div>

                    <p className="card-heading">Welcome back</p>
                    <p className="card-sub">Sign in to access the institutional portal</p>

                    {error && <div className="error-box">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        {/* Username */}
                        <div className="field-wrap">
                            <label className="field-label">Username</label>
                            <div style={{ position: 'relative' }}>
                                <span className="field-icon">
                                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                                    </svg>
                                </span>
                                <input
                                    className="field-input"
                                    type="text"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    autoComplete="username"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="field-wrap">
                            <label className="field-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <span className="field-icon">
                                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18 8h-1V6c0-2.8-2.2-5-5-5S7 3.2 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.7 1.4-3.1 3.1-3.1 1.7 0 3.1 1.4 3.1 3.1v2z" />
                                    </svg>
                                </span>
                                <input
                                    className="field-input"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? (
                                <><span className="spinner" /> Signing in…</>
                            ) : (
                                <>
                                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M10 17l5-5-5-5v3H3v4h7v3zm8-14H6v2h12v14H6v2h12c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                                    </svg>
                                    Sign in to Portal
                                </>
                            )}
                        </button>
                    </form>

                    <div className="card-footer">
                        <Link href="/" className="back-lnk">← Back to Home</Link>
                        <span className="secure-badge">
                            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                            </svg>
                            256-bit Secured
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
}
