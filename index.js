const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

/* ──────────────────────────────
   CACHE 60 s pour éviter le 429
   ────────────────────────────── */
const cache = new Map();                 // key = userId
const CACHE_MS = 60 * 1000;              // 1 minute

/* ──────────────────────────────
   ROUTE RACINE (test rapide)
   ────────────────────────────── */
app.get("/", (_, res) =>
  res.send("✅ API Roblox GamePass en ligne – cache 60 s")
);

/* ──────────────────────────────
   ROUTE GAME PASS
   ────────────────────────────── */
app.get("/api/passes/:userId", async (req, res) => {
  const userId = req.params.userId;

  /* validation */
  if (!/^[1-9]\d*$/.test(userId)) {
    return res.status(400).json({ error: "userId invalide" });
  }

  /* cache */
  const hit = cache.get(userId);
  if (hit && Date.now() - hit.t < CACHE_MS)
    return res.json({ passes: hit.data });

  /* URL OFFICIELLE – passe par /catalog.roblox.com/ */
  const makeURL = (creatorType = "User") =>
    `https://catalog.roblox.com/v1/search/items?` +
    `category=Passes&creatorTargetId=${userId}` +
    `&creatorType=${creatorType}&limit=30&sortOrder=Asc`;

  /* ───── premier essai : créateur = User ───── */
  try {
    const { data } = await axios.get(makeURL("User"));

    const passes = (data.data || []).map(it => ({
      id:    it.id,
      name:  it.name,
      price: it.price || 0,
      assetType: "GamePass"
    }));

    cache.set(userId, { data: passes, t: Date.now() });
    return res.json({ passes });
  } catch (err) {
    /* 400 signifie souvent que Roblox veut creatorType=Group,
       ou qu’il n’y a PAS de passes : on tente un 2ᵉ appel. */
    if (err.response?.status === 400) {
      try {
        const { data } = await axios.get(makeURL("Group"));
        const passes = (data.data || []).map(it => ({
          id: it.id,
          name: it.name,
          price: it.price || 0,
          assetType: "GamePass"
        }));
        cache.set(userId, { data: passes, t: Date.now() });
        return res.json({ passes });
      } catch (e2) {
        /* si encore 400 => aucun pass, on renvoie vide */
        if (e2.response?.status === 400)
          return res.json({ passes: [] });
        return sendError(e2, res);
      }
    }
    return sendError(err, res);
  }
});

/* ──────────────────────────────
   FONCTION D’ERREUR GÉNÉRIQUE
   ────────────────────────────── */
function sendError(err, res) {
  if (err.response?.status === 429)
    return res.status(429).json({ error: "Trop de requêtes : réessaie plus tard" });
  console.error("getGamePasses ▶", err.message);
  return res.status(err.response?.status || 500)
            .json({ error: "Erreur interne ou Roblox indisponible" });
}

/* ──────────────────────────────
   DÉMARRAGE SERVEUR
   ────────────────────────────── */
app.listen(PORT, () =>
  console.log(`▶ API prête sur le port ${PORT}`)
);

});
