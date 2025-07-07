const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Route racine pour tester si l'API fonctionne
app.get("/", (_, res) => {
  res.send("✅ API Roblox GamePass en ligne");
});

// Route pour récupérer les Game Pass d'un utilisateur
app.get("/api/passes/:userId", async (req, res) => {
  const userId = req.params.userId;

  // Vérifie que userId est un nombre valide
  if (!/^\d+$/.test(userId)) {
    return res.status(400).json({ error: "userId invalide" });
  }

  // Nouvelle API Roblox (mars 2025) pour récupérer les Game Pass
  const url = `https://apis.roblox.com/game-passes/v1/users/${userId}/game-passes?count=100`;

  try {
    const { data } = await axios.get(url);

    const passes = (data.data || []).map(p => ({
      id: p.id,
      name: p.name,
      price: p.price || 0,
      assetType: "GamePass"
    }));

    return res.json({ passes });
  } catch (error) {
    // Si l'utilisateur n'a aucun pass ou est introuvable → retourne liste vide
    if (error.response?.status === 404) {
      return res.json({ passes: [] });
    }

    console.error("getGamePasses ▶", error.message);
    return res
      .status(error.response?.status || 500)
      .json({ error: "Erreur lors de la récupération des passes" });
  }
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`▶ API en ligne sur le port ${PORT}`);
});
