# DONACTION — Wireframe Homepage v1.1

> **Document de conception** | Date : 21 janvier 2026
> **Tonalité** : Dynamique, sportive, moderne
> **Objectif principal** : Inscription des associations sportives

---

## ⚠️ CONSIGNES D'IMPLÉMENTATION

### Route & Coexistence
- **Route** : `/new-hp` (nouvelle homepage)
- **Ancienne homepage** : Conserver intacte sur `/`
- **Migration** : Après validation, inverser les routes

### Composants
- **NE PAS** modifier les composants existants de l'ancienne homepage
- **CRÉER** de nouveaux composants dans `donaction-frontend/src/layouts/partials/newHomepage/`
- Préfixer les nouveaux composants : `NewHp*` (ex: `NewHpHero`, `NewHpFeatures`)

### Responsive
- **Mobile-first** : Design 100% responsive
- **Breakpoints** : Suivre les conventions Tailwind (`sm`, `md`, `lg`, `xl`)
- **Tester** : Mobile (< 768px), Tablet (768px-1024px), Desktop (> 1024px)

---

## 🎨 Design System Rappel

| Élément | Valeur |
|---------|--------|
| Couleur primaire | `#73cfa8` (vert DONACTION) |
| Couleur secondaire | `#fb9289` (corail) |
| Couleur accent | À définir (bleu sportif ?) |
| Typographie titres | Sans-serif bold, moderne |
| Typographie corps | Sans-serif lisible |

---

## 📐 Structure Globale

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER (sticky)                                                │
├─────────────────────────────────────────────────────────────────┤
│  1. HERO SECTION                                                │
├─────────────────────────────────────────────────────────────────┤
│  2. BANDEAU RÉASSURANCE                                         │
├─────────────────────────────────────────────────────────────────┤
│  3. SECTION "POURQUOI DONACTION"                                │
├─────────────────────────────────────────────────────────────────┤
│  4. DÉMO WIDGET DE DON                                          │
├─────────────────────────────────────────────────────────────────┤
│  5. PARCOURS D'INSCRIPTION (4 étapes)                           │
├─────────────────────────────────────────────────────────────────┤
│  6. FONCTIONNALITÉS CLÉS                                        │
├─────────────────────────────────────────────────────────────────┤
│  7. PROJETS À LA UNE                                            │
├─────────────────────────────────────────────────────────────────┤
│  8. CALCULATEUR D'IMPACT FISCAL                                 │
├─────────────────────────────────────────────────────────────────┤
│  9. TARIFICATION                                                │
├─────────────────────────────────────────────────────────────────┤
│  10. SECTION FÉDÉRATIONS                                        │
├─────────────────────────────────────────────────────────────────┤
│  11. FAQ                                                        │
├─────────────────────────────────────────────────────────────────┤
│  12. CTA FINAL                                                  │
├─────────────────────────────────────────────────────────────────┤
│  FOOTER                                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔝 HEADER (Navigation)

**Comportement** : Sticky, fond transparent → blanc au scroll

> **⚠️ IMPORTANT** : Réutiliser la logique du header existant (`donaction-frontend/src/layouts/partials/common/header/`)
> ou créer un nouveau composant `NewHpHeader` qui reprend les mêmes fonctionnalités.

### Fonctionnalités obligatoires (identiques à l'actuel)

**Navigation principale :**
- Logo DONACTION (lien vers `/`)
- Lien "Le mécénat" → `/mecenat`
- Lien "Contact" → `/contact`

**État non connecté :**
```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  [LOGO]    Le mécénat   Contact     [Mon espace club ▼]   [Connexion]  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```
- Dropdown "Mon espace club" avec :
  - Accéder à mon club → `/admin`
  - Inscrire mon Club → `/new-club`

**État connecté (reprendre `clientController.tsx`) :**
```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  [LOGO]    Le mécénat   Contact        [Avatar + Nom utilisateur ▼]    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```
- Dropdown utilisateur connecté :
  - **En-tête** : Avatar + Nom + Email
  - **Mon Espace Club** → `/admin` (si `klubr_membres.length > 0`)
  - **Inscrire mon Club** → `/new-club` (si `role.type === 'authenticated'`)
  - **Paramètres** → `/profile`
  - **Mes dons** → `/mes-dons`
  - **Se Déconnecter** (action logout)

**Navigation mobile** : Menu hamburger avec les mêmes éléments (drawer latéral)
- Reprendre la logique de `mobileDrawer.tsx`
- Même structure de menu accordéon pour l'utilisateur connecté

---

## 1️⃣ HERO SECTION

