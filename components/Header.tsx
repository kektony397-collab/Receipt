import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLocalization } from '../hooks/useLocalization';
import Icon from './common/Icon';

const Header: React.FC<{ onNavigate: (view: 'list' | 'admin') => void }> = ({ onNavigate }) => {
    const { logout } = useAuth();
    const { language, setLanguage, t } = useLocalization();

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'gu' : 'en');
    };

    return (
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 p-4 flex justify-between items-center transition-colors">
            <div className="flex items-center gap-3">
                <Icon name="receipt_long" className="text-3xl text-blue-600 dark:text-blue-400" />
                <h1 className={`text-2xl font-bold font-poppins ${language === 'gu' ? 'font-gujarati' : ''}`}>{t('appName')}</h1>
            </div>
            <div className="flex items-center gap-2">
                 <button onClick={() => onNavigate('list')} className="p-2 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors" title={t('receiptList')}>
                    <Icon name="list_alt" />
                </button>
                 <button onClick={() => onNavigate('admin')} className="p-2 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors" title={t('adminPanel')}>
                    <Icon name="admin_panel_settings" />
                </button>
                <button onClick={toggleLanguage} className="p-2 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-700/60 flex items-center gap-2 transition-colors">
                    <Icon name="language" />
                    <span className="font-semibold text-sm">{language === 'en' ? 'ગુ' : 'EN'}</span>
                </button>
                <button onClick={logout} className="p-2 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors" title={t('logout')}>
                    <Icon name="logout" />
                </button>
            </div>
        </header>
    );
};

export default Header;
