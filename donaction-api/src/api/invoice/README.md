# Service de Facturation

Ce service gère la création et la gestion des factures pour la plateforme Klubr.

## Méthodes

## `createInvoices(month, year)`

Génère des factures pour tous les clubs pour un mois et une année donnés.

- **Paramètres :**
  - `month` (number) : Le mois pour lequel générer les factures.
  - `year` (number) : L'année pour laquelle générer les factures.

- **Retourne :**
  - Un objet récapitulatif contenant les détails des factures générées, les erreurs et les factures ignorées.

_**Description**_

1. **Récupération des clubs** :

- Récupère tous les clubs (`klubrs`) qui ne sont pas exemptés de facturation.

2. **Initialisation des tableaux de messages** :

- Initialise trois tableaux pour stocker les messages de succès, d'erreur et les clubs sans dons.

3. **Boucle sur chaque club** :

- Pour chaque club, la méthode :
  - Génère une facture en appelant `createInvoiceForKlub`.
  - Ajoute des messages appropriés aux tableaux en fonction du résultat (succès, erreur, ou absence de dons).

4. **Génération du PDF de la facture** :

- Si la facture est générée avec succès, un PDF de la facture est créé.

5. **Envoi de la facture par email** :

- Envoie la facture générée au leader du club par email.

6. **Envoi du récapitulatif des factures** :

- Envoie un récapitulatif des factures générées aux administrateurs par email.

## `createInvoiceForKlub(klubr, month, year)`

Crée une facture pour un club spécifique pour un mois et une année donnés.

- **Paramètres :**
  - `klubr` (object) : Le club pour lequel créer la facture.
  - `month` (number) : Le mois pour lequel générer la facture.
  - `year` (number) : L'année pour laquelle générer la facture.

- **Retourne :**
  - Un objet contenant les détails de la facture créée, les dons et les montants.

_**Précisions**_

1. **Récupération des dons** :

- Appelle la méthode `getDonDuringPeriod` pour récupérer tous les dons pour le club (`klubr`) et les projets associés
  pendant la période spécifiée (mois et année).
- Les dons sont séparés en deux catégories : `donsForKlub` (dons directement pour le club) et `donsForProjects` (dons
  pour les projets du club).

2. **Calcul des montants** :

- Calcule le montant total des commissions (`commissionTotalAmount`) et des crédits (`creditTotalAmount`) à partir des
  dons récupérés.
- Calcule le montant hors taxes (`amountExcludingTax`) en soustrayant le total des crédits du total des commissions.
- Calcule la TVA (`VAT`) en appliquant le pourcentage de TVA défini dans la politique commerciale (
  `tradePolicy.VATPercentage`) au montant des commissions.
- Calcule le montant TTC (`amountIncludingTax`) en ajoutant la TVA au montant hors taxes.
- Calcule le nombre total de dons (`nbDonations`) en additionnant le nombre de dons pour le club et pour les projets.
- Calcule le panier moyen (`averageBasket`) en divisant le total des crédits par le nombre de dons, si ce nombre est
  supérieur à zéro.

## `getDonDuringPeriod(clubUuid, month, year)`

Récupère tous les dons pour un club spécifique pendant une période donnée.

- **Paramètres :**
  - `clubUuid` (string) : L'UUID du club.
  - `month` (number) : Le mois pour lequel récupérer les dons.
  - `year` (number) : L'année pour laquelle récupérer les dons.

- **Retourne :**
  - Un objet contenant des tableaux de dons pour le club et les projets.

### `getLastInvoiceNumber()`

Récupère le dernier numéro de facture généré.

- **Retourne :**
  - Une chaîne représentant le dernier numéro de facture.

## `sendInvoicesSummary(summary)`

Envoie un récapitulatif des factures générées aux administrateurs.

- **Paramètres :**
  - `summary` (object) : L'objet récapitulatif contenant les détails des factures générées.

## `sendInvoiceToKlubMemberLeader(klubr, summary)`

Envoie la facture générée au leader du club.

- **Paramètres :**
  - `klubr` (object) : Le club pour lequel la facture a été générée.
  - `summary` (object) : L'objet récapitulatif contenant les détails de la facture générée.

## `generateInvoicePDF(klubr, summary)`

Génère un PDF pour la facture créée.

- **Paramètres :**
  - `klubr` (object) : Le club pour lequel la facture a été générée.
  - `summary` (object) : L'objet récapitulatif contenant les détails de la facture générée.
