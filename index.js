const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 🧠 Mémoire temporaire pour éviter le 429 de Roblox (cache en mémoire vive)
const cache = new Map(); // clé = userId, valeur = { data, timestamp }

const CACHE_DURATION_MS = 60 * 1000; // 60 secondes

// ✅ Test API
app.get("/", (_, res) => {
  res.send("✅ API Roblox GamePass OK avec cache !");
});

// 🎯 Route principale
app.get("/api/passes/:userId", async (req, res) => {
  const userId = req.params.userId;

  // Validation simple
  if (!/^\d+$/.test(userId)) {
    return res.status(400).json({ error: "userId invalide" });
  }

  // Vérifie si le résultat est en cache
  const cached = cache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
    return res.json({ passes: cached.data });
  }

  // Requête vers Roblox catalog
  const url = `https://catalog.roblox.com/v1/search/items?category=Passes&creatorTargetId=${userId}&limit=30&sortOrder=Asc`;

  try {
    const { data } = await axios.get(url);

    const passes = (data.data || []).map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price || 0,
      assetType: "GamePass",
    }));
    // Sauvegarde dans le cache
    cache.set(userId, {
      data: passes,
      timestamp: Date.now(),
    });

    return res.json({ passes });
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

// 🚀 Lancement du serveur
app.listen(PORT, () => {
  console.log(`▶ API en ligne sur le port ${PORT}`);
});
veur n'écoute qu'une seule fois ici :
app.listen(PORT, () => {
  console.log(`▶ API en ligne sur le port ${PORT}`);
});
