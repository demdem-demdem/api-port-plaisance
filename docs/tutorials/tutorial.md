# Tutoriels d'Utilisation

Ce guide vous explique comment utiliser les différentes fonctionnalités de l'API Russell pour gérer le port.

---

## 1. Authentification et Session
L'accès à la majorité des fonctions nécessite d'être connecté.

### Se connecter
1.  **Action** : Envoyez vos identifiants via l'interface de connexion.
2.  **Technique** : Requête POST vers `/authenticate` avec `email` et `password`.
3.  **Résultat** : Un cookie contenant un jeton JWT est créé. Ce jeton expire après 24 heures.

---

## 2. Gestion des Utilisateurs (Tableau de bord)
Cette section permet de gérer les accès au système.

### Ajouter un collaborateur
- **Action** : Remplissez le formulaire d'inscription.
- **Données** : Nom, Email unique, Mot de passe.
- **Note** : Le système empêche la création de deux comptes avec le même email.

### Modifier ou Supprimer un utilisateur
- **Modification** : Vous pouvez changer le nom, l'email ou le mot de passe d'un utilisateur existant.
- **Suppression** : Un utilisateur peut être retiré du système via son ID unique.

---

## 3. Gestion des Catways
Les catways sont les emplacements physiques du port.

### Créer un emplacement
- **Données nécessaires** : Numéro du catway (doit être unique), type (`long` ou `short`) et l'état actuel.
- **Vérification** : Si le numéro existe déjà, l'API renverra une erreur pour éviter les doublons.

### Consulter et Modifier
- **Liste** : Affichez tous les catways pour voir l'occupation globale du port.
- **Détails** : Cliquez sur un catway pour voir ses spécifications techniques.
- **Mise à jour** : Si l'état d'un catway change (ex: suite à des réparations), modifiez son champ "État".

### Supprimer un emplacement
- **Attention** : La suppression d'un catway est définitive. Assurez-vous qu'aucune réservation n'est en cours.

---

## 4. Gestion des Réservations
C'est ici que vous gérez les entrées et sorties des bateaux.

### Créer une réservation
1.  Sélectionnez un catway disponible.
2.  Remplissez les informations du client et du bateau.
3.  Indiquez les dates de `checkIn` (arrivée) et `checkOut` (départ).
4.  **Automatisme** : Le système lie la réservation au numéro de catway sélectionné de manière sécurisée.

### Consulter les réservations
- **Vue Globale** : Voir toutes les réservations du port.
- **Vue par Catway** : Voir l'historique et les réservations futures pour un emplacement spécifique.
- **Détails** : Accéder aux informations complètes d'une réservation précise via son identifiant.

### Annuler ou Supprimer une réservation
- Si un client annule ou si son séjour est terminé, vous pouvez supprimer la réservation pour libérer visuellement l'emplacement dans le système.

---

## 5. Résumé des bonnes pratiques

| Objectif | Méthode recommandée |
| :--- | :--- |
| **Sécurité** | Ne partagez jamais vos identifiants. Déconnectez-vous après usage. |
| **Maintenance** | Mettez à jour l'état des catways régulièrement pour refléter la réalité du port. |
| **Précision** | Vérifiez bien les dates de check-in/check-out pour éviter les chevauchements de bateaux. |

---
*Besoin d'aide supplémentaire ? Consultez le [Glossaire]{@tutorial glossary} ou la section [Maintenance]{@tutorial maintenance}.*