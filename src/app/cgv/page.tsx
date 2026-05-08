import type { Metadata } from 'next';
import Link from 'next/link';
import LegalLayout from '@/components/legal/LegalLayout';

export const metadata: Metadata = {
  title: 'Conditions générales de vente',
  description: 'Conditions générales de vente de la boutique en ligne Venips — Guinée, Conakry.',
};

export default function CGVPage() {
  return (
    <LegalLayout title="Conditions générales de vente" lastUpdate="6 mai 2026">
      <h2>1. Préambule</h2>
      <p>
        Les présentes conditions générales de vente (« CGV ») régissent l'ensemble des transactions
        effectuées sur le site <strong>venips.com</strong>, exploité par <strong>Venips</strong>,
        entreprise basée à Conakry, Guinée. Toute commande passée sur le site implique l'acceptation
        sans réserve des présentes CGV.
      </p>

      <h2>2. Produits</h2>
      <p>
        Venips commercialise des produits high-tech : téléphones, ordinateurs, accessoires, gaming,
        TV et audio. Les produits proposés sont décrits avec la plus grande exactitude possible,
        toutefois de légères variations peuvent exister entre les visuels présentés sur le site et le
        produit livré.
      </p>

      <h2>3. Prix</h2>
      <p>
        Les prix affichés sur le site sont indiqués en <strong>francs guinéens (GNF)</strong>, toutes
        taxes comprises. Venips se réserve le droit de modifier ses prix à tout moment, étant entendu
        que le prix appliqué sera celui en vigueur au moment de la validation de la commande.
      </p>

      <h2>4. Commande</h2>
      <p>
        Toute commande passée sur le site fait l'objet d'une confirmation par email. La commande est
        ferme et définitive après validation du paiement. Venips se réserve le droit de refuser ou
        annuler toute commande en cas de litige avec le client, de stock insuffisant ou de paiement
        suspect.
      </p>

      <h2>5. Modes de paiement</h2>
      <p>Les paiements peuvent être effectués via :</p>
      <ul>
        <li><strong>Wave</strong></li>
        <li><strong>Orange Money</strong></li>
        <li><strong>Carte bancaire</strong> (Visa, Mastercard)</li>
        <li><strong>Paiement à la livraison</strong> (cash) — sous conditions</li>
      </ul>

      <h2>6. Livraison</h2>
      <p>
        Venips livre <strong>partout en Guinée</strong>. Les délais de livraison sont indicatifs et
        varient en fonction de la zone géographique. La livraison est <strong>gratuite</strong> dans
        l'agglomération de Conakry et offerte selon les conditions précisées au moment de la
        commande pour les autres zones.
      </p>
      <p>
        En cas de retard de livraison, le client en sera informé par email ou téléphone. La
        responsabilité de Venips ne pourra être engagée en cas de retard dû à un cas de force majeure.
      </p>

      <h2>7. Droit de rétractation et retours</h2>
      <p>
        Le client dispose d'un délai de <strong>30 jours</strong> à compter de la réception du
        produit pour exercer son droit de retour, à condition que le produit soit dans son emballage
        d'origine, non utilisé et accompagné de tous ses accessoires.
      </p>
      <p>
        Les frais de retour sont à la charge du client, sauf en cas de produit défectueux ou erreur
        de Venips. Le remboursement intervient dans un délai de 14 jours suivant la réception du
        produit retourné.
      </p>

      <h2>8. Garantie</h2>
      <p>
        Tous les produits neufs vendus par Venips bénéficient de la <strong>garantie légale du
        constructeur</strong>. La durée et les modalités de garantie varient selon les marques.
        Les produits reconditionnés ou d'occasion sont vendus avec une garantie spécifique précisée
        sur la fiche produit.
      </p>

      <h2>9. Données personnelles</h2>
      <p>
        Les données collectées dans le cadre des commandes sont traitées conformément à notre{' '}
        <Link href="/confidentialite">Politique de confidentialité</Link>.
      </p>

      <h2>10. Litiges et droit applicable</h2>
      <p>
        Les présentes CGV sont soumises au <strong>droit guinéen</strong>. Tout litige relatif à
        leur interprétation ou exécution sera porté devant les tribunaux compétents de Conakry, après
        tentative de résolution amiable.
      </p>

      <h2>11. Contact</h2>
      <ul>
        <li>Email : <a href="mailto:venips.gn@gmail.com">venips.gn@gmail.com</a></li>
        <li>Téléphone : <a href="tel:+224628880354">+224 628 880 354</a></li>
        <li>Adresse : Conakry, Guinée</li>
      </ul>
    </LegalLayout>
  );
}
