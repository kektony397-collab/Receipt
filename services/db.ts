
import Dexie, { type Table } from 'dexie';
import type { Receipt, AdminProfile } from '../types';
import { DB_NAME, DEFAULT_USERNAME, DEFAULT_PASSWORD } from '../constants';
import { localization } from './localization';

export class ReceiptBookDB extends Dexie {
    receipts!: Table<Receipt>;
    profile!: Table<AdminProfile>;

    constructor() {
        super(DB_NAME);
        this.version(1).stores({
            receipts: '++id, receiptId, date, customerName, totalAmount',
            profile: '++id, username'
        });
    }
}

export const db = new ReceiptBookDB();

db.on('populate', async (tx) => {
    const existingProfile = await tx.table('profile').where('username').equals(DEFAULT_USERNAME).first();
    if (!existingProfile) {
        await tx.table('profile').add({
            username: DEFAULT_USERNAME,
            passwordHash: DEFAULT_PASSWORD, // In a real app, hash this. For this example, storing plain.
            displayName: 'Administrator',
            organizationName: {
                en: localization.en.companyName,
                gu: localization.gu.companyName
            },
            address: {
                en: localization.en.companyAddress,
                gu: localization.gu.companyAddress
            },
            contact: {
                en: 'REG.NO',
                gu: 'REG.NO'
            },
            regNo: localization.gu.companyRegNo // Same for both for now
        } as AdminProfile);
    }
});

export const calculateTotal = (receipt: Omit<Receipt, 'id' | 'receiptId' | 'date'>): number => {
    const subtotal = receipt.items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    const taxAmount = (subtotal - receipt.discount) * (receipt.taxRate / 100);
    const grandTotal = subtotal - receipt.discount + taxAmount;
    return grandTotal > 0 ? grandTotal : 0;
};
