# Gestion des remboursements exceptionnels avec reçus fiscaux

## Le problème fondamental

Un reçu fiscal (Cerfa 11580*04) une fois émis crée une obligation légale :
- Le donateur peut l'utiliser pour sa réduction d'impôt (66% ou 75%)
- L'association a déclaré ce don à l'administration fiscale
- En cas de remboursement, il y a un risque de **double avantage** (remboursement + réduction d'impôt)

---

## Solutions à mettre en place

### 1. Reçu fiscal correctif / annulatif

Créer un document complémentaire (pas une modification du reçu original) :

```
┌─────────────────────────────────────────┐
│  ATTESTATION D'ANNULATION DE DON        │
│  Réf. reçu original : RF-2024-00123     │
│  Montant annulé : 150,00 €              │
│  Motif : Remboursement pour [raison]    │
│  Date d'annulation : XX/XX/XXXX         │
└─────────────────────────────────────────┘
```

Le reçu original reste **immutable** dans la base, mais on crée une nouvelle entrée liée qui l'invalide.

---

### 2. Workflow de remboursement exceptionnel

```
Demande de remboursement
        │
        ▼
┌───────────────────┐
│ Vérification :    │
│ - Reçu émis ?     │
│ - Déjà déclaré ?  │
└───────────────────┘
        │
        ▼ (si reçu émis)
┌───────────────────────────────────────┐
│ Conditions obligatoires :             │
│ 1. Engagement écrit du donateur       │
│    à ne pas utiliser le reçu          │
│ 2. OU retour du reçu original         │
│ 3. OU déclaration sur l'honneur       │
└───────────────────────────────────────┘
        │
        ▼
┌───────────────────┐
│ Validation manuelle│
│ (admin association)│
└───────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│ Actions système :                     │
│ - Création attestation annulation     │
│ - Notification administration fiscale │
│   (selon montant/contexte)            │
│ - Remboursement effectif              │
└───────────────────────────────────────┘
```

---

### 3. Modèle de données suggéré

```sql
-- Table des annulations/corrections
CREATE TABLE receipt_cancellations (
    id UUID PRIMARY KEY,
    original_receipt_id UUID REFERENCES tax_receipts(id),
    cancellation_type ENUM('fraud', 'legal_dispute', 'donor_request', 'payment_error'),
    reason TEXT NOT NULL,
    cancelled_amount DECIMAL(10,2),
    
    -- Preuves et engagements
    donor_declaration_signed BOOLEAN DEFAULT FALSE,
    donor_declaration_date TIMESTAMP,
    original_receipt_returned BOOLEAN DEFAULT FALSE,
    
    -- Audit trail
    requested_by UUID,
    approved_by UUID,
    approved_at TIMESTAMP,
    
    -- Notification fiscale
    tax_authority_notified BOOLEAN DEFAULT FALSE,
    notification_reference VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 4. Obligations légales à rappeler

Dans l'interface, lors d'un remboursement avec reçu émis :

> ⚠️ **Attention** : Un reçu fiscal a été émis pour ce don.
> 
> En cas de remboursement, le donateur s'engage à :
> - Ne pas utiliser ce reçu pour sa déclaration d'impôts
> - Ou, s'il l'a déjà utilisé, à régulariser sa situation auprès de l'administration fiscale
> 
> L'association conserve une trace de cette annulation et peut être amenée à la communiquer aux services fiscaux.

---

### 5. Cas particuliers

| Situation | Action recommandée |
|-----------|-------------------|
| **Fraude avérée** | Signalement TRACFIN si > 10 000€, annulation + blocage donateur |
| **Litige juridique** | Gel du remboursement jusqu'à décision, conservation preuves |
| **Erreur de paiement** | Remboursement rapide + annulation reçu si non encore déclaré |
| **Rétractation (14j)** | Annulation simple si reçu pas encore généré |

---

## Points clés à retenir

1. **Immutabilité** : Ne jamais modifier un reçu fiscal existant, créer un document d'annulation lié
2. **Traçabilité** : Conserver toutes les preuves et engagements du donateur
3. **Engagement donateur** : Obtenir une déclaration écrite avant tout remboursement
4. **Notification fiscale** : Selon le montant et le contexte, informer l'administration
5. **Audit trail** : Logger toutes les actions avec horodatage et acteurs
