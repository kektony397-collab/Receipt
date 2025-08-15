import React, { useState, useEffect, useMemo } from 'react';
import type { Receipt, ReceiptItem } from '../types';
import { db, calculateTotal } from '../services/db';
import { useLocalization } from '../hooks/useLocalization';
import Icon from './common/Icon';
import ReceiptView from './ReceiptView';
import Modal from './common/Modal';
import { useLiveQuery } from 'dexie-react-hooks';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ReceiptFormProps {
    receipt: Receipt | null;
    onSave: () => void;
    onCancel: () => void;
}

const ReceiptForm: React.FC<ReceiptFormProps> = ({ receipt, onSave, onCancel }) => {
    const { t, language } = useLocalization();
    const profile = useLiveQuery(() => db.profile.toCollection().first());
    
    const initialReceiptState: Receipt = useMemo(() => ({
        receiptId: `RCPT-${Date.now()}`,
        date: new Date().toISOString(),
        customerName: '',
        customerContact: '',
        items: [{ id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0 }],
        taxRate: 0,
        discount: 0,
        paymentMethod: 'Cash',
        notes: ''
    }), []);
    
    const [currentReceipt, setCurrentReceipt] = useState<Receipt>(receipt || initialReceiptState);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const receiptPreviewRef = React.useRef<HTMLDivElement>(null);

    const inputFieldClasses = "w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500";
    const inputFieldDisabledClasses = "w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400";
    
    useEffect(() => {
        setCurrentReceipt(receipt || initialReceiptState);
    }, [receipt, initialReceiptState]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCurrentReceipt(prev => ({ ...prev, [name]: name === 'taxRate' || name === 'discount' ? parseFloat(value) || 0 : value }));
    };

    const handleItemChange = (id: string, field: keyof Omit<ReceiptItem, 'id'>, value: string | number) => {
        setCurrentReceipt(prev => ({
            ...prev,
            items: prev.items.map(item =>
                item.id === id ? { ...item, [field]: typeof value === 'string' ? value : (parseFloat(value.toString()) || 0) } : item
            )
        }));
    };

    const addItem = () => {
        setCurrentReceipt(prev => ({
            ...prev,
            items: [...prev.items, { id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0 }]
        }));
    };

    const removeItem = (id: string) => {
        setCurrentReceipt(prev => ({
            ...prev,
            items: prev.items.filter(item => item.id !== id)
        }));
    };

    const handleSave = async () => {
        if (currentReceipt.id) {
            const { id, ...dataToUpdate } = currentReceipt;
            await db.receipts.update(id, dataToUpdate);
        } else {
            await db.receipts.add(currentReceipt);
        }
        onSave();
    };

    const handleDownloadPdf = async () => {
        const element = receiptPreviewRef.current;
        if (!element) return;
        
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Receipt-${currentReceipt.receiptId}.pdf`);
    };

    const total = useMemo(() => calculateTotal(currentReceipt), [currentReceipt]);
    const subtotal = useMemo(() => currentReceipt.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0), [currentReceipt.items]);

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl">
                <h2 className={`text-3xl font-bold mb-6 ${language === 'gu' ? 'font-gujarati' : ''}`}>{receipt ? t('edit') : t('newReceipt')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('receiptId')}</label>
                        <input type="text" value={currentReceipt.receiptId} readOnly className={inputFieldDisabledClasses} />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('date')}</label>
                        <input type="datetime-local" name="date" value={currentReceipt.date.substring(0, 16)} onChange={handleChange} className={inputFieldClasses} />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('customerName')}</label>
                        <input type="text" name="customerName" value={currentReceipt.customerName} onChange={handleChange} className={inputFieldClasses} required/>
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('customerContact')}</label>
                        <input type="text" name="customerContact" value={currentReceipt.customerContact} onChange={handleChange} className={inputFieldClasses} />
                    </div>
                </div>

                <div className="mt-8">
                    <h3 className={`text-xl font-bold mb-4 ${language === 'gu' ? 'font-gujarati' : ''}`}>{t('items')}</h3>
                    <div className="space-y-4">
                        {currentReceipt.items.map((item, index) => (
                            <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                                <input type="text" placeholder={t('description')} value={item.description} onChange={e => handleItemChange(item.id, 'description', e.target.value)} className={`${inputFieldClasses} col-span-5`} />
                                <input type="number" placeholder={t('quantity')} value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', e.target.value)} className={`${inputFieldClasses} col-span-2`} />
                                <input type="number" placeholder={t('unitPrice')} value={item.unitPrice} onChange={e => handleItemChange(item.id, 'unitPrice', e.target.value)} className={`${inputFieldClasses} col-span-3`} />
                                <div className="col-span-1 text-right font-medium">{(item.quantity * item.unitPrice).toLocaleString(language === 'gu' ? 'gu-IN' : 'en-US')}</div>
                                <button onClick={() => removeItem(item.id)} className="col-span-1 text-red-500 hover:text-red-700"><Icon name="delete" /></button>
                            </div>
                        ))}
                    </div>
                    <button onClick={addItem} className={`mt-4 flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold ${language === 'gu' ? 'font-gujarati' : ''}`}><Icon name="add_circle" /> {t('addItem')}</button>
                </div>
                
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('paymentMethod')}</label>
                        <select name="paymentMethod" value={currentReceipt.paymentMethod} onChange={handleChange} className={inputFieldClasses}>
                            <option value="Cash">{t('cash')}</option>
                            <option value="Card">{t('card')}</option>
                            <option value="Online">{t('online')}</option>
                        </select>
                         <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 mt-4">{t('notes')}</label>
                        <textarea name="notes" value={currentReceipt.notes} onChange={handleChange} className={`${inputFieldClasses} h-24`}></textarea>
                    </div>

                    <div className="flex flex-col items-end gap-2 text-lg">
                        <div className="flex justify-between w-full max-w-xs"><span>{t('subtotal')}:</span><span>{subtotal.toLocaleString(language === 'gu' ? 'gu-IN' : 'en-US', { style: 'currency', currency: 'INR' })}</span></div>
                        <div className="flex justify-between items-center w-full max-w-xs">
                             <label htmlFor="taxRate">{t('taxRate')}:</label>
                             <input type="number" id="taxRate" name="taxRate" value={currentReceipt.taxRate} onChange={handleChange} className={`${inputFieldClasses} w-20 text-right`} />
                        </div>
                         <div className="flex justify-between items-center w-full max-w-xs">
                             <label htmlFor="discount">{t('discount')}:</label>
                             <input type="number" id="discount" name="discount" value={currentReceipt.discount} onChange={handleChange} className={`${inputFieldClasses} w-20 text-right`} />
                        </div>
                        <div className="flex justify-between w-full max-w-xs mt-2 pt-2 border-t border-slate-300 dark:border-slate-600 font-bold text-2xl"><span>{t('grandTotal')}:</span><span>{total.toLocaleString(language === 'gu' ? 'gu-IN' : 'en-US', { style: 'currency', currency: 'INR' })}</span></div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-4">
                    <button onClick={onCancel} className={`px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 ${language === 'gu' ? 'font-gujarati' : ''}`}>{t('cancel')}</button>
                    <button onClick={() => setIsPreviewOpen(true)} className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 ${language === 'gu' ? 'font-gujarati' : ''}`}><Icon name="visibility"/> Preview & PDF</button>
                    <button onClick={handleSave} className={`px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-bold ${language === 'gu' ? 'font-gujarati' : ''}`}>{t('save')}</button>
                </div>
            </div>
            
            <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title={t('receiptDetails')}>
                <div className="max-h-[70vh] overflow-y-auto">
                    {profile && <ReceiptView ref={receiptPreviewRef} receipt={currentReceipt} profile={profile} language={language} isForPdf={false} />}
                </div>
                <div className="mt-6 flex justify-end">
                    <button onClick={handleDownloadPdf} className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 ${language === 'gu' ? 'font-gujarati' : ''}`}><Icon name="picture_as_pdf"/> Download PDF</button>
                </div>
                {/* Hidden element for PDF generation with fixed width */}
                 <div className="hidden">
                    {profile && <ReceiptView ref={receiptPreviewRef} receipt={currentReceipt} profile={profile} language={language} isForPdf={true} />}
                </div>
            </Modal>
        </div>
    );
};

export default ReceiptForm;