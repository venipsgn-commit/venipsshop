// ─────────────────────────────────────────────────────────────────────────
// Copie fidèle des DONNÉES de Railway → Supabase (projet venipsshop).
//
// Utilise COPY (via pg-copy-streams) : rapide et fidèle (arrays, JSON, enums).
// Le schéma existe déjà sur Supabase ; ce script ne transfère que les données.
//
// Pré-requis (sur TON ordinateur, une seule fois) :
//   cd backend
//   npm install pg pg-copy-streams
//
// Lancement :
//   RAILWAY_URL="postgresql://postgres:...@<hote-public-railway>:<port>/railway" \
//   SUPABASE_URL="postgresql://postgres.uzbgzvhietfzscephwtm:...@aws-0-eu-west-1.pooler.supabase.com:5432/postgres" \
//   node scripts/copy-railway-to-supabase.mjs
//
// ⚠️ RAILWAY_URL doit être l'URL PUBLIQUE de Railway (variable
//    DATABASE_PUBLIC_URL, hôte du type xxxx.proxy.rlwy.net) — l'hôte interne
//    *.railway.internal n'est joignable que depuis l'intérieur de Railway.
// ─────────────────────────────────────────────────────────────────────────
import pg from 'pg';
import { to as copyTo, from as copyFrom } from 'pg-copy-streams';
import { pipeline } from 'node:stream/promises';

const { Client } = pg;

const RAILWAY_URL = process.env.RAILWAY_URL;
const SUPABASE_URL = process.env.SUPABASE_URL;
if (!RAILWAY_URL || !SUPABASE_URL) {
  console.error('❌ Définis les variables RAILWAY_URL et SUPABASE_URL.');
  process.exit(1);
}

// Ordre d'insertion : parents avant enfants (contraintes de clés étrangères).
const TABLES = [
  'users',
  'categories',
  'promo_codes',
  'products',
  'addresses',
  'refresh_tokens',
  'orders',
  'order_items',
  'reviews',
  'wishlist_items',
  'promo_redemptions',
];

const src = new Client({ connectionString: RAILWAY_URL, ssl: sslFor(RAILWAY_URL) });
const dst = new Client({ connectionString: SUPABASE_URL, ssl: sslFor(SUPABASE_URL) });

function sslFor(url) {
  // Railway/Supabase acceptent TLS ; on ne vérifie pas le CA (proxies).
  return /sslmode=disable/.test(url) ? false : { rejectUnauthorized: false };
}

async function columnsOf(client, table) {
  const { rows } = await client.query(
    `select column_name from information_schema.columns
     where table_schema = 'public' and table_name = $1
     order by ordinal_position`,
    [table],
  );
  return rows.map((r) => `"${r.column_name}"`);
}

async function main() {
  await src.connect();
  await dst.connect();
  console.log('✅ Connecté à Railway (source) et Supabase (cible).\n');

  // On vide la cible (retire un éventuel seed) dans l'ordre inverse.
  console.log('==> Purge des tables cibles…');
  await dst.query(
    `TRUNCATE ${[...TABLES].reverse().map((t) => `"${t}"`).join(',')} RESTART IDENTITY CASCADE;`,
  );

  for (const table of TABLES) {
    const cols = (await columnsOf(src, table)).join(',');
    process.stdout.write(`==> Copie ${table} … `);
    const srcStream = src.query(copyTo(`COPY "${table}" (${cols}) TO STDOUT`));
    const dstStream = dst.query(copyFrom(`COPY "${table}" (${cols}) FROM STDIN`));
    await pipeline(srcStream, dstStream);
    console.log('ok');
  }

  console.log('\n==> Vérification des nombres de lignes :');
  console.log('TABLE'.padEnd(20), 'RAILWAY'.padStart(10), 'SUPABASE'.padStart(10));
  let allMatch = true;
  for (const table of TABLES) {
    const r = (await src.query(`select count(*)::int as c from "${table}"`)).rows[0].c;
    const s = (await dst.query(`select count(*)::int as c from "${table}"`)).rows[0].c;
    if (r !== s) allMatch = false;
    console.log(table.padEnd(20), String(r).padStart(10), String(s).padStart(10), r === s ? '' : '⚠️');
  }

  await src.end();
  await dst.end();
  console.log(allMatch ? '\n🎉 Migration réussie : tous les compteurs coïncident.' : '\n⚠️ Des écarts existent, vérifie les lignes marquées.');
}

main().catch((e) => {
  console.error('\n❌ Erreur :', e.message);
  process.exit(1);
});
