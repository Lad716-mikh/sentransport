import { useState, useEffect } from 'react';
import './App.css';
import Header from './Header';
import Recherche from './Recherche';
import LigneBus from './LigneBus';
import DetailLigne from './DetailLigne';
import Footer from './Footer';

function App() {
  // 1. Trois etats (Etape 3)
  const [lignes, setLignes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [recherche, setRecherche] = useState("");
  const [ligneSelectionnee, setLigneSelectionnee] = useState(null);
  
  const [compteur, setCompteur] = useState(0);

  // 2. Charger les donnees au demarrage (Etape 3)
  useEffect(() => {
    fetch("http://localhost:5000/lignes")
      .then(response => {
        if (!response.ok) {
          throw new Error(
            "Erreur serveur : " + response.status
          );
        }
        return response.json();
      })
      .then(data => {
        setLignes(data);
        setChargement(false);
      })
      .catch(error => {
        setErreur(error.message);
        setChargement(false);
      });
  }, []);

  // Gestion de la recherche
  const handleRechercheChange = (valeur) => {
    setRecherche(valeur);
    setCompteur(compteur + 1);
  };

  const lignesFiltrees = lignes.filter(l =>
    l.depart.toLowerCase().includes(recherche.toLowerCase()) ||
    l.arrivee.toLowerCase().includes(recherche.toLowerCase()) ||
    l.numero.includes(recherche)
  );

  function handleClickLigne(ligne) {
    if (ligneSelectionnee && ligneSelectionnee.id === ligne.id) {
      setLigneSelectionnee(null);
    } else {
      setLigneSelectionnee(ligne);
    }
  }

  // --- ÉTAPE 4 : Écrans de chargement et d'erreur ---

  // Ecran de chargement
  if (chargement) {
    return (
      <div className="App">
        <Header />
        <main className="contenu">
          <p className="message-chargement">
            Chargement des lignes...
          </p>
        </main>
      </div>
    );
  }

  // Ecran d'erreur
  if (erreur) {
    return (
      <div className="App">
        <Header />
        <main className="contenu">
          <div className="message-erreur">
            <p>Impossible de charger les lignes.</p>
            <p className="erreur-detail">{erreur}</p>
            <p>Verifiez que le serveur Flask est lance (python api/app.py).</p>
          </div>
        </main>
      </div>
    );
  }

  // Ecran normal (inchangé par rapport au Lab 3)
  return (
    <div className="App">
      <Header />
      <main className="contenu">
        <p className="compteur">Vous avez effectué {compteur} recherche(s)</p>

        <div className="recherche-container" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Recherche valeur={recherche} onChange={handleRechercheChange} />
          <button onClick={() => setRecherche("")} className="btn-effacer">
            Effacer
          </button>
        </div>
        
        <p className="resultat-recherche">
          {lignesFiltrees.length} ligne{lignesFiltrees.length > 1 ? 's' : ''} trouvée{lignesFiltrees.length > 1 ? 's' : ''}
        </p>

        {lignesFiltrees.length === 0 && (
          <p className="message-erreur">Aucune ligne trouvée</p>
        )}

        {lignesFiltrees.map(ligne => (
          <LigneBus
            key={ligne.id}
            numero={ligne.numero}
            depart={ligne.depart}
            arrivee={ligne.arrivee}
            arrets={ligne.arrets}
            estSelectionnee={ligneSelectionnee && ligneSelectionnee.id === ligne.id}
            onClick={() => handleClickLigne(ligne)}
          />
        ))}

        {ligneSelectionnee && <DetailLigne ligne={ligneSelectionnee} />}
      </main>
      <Footer />
    </div>
  );
}

export default App;