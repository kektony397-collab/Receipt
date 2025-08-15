
import React from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LocalizationProvider } from './hooks/useLocalization';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

const AppContent: React.FC = () => {
    const { isLoggedIn } = useAuth();

    return (
        <div className="min-h-screen text-slate-800 dark:text-slate-200">
            {isLoggedIn ? <Dashboard /> : <Login />}
        </div>
    );
};

const App: React.FC = () => {
    return (
        <LocalizationProvider>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </LocalizationProvider>
    );
};

export default App;
