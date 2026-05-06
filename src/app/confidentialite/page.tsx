import type { Metadata } from 'next';
import Link from 'next/link';
import LegalLayout from '@/components/legal/LegalLayout';

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: 'Comment Venips collecte, utilise et protège vos données personnelles.',
};

export default function ConfidentialitePage() {
  return (
    <LegalLayout title="Politique de confidentialité" lastUpdate="6 mai 2026">
      <p>
        Chez <strong>Venips</strong>, la protection de vos données personnelles est une priorité.
        Cette politique explique de manière transparente quelles données nous collectons, pourquoi,
        comment elles sont utilisées et quels sont vos droits.
      </p>

      <h2>1. Responsable du traitement</h2>
      <p>
        Le responsable du traitement de vos données est <strong>Venips</strong>, basée à Conakry, Guinée.
        Pour toute question concernant vos données, contactez-nous à{' '}
        <a href="mailto:venips.gn@gmail.com">venips.gn@gmail.com</a>.
      </p>

      <h2>2. Données collectées</h2>
      <p>Nous collectons uniquement les données nécessaires au bon fonctionnement du service :</p>
      <ul>
        <li><strong>Données de compte</strong> : nom, prénom, email, mot de passe (hashé), numéro de téléphone</li>
        <li><strong>Données de livraison</strong> : adresses postales, ville, commune</li>
        <li><strong>Données de commande</strong> : produits commandés, montants, mode de paiement, historique d'achat</li>
        <li><strong>Données techniques</strong> : adresse IP, type de navigateur, pages consultées (à des fins statistiques)</li>
      </ul>

      <h2>3. Finalités du traitement</h2>
      <p>Vos données sont utilisées pour :</p>
      <ul>
        <li>Gérer votre compte et vos commandes</li>
        <li>Assurer la livraison de vos produits</li>
        <li>Vous envoyer des emails transactionnels (confirmation de commande, mot de passe oublié)</li>
        <li>Améliorer notre service et notre site</li>
        <li>Respecter nos obligations légales et fiscales</li>
      </ul>
      <p>
        Nous ne vendons <strong>jamais</strong> vos données à des tiers et ne les utilisons pas à
        des fins de prospection commerciale sans votre consentement explicite.
      </p>

      <h2>4. Durée de conservation</h2>
      <ul>
        <li><strong>Compte client</strong> : conservé tant que le compte est actif. Supprimé sur demande.</li>
        <li><strong>Commandes</strong> : conservées 5 ans (obligation comptable et fiscale)</li>
        <li><strong>Logs techniques</strong> : conservés 12 mois maximum</li>
      </ul>

      <h2>5. Sous-traitants</h2>
      <p>
        Nous travaillons avec des prestataires techniques de confiance pour héberger et faire
        fonctionner le site. Ces prestataires sont contractuellement engagés à protéger vos données :
      </p>
      <ul>
        <li><strong>Vercel</strong> — hébergement du site web</li>
        <li><strong>Railway</strong> — hébergement de la base de données et de l'API</li>
        <li><strong>Cloudinary</strong> — stockage des images produits</li>
        <li><strong>Resend</strong> — envoi des emails transactionnels</li>
      </ul>

      <h2>6. Sécurité</h2>
      <p>Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles :</p>
      <ul>
        <li>Connexion HTTPS chiffrée sur l'ensemble du site</li>
        <li>Mots de passe hashés avec <strong>bcrypt</strong> (jamais stockés en clair)</li>
        <li>Sessions protégées par cookies sécurisés <code>httpOnly</code></li>
        <li>Limitation des tentatives de connexion (anti-brute force)</li>
        <li>Accès restreint à la base de données et aux infrastructures</li>
      </ul>

      <h2>7. Vos droits</h2>
      <p>Vous disposez à tout moment des droits suivants :</p>
      <ul>
        <li><strong>Droit d'accès</strong> : obtenir une copie des données vous concernant</li>
        <li><strong>Droit de rectification</strong> : corriger vos données via votre espace client ou sur demande</li>
        <li><strong>Droit de suppression</strong> : demander la suppression de votre compte</li>
        <li><strong>Droit d'opposition</strong> : refuser certains traitements</li>
        <li><strong>Droit à la portabilité</strong> : récupérer vos données dans un format structuré</li>
      </ul>
      <p>
        Pour exercer ces droits, écrivez-nous à{' '}
        <a href="mailto:venips.gn@gmail.com">venips.gn@gmail.com</a>. Une réponse vous sera apportée
        dans un délai de 30 jours.
      </p>

      <h2>8. Cookies</h2>
      <p>
        L'utilisation des cookies sur notre site est détaillée dans notre{' '}
        <Link href="/cookies">Politique de cookies</Link>.
      </p>

      <h2>9. Contact</h2>
      <ul>
        <li>Email : <a href="mailto:venips.gn@gmail.com">venips.gn@gmail.com</a></li>
        <li>Téléphone : <a href="tel:+224628880354">+224 628 880 354</a></li>
        <li>Adresse : Conakry, Guinée</li>
      </ul>
    </LegalLayout>
  );
}
