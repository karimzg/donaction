# Prompt : Analyse et Refactoring de Memory Bank

## 🎯 Objectif
Réduire la memory bank de ~120k tokens à ~10k tokens en :
1. Extrayant les **Skills** (savoir-faire réutilisables)
2. Identifiant les **Rules** (contraintes globales pour CLAUDE.md)
3. Définissant les **Subagents** (experts spécialisés)
4. Éliminant les redondances et informations obsolètes

## 📍 Contexte
- **Source** : `/memory-bank/` (fichiers .md)
- **Destination Skills** : `/skills/{domaine}/SKILL.md`
- **Destination Rules** : `CLAUDE.md` (racine)
- **Destination Agents** : `/agents/{nom}/AGENT.md`

---

## 🔍 Définitions des concepts à extraire

### SKILL (Savoir-faire procédural)
> Question clé : "Comment faire X de manière optimale ?"

**Critères d'identification :**
- [ ] Instructions étape par étape pour accomplir une tâche
- [ ] Templates ou boilerplates de code
- [ ] Bonnes pratiques spécifiques à une techno/domaine
- [ ] Exemples de référence avec explication
- [ ] Workflows reproductibles

**Signaux dans le texte :**
- "Pour créer/configurer/déployer..."
- "La méthode recommandée est..."
- "Template de...", "Exemple de..."
- "Étape 1, 2, 3..."
- Blocs de code avec commentaires explicatifs

**Structure de sortie :**
```
/skills/{domaine}/
├── SKILL.md          # Instructions principales
├── examples/
│   ├── example-1.md  # Cas d'usage concret
│   └── example-2.md
└── templates/
    └── template.{ext}
```

---

### RULE (Contrainte globale)
> Question clé : "Qu'est-ce qui doit TOUJOURS/JAMAIS être fait ?"

**Critères d'identification :**
- [ ] S'applique à TOUT le projet (pas un cas spécifique)
- [ ] Contrainte permanente, pas une procédure
- [ ] Concerne : nommage, architecture, sécurité, style
- [ ] Peut être vérifié par un linter/test automatique

**Signaux dans le texte :**
- "Toujours...", "Jamais...", "Obligatoire"
- "Convention :", "Standard :"
- "Interdit de...", "Ne pas..."
- "Tous les fichiers doivent..."
- Règles ESLint, Prettier, .editorconfig mentionnées

**Format de sortie (pour CLAUDE.md) :**
```markdown
## Rules
- [NAMING] Les composants utilisent PascalCase
- [ARCH] Chaque feature a son propre module
- [SEC] Jamais de credentials en dur
- [STYLE] Utiliser Prettier avec config projet
```

---

### SUBAGENT (Expert spécialisé)
> Question clé : "Quel expert dois-je consulter pour ce domaine ?"

**Critères d'identification :**
- [ ] Domaine d'expertise délimité et spécifique
- [ ] Nécessite un contexte/connaissances particulières
- [ ] Implique un processus de décision ou validation
- [ ] Checklist de contrôle qualité associée
- [ ] Pourrait être un "rôle" dans une équipe humaine

**Signaux dans le texte :**
- "Le reviewer vérifie que..."
- "L'architecte doit valider..."
- "Checklist de sécurité :"
- "Critères d'acceptance :"
- Processus de review, audit, validation

**Structure de sortie :**
```
/agents/{nom}/
├── AGENT.md          # Définition du rôle + prompt système
├── checklist.md      # Points de contrôle
└── examples/         # Cas d'intervention typiques
```

**Template AGENT.md :**
```markdown
# Agent: {Nom}

## Rôle
{Description en 1-2 phrases}

## Expertise
- {Domaine 1}
- {Domaine 2}

## Quand l'invoquer
- {Situation 1}
- {Situation 2}

## Checklist de validation
- [ ] {Point 1}
- [ ] {Point 2}

## Prompt système
\`\`\`
Tu es un expert en {domaine}. Ton rôle est de {mission}.
Tu dois vérifier que {critères}.
\`\`\`
```

---

## 📋 Workflow d'analyse

### Phase 1 : Inventaire
Pour chaque fichier de `/memory-bank/` :
1. Lire le contenu complet
2. Identifier le type dominant (Skill/Rule/Subagent/Obsolète/Redondant)
3. Estimer les tokens
4. Noter les dépendances avec d'autres fichiers

**Output Phase 1 :**
| Fichier | Tokens | Type principal | Action recommandée | Score (1-5) |
|---------|--------|----------------|-------------------|-------------|
| xxx.md  | 2500   | Skill          | Extraire vers /skills/auth/ | ⭐⭐⭐⭐⭐ |
| yyy.md  | 800    | Rule           | Consolider dans CLAUDE.md | ⭐⭐⭐⭐ |
| zzz.md  | 3000   | Obsolète       | Supprimer | ⭐⭐⭐⭐⭐ |

### Phase 2 : Plan d'action
Générer un plan consolidé :
```markdown
## Plan de refactoring

### Skills à créer (X fichiers, ~Yk tokens économisés)
- [ ] `/skills/auth/` ← fichiers A, B, C
- [ ] `/skills/deployment/` ← fichiers D, E

### Agents à créer (X agents)
- [ ] `security-reviewer` ← extraire de fichier F
- [ ] `code-reviewer` ← extraire de fichier G

### Rules à consolider (~X rules)
- [ ] Nommage (de fichiers H, I)
- [ ] Architecture (de fichier J)

### À supprimer (obsolète/redondant)
- [ ] fichier K (doublon de L)
- [ ] fichier M (obsolète depuis migration)

### Estimation finale
- Avant : ~120k tokens
- Après : ~Xk tokens (réduction de Y%)
```

⏸️ **STOP - Attendre validation utilisateur avant Phase 3**

### Phase 3 : Exécution
Pour chaque action validée :
1. Afficher le contenu proposé
2. Attendre confirmation (✅ Go / ❌ Skip / ✏️ Modifier)
3. Créer/éditer le fichier
4. Logger l'action effectuée

---

## 🔧 Règles d'exécution

### Générales
- Analyser UN fichier à la fois, présenter les findings
- Ne JAMAIS éditer sans validation explicite
- Conserver une trace des sources originales (commentaire en haut de chaque fichier généré)

### Pour les Skills
- Consulter la doc officielle via MCP/web si techno spécifique
- 1 dossier par skill, fichiers séparés pour exemples
- Nommage : `{domaine}-{action}` (ex: `auth-oauth2-setup`)

### Pour les Subagents
- Inclure toujours un prompt système prêt à l'emploi
- Définir clairement les triggers d'invocation
- Limiter à 5-7 agents maximum pour éviter la confusion

### Pour les Rules
- Format concis : `[CATEGORY] Rule description`
- Grouper par thème (NAMING, ARCH, SEC, STYLE, etc.)
- Max 20-30 rules dans CLAUDE.md

---

## 🚀 Commande de démarrage

Commence par :
1. Lister tous les fichiers dans `/memory-bank/`
2. Me donner un aperçu rapide (nom + taille estimée + 1ère impression)
3. Proposer l'ordre d'analyse recommandé

Puis attends mon GO pour démarrer l'analyse détaillée.
