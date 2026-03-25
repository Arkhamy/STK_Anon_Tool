import React from 'react';

const FeatureCard = ({ icon, children }) => (
  <div className="bg-neutral-800/50 p-6 rounded-lg border border-neutral-700/80 text-center flex flex-col items-center shadow-lg hover:border-orange-500/50 hover:bg-neutral-800 transition-all duration-300 h-full">
    {icon}
    {children}
  </div>
);

export default function WelcomeScreen() {
  return (
    <div className="w-full max-w-5xl mx-auto text-center p-8 animate-fadeIn">
        <header className="mb-12">
            <h1 className="text-5xl font-extrabold tracking-tight text-white">
                <span className="text-orange-500">TUTORIEL</span>
            </h1>
            <p className="text-neutral-400 mt-2 text-lg">Découvrez comment protéger vos documents en 3 étapes simples.</p>
        </header>

        <main>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <FeatureCard icon={<img src="/Balai.png" alt="Illustration pour le nettoyage des métadonnées" className="w-24 h-24 mb-4 object-contain"/>}>
              <h3 className="text-xl font-bold mt-4 mb-2 text-white">1. Nettoyer les Métadonnées</h3>
              <p className="text-neutral-400 text-sm px-2">
                Effacez les informations personnelles cachées de vos photos et PDFs avant de les partager.
              </p>
            </FeatureCard>

            <FeatureCard icon={<img src="/Tampon.png" alt="Illustration pour l'ajout de filigrane" className="w-24 h-24 mb-4 object-contain"/>}>
              <h3 className="text-xl font-bold mt-4 mb-2 text-white">2. Ajouter un Filigrane</h3>
              <p className="text-neutral-400 text-sm px-2">
                Protégez vos documents en y ajoutant un texte visible pour indiquer leur statut ou leur propriétaire.
              </p>
            </FeatureCard>

            <FeatureCard icon={<img src="/Stylo.png" alt="Illustration pour le masquage de contenu" className="w-24 h-24 mb-4 object-contain"/>}>
              <h3 className="text-xl font-bold mt-4 mb-2 text-white">3. Masquer le contenu</h3>
              <p className="text-neutral-400 text-sm px-2">
                Dessinez des rectangles noirs pour cacher de façon permanente les noms, adresses, ou toute autre information sensible.
              </p>
            </FeatureCard>
          </div>
        </main>
    </div>
  );
}