**Objectif** : Capter l'attention, clarifier la proposition de valeur, double CTA

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ┌─────────────────────────────────┐  ┌───────────────────────────────┐ │
│  │                                 │  │                               │ │
│  │  🏅 LA COLLECTE DE DONS         │  │    [IMAGE/ILLUSTRATION]       │ │
│  │     PENSÉE POUR LE SPORT        │  │                               │ │
│  │                                 │  │    Équipe sportive célébrant  │ │
│  │  Votre association mérite       │  │    ou animation dynamique     │ │
│  │  une solution simple et         │  │    avec confettis/médailles   │ │
│  │  transparente pour collecter    │  │                               │ │
│  │  des dons.                      │  │                               │ │
│  │                                 │  │                               │ │
│  │  100% du don arrive à           │  │                               │ │
│  │  l'association.                 │  │                               │ │
│  │  Reçu fiscal instantané.        │  │                               │ │
│  │                                 │  │                               │ │
│  │  [🏆 Inscrire mon association]  │  │                               │ │
│  │      (bouton primaire)          │  │                               │ │
│  │                                 │  │                               │ │
│  │  [❤️ Je veux faire un don]      │  │                               │ │
│  │      (bouton secondaire)        │  │                               │ │
│  │                                 │  │                               │ │
│  └─────────────────────────────────┘  └───────────────────────────────┘ │
│                                                                         │
│                         ↓ Scroll indicator animé                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Variante mobile** : Image au-dessus, texte en dessous, CTAs empilés

**Copywriting alternatif à tester** :
- "Financez vos projets sportifs grâce à la générosité de vos supporters"
- "De la cagnotte au terrain : collectez des dons en toute simplicité"

---

## 2️⃣ BANDEAU DE RÉASSURANCE

**Objectif** : Créer la confiance immédiatement (même sans chiffres pour le lancement)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐      │
│  │           │    │           │    │           │    │           │      │
│  │    🔒     │    │    📄     │    │    🇫🇷     │    │    ⚡     │      │
│  │           │    │           │    │           │    │           │      │
│  │ Paiement  │    │  Reçu     │    │ Conforme  │    │ Activation│      │
│  │ sécurisé  │    │  fiscal   │    │ RGPD      │    │ en 5 min  │      │
│  │ Stripe    │    │  Cerfa    │    │           │    │           │      │
│  │           │    │           │    │           │    │           │      │
│  └───────────┘    └───────────┘    └───────────┘    └───────────┘      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Version future (avec chiffres)** :
```
│  [X] associations  │  [X €] collectés  │  [X] donateurs  │  [X] sports │
```

---

## 3️⃣ SECTION "POURQUOI DONACTION"

