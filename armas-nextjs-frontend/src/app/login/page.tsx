'use client';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import axiosInstance from '@/lib/axios';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post('/login', { username, password });
            const token = response.data.token;
            const role = response.data.roles && response.data.roles.length > 0 ? response.data.roles[0] : 'USER';
            login(token, role);
            window.location.href = '/dashboard';
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md p-8 bg-white rounded shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-center">ARMAS Login</h2>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Username</label>
                        <input
                            type="text"
                            className="w-full border rounded p-2"
                            value={username} onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            className="w-full border rounded p-2"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white rounded p-2 hover:bg-blue-700">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}
