import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../utils/prisma';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../utils/email';

const SALT_ROUNDS = 12;
const REFRESH_EXPIRES_DAYS = 7;
const RESET_TOKEN_EXPIRES_MS = 60 * 60 * 1000; // 1h

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// ── Inscription ───────────────────────────────────────────────────
export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password, prenom, nom, telephone } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: 'Cet email est déjà utilisé' });
    return;
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { email, password: hashed, prenom, nom, telephone },
    select: { id: true, email: true, prenom: true, nom: true, role: true },
  });

  const payload = { userId: user.id, email: user.email, role: user.role };
  const accessToken  = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_EXPIRES_DAYS * 86400000),
    },
  });

  sendWelcomeEmail({ email: user.email, prenom: user.prenom }).catch(() => {});

  res.status(201).json({ user, accessToken, refreshToken });
};

// ── Connexion ─────────────────────────────────────────────────────
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    return;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    return;
  }

  const payload = { userId: user.id, email: user.email, role: user.role };
  const accessToken  = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_EXPIRES_DAYS * 86400000),
    },
  });

  const { password: _, ...userSafe } = user;
  res.json({ user: userSafe, accessToken, refreshToken });
};

// ── Refresh token ─────────────────────────────────────────────────
export const refresh = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(401).json({ error: 'Refresh token manquant' });
    return;
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored || stored.expiresAt < new Date()) {
    res.status(401).json({ error: 'Refresh token invalide ou expiré' });
    return;
  }

  const payload = verifyRefreshToken(refreshToken);
  const newAccessToken  = generateAccessToken({ userId: payload.userId, email: payload.email, role: payload.role });
  const newRefreshToken = generateRefreshToken({ userId: payload.userId, email: payload.email, role: payload.role });

  await prisma.refreshToken.delete({ where: { token: refreshToken } });
  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: payload.userId,
      expiresAt: new Date(Date.now() + REFRESH_EXPIRES_DAYS * 86400000),
    },
  });

  res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
};

// ── Déconnexion ───────────────────────────────────────────────────
export const logout = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }
  res.json({ message: 'Déconnecté avec succès' });
};

// ── Profil courant ────────────────────────────────────────────────
export const me = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, email: true, prenom: true, nom: true, telephone: true, role: true, createdAt: true, addresses: true },
  });
  if (!user) { res.status(404).json({ error: 'Utilisateur introuvable' }); return; }
  res.json(user);
};

// ── Mot de passe oublié ───────────────────────────────────────────
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  // Toujours renvoyer 200 pour ne pas révéler si l'email existe
  if (user && user.isActive) {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = hashToken(rawToken);
    const expiry = new Date(Date.now() + RESET_TOKEN_EXPIRES_MS);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: hashedToken, resetTokenExpiry: expiry },
    });
    // Envoyer le token brut dans l'email (jamais le hash)
    sendPasswordResetEmail({ email: user.email, prenom: user.prenom }, rawToken).catch(() => {});
  }

  res.json({ message: 'Si cette adresse existe, un email a été envoyé.' });
};

// ── Réinitialisation mot de passe ─────────────────────────────────
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword || newPassword.length < 8) {
    res.status(400).json({ error: 'Lien invalide ou mot de passe trop court (8 caractères min)' });
    return;
  }

  // Comparer le hash, pas le token brut
  const hashedToken = hashToken(token);
  const user = await prisma.user.findFirst({
    where: {
      resetToken: hashedToken,
      resetTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    res.status(400).json({ error: 'Lien invalide ou expiré' });
    return;
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        password: await bcrypt.hash(newPassword, SALT_ROUNDS),
        resetToken: null,
        resetTokenExpiry: null,
      },
    }),
    // Invalider toutes les sessions actives après reset
    prisma.refreshToken.deleteMany({ where: { userId: user.id } }),
  ]);

  res.json({ message: 'Mot de passe réinitialisé avec succès' });
};

// ── Connexion sociale ─────────────────────────────────────────────
export const socialLogin = async (req: Request, res: Response): Promise<void> => {
  const { provider, token } = req.body;
  let email: string, prenom: string, nom: string, providerId: string;

  try {
    if (provider === 'google') {
      const r = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
      const d = await r.json();
      if (!r.ok || d.error_description) { res.status(401).json({ error: 'Token Google invalide' }); return; }
      email = d.email; prenom = d.given_name || 'Utilisateur'; nom = d.family_name || ''; providerId = d.sub;
    } else if (provider === 'facebook') {
      const r = await fetch(`https://graph.facebook.com/me?fields=id,name,email,first_name,last_name&access_token=${token}`);
      const d = await r.json();
      if (!r.ok || d.error) { res.status(401).json({ error: 'Token Facebook invalide' }); return; }
      email = d.email; prenom = d.first_name || d.name?.split(' ')[0] || 'Utilisateur'; nom = d.last_name || ''; providerId = d.id;
    } else if (provider === 'apple') {
      // Apple sends user info only on first sign-in, decode the identityToken (JWT) without verification for email
      const parts = token.split('.');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      email = payload.email || `apple_${payload.sub}@privaterelay.appleid.com`;
      prenom = req.body.firstName || 'Utilisateur'; nom = req.body.lastName || ''; providerId = payload.sub;
    } else {
      res.status(400).json({ error: 'Fournisseur non supporté' }); return;
    }
  } catch {
    res.status(401).json({ error: 'Erreur de vérification du token' }); return;
  }

  // Find or create user
  let user = await prisma.user.findFirst({
    where: { OR: [{ email }, { provider, providerId }] },
    select: { id: true, email: true, prenom: true, nom: true, role: true },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        prenom,
        nom: nom || '-',
        password: crypto.randomBytes(32).toString('hex'),
        provider,
        providerId,
      },
      select: { id: true, email: true, prenom: true, nom: true, role: true },
    });
    sendWelcomeEmail({ email: user.email, prenom: user.prenom }).catch(() => {});
  }

  const payload2 = { userId: user.id, email: user.email, role: user.role };
  const accessToken  = generateAccessToken(payload2);
  const refreshToken = generateRefreshToken(payload2);
  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 86400000) }
  });

  res.json({ user, accessToken, refreshToken });
};

// ── Changement mot de passe ───────────────────────────────────────
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) { res.status(404).json({ error: 'Utilisateur introuvable' }); return; }

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) { res.status(400).json({ error: 'Mot de passe actuel incorrect' }); return; }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { password: await bcrypt.hash(newPassword, SALT_ROUNDS) },
    }),
    // Invalider toutes les autres sessions
    prisma.refreshToken.deleteMany({ where: { userId: user.id } }),
  ]);

  res.json({ message: 'Mot de passe modifié avec succès. Reconnectez-vous.' });
};
