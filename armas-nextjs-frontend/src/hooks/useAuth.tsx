'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';
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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const token = Cookies.get('token');
        const role = Cookies.get('userRole');
        if (token) {
            setIsAuthenticated(true);
            setUserRole(role || null);
        }
    }, []);

    const login = (token: string, role: string) => {
        Cookies.set('token', token, { expires: 1 });
        Cookies.set('userRole', role, { expires: 1 });
        setIsAuthenticated(true);
        setUserRole(role);
    };

    const logout = () => {
        Cookies.remove('token');
        Cookies.remove('userRole');
        setIsAuthenticated(false);
        setUserRole(null);
        router.push('/login');
    };

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
