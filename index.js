const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Route principale de test
app.get("/", (_, res) => {
  res.send("✅ API Roblox GamePass est en ligne !");
});

// Route : récupération des Game Pass d’un utilisateur Roblox
app.get("/api/passes/:userId", async (req, res) => {
  const userId = req.params.userId;

  if (!/^\d+$/.test(userId)) {
    return res.status(400).json({ error: "userId invalide" });
  }

  const robloxUrl = `https://inventory.roblox.com/v1/users/${userId}/assets?assetTypes=GamePass&limit=100&sortOrder=Asc`;

  try {
    const { data } = await axios.get(robloxUrl);

    const passes = (data.data || []).map((item) => ({
      id: item.id,
      name: item.name,
      price: 0, // Tu peux ajouter une requête pour le prix réel
      assetType: "GamePass",
    }));

    return res.json({ passes });
  } catch (error) {
    // Si aucun Game Pass : on retourne une liste vide au lieu d'une erreur
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
  console.log(`▶ API active sur le port ${PORT}`);
});
