export interface Transaction {
    id: string;
    type: 'income' | 'expense';
    amount: number;
    description: string;
    category?: string;
    date: string;
    member?: string; // Name of the member who added the transaction
}
