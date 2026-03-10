'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import axiosInstance from '@/lib/axios';

interface AuthContextType {
    isAuthenticated: boolean;
    userRole: string | null;
    login: (token: string, role: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Read auth state synchronously from cookies — avoids the blank-frame flicker
// caused by initializing as `false` then reading cookies in useEffect.
function readAuthFromCookies(): { isAuthenticated: boolean; userRole: string | null } {
    if (typeof document === 'undefined') {
        // Server-side: no cookies available yet
        return { isAuthenticated: false, userRole: null };
    }
    const token = Cookies.get('token');
    const role = Cookies.get('userRole') || null;
    return { isAuthenticated: !!token, userRole: role };
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const initial = readAuthFromCookies();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initial.isAuthenticated);
    const [userRole, setUserRole] = useState<string | null>(initial.userRole);
    const router = useRouter();

    // Keep in sync if another tab logs in/out (storage event)
    useEffect(() => {
        const sync = () => {
            const { isAuthenticated: a, userRole: r } = readAuthFromCookies();
            setIsAuthenticated(a);
            setUserRole(r);
        };
        window.addEventListener('focus', sync);
        return () => window.removeEventListener('focus', sync);
    }, []);

    const login = useCallback((token: string, role: string) => {
        Cookies.set('token', token, { expires: 1 });
        Cookies.set('userRole', role, { expires: 1 });
        setIsAuthenticated(true);
        setUserRole(role);
    }, []);

    const logout = useCallback(() => {
        Cookies.remove('token');
        Cookies.remove('userRole');
        setIsAuthenticated(false);
        setUserRole(null);
        router.push('/login');
    }, [router]);

    return (
        <AuthContext.Provider value={{ isAuthenticated, userRole, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
