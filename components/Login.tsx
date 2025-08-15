import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLocalization } from '../hooks/useLocalization';
import { DEFAULT_USERNAME, DEFAULT_PASSWORD } from '../constants';
import Icon from './common/Icon';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const { t, language } = useLocalization();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const success = await login(username, password);
        if (!success) {
            setError('Invalid username or password');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-4">
            <div className="w-full max-w-sm p-8 space-y-6 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-black/50">
                <div className="text-center">
                    <Icon name="receipt_long" className="text-5xl text-blue-600 dark:text-blue-400 mx-auto" />
                    <h2 className={`mt-4 text-3xl font-bold text-slate-900 dark:text-white font-poppins ${language === 'gu' ? 'font-gujarati' : ''}`}>
                        {t('appName')}
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="username" className="sr-only">{t('username')}</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                required
                                className="relative block w-full appearance-none rounded-xl border border-slate-300 bg-transparent px-4 py-3 text-slate-900 placeholder-slate-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-slate-700 dark:text-white dark:placeholder-slate-400 sm:text-sm"
                                placeholder={t('username')}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">{t('password')}</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="relative block w-full appearance-none rounded-xl border border-slate-300 bg-transparent px-4 py-3 text-slate-900 placeholder-slate-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-slate-700 dark:text-white dark:placeholder-slate-400 sm:text-sm"
                                placeholder={t('password')}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                     <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                        Hint: {DEFAULT_USERNAME} / {DEFAULT_PASSWORD}
                     </p>
                    <div>
                        <button
                            type="submit"
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 transition-colors ${language === 'gu' ? 'font-gujarati' : ''}`}
                        >
                            {t('login')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
