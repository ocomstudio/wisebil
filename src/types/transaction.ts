export interface Transaction {
    id: string;
    type: 'income' | 'expense';
    amount: number;
    description: string;
    category?: string;
    date: string;
    // Added to track who made the transaction in a company context
    member?: string; 
}
