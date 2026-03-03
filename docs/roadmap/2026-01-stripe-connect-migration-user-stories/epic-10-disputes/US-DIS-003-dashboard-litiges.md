# US-DIS-003 : Dashboard admin - Section litiges en cours

> **Epic**: 10 - Disputes | **Priorité**: P2 | **Estimation**: 5 points

## 📋 Description

Créer une section dans le dashboard admin pour visualiser et gérer les litiges en cours.

## 🎯 Critères d'Acceptation

- Liste des litiges avec filtres (statut, association, date)
- Détail avec don, donateur, motif, deadline
- Actions : soumettre preuves, marquer résolu
- Indicateurs : nombre litiges ouverts, taux de victoire

## 📐 Endpoints nécessaires

```
GET /api/disputes - Liste paginée
GET /api/disputes/:id - Détail
POST /api/disputes/:id/evidence - Soumettre preuves
```

## ✅ Definition of Done

- [ ] Composant liste
- [ ] Composant détail
- [ ] Endpoints API
- [ ] Filtres et pagination
- [ ] PR approuvée et mergée
