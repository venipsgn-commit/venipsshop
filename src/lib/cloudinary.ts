import { getAccessToken } from './api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://venipsshop-production.up.railway.app/api/v1';

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

export async function uploadImage(file: File): Promise<UploadResult> {
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Image trop lourde (max 10 MB)');
  }
  if (!file.type.startsWith('image/')) {
    throw new Error('Le fichier doit être une image');
  }

  // 1. Demander une signature au backend (admin seulement)
  const token = getAccessToken();
  const signRes = await fetch(`${BASE_URL}/upload/sign`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!signRes.ok) {
    if (signRes.status === 401 || signRes.status === 403) {
      throw new Error('Non autorisé — connectez-vous en tant qu\'admin');
    }
    if (signRes.status === 503) {
      throw new Error('Cloudinary non configuré sur le serveur. Ajoutez CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET et CLOUDINARY_CLOUD_NAME dans Railway.');
    }
    throw new Error('Impossible d\'obtenir la signature d\'upload');
  }

  const { signature, timestamp, apiKey, cloudName, folder } = await signRes.json();

  // 2. Uploader directement sur Cloudinary avec la signature
  const data = new FormData();
  data.append('file', file);
  data.append('api_key', apiKey);
  data.append('timestamp', String(timestamp));
  data.append('signature', signature);
  data.append('folder', folder);

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: data }
  );

  if (!uploadRes.ok) {
    const err = await uploadRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Échec de l\'upload Cloudinary');
  }

  const json = await uploadRes.json();
  return {
    url: json.secure_url,
    publicId: json.public_id,
    width: json.width,
    height: json.height,
  };
}
