const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (_, res) => {
  res.send("✅ API Roblox GamePass fonctionne sans token !");
});

app.get("/api/passes/:userId", async (req, res) => {
  const userId = req.params.userId;
  if (!/^\d+$/.test(userId)) {
    return res.status(400).json({ error: "userId invalide" });
  }

  const url = `https://catalog.roblox.com/v1/search/items?category=Passes&creatorTargetId=${userId}&limit=30&sortOrder=Asc`;

  try {
    const { data } = await axios.get(url);

    const passes = (data.data || []).map(item => ({
      id: item.id,
      name: item.name,
      price: item.price || 0,
      assetType: "GamePass"
    }));

    res.json({ passes });
  } catch (err) {
    console.error("getGamePasses ▶", err.message);
    return res.status(err.response?.status || 500).json({ error: "Erreur lors de la récupération des Game Pass" });
  }
});

app.listen(PORT, () => {
  console.log(`▶ API en ligne sur le port ${PORT}`);
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`▶ API en ligne sur le port ${PORT}`);
});
