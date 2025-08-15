
import React, { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';
import { db } from '../services/db';

interface AuthContextType {
    isLoggedIn: boolean;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const login = async (username: string, password: string): Promise<boolean> => {
        const user = await db.profile.where('username').equals(username).first();
        if (user && user.passwordHash === password) { // Plain text check for this implementation
            setIsLoggedIn(true);
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsLoggedIn(false);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
