
export type Language = 'en' | 'gu';

export interface ReceiptItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
}

export interface Receipt {
    id?: number;
    receiptId: string;
    date: string;
    customerName: string;
    customerContact: string;
    items: ReceiptItem[];
    taxRate: number; // Percentage
    discount: number; // Fixed amount
    paymentMethod: 'Cash' | 'Card' | 'Online';
    notes: string;
}

export interface AdminProfile {
    id?: number;
    username: string;
    passwordHash: string; // Note: Hashing on client-side is for obfuscation, not security.
    displayName: string;
    organizationName: { [key in Language]: string };
    address: { [key in Language]: string };
    contact: { [key in Language]: string };
    regNo: string;
}
