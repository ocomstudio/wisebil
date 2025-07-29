// src/types/savings-goal.ts
export interface SavingsGoal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    emoji?: string;
}
