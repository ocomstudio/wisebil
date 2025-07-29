// src/ai/flows/index.ts
/**
 * @fileOverview This file re-exports all the AI flow functions
 * to ensure they are not tree-shaken by Next.js.
 */
'use server';

export * from './categorize-expense';
export * from './expense-assistant';
export * from './financial-summary';
