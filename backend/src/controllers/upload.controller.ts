import crypto from 'crypto';
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';

// Génère une signature Cloudinary côté serveur pour un upload sécurisé.
// Le navigateur n'a jamais accès à CLOUDINARY_API_SECRET.
export const signCloudinaryUpload = async (req: AuthRequest, res: Response): Promise<void> => {
  const apiKey    = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

  if (!apiKey || !apiSecret || !cloudName) {
    res.status(503).json({ error: 'Cloudinary non configuré sur le serveur' });
    return;
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = 'venips/products';

  // Les paramètres doivent être triés alphabétiquement pour la signature Cloudinary
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash('sha1')
    .update(paramsToSign + apiSecret)
    .digest('hex');

  res.json({ signature, timestamp, apiKey, cloudName, folder });
};
