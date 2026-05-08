import type { Metadata } from 'next';
import Link from 'next/link';
import LegalLayout from '@/components/legal/LegalLayout';

export const metadata: Metadata = {
  title: 'Politique de cookies',
  description: 'Comment Venips utilise les cookies sur son site web.',
};

export default function CookiesPage() {
  return (
    <LegalLayout title="Politique de cookies" lastUpdate="6 mai 2026">
      <h2>1. Qu'est-ce qu'un cookie ?</h2>
      <p>
        Un cookie est un petit fichier texte stocké sur votre appareil (ordinateur, tablette,
        téléphone) lorsque vous visitez un site web. Les cookies permettent au site de mémoriser
        certaines informations pour faciliter votre navigation.
      </p>

      <h2>2. Cookies utilisés sur venips.com</h2>
      <p>
        Nous utilisons uniquement des <strong>cookies strictement nécessaires</strong> au
        fonctionnement du site. Aucun cookie publicitaire ni de tracking tiers n'est déposé.
      </p>

      <h3>Cookies de session</h3>
      <ul>
        <li>
          <strong>venips_rt</strong> — Cookie d'authentification sécurisé (<code>httpOnly</code>,{' '}
          <code>Secure</code>, <code>SameSite=Strict</code>). Il permet de maintenir votre session
          ouverte entre les visites. Durée : 7 jours. Inaccessible au JavaScript pour empêcher tout
          vol par script malveillant.
        </li>
      </ul>

      <h3>Stockage local (localStorage)</h3>
      <p>Pour améliorer votre expérience, certaines données sont stockées localement dans votre navigateur :</p>
      <ul>
        <li><strong>Panier</strong> — vos produits sélectionnés</li>
        <li><strong>Wishlist</strong> — vos produits favoris</li>
      </ul>
      <p>
        Ces données restent sur votre appareil et ne sont jamais envoyées à nos serveurs sans votre
        action explicite (validation de commande).
      </p>

      <h2>3. Cookies tiers</h2>
      <p>
        Notre site n'utilise actuellement <strong>aucun cookie tiers</strong> (pas de Google
        Analytics, pas de pixels Facebook, pas de publicité ciblée). Si nous décidions à l'avenir
        d'intégrer de tels services, nous mettrions à jour cette politique et solliciterions votre
        consentement préalable.
      </p>

      <h2>4. Comment gérer les cookies ?</h2>
      <p>
        Vous pouvez configurer votre navigateur pour bloquer ou supprimer les cookies. Toutefois, le
        blocage du cookie de session vous empêchera de vous connecter à votre compte.
      </p>
      <p>Liens vers les paramètres de cookies des principaux navigateurs :</p>
      <ul>
        <li>
          <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">
            Google Chrome
          </a>
        </li>
        <li>
          <a href="https://support.mozilla.org/fr/kb/cookies-informations-sites-enregistrent" target="_blank" rel="noopener noreferrer">
            Mozilla Firefox
          </a>
        </li>
        <li>
          <a href="https://support.apple.com/fr-fr/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">
            Safari
          </a>
        </li>
        <li>
          <a href="https://support.microsoft.com/fr-fr/microsoft-edge/supprimer-les-cookies-dans-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">
            Microsoft Edge
          </a>
        </li>
      </ul>

      <h2>5. Pour aller plus loin</h2>
      <p>
        Pour plus d'informations sur la gestion de vos données personnelles, consultez notre{' '}
        <Link href="/confidentialite">Politique de confidentialité</Link>.
      </p>

      <h2>6. Contact</h2>
      <p>Pour toute question relative aux cookies :</p>
      <ul>
        <li>Email : <a href="mailto:venips.gn@gmail.com">venips.gn@gmail.com</a></li>
        <li>Téléphone : <a href="tel:+224628880354">+224 628 880 354</a></li>
      </ul>
    </LegalLayout>
  );
}
