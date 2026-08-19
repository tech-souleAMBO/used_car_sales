export const metadata = { title: 'Mentions légales' };

export default function LegalNoticePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-bold text-ink">Mentions légales</h1>
      <div className="prose prose-sm mt-6 max-w-none text-ink/80">
        <p>
          <strong>Éditeur du site :</strong> [Raison sociale à compléter], société [forme
          juridique] au capital de [montant] €, immatriculée au RCS de [ville] sous le numéro
          [SIREN/SIRET], dont le siège social est situé [adresse].
        </p>
        <p>
          <strong>Directeur de la publication :</strong> [Nom du représentant légal]
        </p>
        <p>
          <strong>Hébergeur :</strong> [Nom de l&apos;hébergeur], [adresse de l&apos;hébergeur]
        </p>
        <p>
          <strong>Contact :</strong> [e-mail de contact]
        </p>
        <p className="text-xs text-ink/50">
          Ce modèle de mentions légales doit être complété avec les informations réelles de la
          société avant mise en production, conformément à la loi n° 2004-575 du 21 juin 2004
          pour la confiance dans l&apos;économie numérique (LCEN).
        </p>
      </div>
    </div>
  );
}
