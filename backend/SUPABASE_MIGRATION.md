# Migration de la base de données vers Supabase

La base PostgreSQL de la boutique **Venips** est hébergée sur **Supabase**
(projet `venipsshop`) au lieu de Railway, pour éviter la mise en veille
(« sleep ») de l'instance.

## Projet Supabase

| Élément            | Valeur                                          |
| ------------------ | ----------------------------------------------- |
| Nom du projet      | `venipsshop`                                    |
| Référence (ref)    | `uzbgzvhietfzscephwtm`                           |
| Région             | `eu-west-1` (Irlande)                            |
| URL API            | `https://uzbgzvhietfzscephwtm.supabase.co`      |
| Dashboard          | https://supabase.com/dashboard/project/uzbgzvhietfzscephwtm |

> Le projet `venips` reste dédié à l'application de gestion de la boutique ;
> `venipsshop` est réservé à ce site e-commerce.

## Ce qui a déjà été fait

- ✅ Création du projet Supabase `venipsshop`.
- ✅ Application du schéma Prisma complet (tables, enums, index, clés
  étrangères) — DDL généré par `prisma migrate diff`, 100 % compatible avec
  `backend/prisma/schema.prisma`.
- ✅ Insertion des données de base (seed) : compte admin, utilisateur test,
  8 catégories, 8 produits, 3 codes promo.
- ✅ Activation de **Row Level Security (RLS)** sur toutes les tables, sans
  policy : l'API publique (clé anon) ne peut rien lire/écrire, tandis que le
  backend Prisma (rôle `postgres`) contourne la RLS et fonctionne normalement.

## Configurer le backend

1. Dans le **Dashboard Supabase → projet `venipsshop` → Settings → Database**,
   définis (ou réinitialise) le mot de passe de la base de données.
2. Récupère la chaîne de connexion via le bouton **Connect → ORMs / Prisma**
   (utilise de préférence le **Session pooler**, compatible IPv4 et
   `prisma db push`).
3. Mets à jour la variable `DATABASE_URL` :
   - En local : dans `backend/.env` (voir `backend/.env.example`).
   - Sur l'hébergeur (Railway/Render/…) : dans les variables d'environnement
     du service.

Format attendu (Session pooler) :

```
postgresql://postgres.uzbgzvhietfzscephwtm:[MOT_DE_PASSE]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres
```

Aucun changement de code n'est nécessaire : Prisma lit déjà
`env("DATABASE_URL")` et le script `railway:start` exécute
`prisma db push` puis démarre le serveur.

## Migrer les données existantes de Railway (optionnel)

Le schéma et le seed sont en place, mais les données déjà saisies en
production sur Railway (commandes, comptes clients, etc.) n'ont pas pu être
copiées automatiquement (pas d'accès à la base Railway depuis l'agent). Pour
les transférer :

```bash
# 1. Exporter depuis Railway (récupère DATABASE_URL dans Railway → Variables)
pg_dump --no-owner --no-privileges --data-only \
  --disable-triggers "$RAILWAY_DATABASE_URL" > venips_data.sql

# 2. Importer dans Supabase
psql "$SUPABASE_DATABASE_URL" < venips_data.sql
```

> Si tu préfères un transfert complet (schéma + données), utilise
> `pg_dump` sans `--data-only` sur une base Supabase vide.
