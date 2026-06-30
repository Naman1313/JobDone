'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    _id: string;
    phone: string;
    role: 'worker' | 'client';
    name: string;
    profilePhoto: string;
    isVerified: boolean;
    trustScore: number;
    trustTier: string;
    location?: {
        type: 'Point';
        coordinates: [number, number];
    };
    address?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    updateUser: (user: Partial<User>) => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const savedToken = localStorage.getItem('token');
            const savedUser = localStorage.getItem('jobdone_user');
            
            if (savedToken && savedUser) {
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/auth/me`, {
                        headers: {
                            'Authorization': `Bearer ${savedToken}`
                        }
                    });
                    
                    if (res.ok) {
                        const data = await res.json();
                        if (data.success && data.data) {
                            setToken(savedToken);
                            setUser(data.data);
                            localStorage.setItem('jobdone_user', JSON.stringify(data.data));
                        } else {
                            throw new Error('Invalid response data');
                        }
                    } else {
                        // Token is invalid or user deleted
                        localStorage.removeItem('token');
                        localStorage.removeItem('jobdone_user');
                        localStorage.removeItem('userId');
                        setToken(null);
                        setUser(null);
                    }
                } catch (err) {
                    // Network error, trust local storage for now to allow offline capabilities
                    setToken(savedToken);
                    setUser(JSON.parse(savedUser));
                }
            }
            setIsLoading(false);
        };
        
        checkAuth();
    }, []);

    const login = (token: string, user: User) => {
        localStorage.setItem('token', token);
        localStorage.setItem('jobdone_user', JSON.stringify(user));
        if (user?._id) {
            localStorage.setItem('userId', user._id);
        }
        setToken(token);
        setUser(user);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('jobdone_user');
        localStorage.removeItem('userId');
        setToken(null);
        setUser(null);
        router.push('/auth');
    };

    const updateUser = (updates: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...updates };
            setUser(updatedUser);
            localStorage.setItem('jobdone_user', JSON.stringify(updatedUser));
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, updateUser, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};