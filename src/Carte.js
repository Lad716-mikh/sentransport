import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Carte.css';

// Corriger les icônes Leaflet par défaut (bug webpack)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Icône par défaut explicite (évite le bug icon={undefined})
const iconeDefaut = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Icône orange pour l'arrêt le plus proche
const iconeArretProche = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Calculer la distance entre 2 points GPS (km)
function calculerDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Mini-composant pour gérer le bouton de recentrage
function BoutonCentrer({ position }) {
  const map = useMap();

  if (!position) return null;

  return (
    <button
      className="btn-centrer"
      onClick={() => map.setView(position, 14)}
      type="button"
    >
      🎯 Centrer sur ma position
    </button>
  );
}

function Carte() {
  const [arrets, setArrets] = useState([]);
  const [positionUtilisateur, setPositionUtilisateur] = useState(null);
  const [arretProche, setArretProche] = useState(null);
  const [topArrets, setTopArrets] = useState([]);
  const DAKAR = [14.6928, -17.4467];

  // Charger les arrêts depuis Flask
  useEffect(() => {
    fetch("http://localhost:5000/arrets")
      .then((r) => r.json())
      .then((data) => setArrets(data))
      .catch((err) => console.error("Erreur arrêts :", err));
  }, []);

  // Géolocalisation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPositionUtilisateur([
            pos.coords.latitude,
            pos.coords.longitude,
          ]);
        },
        () => console.log("Géolocalisation refusée")
      );
    }
  }, []);

  // Calculs de proximité
  useEffect(() => {
    if (positionUtilisateur && arrets.length > 0) {
      const arretsAvecDistance = arrets.map(a => {
        const d = calculerDistance(
          positionUtilisateur[0],
          positionUtilisateur[1],
          a.lat,
          a.lon
        );
        return { ...a, distance: d };
      });

      arretsAvecDistance.sort((a, b) => a.distance - b.distance);

      setArretProche(arretsAvecDistance[0]);
      setTopArrets(arretsAvecDistance.slice(0, 3));
    }
  }, [positionUtilisateur, arrets]);

  return (
    <div className="carte-container">
      <h2 className="carte-titre">Carte des arrêts</h2>

      {positionUtilisateur && topArrets.length > 0 && (
        <div className="top-arrets-box">
          <h3>📌 Les 3 arrêts les plus proches de vous :</h3>
          <ul>
            {topArrets.map((a, index) => (
              <li key={a.id} className={index === 0 ? "premier-arret" : ""}>
                <strong>{a.nom}</strong> ({a.distance.toFixed(2)} km)
                <span className="lignes-badge">Lignes: {a.lignes.join(', ')}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <MapContainer center={DAKAR} zoom={13} className="carte">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <BoutonCentrer position={positionUtilisateur} />

        {arrets.map((a) => {
          const estLePlusProche = arretProche && arretProche.id === a.id;

          return (
            <Marker
              key={a.id}
              position={[a.lat, a.lon]}
              icon={estLePlusProche ? iconeArretProche : iconeDefaut}
            >
              <Popup>
                <strong>{a.nom}</strong> {estLePlusProche && "⭐️ (Le plus proche)"} <br />
                Lignes : {a.lignes.join(", ")}
              </Popup>
            </Marker>
          );
        })}

        {positionUtilisateur && (
          <Marker position={positionUtilisateur} icon={iconeDefaut}>
            <Popup>Vous êtes ici</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

export default Carte;
