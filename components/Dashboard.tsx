import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, calculateTotal } from '../services/db';
import type { Receipt } from '../types';
import Header from './Header';
import ReceiptForm from './ReceiptForm';
import { useLocalization } from '../hooks/useLocalization';
import Icon from './common/Icon';
import Modal from './common/Modal';
import AdminPanel from './AdminPanel';
import FAB from './common/FAB';
import { useDebounce } from '../hooks/useDebounce';

const Dashboard: React.FC = () => {
    const [currentView, setCurrentView] = useState<'list' | 'form' | 'admin'>('list');
    const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [dateFilter, setDateFilter] = useState('');
    const [selectedReceipts, setSelectedReceipts] = useState<Set<number>>(new Set());
    const [receiptToDelete, setReceiptToDelete] = useState<Receipt | null>(null);

    const { t, language } = useLocalization();

    const allReceipts = useLiveQuery(() => db.receipts.orderBy('date').reverse().toArray(), []);

    const filteredReceipts = useMemo(() => {
        return (allReceipts || []).filter(receipt => {
            const matchesSearch = debouncedSearchTerm.length === 0 ||
                receipt.customerName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                receipt.receiptId.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
            
            const matchesDate = dateFilter.length === 0 ||
                new Date(receipt.date).toLocaleDateString() === new Date(dateFilter).toLocaleDateString();

            return matchesSearch && matchesDate;
        });
    }, [allReceipts, debouncedSearchTerm, dateFilter]);

    const handleNewReceipt = () => {
        setEditingReceipt(null);
        setCurrentView('form');
    };

    const handleEditReceipt = (receipt: Receipt) => {
        setEditingReceipt(receipt);
        setCurrentView('form');
    };
    
    const handleDeleteRequest = (receipt: Receipt) => {
        setReceiptToDelete(receipt);
    };

    const confirmDelete = async () => {
        if (receiptToDelete && receiptToDelete.id) {
            await db.receipts.delete(receiptToDelete.id);
            setReceiptToDelete(null);
        }
    };

    const handleSave = () => {
        setEditingReceipt(null);
        setCurrentView('list');
    };

    const handleSelectReceipt = (id: number) => {
        setSelectedReceipts(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };
    
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const allIds = new Set(filteredReceipts.map(r => r.id!));
            setSelectedReceipts(allIds);
        } else {
            setSelectedReceipts(new Set());
        }
    };
    
    const aggregatedTotal = useMemo(() => {
        return filteredReceipts.reduce((sum, r) => sum + calculateTotal(r), 0);
    }, [filteredReceipts]);

    const renderListView = () => (
        <div className="p-4 md:p-8">
            <h2 className={`text-3xl font-bold font-poppins mb-6 ${language === 'gu' ? 'font-gujarati' : ''}`}>{t('receiptList')}</h2>
            
            <div className="bg-white dark:bg-slate-800/50 p-6 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <input
                        type="text"
                        placeholder={t('searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                     <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                    Showing {filteredReceipts.length} receipts — Sum: {aggregatedTotal.toLocaleString(language === 'gu' ? 'gu-IN' : 'en-US', { style: 'currency', currency: 'INR' })}
                </div>
            </div>

            <div className="overflow-x-auto bg-white dark:bg-slate-800/50 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-black/20">
                <table className="w-full text-left">
                    <thead className="border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="p-4"><input type="checkbox" onChange={handleSelectAll} checked={selectedReceipts.size === filteredReceipts.length && filteredReceipts.length > 0} className="rounded" /></th>
                            <th className={`p-4 font-bold ${language === 'gu' ? 'font-gujarati' : ''}`}>{t('receiptId')}</th>
                            <th className={`p-4 font-bold ${language === 'gu' ? 'font-gujarati' : ''}`}>{t('customerName')}</th>
                            <th className={`p-4 font-bold ${language === 'gu' ? 'font-gujarati' : ''}`}>{t('date')}</th>
                            <th className={`p-4 font-bold text-right ${language === 'gu' ? 'font-gujarati' : ''}`}>{t('amount')}</th>
                            <th className={`p-4 font-bold text-center ${language === 'gu' ? 'font-gujarati' : ''}`}>{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReceipts.map(receipt => (
                            <tr key={receipt.id} className="border-b border-slate-200 dark:border-slate-700 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                <td className="p-4"><input type="checkbox" checked={selectedReceipts.has(receipt.id!)} onChange={() => handleSelectReceipt(receipt.id!)} className="rounded" /></td>
                                <td className="p-4 font-mono text-sm">{receipt.receiptId}</td>
                                <td className="p-4 font-medium">{receipt.customerName}</td>
                                <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{new Date(receipt.date).toLocaleDateString()}</td>
                                <td className="p-4 text-right font-semibold">{calculateTotal(receipt).toLocaleString(language === 'gu' ? 'gu-IN' : 'en-US', { style: 'currency', currency: 'INR' })}</td>
                                <td className="p-4">
                                    <div className="flex justify-center items-center gap-2">
                                        <button onClick={() => handleEditReceipt(receipt)} className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400" title={t('edit')}><Icon name="edit" /></button>
                                        <button onClick={() => handleDeleteRequest(receipt)} className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400" title={t('delete')}><Icon name="delete" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                         {filteredReceipts.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-center p-8 text-slate-500 dark:text-slate-400">
                                    No receipts found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <FAB onClick={handleNewReceipt} icon="add" label={t('newReceipt')} />
        </div>
    );
    
    return (
        <div className="flex flex-col h-screen">
            <Header onNavigate={(view) => setCurrentView(view)} />
            <main className="flex-grow overflow-y-auto bg-slate-100 dark:bg-slate-900">
                {currentView === 'list' && renderListView()}
                {currentView === 'form' && <ReceiptForm receipt={editingReceipt} onSave={handleSave} onCancel={() => setCurrentView('list')} />}
                {currentView === 'admin' && <AdminPanel />}
            </main>
             <Modal isOpen={!!receiptToDelete} onClose={() => setReceiptToDelete(null)} title={t('confirmDelete')}>
                <div>
                    <p className={`mb-6 ${language === 'gu' ? 'font-gujarati' : ''}`}>{t('confirmDelete')}</p>
                    <div className="flex justify-end gap-4">
                        <button onClick={() => setReceiptToDelete(null)} className={`px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 ${language === 'gu' ? 'font-gujarati' : ''}`}>{t('noCancel')}</button>
                        <button onClick={confirmDelete} className={`px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 ${language === 'gu' ? 'font-gujarati' : ''}`}>{t('yesDelete')}</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Dashboard;
