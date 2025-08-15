
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
        <header className="bg-white dark:bg-slate-800 shadow-md p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <Icon name="receipt_long" className="text-3xl text-blue-600 dark:text-blue-400" />
                <h1 className={`text-2xl font-bold ${language === 'gu' ? 'font-gujarati' : ''}`}>{t('appName')}</h1>
            </div>
            <div className="flex items-center gap-4">
                 <button onClick={() => onNavigate('list')} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" title={t('receiptList')}>
                    <Icon name="list_alt" />
                </button>
                 <button onClick={() => onNavigate('admin')} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" title={t('adminPanel')}>
                    <Icon name="admin_panel_settings" />
                </button>
                <button onClick={toggleLanguage} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2">
                    <Icon name="language" />
                    <span className="font-semibold">{language === 'en' ? 'ગુ' : 'EN'}</span>
                </button>
                <button onClick={logout} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" title={t('logout')}>
                    <Icon name="logout" />
                </button>
            </div>
        </header>
    );
};

export default Header;
