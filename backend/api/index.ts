// Point d'entrée des fonctions serverless Vercel.
// Vercel invoque l'application Express exportée (elle est un handler
// (req, res) standard). Toutes les routes sont réécrites vers cette
// fonction via vercel.json, donc Express garde son routage /api/v1/* et
// /health inchangé.
import app from '../src/index';

export default app;
