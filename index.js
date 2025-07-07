const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 🧠 Cache en mémoire pour éviter les erreurs 429
const cache = new Map();
const CACHE_DURATION_MS = 60 * 1000;

// Route racine pour tester
app.get("/", (_, res) => {
  res.send("✅ API Roblox GamePass OK avec cache !");
});

// Route principale
app.get("/api/passes/:userId", async (req, res) => {
  const userId = req.params.userId;

  if (!/^\d+$/.test(userId)) {
    return res.status(400).json({ error: "userId invalide" });
  }

  // Vérifie si en cache
  const cached = cache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
    return res.json({ passes: cached.data });
  }

  const url = `https://catalog.roblox.com/v1/search/items?category=Passes&creatorTargetId=${userId}&limit=30&sortOrder=Asc`;

  try {
    const { data } = await axios.get(url);

    const passes = (data.data || []).map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price || 0,
      assetType: "GamePass",
    }));

    cache.set(userId, {
      data: passes,
      timestamp: Date.now(),
    });

    res.json({ passes });
  } catch (err) {
    console.error("getGamePasses ▶", err.message);

    if (err.response?.status === 429) {
      return res
        .status(429)
        .json({ error: "Trop de requêtes – réessaie dans quelques secondes" });
    }

    return res
      .status(err.response?.status || 500)
      .json({ error: "Erreur lors de la récupération des Game Pass" });
  }
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`▶ API en ligne sur le port ${PORT}`);
});
