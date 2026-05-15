import json
from flask import Flask, jsonify, request  # Ajout de request ici
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Charger les données depuis le fichier JSON
with open("lignes_ddd.json", "r") as f:
    lignes = json.load(f)

@app.route("/")
def accueil():
    return jsonify({
        "message": "Bienvenue sur l'API SenTransport !",
        "endpoints": ["/lignes", "/lignes/<id>", "/arrets", "/stats", "/lignes/recherche"]
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
def get_all_arrets():
    tous_les_arrets = []
    for ligne in lignes:
        tous_les_arrets.extend(ligne["listeArrets"])
    
    # Utilisation de set() pour supprimer les doublons
    arrets_uniques = list(set(tous_les_arrets))
    return jsonify(arrets_uniques)

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
    app.run(debug=True, port=5000)