# MAIVÉ Platform - Owner Manual

## 👜 Bienvenue sur votre plateforme MAIVÉ

Ce guide vous explique comment gérer votre boutique de luxe en ligne.

---

## 📋 Table des Matières

1. [Accès Admin](#accès-admin)
2. [Gestion des Produits](#gestion-des-produits)
3. [Gestion des Commandes](#gestion-des-commandes)
4. [Gestion des Clients](#gestion-des-clients)
5. [Statistiques](#statistiques)
6. [FAQ](#faq)

---

## 🔐 Accès Admin

### Connexion
```
URL: https://votre-site.com/admin
Email: admin@maive.com
Mot de passe: [fourni par votre développeur]
```

### Sécurité
- Changez votre mot de passe immédiatement
- Utilisez un mot de passe fort (12+ caractères)
- Ne partagez jamais vos identifiants
- Déconnectez-vous après chaque session

---

## 👜 Gestion des Produits

### Ajouter un Nouveau Produit

1. Allez dans **Produits > Ajouter**
2. Remplissez les informations:

#### Informations de Base
| Champ | Description | Exemple |
|-------|-------------|---------|
| Nom | Nom du produit | Tote MAIVÉ Noir Signature |
| Description | Description détaillée | Le tote signature en cuir... |
| Description courte | Résumé (200 caractères max) | Tote en cuir grainé |
| Prix | Prix en DZD | 42000 |
| Prix promo | Prix réduit (optionnel) | 38000 |

#### Catégorisation
| Champ | Description |
|-------|-------------|
| Catégorie | Totes, Mini Bags, Pochettes, etc. |
| Matériau | Cuir grainé, Cuir lisse, etc. |
| Tags | signature, classic, new, etc. |

#### Dimensions
```
Longueur: 35 cm
Largeur: 15 cm
Hauteur: 28 cm
Poids: 0.8 kg
```

#### Variantes de Couleur
Pour chaque couleur, ajoutez:
- **Nom**: Noir, Camel, Crème
- **Code couleur**: #1a1410, #b8986a, #f7f3ee
- **Photo du sac**: Image du sac seul
- **Photo modèle**: Image du sac porté
- **Stock**: Quantité disponible
- **SKU**: Code unique (ex: TOT-NOI-001)

#### Photos

**Formats acceptés**: JPG, PNG, WebP
**Taille maximale**: 5 Mo par image
**Dimensions recommandées**: 
- Photo sac: 800x1067px (3:4)
- Photo modèle: 800x1067px (3:4)

**Conseils pour de belles photos**:
- Fond uni (blanc ou crème)
- Éclairage naturel
- Pas d'ombres dures
- Cadrage centré

### Modifier un Produit

1. Allez dans **Produits > Tous les produits**
2. Cliquez sur le produit à modifier
3. Modifiez les champs nécessaires
4. Cliquez sur **Enregistrer**

### Gestion du Stock

#### Voir les stocks faibles
- Dashboard > Alertes stock
- Produits avec moins de 5 unités

#### Mettre à jour le stock
1. Allez dans **Produits > Stock**
2. Cliquez sur la variante
3. Modifiez la quantité
4. Enregistrez

#### Statuts de produit
| Statut | Description |
|--------|-------------|
| Actif | Visible sur le site |
| Brouillon | En préparation, non visible |
| Rupture de stock | Plus de stock |
| Discontinué | Plus vendu |

---

## 📦 Gestion des Commandes

### Cycle de Vie d'une Commande

```
En attente → Paiement reçu → En préparation → Expédiée → Livrée
     ↓
Annulée (si client annule)
```

### Statuts de Commande

| Statut | Description | Action requise |
|--------|-------------|----------------|
| **En attente** | Commande placée | Attendre paiement |
| **Paiement reçu** | Payée | Préparer la commande |
| **En préparation** | En cours de prépa | Emballer, étiqueter |
| **Expédiée** | Envoyée | Ajouter numéro de suivi |
| **En livraison** | Chez le livreur | - |
| **Livrée** | Reçue par client | Archiver |
| **Annulée** | Commande annulée | Rembourser si payé |

### Traiter une Commande

1. **Recevoir la notification**
   - Email automatique
   - Notification WhatsApp (si configuré)

2. **Vérifier le paiement**
   - CIB/Edahabia: Vérifier sur votre compte
   - Espèces: À la livraison

3. **Préparer la commande**
   - Vérifier les articles
   - Emballer avec soin
   - Ajouter facture

4. **Expédier**
   - Créer l'étiquette d'expédition
   - Mettre à jour le statut
   - Ajouter le numéro de suivi

5. **Notifier le client**
   - Email automatique envoyé
   - WhatsApp optionnel

### Numéros de Suivi

Format recommandé:
```
Yalidine: YLD123456789
Ecotrack: ECO987654321
```

### Annulations et Remboursements

**Client demande annulation**:
1. Vérifier statut (doit être "En attente" ou "Paiement reçu")
2. Cliquer sur **Annuler**
3. Choisir raison d'annulation
4. Si payée, initier remboursement

**Remboursement**:
- CIB/Edahabia: Via votre interface bancaire
- Stripe: Automatique via plateforme
- Délai: 3-5 jours ouvrés

---

## 👥 Gestion des Clients

### Voir les Clients

**Dashboard > Clients**

Informations disponibles:
- Nom et prénom
- Email
- Téléphone
- Adresses
- Historique des commandes
- Total dépensé

### Rechercher un Client

Utilisez la barre de recherche:
- Par nom
- Par email
- Par téléphone

### Fidélisation

**Identifier les meilleurs clients**:
- Dashboard > Top Clients
- Filtre par total dépensé

**Actions possibles**:
- Envoyer code promo exclusif
- Offrir livraison gratuite
- Accès prioritaire aux nouveautés

---

## 📊 Statistiques

### Dashboard Principal

Affiche en temps réel:

| Métrique | Description |
|----------|-------------|
| Commandes aujourd'hui | Nombre et montant |
| Revenus ce mois | Total des ventes |
| Commandes en attente | À traiter |
| Stock faible | Alertes |

### Rapports de Ventes

**Périodes disponibles**:
- Aujourd'hui
- Cette semaine
- Ce mois
- Cette année
- Personnalisé

**Graphiques**:
- Évolution des ventes
- Produits les plus vendus
- Répartition par catégorie

### Export de Données

Formats disponibles:
- Excel (.xlsx)
- CSV
- PDF

---

## 🎨 Conseils pour de Belles Photos

### Équipement Recommandé
- Appareil photo ou smartphone récent
- Trépied
- Fond blanc/crème (carton ou tissu)
- Lumière naturelle ou softbox

### Setup Photo

```
[Source de lumière] → [Produit] → [Appareil photo]
                              ↓
                        [Fond blanc]
```

### Checklist Photo

- [ ] Fond propre et uni
- [ ] Produit centré
- [ ] Pas de reflets parasites
- [ ] Mise au point nette
- [ ] Couleurs fidèles à la réalité

### Photos Requises par Produit

1. **Sac seul** (vue de face)
2. **Sac seul** (vue de côté)
3. **Sac seul** (détail)
4. **Modèle portant le sac**
5. **Zoom sur le matériau**

---

## 💰 Prix et Marges

### Calcul du Prix de Vente

```
Prix de vente = Coût produit + Marge + Frais

Exemple:
Coût produit: 20 000 DZD
Marge (50%): 10 000 DZD
Frais (10%): 3 000 DZD
------------------------
Prix de vente: 33 000 DZD → Arrondir à 35 000 DZD
```

### Prix Psychologiques

| Prix brut | Prix psychologique |
|-----------|-------------------|
| 42 300 DZD | 42 000 DZD |
| 28 700 DZD | 29 000 DZD |
| 19 500 DZD | 19 000 DZD |

---

## 🚚 Livraison

### Options de Livraison

| Type | Délai | Prix | Description |
|------|-------|------|-------------|
| Standard | 2-3 jours | 800 DZD | Livraison normale |
| Express | 24h | 1 500 DZD | Livraison rapide |
| Same Day | Same day | 3 000 DZD | Alger uniquement |

### Wilayas Desservies

Toutes les wilayas d'Algérie via:
- Yalidine
- Ecotrack
- Propre livreur (Alger)

### Frais de Livraison Gratuite

Offrir la livraison gratuite à partir de:
- **50 000 DZD** d'achat (recommandé)

---

## 📱 Communication Clients

### Emails Automatiques

| Événement | Email envoyé |
|-----------|--------------|
| Commande placée | ✅ Confirmation |
| Paiement reçu | ✅ Confirmation |
| Commande expédiée | ✅ Avec suivi |
| Commande livrée | ✅ Demande avis |

### WhatsApp Business

**Configuration**:
1. Créer compte WhatsApp Business
2. Connecter à la plateforme
3. Configurer messages automatiques

**Messages types**:
```
Confirmation commande:
"Bonjour [Prénom], votre commande #[Numéro] 
d'un montant de [Montant] DZD a été confirmée. 
Merci pour votre confiance! 👜"
```

---

## ❓ FAQ

### Comment changer mon mot de passe ?
```
Admin > Paramètres > Sécurité > Changer mot de passe
```

### Un client n'a pas reçu son email de confirmation
```
1. Vérifier l'adresse email dans la commande
2. Demander au client de vérifier spam
3. Renvoyer manuellement depuis la commande
```

### Comment ajouter un nouvel admin ?
```
Contactez votre développeur ou
Superadmin > Utilisateurs > Ajouter > Rôle: Admin
```

### Le stock ne se met pas à jour
```
Vérifier:
1. La variante sélectionnée
2. Enregistrer après modification
3. Rafraîchir la page
```

### Comment créer un code promo ?
```
Marketing > Codes promo > Ajouter
- Code: SUMMER20
- Type: Pourcentage (20%) ou Fixe (5000 DZD)
- Date d'expiration
- Usage limité (optionnel)
```

---

## 📞 Support Technique

### Contactez votre développeur si:

- Le site ne fonctionne pas
- Erreur lors du paiement
- Problème d'upload d'images
- Bug dans l'interface admin
- Question technique

### Informations à fournir:
1. Description du problème
2. Capture d'écran
3. URL de la page concernée
4. Heure du problème

---

## 🔒 Sécurité

### Bonnes Pratiques

- ✅ Changer mot de passe tous les 3 mois
- ✅ Vérifier les connexions suspectes
- ✅ Sauvegarder les données régulièrement
- ❌ Ne jamais partager les identifiants
- ❌ Ne pas utiliser WiFi public pour admin

### Sauvegardes

Automatiques: Tous les jours
Conservation: 30 jours
Emplacement: Cloud sécurisé

---

## 📈 Croissance

### Conseils pour Augmenter les Ventes

1. **Nouveautés régulières**
   - 2-3 nouveaux modèles par mois

2. **Photos de qualité**
   - Investir dans la photographie

3. **Réseaux sociaux**
   - Instagram: Posts quotidiens
   - TikTok: Vidéos tendances

4. **Fidélisation**
   - Programme de points
   - Offres exclusives clients

5. **Avis clients**
   - Encourager les reviews
   - Partager les témoignages

---

*MAIVÉ Platform v2.0.0 - Owner Manual*
*Dernière mise à jour: 2026*
