import json
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Charger les données depuis le fichier JSON des lignes
with open("lignes_ddd.json", "r") as f:
    lignes = json.load(f)

# Charger les données depuis le fichier JSON des arrêts
with open("arrets.json", "r") as f:
    arrets = json.load(f)

# --- GESTION DES INCIDENTS (Lab 7) ---

# Liste globale temporaire pour stocker les incidents en mémoire
incidents = []

@app.route("/incidents", methods=["GET"])
def get_incidents():
    """Retourne la liste de tous les incidents signalés"""
    return jsonify(incidents)

@app.route("/incidents", methods=["POST"])
def post_incident():
    """Permet de signaler un nouvel incident sur une ligne"""
    data = request.get_json()
    
    # Validation : vérification des champs obligatoires
    if not data or "ligne" not in data or "description" not in data:
        return jsonify({"erreur": "Champs requis manquants"}), 400
        
    # Création du nouvel incident avec un ID auto-incrémenté
    incident = {
        "id": len(incidents) + 1,
        "ligne": data["ligne"],
        "description": data["description"],
        "lieu": data.get("lieu", "Non precise")
    }
    
    incidents.append(incident)
    return jsonify(incident), 201

# --- AUTRES ENDPOINTS EXISTANTS ---

@app.route("/")
def accueil():
    return jsonify({
        "message": "Bienvenue sur l'API SenTransport !",
        "endpoints": ["/lignes", "/lignes/<id>", "/arrets", "/stats", "/lignes/recherche", "/incidents"]
    })

@app.route("/lignes")
def get_lignes():
    return jsonify(lignes)

@app.route("/lignes/<int:ligne_id>")
def get_ligne(ligne_id):
    ligne = next(
        (l for l in lignes if l["id"] == ligne_id),
        None
    )
    if ligne is None:
        return jsonify({"erreur": "Ligne non trouvee"}), 404
    return jsonify(ligne)

@app.route("/arrets")
def get_arrets():
    return jsonify(arrets)

@app.route("/stats")
def get_stats():
    nombre_lignes = len(lignes)
    somme_arrets = sum(ligne["arrets"] for ligne in lignes)
    
    # Trouver la ligne avec le maximum d'arrêts
    ligne_max = max(lignes, key=lambda x: x["arrets"])
    
    return jsonify({
        "total_lignes": nombre_lignes,
        "total_arrets": somme_arrets,
        "ligne_plus_longue": ligne_max["numero"]
    })

@app.route("/lignes/recherche")
def rechercher_lignes():
    # Récupérer le paramètre 'q' (vide par défaut)
    query = request.args.get("q", "").lower()
    
    resultats = [
        l for l in lignes 
        if query in l["depart"].lower() or query in l["arrivee"].lower()
    ]
    
    return jsonify(resultats)

# TOUJOURS À LA FIN DU FICHIER
if __name__ == "__main__":
    # Remplacement par host="0.0.0.0" pour autoriser les tests sur PC et mobile en local
    app.run(debug=True, host="0.0.0.0", port=5000)