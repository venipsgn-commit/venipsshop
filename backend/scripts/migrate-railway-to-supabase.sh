#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────
# Copie les DONNÉES de la base Railway vers la base Supabase (venipsshop).
#
# Le schéma (tables, enums, RLS) existe déjà sur Supabase : ce script ne
# transfère QUE les données (--data-only).
#
# À lancer depuis un endroit qui atteint Railway :
#   • le SHELL de ton service Railway (recommandé) — l'hôte interne
#     `postgres.railway.internal` y fonctionne, et Supabase est joignable
#     par Internet ; OU
#   • ta machine locale, en remplaçant RAILWAY_URL par la DATABASE_PUBLIC_URL
#     de Railway (hôte du type xxxx.proxy.rlwy.net:PORT).
#
# Usage :
#   RAILWAY_URL="..." SUPABASE_URL="..." bash migrate-railway-to-supabase.sh
# ─────────────────────────────────────────────────────────────────────────
set -euo pipefail

RAILWAY_URL="${RAILWAY_URL:?Définis RAILWAY_URL (source Railway)}"
SUPABASE_URL="${SUPABASE_URL:?Définis SUPABASE_URL (cible Supabase)}"

TABLES="promo_redemptions reviews wishlist_items order_items orders addresses refresh_tokens products categories promo_codes users"

echo "==> 1/4 Vérification de la connexion à Railway (source)…"
psql "$RAILWAY_URL" -c "select 'railway ok' as status;" >/dev/null

echo "==> 2/4 Vérification de la connexion à Supabase (cible)…"
psql "$SUPABASE_URL" -c "select 'supabase ok' as status;" >/dev/null

echo "==> 3/4 Purge de la cible + copie des données (data-only)…"
# On vide d'abord la cible (au cas où le seed de démo serait encore présent),
# puis on copie. --disable-triggers désactive temporairement les contraintes
# FK pendant le chargement (nécessite le rôle propriétaire = postgres).
psql "$SUPABASE_URL" -v ON_ERROR_STOP=1 -c \
  "TRUNCATE ${TABLES// /,} RESTART IDENTITY CASCADE;"

pg_dump --data-only --no-owner --no-privileges --disable-triggers \
        "$RAILWAY_URL" \
  | psql "$SUPABASE_URL" -v ON_ERROR_STOP=1

echo "==> 4/4 Vérification des nombres de lignes (Railway vs Supabase)…"
printf "%-20s %10s %10s\n" "TABLE" "RAILWAY" "SUPABASE"
for t in $TABLES; do
  r=$(psql "$RAILWAY_URL"  -tAc "select count(*) from \"$t\";" 2>/dev/null || echo "ERR")
  s=$(psql "$SUPABASE_URL" -tAc "select count(*) from \"$t\";" 2>/dev/null || echo "ERR")
  printf "%-20s %10s %10s\n" "$t" "$r" "$s"
done

echo ""
echo "✅ Migration terminée. Si les colonnes RAILWAY et SUPABASE coïncident, tout est bon."
