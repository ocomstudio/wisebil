// src/config/chart-of-accounts-data.ts

export interface Account {
    accountNumber: number;
    accountName: string;
    class: number;
    type: 'Débit' | 'Crédit';
}

export const syscohadaChartOfAccounts: Account[] = [
    // Classe 1 : Comptes de ressources durables
    { accountNumber: 1010, accountName: "Capital social", class: 1, type: "Crédit" },
    { accountNumber: 1061, accountName: "Réserves légales", class: 1, type: "Crédit" },
    { accountNumber: 1100, accountName: "Report à nouveau", class: 1, type: "Crédit" },
    { accountNumber: 1310, accountName: "Subventions d'équipement", class: 1, type: "Crédit" },
    { accountNumber: 1610, accountName: "Emprunts auprès des ets de crédit", class: 1, type: "Crédit" },

    // Classe 2 : Comptes de l'actif immobilisé
    { accountNumber: 2110, accountName: "Terrains", class: 2, type: "Débit" },
    { accountNumber: 2120, accountName: "Bâtiments", class: 2, type: "Débit" },
    { accountNumber: 2150, accountName: "Matériel et outillage", class: 2, type: "Débit" },
    { accountNumber: 2181, accountName: "Matériel de bureau et informatique", class: 2, type: "Débit" },
    { accountNumber: 2812, accountName: "Amortissements des bâtiments", class: 2, type: "Crédit" },
    
    // Classe 3 : Comptes de stocks
    { accountNumber: 3110, accountName: "Matières premières et fournitures", class: 3, type: "Débit" },
    { accountNumber: 3310, accountName: "Produits en cours", class: 3, type: "Débit" },
    { accountNumber: 3550, accountName: "Produits finis", class: 3, type: "Débit" },

    // Classe 4 : Comptes de tiers
    { accountNumber: 4011, accountName: "Fournisseurs", class: 4, type: "Crédit" },
    { accountNumber: 4111, accountName: "Clients", class: 4, type: "Débit" },
    { accountNumber: 4220, accountName: "Personnel, Rémunérations dues", class: 4, type: "Crédit" },
    { accountNumber: 4310, accountName: "Sécurité sociale et autres org. soc.", class: 4, type: "Crédit" },
    { accountNumber: 4421, accountName: "État, TVA facturée", class: 4, type: "Crédit" },
    { accountNumber: 4422, accountName: "État, TVA récupérable", class: 4, type: "Débit" },

    // Classe 5 : Comptes de trésorerie
    { accountNumber: 5210, accountName: "Banques", class: 5, type: "Débit" },
    { accountNumber: 5710, accountName: "Caisse", class: 5, type: "Débit" },
    { accountNumber: 5850, accountName: "Virements internes", class: 5, type: "Débit" },

    // Classe 6 : Comptes de charges des activités ordinaires
    { accountNumber: 6010, accountName: "Achats de marchandises", class: 6, type: "Débit" },
    { accountNumber: 6020, accountName: "Achats de matières premières", class: 6, type: "Débit" },
    { accountNumber: 6061, accountName: "Fournitures non stockables (eau, gaz, électricité)", class: 6, type: "Débit" },
    { accountNumber: 6132, accountName: "Locations", class: 6, type: "Débit" },
    { accountNumber: 6226, accountName: "Frais postaux et de télécommunications", class: 6, type: "Débit" },
    { accountNumber: 6410, accountName: "Salaires et appointements", class: 6, type: "Débit" },
    { accountNumber: 6451, accountName: "Cotisations à l'URSSAF", class: 6, type: "Débit" },
    { accountNumber: 6811, accountName: "Dotations aux amortissements d'exploitation", class: 6, type: "Débit" },

    // Classe 7 : Comptes de produits des activités ordinaires
    { accountNumber: 7010, accountName: "Ventes de marchandises", class: 7, type: "Crédit" },
    { accountNumber: 7020, accountName: "Ventes de produits finis", class: 7, type: "Crédit" },
    { accountNumber: 7060, accountName: "Prestations de services", class: 7, type: "Crédit" },
    { accountNumber: 7730, accountName: "Produits financiers", class: 7, type: "Crédit" },
];
