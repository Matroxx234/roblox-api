/**
 * API Roblox – Récupération des Game Pass d’un utilisateur
 * Version : 1.0.0
 *
 * Déploiement compatible Render :
 *   • Build Command  : npm install
 *   • Start Command  : npm start
 *   • Environment    : Node
 */

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

/* Render fournit la variable d’environnement PORT automatiquement.
   En local, on écoute le port 3000 par défaut. */
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

/**
 * GET /api/passes/:userId
 * Renvoie les Game Pass publics appartenant au joueur.
 * Exemple : /api/passes/156
 */
app.get("/api/passes/:userId", async (req, res) => {
  const userId = req.params.userId;

  // Vérification basique :
  if (!/^\d+$/.test(userId)) {
    return res.status(400).json({ error: "userId invalide" });
  }

  try {
    // On interroge l’inventaire Roblox pour le type GamePass
    const robloxUrl = `https://inventory.roblox.com/v1/users/${userId}/assets?assetTypes=GamePass&limit=100&sortOrder=Asc`;
    const { data } = await axios.get(robloxUrl);

    const passes = (data.data || []).map((item) => ({
      id: item.id,
      name: item.name,
      // À toi d’ajouter un appel /economy/ pour obtenir le prix si besoin
      price: 0,
      assetType: "GamePass",
    }));

    return res.json({ passes });
  } catch (error) {
    console.error("getGamePasses ▶", error.message);
    return res
      .status(error.response?.status || 500)
      .json({ error: "Erreur lors de la récupération des passes" });
  }
});

/* Route racine – pratique pour vérifier rapidement que le serveur tourne */
app.get("/", (_, res) => {
  res.send("Roblox Game Pass API – online ✅");
});

/* Lancement du serveur */
app.listen(PORT, () => {
  console.log(`▶ API active sur le port ${PORT}`);
});
