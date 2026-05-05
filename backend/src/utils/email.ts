import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM || 'Venips <noreply@venips.com>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@venips.gn';
const SITE_URL = process.env.FRONTEND_URL || 'https://venips.com';

async function send(to: string | string[], subject: string, html: string) {
  if (!resend) {
    console.warn('⚠️ RESEND_API_KEY manquant — email non envoyé:', subject);
    return;
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    console.error('❌ Erreur envoi email:', err);
  }
}

const layout = (title: string, body: string) => `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;padding:30px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.05);">
        <tr><td style="background:linear-gradient(135deg,#020B3A,#041459);padding:30px;text-align:center;">
          <h1 style="color:#00D8D8;margin:0;font-size:28px;font-weight:800;letter-spacing:-0.5px;">VENIPS</h1>
          <p style="color:#a0aec0;margin:6px 0 0;font-size:13px;">Boutique tech en Guinée</p>
        </td></tr>
        <tr><td style="padding:40px 30px;color:#2d3748;line-height:1.6;">
          <h2 style="margin:0 0 20px;color:#1a202c;font-size:22px;">${title}</h2>
          ${body}
        </td></tr>
        <tr><td style="background:#f7fafc;padding:24px 30px;text-align:center;color:#718096;font-size:12px;border-top:1px solid #e2e8f0;">
          <p style="margin:0 0 8px;">Venips — Conakry, Guinée</p>
          <p style="margin:0;"><a href="${SITE_URL}" style="color:#00A0A0;text-decoration:none;">venips.com</a> · <a href="mailto:contact@venips.com" style="color:#00A0A0;text-decoration:none;">contact@venips.com</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

export async function sendWelcomeEmail(user: { email: string; prenom: string }) {
  const body = `
    <p>Bonjour <strong>${user.prenom}</strong>,</p>
    <p>Bienvenue sur <strong>Venips</strong> ! Ton compte a bien été créé.</p>
    <p>Tu peux dès maintenant explorer notre catalogue de produits high-tech : téléphones, ordinateurs, accessoires, gaming, et plus encore.</p>
    <p style="text-align:center;margin:30px 0;">
      <a href="${SITE_URL}/catalogue" style="background:linear-gradient(135deg,#22c55e,#15803d);color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:700;display:inline-block;">Découvrir le catalogue</a>
    </p>
    <p style="color:#718096;font-size:14px;">Une question ? Réponds simplement à cet email.</p>
  `;
  await send(user.email, 'Bienvenue chez Venips 🎉', layout('Bienvenue !', body));
}

export async function sendOrderConfirmationEmail(
  user: { email: string; prenom: string },
  order: { orderNumber: string; total: number; subtotal: number; discount: number; shippingCost: number; paymentMethod: string; items: { name: string; price: number; quantity: number }[] }
) {
  const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' GNF';
  const itemsHtml = order.items.map(i => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #edf2f7;">${i.name} <span style="color:#a0aec0;">× ${i.quantity}</span></td>
      <td style="padding:10px 0;border-bottom:1px solid #edf2f7;text-align:right;font-weight:600;">${fmt(i.price * i.quantity)}</td>
    </tr>`).join('');

  const body = `
    <p>Bonjour <strong>${user.prenom}</strong>,</p>
    <p>Merci pour ta commande ! Nous l'avons bien reçue et elle est en cours de traitement.</p>
    <div style="background:#f7fafc;border-radius:12px;padding:20px;margin:20px 0;">
      <p style="margin:0;color:#718096;font-size:13px;">N° de commande</p>
      <p style="margin:4px 0 0;font-weight:700;font-size:18px;color:#1a202c;">${order.orderNumber}</p>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
      ${itemsHtml}
      <tr><td style="padding:14px 0 6px;color:#718096;">Sous-total</td><td style="padding:14px 0 6px;text-align:right;color:#718096;">${fmt(order.subtotal)}</td></tr>
      ${order.discount > 0 ? `<tr><td style="padding:6px 0;color:#16a34a;">Réduction</td><td style="padding:6px 0;text-align:right;color:#16a34a;">-${fmt(order.discount)}</td></tr>` : ''}
      <tr><td style="padding:6px 0;color:#718096;">Livraison</td><td style="padding:6px 0;text-align:right;color:#718096;">${order.shippingCost === 0 ? 'Gratuite' : fmt(order.shippingCost)}</td></tr>
      <tr><td style="padding:14px 0 0;font-weight:800;font-size:18px;border-top:2px solid #1a202c;">TOTAL</td><td style="padding:14px 0 0;text-align:right;font-weight:800;font-size:18px;border-top:2px solid #1a202c;color:#00A0A0;">${fmt(order.total)}</td></tr>
    </table>
    <p><strong>Mode de paiement :</strong> ${order.paymentMethod}</p>
    <p>Nous te contacterons rapidement pour confirmer la livraison. Tu peux suivre ta commande dans ton espace client.</p>
    <p style="text-align:center;margin:30px 0;">
      <a href="${SITE_URL}/compte/commandes" style="background:#00A0A0;color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:700;display:inline-block;">Voir ma commande</a>
    </p>
  `;
  await send(user.email, `Commande confirmée — ${order.orderNumber}`, layout('Commande confirmée ✓', body));

  // Notify admin
  const adminBody = `
    <p>Nouvelle commande de <strong>${user.prenom}</strong> (${user.email}).</p>
    <p><strong>N° :</strong> ${order.orderNumber}<br><strong>Total :</strong> ${fmt(order.total)}<br><strong>Paiement :</strong> ${order.paymentMethod}</p>
    <table width="100%" cellpadding="0" cellspacing="0">${itemsHtml}</table>
  `;
  await send(ADMIN_EMAIL, `🛒 Nouvelle commande ${order.orderNumber}`, layout('Nouvelle commande', adminBody));
}

export async function sendPasswordResetEmail(user: { email: string; prenom: string }, token: string) {
  const url = `${SITE_URL}/auth/reset-password?token=${token}`;
  const body = `
    <p>Bonjour <strong>${user.prenom}</strong>,</p>
    <p>Tu as demandé à réinitialiser ton mot de passe Venips. Clique sur le bouton ci-dessous pour en créer un nouveau.</p>
    <p style="text-align:center;margin:30px 0;">
      <a href="${url}" style="background:linear-gradient(135deg,#22c55e,#15803d);color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:700;display:inline-block;">Réinitialiser mon mot de passe</a>
    </p>
    <p style="color:#718096;font-size:13px;">Ce lien expire dans 1 heure. Si tu n'as pas fait cette demande, ignore simplement cet email — ton compte reste sécurisé.</p>
    <p style="color:#a0aec0;font-size:12px;word-break:break-all;">Lien manuel : ${url}</p>
  `;
  await send(user.email, 'Réinitialiser ton mot de passe Venips', layout('Mot de passe oublié ?', body));
}