**Objectif** : Différenciation, avantages clés pour les associations

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                    POURQUOI CHOISIR DONACTION ?                         │
│                                                                         │
│     La plateforme de collecte conçue par et pour le monde sportif      │
│                                                                         │
│  ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐│
│  │                     │ │                     │ │                     ││
│  │   💯                │ │   🎯                │ │   📱                ││
│  │                     │ │                     │ │                     ││
│  │  100% TRANSPARENT   │ │  ZÉRO ABONNEMENT    │ │  PRÊT EN 5 MIN      ││
│  │                     │ │  POUR DÉMARRER      │ │                     ││
│  │  L'association      │ │                     │ │  Créez votre page,  ││
│  │  reçoit l'intégra-  │ │  Aucun engagement.  │ │  configurez Stripe, ││
│  │  lité du don.       │ │  Payez uniquement   │ │  et commencez à     ││
│  │  Les frais sont     │ │  une commission de  │ │  collecter.         ││
│  │  pris en charge     │ │  4% sur les dons    │ │                     ││
│  │  par le donateur    │ │  effectivement      │ │  Votre page est     ││
│  │  (s'il le souhaite) │ │  reçus.             │ │  en ligne ce soir.  ││
│  │                     │ │                     │ │                     ││
│  └─────────────────────┘ └─────────────────────┘ └─────────────────────┘│
│                                                                         │
│  ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐│
│  │                     │ │                     │ │                     ││
│  │   🧾                │ │   🏆                │ │   📊                ││
│  │                     │ │                     │ │                     ││
│  │  REÇUS FISCAUX      │ │  PENSÉ POUR LE      │ │  TABLEAU DE BORD    ││
│  │  AUTOMATIQUES       │ │  SPORT              │ │  COMPLET            ││
│  │                     │ │                     │ │                     ││
│  │  Vos donateurs      │ │  Bibliothèque de    │ │  Suivez vos dons,   ││
│  │  reçoivent leur     │ │  projets sportifs   │ │  gérez vos projets, ││
│  │  reçu fiscal Cerfa  │ │  prête à l'emploi.  │ │  exportez vos       ││
│  │  instantanément     │ │  Tennis, foot,      │ │  données comptables ││
│  │  par email.         │ │  rugby, basket...   │ │  en un clic.        ││
│  │                     │ │                     │ │                     ││
│  └─────────────────────┘ └─────────────────────┘ └─────────────────────┘│
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4️⃣ DÉMO WIDGET DE DON (Section interactive)

**Objectif** : Montrer le produit en action, engager visuellement

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│        DÉCOUVREZ L'EXPÉRIENCE DE DON EN DIRECT                          │
│                                                                         │
│    Vos donateurs profitent d'un parcours fluide et rassurant            │
│                                                                         │
│  ┌─────────────────────────────────┐  ┌───────────────────────────────┐ │
│  │                                 │  │                               │ │
│  │  TEXTE EXPLICATIF               │  │  ┌─────────────────────────┐  │ │
│  │                                 │  │  │                         │  │ │
│  │  ✓ Montants suggérés            │  │  │   [WIDGET DE DON RÉEL]  │  │ │
│  │    intelligents                 │  │  │                         │  │ │
│  │                                 │  │  │   Club Sportif Démo     │  │ │
│  │  ✓ Don ponctuel ou              │  │  │                         │  │ │
│  │    récurrent                    │  │  │   [20€] [50€] [100€]    │  │ │
│  │                                 │  │  │   [____€ Autre montant] │  │ │
│  │  ✓ Particulier ou               │  │  │                         │  │ │
│  │    entreprise                   │  │  │   ☐ Don mensuel         │  │ │
│  │                                 │  │  │                         │  │ │
│  │  ✓ Calcul fiscal                │  │  │   Après réduction :     │  │ │
│  │    en temps réel                │  │  │   34€ (au lieu de 100€) │  │ │
│  │                                 │  │  │                         │  │ │
│  │  ✓ Paiement sécurisé            │  │  │   [Je donne 100€ ❤️]    │  │ │
│  │    Stripe                       │  │  │                         │  │ │
│  │                                 │  │  │   🔒 Paiement sécurisé  │  │ │
│  │                                 │  │  └─────────────────────────┘  │ │
│  │  Ce widget s'adapte aux         │  │                               │ │
│  │  couleurs de votre club !       │  │  ↑ Aux couleurs du club       │ │
│  │                                 │  │    (démo avec votre branding) │ │
│  └─────────────────────────────────┘  └───────────────────────────────┘ │
│                                                                         │
│              [🏆 Je veux ça pour mon association]                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Interaction** : Le widget est fonctionnel mais en mode "démo" (pas de vrai paiement)

---

## 5️⃣ PARCOURS D'INSCRIPTION (Timeline)

**Objectif** : Rassurer sur la simplicité, montrer les 4 étapes clés

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│              ACTIVEZ VOTRE COLLECTE EN 4 ÉTAPES                         │
│                                                                         │
│          Tout est pensé pour que vous soyez opérationnel                │
│                    le plus rapidement possible                          │
│                                                                         │
│                                                                         │
│     ①────────────────②────────────────③────────────────④               │
│     ●                ●                ●                ●               │
│     │                │                │                │               │
│     │                │                │                │               │
│  ┌──┴──┐          ┌──┴──┐          ┌──┴──┐          ┌──┴──┐           │
│  │     │          │     │          │     │          │     │           │
│  │ 👤  │          │ 💳  │          │ 📋  │          │ 🎨  │           │
│  │     │          │     │          │     │          │     │           │
│  └─────┘          └─────┘          └─────┘          └─────┘           │
│                                                                         │
│  CRÉEZ VOTRE      ACTIVEZ           AJOUTEZ VOS      PERSONNALISEZ     │
│  COMPTE           STRIPE            DOCUMENTS        VOTRE PAGE        │
│                                                                         │
│  Renseignez les   Votre compte      Statuts, RIB,    Logo, couleurs,   │
│  informations     Stripe Express    signature du     description...    │
│  de votre         est créé          président pour   Votre page est    │
│  association      automatiquement.  les reçus        prête à recevoir  │
│  et du            Finalisez la      fiscaux.         des dons !        │
│  responsable.     vérification                                         │
│                   en 5 min.         Validation sous                    │
│  ⏱️ 2 min         ⏱️ 5 min          24-48h            ⏱️ 5 min          │
│                                     ⏱️ Variable                         │
│                                                                         │
│                                                                         │
│                   [🏆 Commencer l'inscription]                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Animation suggérée** : Les étapes s'animent au scroll (apparition progressive)

---

## 6️⃣ FONCTIONNALITÉS CLÉS

**Objectif** : Détailler les features, distinguer gratuit/premium

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                    TOUT CE QU'IL VOUS FAUT                              │
│                    POUR RÉUSSIR VOS COLLECTES                           │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                                                                     ││
│  │  ┌─────────────────────────────┐  ┌─────────────────────────────┐  ││
│  │  │                             │  │                             │  ││
│  │  │  🏠 PAGE DE PRÉSENTATION    │  │  📊 TABLEAU DE BORD         │  ││
│  │  │                             │  │                             │  ││
│  │  │  Une page dédiée à votre    │  │  Gérez vos dons, suivez     │  ││
│  │  │  association avec toutes    │  │  vos projets, visualisez    │  ││
│  │  │  vos infos et le formulaire │  │  vos statistiques et        │  ││
│  │  │  de don intégré.            │  │  pilotez votre collecte.    │  ││
│  │  │                             │  │                             │  ││
│  │  │  ✅ Inclus dans GRATUIT     │  │  ✅ Inclus dans GRATUIT     │  ││
│  │  │                             │  │                             │  ││
│  │  └─────────────────────────────┘  └─────────────────────────────┘  ││
│  │                                                                     ││
│  │  ┌─────────────────────────────┐  ┌─────────────────────────────┐  ││
│  │  │                             │  │                             │  ││
│  │  │  ✉️ NOTIFICATIONS EMAIL     │  │  🧾 REÇUS FISCAUX           │  ││
│  │  │                             │  │     AUTOMATIQUES            │  ││
│  │  │  Soyez alerté à chaque      │  │                             │  ││
│  │  │  nouveau don, nouveau       │  │  Vos donateurs reçoivent    │  ││
│  │  │  projet créé et événement   │  │  automatiquement leur       │  ││
│  │  │  important.                 │  │  attestation et reçu        │  ││
│  │  │                             │  │  fiscal Cerfa par email.    │  ││
│  │  │  ✅ Inclus dans GRATUIT     │  │                             │  ││
│  │  │                             │  │  ✅ Inclus dans GRATUIT     │  ││
│  │  └─────────────────────────────┘  └─────────────────────────────┘  ││
│  │                                                                     ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│  ─────────────────────── FONCTIONNALITÉS PREMIUM ───────────────────── │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                                                                     ││
│  │  ┌─────────────────────────────┐  ┌─────────────────────────────┐  ││
│  │  │                             │  │                             │  ││
│  │  │  🎯 CAGNOTTES PROJETS       │  │  🔗 WIDGET INTÉGRABLE       │  ││
│  │  │                             │  │                             │  ││
│  │  │  Créez des cagnottes en     │  │  Intégrez le formulaire     │  ││
│  │  │  3 minutes grâce à notre    │  │  de don directement sur     │  ││
│  │  │  bibliothèque de projets    │  │  votre propre site web.     │  ││
│  │  │  sportifs prêts à l'emploi. │  │  Il s'adapte à vos          │  ││
│  │  │                             │  │  couleurs automatiquement.  │  ││
│  │  │  ⭐ PREMIUM                  │  │                             │  ││
│  │  │                             │  │  ⭐ PREMIUM                  │  ││
│  │  └─────────────────────────────┘  └─────────────────────────────┘  ││
│  │                                                                     ││
│  │  ┌─────────────────────────────┐  ┌─────────────────────────────┐  ││
│  │  │                             │  │                             │  ││
│  │  │  📥 EXPORT COMPTABLE        │  │  🏦 PAIEMENT PAR VIREMENT   │  ││
│  │  │                             │  │                             │  ││
│  │  │  Exportez tous vos dons     │  │  Offrez à vos donateurs     │  ││
│  │  │  au format comptable pour   │  │  la possibilité de payer    │  ││
│  │  │  simplifier votre gestion   │  │  par virement bancaire      │  ││
│  │  │  administrative.            │  │  en plus de la carte.       │  ││
│  │  │                             │  │                             │  ││
│  │  │  ⭐ PREMIUM (bientôt)        │  │  ⭐ PREMIUM                  │  ││
│  │  │                             │  │                             │  ││
│  │  └─────────────────────────────┘  └─────────────────────────────┘  ││
│  │                                                                     ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│                    [Voir tous les détails des offres ↓]                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 7️⃣ PROJETS À LA UNE

**Objectif** : Montrer des collectes réelles/exemples, inspirer, social proof

> **⚠️ IMPORTANT** : Réutiliser la logique du composant `PlusProjects` existant
> (`donaction-frontend/src/layouts/partials/common/plusProjects/index.tsx`)

### Implémentation technique

**Récupération des données (reprendre la logique de `page.tsx`) :**
```typescript
// Récupérer les 3 derniers projets publiés
const projets = await getProjets(1, 3, true, !!isPreview, cookies().toString());
```

**Affichage :**
- Utiliser le composant `ProjectCard` avec `type='showcase'`
- Si aucun projet : afficher l'animation Lottie `emptyProjects.json`
- Bouton "Voir tous les projets" → `/projets`

### Wireframe

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                    🔥 PROJETS À LA UNE                                  │
│                                                                         │
│           Découvrez les collectes en cours de nos associations          │
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │                  │  │                  │  │                  │      │
│  │  [IMAGE PROJET]  │  │  [IMAGE PROJET]  │  [IMAGE PROJET]  │      │
│  │                  │  │                  │  │                  │      │
│  │  ⚽ FC Lyon U13  │  │  🎾 TC Marseille │  │  🏀 Basket Lille │      │
│  │                  │  │                  │  │                  │      │
│  │  Nouveau maillot │  │  Rénovation des  │  │  Stage d'été     │      │
│  │  pour l'équipe   │  │  courts couverts │  │  pour les jeunes │      │
│  │                  │  │                  │  │                  │      │
│  │  ████████░░ 78%  │  │  ██████░░░░ 56%  │  │  ████░░░░░░ 34%  │      │
│  │  1 560€ / 2 000€ │  │  8 400€ / 15 000€│  │  850€ / 2 500€   │      │
│  │                  │  │                  │  │                  │      │
│  │  [Soutenir →]    │  │  [Soutenir →]    │  │  [Soutenir →]    │      │
│  │                  │  │                  │  │                  │      │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘      │
│                                                                         │
│                         [Voir tous les projets]                         │
│                                                                         │
│  ───────────────────────────────────────────────────────────────────── │
│                                                                         │
│       💡 Vous aussi, lancez votre collecte et rejoignez le mouvement   │
│                                                                         │
│                    [🏆 Créer ma première cagnotte]                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Responsive
- **Mobile** : Carrousel horizontal swipeable ou cards empilées verticalement
- **Tablet** : 2 projets visibles + flèches de navigation
- **Desktop** : 3 projets côte à côte

**Note** : Si aucun projet disponible, afficher une animation vide avec message d'encouragement

---

## 8️⃣ CALCULATEUR D'IMPACT FISCAL (Interactif)

**Objectif** : Engager les donateurs, montrer l'avantage fiscal

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ┌─────────────────────────────────┐  ┌───────────────────────────────┐ │
│  │                                 │  │                               │ │
│  │  💰 CALCULEZ VOTRE              │  │  ┌─────────────────────────┐  │ │
│  │     AVANTAGE FISCAL             │  │  │                         │  │ │
│  │                                 │  │  │  Je suis :              │  │ │
│  │  En France, vos dons aux        │  │  │  (●) Particulier        │  │ │
│  │  associations sportives sont    │  │  │  ( ) Entreprise         │  │ │
│  │  déductibles de vos impôts.     │  │  │                         │  │ │
│  │                                 │  │  │  Montant du don :       │  │ │
│  │  • Particulier : 66% du don     │  │  │  [________] €           │  │ │
│  │    (dans la limite de 20%       │  │  │                         │  │ │
│  │    du revenu imposable)         │  │  │  ─────────────────────  │  │ │
│  │                                 │  │  │                         │  │ │
│  │  • Entreprise : 60% du don      │  │  │  Votre réduction :      │  │ │
│  │    (dans la limite de 0.5%      │  │  │  🎁 66,00 €             │  │ │
│  │    du CA HT)                    │  │  │                         │  │ │
│  │                                 │  │  │  Coût réel de votre     │  │ │
│  │                                 │  │  │  don de 100€ :          │  │ │
│  │                                 │  │  │  💚 34,00 €             │  │ │
│  │                                 │  │  │                         │  │ │
│  │                                 │  │  │  [Trouver une asso →]   │  │ │
│  │                                 │  │  │                         │  │ │
│  │                                 │  │  └─────────────────────────┘  │ │
│  │                                 │  │                               │ │
│  └─────────────────────────────────┘  └───────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 9️⃣ TARIFICATION

**Objectif** : Clarté totale, comparaison visuelle, incitation au premium

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                      💎 TARIFICATION TRANSPARENTE                       │
│                                                                         │
│               Aucun frais caché. Aucun engagement.                      │
│                                                                         │
│  ┌─────────────────────────────────┐  ┌───────────────────────────────┐ │
│  │                                 │  │  ⭐ RECOMMANDÉ                 │ │
│  │         🆓 GRATUIT              │  │                               │ │
│  │                                 │  │         💎 PREMIUM            │ │
│  │            0€/mois              │  │                               │ │
│  │                                 │  │          69€/mois             │ │
│  │  Commission : 4% par don        │  │                               │ │
│  │  + frais Stripe (~1.5% + 0.25€) │  │  Commission : 4% par don      │ │
│  │                                 │  │  + frais Stripe (~1.5%+0.25€) │ │
│  │  ─────────────────────────────  │  │                               │ │
│  │                                 │  │  ─────────────────────────    │ │
│  │  ✅ Page de présentation        │  │                               │ │
│  │     de l'association            │  │  ✅ Tout le gratuit           │ │
│  │                                 │  │                               │ │
│  │  ✅ Formulaire de collecte      │  │  ✅ Cagnottes projets         │ │
│  │     de dons                     │  │     illimitées                │ │
│  │                                 │  │                               │ │
│  │  ✅ Tableau de bord complet     │  │  ✅ Bibliothèque de           │ │
│  │                                 │  │     projets sportifs          │ │
│  │  ✅ Reçus fiscaux               │  │                               │ │
│  │     automatiques                │  │  ✅ Widget intégrable         │ │
│  │                                 │  │     sur votre site            │ │
│  │  ✅ Notifications email         │  │                               │ │
│  │                                 │  │  ✅ Paiement par virement     │ │
│  │  ❌ Cagnottes projets           │  │                               │ │
│  │                                 │  │  ✅ Export comptable          │ │
│  │  ❌ Widget intégrable           │  │     (bientôt disponible)      │ │
│  │                                 │  │                               │ │
│  │  ❌ Export comptable            │  │  ✅ Support prioritaire       │ │
│  │                                 │  │                               │ │
│  │  ❌ Paiement par virement       │  │                               │ │
│  │                                 │  │                               │ │
│  │                                 │  │                               │ │
│  │  [Commencer gratuitement]       │  │  [Passer au Premium]          │ │
│  │                                 │  │                               │ │
│  └─────────────────────────────────┘  └───────────────────────────────┘ │
│                                                                         │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                         │
│                    💡 EXEMPLE CONCRET                                   │
│                                                                         │
│    Pour un don de 100€, voici ce qui se passe :                         │
│                                                                         │
│    ┌─────────────────────────────────────────────────────────────────┐  │
│    │  Le donateur paie      │  L'association reçoit  │  DONACTION    │  │
│    │  105,90€*              │  100,00€               │  reçoit 4€    │  │
│    │                        │  (100% du don)         │  de commission│  │
│    └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│    * Si le donateur choisit de prendre en charge les frais.             │
│      Sinon, les frais sont déduits du montant reçu par l'association.   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔟 SECTION FÉDÉRATIONS / GROUPEMENTS

**Objectif** : Adresser le persona B2B, solution multi-associations

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  FOND DÉGRADÉ / COULEUR DIFFÉRENTE                                  ││
│  │                                                                     ││
│  │  🏛️ VOUS ÊTES UNE FÉDÉRATION OU UN COMITÉ ?                        ││
│  │                                                                     ││
│  │  Équipez tous vos clubs affiliés d'une solution de collecte        ││
│  │  professionnelle et suivez leur activité depuis un tableau         ││
│  │  de bord centralisé.                                               ││
│  │                                                                     ││
│  │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐       ││
│  │  │                 │ │                 │ │                 │       ││
│  │  │  📊             │ │  🎨             │ │  💰             │       ││
│  │  │                 │ │                 │ │                 │       ││
│  │  │  PILOTAGE       │ │  PERSONNALI-    │ │  TARIFS         │       ││
│  │  │  CENTRALISÉ     │ │  SATION         │ │  PRÉFÉRENTIELS  │       ││
│  │  │                 │ │                 │ │                 │       ││
│  │  │  Vision globale │ │  Chaque club    │ │  Offres sur     │       ││
│  │  │  sur toutes les │ │  conserve son   │ │  mesure selon   │       ││
│  │  │  collectes de   │ │  identité et    │ │  le nombre de   │       ││
│  │  │  vos clubs.     │ │  ses couleurs.  │ │  clubs.         │       ││
│  │  │                 │ │                 │ │                 │       ││
│  │  └─────────────────┘ └─────────────────┘ └─────────────────┘       ││
│  │                                                                     ││
│  │                 [📞 Demander une démonstration]                     ││
│  │                                                                     ││
│  │                 ou contactez-nous : federations@donaction.fr        ││
│  │                                                                     ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 1️⃣1️⃣ FAQ

**Objectif** : Lever les dernières objections, SEO

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                    ❓ QUESTIONS FRÉQUENTES                              │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │                                                                     ││
│  │  ▶ Qui peut utiliser DONACTION ?                               [+] ││
│  │  ─────────────────────────────────────────────────────────────────  ││
│  │                                                                     ││
│  │  ▶ Comment sont générés les reçus fiscaux ?                    [+] ││
│  │  ─────────────────────────────────────────────────────────────────  ││
│  │                                                                     ││
│  │  ▶ Combien de temps pour recevoir les fonds ?                  [+] ││
│  │  ─────────────────────────────────────────────────────────────────  ││
│  │                                                                     ││
│  │  ▶ Mon association est-elle éligible aux dons déductibles ?    [+] ││
│  │  ─────────────────────────────────────────────────────────────────  ││
│  │                                                                     ││
│  │  ▶ Puis-je annuler mon abonnement Premium ?                    [+] ││
│  │  ─────────────────────────────────────────────────────────────────  ││
│  │                                                                     ││
│  │  ▶ Les données de mes donateurs sont-elles protégées ?         [+] ││
│  │  ─────────────────────────────────────────────────────────────────  ││
│  │                                                                     ││
│  │  ▶ Puis-je personnaliser les emails envoyés aux donateurs ?    [+] ││
│  │  ─────────────────────────────────────────────────────────────────  ││
│  │                                                                     ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│              Une autre question ? [Contactez-nous →]                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Contenu des réponses (exemples)** :

**Q: Qui peut utiliser DONACTION ?**
> DONACTION est destiné aux associations sportives françaises déclarées en préfecture et habilitées à recevoir des dons ouvrant droit à réduction fiscale (associations d'intérêt général au sens de l'article 200 du CGI).

**Q: Comment sont générés les reçus fiscaux ?**
> Les reçus fiscaux sont générés automatiquement et conformes au format Cerfa. Ils sont signés numériquement par le responsable de votre association et envoyés instantanément par email au donateur.

**Q: Combien de temps pour recevoir les fonds ?**
> Les fonds sont virés automatiquement sur le compte bancaire de votre association sous 7 jours ouvrés après réception du don, conformément à la réglementation française.

---

## 1️⃣2️⃣ CTA FINAL

**Objectif** : Dernière incitation à l'action

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  FOND COULEUR PRIMAIRE (VERT DONACTION)                            ││
│  │                                                                     ││
│  │                                                                     ││
│  │        🏆 PRÊT À LANCER VOTRE COLLECTE ?                           ││
│  │                                                                     ││
│  │        Rejoignez les associations sportives qui ont choisi         ││
│  │        la transparence et la simplicité.                           ││
│  │                                                                     ││
│  │                                                                     ││
│  │                [Créer mon compte gratuitement]                      ││
│  │                    (bouton blanc sur fond vert)                     ││
│  │                                                                     ││
│  │                 Activation en moins de 10 minutes                   ││
│  │                 Aucune carte bancaire requise                       ││
│  │                                                                     ││
│  │                                                                     ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🦶 FOOTER

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  [LOGO DONACTION]                                                       │
│                                                                         │
│  La plateforme de collecte de dons                                      │
│  pour les associations sportives françaises.                            │
│                                                                         │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                         │
│  PRODUIT              RESSOURCES           LÉGAL                        │
│  ───────              ──────────           ─────                        │
│  Fonctionnalités      Blog                 CGU                          │
│  Tarifs               Centre d'aide        CGV                          │
│  Fédérations          FAQ                  Mentions légales             │
│  Connexion            Contact              Politique de                 │
│                                            confidentialité              │
│                                                                         │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                         │
│  © 2026 DONACTION - Tous droits réservés                                │
│                                                                         │
│  Paiements sécurisés par [Logo Stripe]                                  │
│                                                                         │
│  [LinkedIn]  [Twitter/X]  [Instagram]                                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📱 DESIGN RESPONSIVE (OBLIGATOIRE)

> **⚠️ CRITIQUE** : Cette homepage DOIT être 100% responsive. Tester systématiquement sur tous les breakpoints.

### Breakpoints Tailwind

| Breakpoint | Largeur | Usage |
|------------|---------|-------|
| `sm` | ≥ 640px | Mobiles larges |
| `md` | ≥ 768px | Tablettes portrait |
| `lg` | ≥ 1024px | Tablettes paysage / Petits laptops |
| `xl` | ≥ 1280px | Desktops |
| `2xl` | ≥ 1536px | Grands écrans |

### Mobile (< 768px)

| Section | Adaptation |
|---------|------------|
| **Header** | Menu hamburger, drawer latéral plein écran |
| Hero | Image au-dessus, CTAs empilés verticalement, texte centré |
| Bandeau réassurance | Grille 2x2 ou scroll horizontal |
| Avantages | Grille 1 colonne, cards empilées |
| Widget démo | Pleine largeur, texte au-dessus du widget |
| Parcours | Timeline verticale, étapes empilées |
| Fonctionnalités | Cards empilées, accordéon possible |
| **Projets** | Carrousel horizontal swipeable (1 card visible) |
| Calculateur | Pleine largeur, formulaire empilé |
| Tarification | Cards empilées, sticky CTA en bas de page |
| Fédérations | Texte reflow, icônes empilées |
| FAQ | Accordéon classique (toucher pour ouvrir) |
| CTA Final | Bouton pleine largeur |
| Footer | Colonnes empilées |

### Tablet (768px - 1024px)

| Section | Adaptation |
|---------|------------|
| **Header** | Navigation complète visible (ou hamburger selon complexité) |
| Hero | Layout 50/50 ou image en background |
| Avantages | Grille 2 colonnes |
| Widget démo | Layout côte à côte |
| Parcours | Timeline horizontale avec scroll si besoin |
| Fonctionnalités | Grille 2 colonnes |
| **Projets** | 2 projets visibles + flèches navigation |
| Tarification | 2 colonnes côte à côte |
| FAQ | Accordéon 2 colonnes possible |

### Desktop (> 1024px)

| Section | Adaptation |
|---------|------------|
| **Header** | Navigation complète, dropdown au hover |
| Hero | Layout asymétrique 60/40 |
| Avantages | Grille 3 colonnes (2 lignes) |
| Widget démo | Layout côte à côte avec texte à gauche |
| Parcours | Timeline horizontale complète |
| Fonctionnalités | Grille 2 colonnes |
| **Projets** | 3 projets côte à côte |
| Tarification | 2 colonnes avec comparatif visuel |
| Fédérations | Layout horizontal complet |
| FAQ | Layout 2 colonnes accordéon |

### Considérations techniques

```typescript
// Exemple de classes responsive Tailwind
<div className="
  grid grid-cols-1       // Mobile: 1 colonne
  md:grid-cols-2         // Tablet: 2 colonnes
  lg:grid-cols-3         // Desktop: 3 colonnes
  gap-4 md:gap-6 lg:gap-8
">
```

```css
/* Container max-width cohérent avec le projet */
.minMaxWidth {
  @apply xl:max-w-screen-xl lg:max-w-screen-lg md:max-w-screen-md max-w-screen-sm mx-auto;
}
```

---

## 🎬 ANIMATIONS SUGGÉRÉES

| Élément | Animation |
|---------|-----------|
| Hero illustration | Subtle float/bounce |
| Scroll indicator | Pulse/bounce |
| Badges réassurance | Fade in au scroll |
| Timeline parcours | Apparition progressive step by step |
| Cards fonctionnalités | Slide up au scroll |
| Projets carousel | Swipe horizontal |
| Calculateur | Résultat animé (compteur) |
| CTA buttons | Hover scale + shadow |
| FAQ | Smooth expand/collapse |

---

## 🔍 SEO - META TAGS SUGGÉRÉS

```html
<title>DONACTION - Collecte de dons pour associations sportives | 100% transparent</title>

<meta name="description" content="Plateforme de collecte de dons pour associations sportives françaises. 100% du don à l'association, reçu fiscal automatique, activation en 5 minutes. Gratuit pour démarrer.">

<meta name="keywords" content="don association sportive, collecte dons sport, plateforme don, reçu fiscal association, cagnotte club sportif, financement participatif sport">
```

---

## 📁 STRUCTURE DE FICHIERS À CRÉER

```
donaction-frontend/src/
├── app/
│   └── (main)/
│       └── new-hp/
│           └── page.tsx              # Nouvelle homepage (Server Component)
│
├── layouts/partials/
│   └── newHomepage/                  # Dossier pour tous les nouveaux composants
│       ├── index.ts                  # Barrel export
│       ├── NewHpHero/
│       │   └── index.tsx             # Section Hero
│       ├── NewHpReassurance/
│       │   └── index.tsx             # Bandeau de réassurance
│       ├── NewHpWhyDonaction/
│       │   └── index.tsx             # Section "Pourquoi DONACTION"
│       ├── NewHpWidgetDemo/
│       │   └── index.tsx             # Démo widget de don
│       ├── NewHpTimeline/
│       │   └── index.tsx             # Parcours 4 étapes
│       ├── NewHpFeatures/
│       │   └── index.tsx             # Fonctionnalités
│       ├── NewHpProjects/
│       │   └── index.tsx             # Projets à la une (utilise PlusProjects)
│       ├── NewHpCalculator/
│       │   └── index.tsx             # Calculateur fiscal
│       ├── NewHpPricing/
│       │   └── index.tsx             # Tarification
│       ├── NewHpFederations/
│       │   └── index.tsx             # Section Fédérations
│       ├── NewHpFaq/
│       │   └── index.tsx             # FAQ accordéon
│       └── NewHpCta/
│           └── index.tsx             # CTA final
```

### Composants réutilisés (NE PAS MODIFIER)

| Composant existant | Usage |
|-------------------|-------|
| `layouts/partials/common/header/` | Header avec navigation et user menu |
| `layouts/partials/common/footer/` | Footer standard |
| `layouts/partials/common/plusProjects/` | Logique d'affichage des projets |
| `layouts/partials/clubPage/projectCard/` | Card de projet |
| `components/KlubrLogo/` | Logo DONACTION |
| `components/dropdownList/` | Dropdown menu |

---

## ✅ CHECKLIST AVANT DÉVELOPPEMENT

### Design & Assets
- [ ] Valider le copywriting de chaque section
- [ ] Choisir les illustrations/images (style, stock ou custom)
- [ ] Définir les couleurs exactes (primaire, secondaire, accent, neutres)
- [ ] Choisir la typographie (Google Fonts ou custom)
- [ ] Préparer les projets "démo" pour la section À la Une
- [ ] Rédiger les réponses FAQ complètes
- [ ] Créer le widget de démonstration fonctionnel
- [ ] Préparer les assets (logo SVG, icônes, badges Stripe)
- [ ] Définir les URLs des CTAs (inscription, connexion, contact)
- [ ] Configurer le tracking (Google Analytics, events)

### Technique
- [ ] Créer la route `/new-hp` dans `app/(main)/new-hp/page.tsx`
- [ ] Créer le dossier `layouts/partials/newHomepage/`
- [ ] Implémenter chaque section comme composant indépendant
- [ ] Tester le responsive sur tous les breakpoints
- [ ] Vérifier le header (connecté/déconnecté)
- [ ] Vérifier la récupération des projets via `getProjets()`
- [ ] Tester les animations (prefers-reduced-motion)
- [ ] Audit accessibilité (WCAG 2.1 AA)
- [ ] Test de performance (Core Web Vitals)

---

---

## 📋 HISTORIQUE DES VERSIONS

| Version | Date | Modifications |
|---------|------|---------------|
| 1.0 | 16/01/2026 | Version initiale du wireframe |
| 1.1 | 21/01/2026 | Ajout consignes d'implémentation, header détaillé, section projets avec PlusProjects, responsive obligatoire, structure fichiers |

---

**Document créé le** : 16 janvier 2026
**Dernière mise à jour** : 21 janvier 2026
**Version** : 1.1
**Auteur** : Claude pour Karim (DONACTION)
