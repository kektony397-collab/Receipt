import React from 'react';
import type { Receipt, AdminProfile, Language } from '../types';
import { calculateTotal } from '../services/db';

interface ReceiptViewProps {
    receipt: Receipt;
    profile: AdminProfile | null;
    language: Language;
    isForPdf?: boolean;
}

const ReceiptView = React.forwardRef<HTMLDivElement, ReceiptViewProps>(({ receipt, profile, language, isForPdf = false }, ref) => {
    
    const t = (textEn: string, textGu: string) => language === 'gu' ? textGu : textEn;
    const fontClass = language === 'gu' ? 'font-gujarati' : '';

    const subtotal = receipt.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const taxAmount = (subtotal - receipt.discount) * (receipt.taxRate / 100);
    const total = calculateTotal(receipt);
    
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString(language === 'gu' ? 'gu-IN' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }

    return (
        <div ref={ref} className={`bg-white text-gray-800 font-sans mx-auto ${isForPdf ? 'w-[210mm] min-h-[297mm] p-10 shadow-none' : 'p-6'}`}>
            <header className="flex justify-between items-start pb-6 border-b-2 border-gray-200">
                <div className={`space-y-1 ${fontClass}`}>
                    <h1 className="text-3xl font-bold text-blue-700 font-poppins">{profile?.organizationName?.[language]}</h1>
                    <p className="text-sm text-gray-600">{profile?.address?.en.includes("CO-OP") ? profile?.organizationName?.[language === 'en' ? 'gu' : 'en'].split(' ').slice(3).join(' ') : ""}</p>
                    <p className="text-sm text-gray-600">{profile?.address?.[language]}</p>
                    <p className="text-sm font-semibold text-gray-700">{profile?.regNo}</p>
                </div>
                <div className="text-right flex-shrink-0">
                    <h2 className={`text-4xl font-bold uppercase text-gray-400 tracking-widest font-poppins`}>{t('Receipt', 'રસીદ')}</h2>
                    <p className="text-sm text-gray-600 mt-2"><strong className={fontClass}>{t('Receipt ID', 'રસીદ ID')}:</strong> {receipt.receiptId}</p>
                    <p className="text-sm text-gray-600"><strong className={fontClass}>{t('Date', 'તારીખ')}:</strong> {formatDate(receipt.date)}</p>
                </div>
            </header>

            <section className="my-8 grid grid-cols-2 gap-8">
                <div className={`p-4 bg-slate-50 rounded-lg border border-slate-200 ${fontClass}`}>
                    <h3 className="text-sm font-bold text-slate-500 uppercase mb-2 tracking-wider">{t('Billed To', 'ગ્રાહક')}</h3>
                    <p className="font-bold text-lg">{receipt.customerName}</p>
                    {receipt.customerContact && <p className="text-slate-600">{receipt.customerContact}</p>}
                </div>
                <div className={`p-4 bg-slate-50 rounded-lg border border-slate-200 text-right ${fontClass}`}>
                    <h3 className="text-sm font-bold text-slate-500 uppercase mb-2 tracking-wider">{t('Payment Method', 'ચુકવણી પદ્ધતિ')}</h3>
                    <p className="font-bold text-lg">{receipt.paymentMethod}</p>
                </div>
            </section>

            <section>
                <table className="w-full">
                    <thead className="border-b-2 border-slate-300">
                        <tr>
                            <th className={`p-3 text-left font-bold text-sm uppercase text-slate-600 tracking-wider ${fontClass}`}>{t('Description', 'વર્ણન')}</th>
                            <th className={`p-3 text-right font-bold text-sm uppercase text-slate-600 tracking-wider ${fontClass}`}>{t('Quantity', 'જથ્થો')}</th>
                            <th className={`p-3 text-right font-bold text-sm uppercase text-slate-600 tracking-wider ${fontClass}`}>{t('Unit Price', 'એકમ ભાવ')}</th>
                            <th className={`p-3 text-right font-bold text-sm uppercase text-slate-600 tracking-wider ${fontClass}`}>{t('Total', 'કુલ')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {receipt.items.map(item => (
                            <tr key={item.id} className="border-b border-slate-100 last:border-none">
                                <td className="p-3 align-top">{item.description}</td>
                                <td className="p-3 text-right align-top">{item.quantity.toLocaleString(language === 'gu' ? 'gu-IN' : 'en-US')}</td>
                                <td className="p-3 text-right align-top">{item.unitPrice.toLocaleString(language === 'gu' ? 'gu-IN' : 'en-US', { style: 'currency', currency: 'INR' })}</td>
                                <td className="p-3 text-right font-semibold align-top">{(item.quantity * item.unitPrice).toLocaleString(language === 'gu' ? 'gu-IN' : 'en-US', { style: 'currency', currency: 'INR' })}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section className="flex justify-end mt-8">
                <div className="w-full max-w-sm space-y-2 text-gray-700">
                    <div className="flex justify-between">
                        <strong className={fontClass}>{t('Subtotal', 'પેટાટોટલ')}:</strong>
                        <span>{subtotal.toLocaleString(language === 'gu' ? 'gu-IN' : 'en-US', { style: 'currency', currency: 'INR' })}</span>
                    </div>
                    {receipt.discount > 0 && (
                        <div className="flex justify-between">
                            <strong className={fontClass}>{t('Discount', 'ડિસ્કાઉન્ટ')}:</strong>
                            <span className="text-red-600">- {receipt.discount.toLocaleString(language === 'gu' ? 'gu-IN' : 'en-US', { style: 'currency', currency: 'INR' })}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <strong className={fontClass}>{t('Tax', 'કર')} ({receipt.taxRate}%):</strong>
                        <span>{taxAmount.toLocaleString(language === 'gu' ? 'gu-IN' : 'en-US', { style: 'currency', currency: 'INR' })}</span>
                    </div>
                    <div className="flex justify-between mt-3 pt-3 border-t-2 border-black text-2xl font-bold text-black">
                        <strong className={fontClass}>{t('Grand Total', 'મહાન કુલ')}:</strong>
                        <span>{total.toLocaleString(language === 'gu' ? 'gu-IN' : 'en-US', { style: 'currency', currency: 'INR' })}</span>
                    </div>
                </div>
            </section>

            <footer className={`mt-16 pt-8 border-t border-gray-200 ${isForPdf ? '' : 'mb-8'}`}>
                {receipt.notes && (
                    <div className="mb-8">
                        <strong className={`${fontClass} text-sm text-gray-500 uppercase tracking-wider`}>{t('Notes', 'નોંધો')}:</strong>
                        <p className="text-sm italic text-gray-600 mt-1">{receipt.notes}</p>
                    </div>
                )}
                <div className="flex justify-between items-end">
                    <div className="text-sm text-gray-500">
                        <p className={`font-bold ${fontClass}`}>{t('Thank you for your business!', 'તમારા વ્યવસાય બદલ આભાર!')}</p>
                    </div>
                    <div className="w-48 text-center">
                        <div className="border-b border-gray-400 h-12"></div>
                        <p className={`text-sm text-gray-600 mt-2 ${fontClass}`}>{t('Authorized Signature', 'અધિકૃત સહી')}</p>
                    </div>
                </div>
            </footer>
        </div>
    );
});

export default ReceiptView;
