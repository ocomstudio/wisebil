// src/config/categories.ts

export const expenseCategories = [
    { name: "Alimentation", emoji: "🍔" },
    { name: "Transport", emoji: "🚗" },
    { name: "Logement", emoji: "🏠" },
    { name: "Factures", emoji: "🧾" },
    { name: "Santé", emoji: "💊" },
    { name: "Divertissement", emoji: "🎬" },
    { name: "Shopping", emoji: "🛍️" },
    { name: "Éducation", emoji: "🎓" },
    { name: "Famille", emoji: "👨‍👩‍👧‍👦" },
    { name: "Animaux", emoji: "🐾" },
    { name: "Autre", emoji: "➕" },
];

export const incomeCategories = [
    { name: "Salaire", emoji: "💰" },
    { name: "Vente", emoji: "📈" },
    { name: "Bonus", emoji: "🎁" },
    { name: "Cadeau", emoji: "🎉" },
    { name: "Remboursement", emoji: "💸" },
    { name: "Autre", emoji: "➕" },
];

export const allCategories = [...expenseCategories, ...incomeCategories];
