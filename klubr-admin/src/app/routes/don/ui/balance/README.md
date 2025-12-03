# Balance des dons

## Club

Cette section regroupe tous les dons effectués pour le fonctionnement du Klub.
Les dons sont regroupés par mois (par facture).

1. ##### Le montant total des dons pour le mois en cours, s'il y en a. (Dons reçus, non encore facturés)

Requête: `GET /api/klub-dons/received-dons/`

Paramètres:

```json
{
  "populate[0]": "klubDonateur.logo",
  "populate[1]": "klubDonateur.avatar",
  "populate[2]": "klub_projet",
  "populate[3]": "klubr.logo",
  "sort[0]": "createdAt: desc",
  "filters[klub_projet][$null]": true,
  "filters[invoice][$null]": true,
  "filters[statusPaiment]": "success",
  "pagination[page]": 1,
  "pagination[pageSize]": 100
}
  ```

Attention: Point de vigileance concernant la pagination par 100 car les informations affichées sont caculées sur la base des 100 premiers dons reçus.

2. ##### Le montant total des dons pour les mois précédent.
   Requête: `GET /api/invoices/`

Paramètres:

```json
{
  "filters[invoice_lines][reference][$eq]": "DONS CLUB",
  "filters[invoice_lines][isCreditLine][$eq]": true,
  "populate[0]": "invoice_lines.klub_projet",
  "populate[1]": "klubr.logo",
  "sort[0]": "createdAt: desc",
  "pagination[page]": 1,
  "pagination[pageSize]": 10
}
  ```

## Projets

Cette section regroupe tous les dons effectués, regroupés par projets, filtré par mois.

1. ##### Le montant total des dons pour le mois en cours, même s'il n'y a pas eu de dons. (Dons reçus, non encore facturés)

Les informations affichées sont basées sur les données du projet (montantTotalDonations & nbDons).
Requête: `GET /api/klub-projets/`

Paramètres:

```json
{
  "filters[klubr][uuid][$eq]": "a58e498f-e7ef-4261-b2a7-86cd863cb9dd",
  "filters[isTemplate][$eq]": false,
  "filters[invoice_line][$null]": true,
  "filters[dateLimiteFinancementProjet][$gte]": "2024-11-01",
  "filters[status][$eq]": "published",
  "filters[status][$eq]": "closed",
  "populate[0]": "invoice_line.invoice",
  "sort[0]": "dateLimiteFinancementProjet:asc",
  "pagination[page]": 1,
  "pagination[pageSize]": 10
}
  ```

2. ##### Le montant total des dons pour le mois sélectionné, s'il y en a. (Dons reçus et facturés)

Requête: `GET /api/klub-projets/`

Paramètres:

```json
{
  "filters[klubr][uuid][$eq]": "a58e498f-e7ef-4261-b2a7-86cd863cb9dd",
  "filters[isTemplate][$eq]": false,
  "filters[invoice_line][invoice][billingPeriodSmall][$eq]": "2024/09",
  "populate[0]": "invoice_line.invoice",
  "sort[0]": "dateLimiteFinancementProjet:asc",
  "pagination[page]": 1,
  "pagination[pageSize]": 10
}
  ```

## Factures

Cette section affiche toutes les factures pour le Klub.

Requête: `GET /api/invoices/`

Paramètres:

```json
{
  "populate[0]": "invoice_lines.klub_projet",
  "populate[1]": "klubr.logo",
  "sort[0]": "createdAt:desc",
  "pagination[page]": 1,
  "pagination[pageSize]": 10
}
  ```
