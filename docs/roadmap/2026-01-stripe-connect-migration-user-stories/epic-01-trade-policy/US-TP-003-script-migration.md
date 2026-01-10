# US-TP-003 : Script de migration des `trade_policy` existantes

> **Epic**: 1 - Trade Policy | **Priorité**: P1 | **Estimation**: 3 points

---

## 📋 Description

**En tant que** développeur backend,
**Je veux** un script de migration qui initialise les nouveaux champs pour les trade policies existantes,
**Afin de** garantir la cohérence des données après le déploiement du nouveau schéma.

---

## 🎯 Critères d'Acceptation

### Scénario 1 : Migration des trade policies existantes

```gherkin
Given des trade_policies existantes avec l'ancien champ donor_pays_fee
When j'exécute le script de migration
Then pour chaque trade_policy :
  | Condition                    | donor_pays_fee_project | donor_pays_fee_club | allow_donor_fee_choice |
  | donor_pays_fee = true        | true                   | true                | true                   |
  | donor_pays_fee = false       | true                   | false               | true                   |
  | donor_pays_fee = null        | true                   | false               | true                   |
```

### Scénario 2 : Idempotence du script

```gherkin
Given le script de migration a déjà été exécuté
When je l'exécute à nouveau
Then aucune modification n'est apportée aux données
And le script se termine sans erreur
```

### Scénario 3 : Logging de la migration

```gherkin
Given des trade_policies à migrer
When j'exécute le script
Then chaque migration est loggée avec :
  | Champ           | Exemple                      |
  | trade_policy_id | 12                           |
  | uuid            | abc-123-def                  |
  | ancien_valeur   | donor_pays_fee: true         |
  | nouvelles       | project: true, club: true    |
And un résumé final affiche le nombre de migrations effectuées
```

---

## 📐 Spécifications Techniques

### Script de migration

```typescript
// scripts/migrate-trade-policy-donor-pays-fee.ts

import { Core } from '@strapi/strapi';

export default async function migrateTradePolicies(strapi: Core.Strapi) {
  console.log('🔄 Début migration trade_policies...');
  
  const tradePolicies = await strapi.db.query('api::trade-policy.trade-policy').findMany({
    where: {
      $or: [
        { donor_pays_fee_project: null },
        { donor_pays_fee_club: null },
        { allow_donor_fee_choice: null },
      ],
    },
  });

  console.log(`📊 ${tradePolicies.length} trade_policies à migrer`);

  let migratedCount = 0;

  for (const tp of tradePolicies) {
    const oldValue = tp.donor_pays_fee ?? false;
    
    await strapi.db.query('api::trade-policy.trade-policy').update({
      where: { id: tp.id },
      data: {
        donor_pays_fee_project: oldValue ? true : true,  // Toujours true pour projets
        donor_pays_fee_club: oldValue ? true : false,    // Reprend l'ancienne valeur pour club
        allow_donor_fee_choice: true,                     // Toujours true par défaut
      },
    });

    console.log(`✅ Migré trade_policy #${tp.id} (${tp.uuid}): donor_pays_fee=${oldValue} → project=true, club=${oldValue}`);
    migratedCount++;
  }

  console.log(`\n🎉 Migration terminée: ${migratedCount} trade_policies migrées`);
}
```

### Exécution

```bash
# Via Strapi CLI
npm run strapi console
> const migrate = require('./scripts/migrate-trade-policy-donor-pays-fee');
> await migrate(strapi);

# Ou via un endpoint admin protégé (recommandé)
POST /api/admin/migrate/trade-policy-donor-pays-fee
Authorization: Bearer <admin_token>
```

### Rollback

```typescript
// scripts/rollback-trade-policy-donor-pays-fee.ts
export default async function rollback(strapi: Core.Strapi) {
  // Recalculer donor_pays_fee depuis les nouvelles valeurs
  const tradePolicies = await strapi.db.query('api::trade-policy.trade-policy').findMany();
  
  for (const tp of tradePolicies) {
    await strapi.db.query('api::trade-policy.trade-policy').update({
      where: { id: tp.id },
      data: {
        donor_pays_fee: tp.donor_pays_fee_project && tp.donor_pays_fee_club,
      },
    });
  }
}
```

---

## 🔗 Dépendances

| Type | US | Description |
|------|-----|-------------|
| Requiert | US-TP-001 | Nouveaux champs dans le schéma |

---

## ✅ Definition of Done

- [ ] Script de migration créé et testé en local
- [ ] Script testé sur la base de données staging
- [ ] Rollback script créé et testé
- [ ] Documentation d'exécution rédigée
- [ ] PR approuvée et mergée

---

## 📝 Notes

- Exécuter ce script APRÈS le déploiement du nouveau schéma (US-TP-001)
- Prévoir une sauvegarde de la base de données avant exécution en production
- Le script doit être exécuté UNE SEULE FOIS par environnement
