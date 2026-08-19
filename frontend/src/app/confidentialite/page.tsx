export const metadata = { title: 'Politique de confidentialité' };

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-bold text-ink">
        Politique de confidentialité (RGPD)
      </h1>

      <div className="prose prose-sm mt-6 max-w-none space-y-4 text-ink/80">
        <section>
          <h2 className="font-display text-base font-medium text-ink">Données collectées</h2>
          <p>
            Lorsque vous utilisez le formulaire de contact d&apos;une annonce, nous collectons
            votre nom, votre adresse e-mail, votre numéro de téléphone (facultatif) et le contenu
            de votre message, afin de les transmettre au vendeur du véhicule concerné.
          </p>
        </section>

        <section>
          <h2 className="font-display text-base font-medium text-ink">Finalité et base légale</h2>
          <p>
            Ces données sont traitées sur la base de votre consentement, dans le seul but de
            mettre en relation acheteurs et vendeurs de véhicules d&apos;occasion.
          </p>
        </section>

        <section>
          <h2 className="font-display text-base font-medium text-ink">Durée de conservation</h2>
          <p>
            Les messages de contact sont conservés pendant une durée de [X mois à définir],
            au-delà de laquelle ils sont supprimés ou anonymisés.
          </p>
        </section>

        <section>
          <h2 className="font-display text-base font-medium text-ink">Vos droits</h2>
          <p>
            Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez
            d&apos;un droit d&apos;accès, de rectification, de suppression et d&apos;opposition
            concernant vos données personnelles. Pour l&apos;exercer, contactez-nous à
            l&apos;adresse [e-mail à compléter].
          </p>
        </section>

        <section>
          <h2 className="font-display text-base font-medium text-ink">Cookies</h2>
          <p>
            Un identifiant de session anonyme est stocké dans un cookie afin de mémoriser vos
            favoris et votre comparateur de véhicules. Ce cookie ne contient aucune donnée
            personnelle identifiante.
          </p>
        </section>

        <p className="text-xs text-ink/50">
          Ce modèle de politique de confidentialité doit être adapté et validé par un
          professionnel du droit avant mise en production.
        </p>
      </div>
    </div>
  );
}
