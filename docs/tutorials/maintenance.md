# Maintenance et Sécurité

### Sécurité des données
- **Hachage** : Les mots de passe sont hachés avec `bcrypt` avant stockage.
- **Authentification** : Toutes les routes sensibles (POST, PUT, DELETE) sont protégées par un middleware vérifiant la validité du jeton JWT présent dans les cookies.

### Documentation technique
Les détails de chaque fonction (paramètres, retours, erreurs) sont générés automatiquement par JSDoc à partir des commentaires dans le code source des services.