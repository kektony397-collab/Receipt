import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { useLocalization } from '../hooks/useLocalization';
import type { AdminProfile } from '../types';
import Icon from './common/Icon';

const AdminPanel: React.FC = () => {
    const { t, language } = useLocalization();
    const adminProfile = useLiveQuery(() => db.profile.toCollection().first());

    const [profile, setProfile] = useState<Partial<AdminProfile>>({});
    const [statusMessage, setStatusMessage] = useState('');

    const labelClasses = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";
    const inputFieldClasses = "w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500";
    const inputFieldDisabledClasses = "w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed";

    useEffect(() => {
        if (adminProfile) {
            setProfile(adminProfile);
        }
    }, [adminProfile]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, lang?: 'en' | 'gu') => {
        const { name, value } = e.target;
        if (lang) {
            setProfile(prev => ({
                ...prev,
                [name]: {
                    ...(prev[name as keyof AdminProfile] as object),
                    [lang]: value
                }
            }));
        } else {
            setProfile(prev => ({...prev, [name]: value}));
        }
    };
    
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (profile.id) {
            const { id, ...dataToUpdate } = profile;
            await db.profile.update(id, dataToUpdate);
            setStatusMessage(t('profileUpdated'));
            setTimeout(() => setStatusMessage(''), 3000);
        }
    };

    if (!profile) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
             <h2 className={`text-3xl font-bold mb-6 ${language === 'gu' ? 'font-gujarati' : ''}`}>{t('adminPanel')}</h2>
            <form onSubmit={handleUpdate} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelClasses}>{t('username')}</label>
                        <input type="text" value={profile.username || ''} disabled className={inputFieldDisabledClasses} />
                    </div>
                     <div>
                        <label className={labelClasses}>{t('displayName')}</label>
                        <input type="text" name="displayName" value={profile.displayName || ''} onChange={handleChange} className={inputFieldClasses} />
                    </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                     <h3 className="text-xl font-bold mb-4">English Details</h3>
                     <div className="space-y-4">
                        <div>
                             <label className={labelClasses}>{t('organizationName')}</label>
                             <input type="text" name="organizationName" value={profile.organizationName?.en || ''} onChange={(e) => handleChange(e, 'en')} className={inputFieldClasses} />
                        </div>
                        <div>
                             <label className={labelClasses}>{t('address')}</label>
                             <input type="text" name="address" value={profile.address?.en || ''} onChange={(e) => handleChange(e, 'en')} className={inputFieldClasses} />
                        </div>
                     </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                     <h3 className="text-xl font-bold mb-4 font-gujarati">ગુજરાતી વિગતો</h3>
                     <div className="space-y-4 font-gujarati">
                        <div>
                             <label className={labelClasses}>{t('organizationName')}</label>
                             <input type="text" name="organizationName" value={profile.organizationName?.gu || ''} onChange={(e) => handleChange(e, 'gu')} className={`${inputFieldClasses} font-gujarati`} />
                        </div>
                        <div>
                             <label className={labelClasses}>{t('address')}</label>
                             <input type="text" name="address" value={profile.address?.gu || ''} onChange={(e) => handleChange(e, 'gu')} className={`${inputFieldClasses} font-gujarati`} />
                        </div>
                     </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                     <label className={labelClasses}>{t('regNo')}</label>
                     <input type="text" name="regNo" value={profile.regNo || ''} onChange={handleChange} className={inputFieldClasses} />
                </div>


                <div className="flex justify-end items-center gap-4 pt-6">
                     {statusMessage && <p className="text-green-600 dark:text-green-400 flex items-center gap-2"><Icon name="check_circle"/> {statusMessage}</p>}
                    <button type="submit" className={`flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-bold ${language === 'gu' ? 'font-gujarati' : ''}`}>
                         <Icon name="save"/> {t('updateProfile')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminPanel;