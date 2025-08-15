
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
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    return (
        <div ref={ref} className={`p-8 bg-white text-black max-w-2xl mx-auto ${isForPdf ? 'w-[800px]' : ''}`}>
            <header className={`text-center border-b-2 border-black pb-4 mb-6 ${fontClass}`}>
                <h1 className="text-3xl font-bold text-blue-800">{profile?.organizationName?.[language]}</h1>
                <p className="text-lg font-semibold">{profile?.address?.en.includes("CO-OP") ? profile?.organizationName?.[language === 'en' ? 'gu' : 'en'].split(' ').slice(3).join(' ') : ""}</p>
                <p className="text-sm">{profile?.address?.[language]}</p>
                <p className="text-sm font-bold">{profile?.regNo}</p>
            </header>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <strong className={fontClass}>{t('Receipt ID', 'રસીદ ID')}:</strong> {receipt.receiptId}
                </div>
                <div className="text-right">
                    <strong className={fontClass}>{t('Date', 'તારીખ')}:</strong> {formatDate(receipt.date)}
                </div>
                <div>
                    <strong className={fontClass}>{t('Customer Name', 'ગ્રાહકનું નામ')}:</strong> {receipt.customerName}
                </div>
                <div className="text-right">
                    <strong className={fontClass}>{t('Block/Phone No.', 'બ્લોક/ફોન નંબર')}:</strong> {receipt.customerContact}
                </div>
            </div>

            <table className="w-full mb-6">
                <thead className="bg-slate-100">
                    <tr>
                        <th className={`p-2 text-left font-bold border-b-2 border-black ${fontClass}`}>{t('Description', 'વર્ણન')}</th>
                        <th className={`p-2 text-right font-bold border-b-2 border-black ${fontClass}`}>{t('Quantity', 'જથ્થો')}</th>
                        <th className={`p-2 text-right font-bold border-b-2 border-black ${fontClass}`}>{t('Unit Price', 'એકમ ભાવ')}</th>
                        <th className={`p-2 text-right font-bold border-b-2 border-black ${fontClass}`}>{t('Total', 'કુલ')}</th>
                    </tr>
                </thead>
                <tbody>
                    {receipt.items.map(item => (
                        <tr key={item.id}>
                            <td className="p-2 border-b">{item.description}</td>
                            <td className="p-2 text-right border-b">{item.quantity.toLocaleString(language === 'gu' ? 'gu-IN' : 'en-US')}</td>
                            <td className="p-2 text-right border-b">{item.unitPrice.toLocaleString(language === 'gu' ? 'gu-IN' : 'en-US', { style: 'currency', currency: 'INR' })}</td>
                            <td className="p-2 text-right border-b">{(item.quantity * item.unitPrice).toLocaleString(language === 'gu' ? 'gu-IN' : 'en-US', { style: 'currency', currency: 'INR' })}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-end">
                <div className="w-full max-w-xs">
                    <div className="grid grid-cols-2 gap-2 mb-1">
                        <strong className={fontClass}>{t('Subtotal', 'પેટાટોટલ')}:</strong>
                        <span className="text-right">{subtotal.toLocaleString(language === 'gu' ? 'gu-IN' : 'en-US', { style: 'currency', currency: 'INR' })}</span>
                    </div>
                    {receipt.discount > 0 && (
                        <div className="grid grid-cols-2 gap-2 mb-1">
                            <strong className={fontClass}>{t('Discount', 'ડિસ્કાઉન્ટ')}:</strong>
                            <span className="text-right text-red-600">- {receipt.discount.toLocaleString(language === 'gu' ? 'gu-IN' : 'en-US', { style: 'currency', currency: 'INR' })}</span>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 mb-1">
                        <strong className={fontClass}>{t('Tax', 'કર')} ({receipt.taxRate}%):</strong>
                        <span className="text-right">{taxAmount.toLocaleString(language === 'gu' ? 'gu-IN' : 'en-US', { style: 'currency', currency: 'INR' })}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t-2 border-black">
                        <strong className={`text-xl ${fontClass}`}>{t('Grand Total', 'મહાન કુલ')}:</strong>
                        <span className="text-right text-xl font-bold">{total.toLocaleString(language === 'gu' ? 'gu-IN' : 'en-US', { style: 'currency', currency: 'INR' })}</span>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                {receipt.notes && (
                    <div>
                        <strong className={fontClass}>{t('Notes', 'નોંધો')}:</strong>
                        <p className="text-sm italic">{receipt.notes}</p>
                    </div>
                )}
                 <div className="mt-2">
                    <strong className={fontClass}>{t('Payment Method', 'ચુકવણી પદ્ધતિ')}:</strong>
                    <span> {receipt.paymentMethod}</span>
                </div>
            </div>

            <footer className="mt-16 text-center text-sm text-slate-500">
                <p className="mt-8 pt-8 border-t">{t('Authorized Signature', 'અધિકૃત સહી')}</p>
                <p className="mt-4">{t('Thank you for your business!', 'તમારા વ્યવસાય બદલ આભાર!')}</p>
            </footer>
        </div>
    );
});

export default ReceiptView;
