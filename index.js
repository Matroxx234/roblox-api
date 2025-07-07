const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Cache mémoire (anti 429)
const cache = new Map();
const CACHE_DURATION = 60 * 1000; // 60 secondes

// Test route
app.get("/", (_, res) => {
  res.send("✅ API Roblox GamePass en ligne avec cache");
});

// GamePass route
app.get("/api/passes/:userId", async (req, res) => {
  const userId = req.params.userId;

  if (!/^[1-9]\d*$/.test(userId)) {
    return res.status(400).json({ error: "userId invalide" });
  }

  // Vérifie le cache
  const cached = cache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return res.json({ passes: cached.data });
  }

  // Fonction pour construire l'URL
  const buildURL = (creatorType) =>
    `https://catalog.roblox.com/v1/search/items?category=Passes&creatorTargetId=${userId}&creatorType=${creatorType}&limit=30&sortOrder=Asc`;

  // Essai avec creatorType = User
  try {
    const { data } = await axios.get(buildURL("User"));

    const passes = (data.data || []).map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price || 0,
      assetType: "GamePass",
    }));

    cache.set(userId, { data: passes, timestamp: Date.now() });
    return res.json({ passes });
  } catch (err) {
    // Si 400, on tente creatorType = Group
    if (err.response?.status === 400) {
      try {
        const { data } = await axios.get(buildURL("Group"));

        const passes = (data.data || []).map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price || 0,
          assetType: "GamePass",
        }));

        cache.set(userId, { data: passes, timestamp: Date.now() });
        return res.json({ passes });
      } catch (e2) {
        if (e2.response?.status === 400) {
          return res.json({ passes: [] });
        } else {
          return handleError(e2, res);
        }
      }
    } else {
      return handleError(err, res);
    }
  }
});

// Gestion des erreurs
function handleError(err, res) {
  if (err.response?.status === 429) {
    return res
      .status(429)
      .json({ error: "Trop de requêtes – réessaie dans quelques secondes" });
  }
  console.error("getGamePasses ▶", err.message);
  return res
    .status(err.response?.status || 500)
    .json({ error: "Erreur serveur" });
}

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`▶ API en ligne sur le port ${PORT}`);
});
