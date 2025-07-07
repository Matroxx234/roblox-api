const express = require("express");
const cors = require("cors");
const { getGamePasses } = require("./utils");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/passes/:userId", async (req, res) => {
  const userId = req.params.userId;
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ error: "UserId invalide" });
  }

  const passes = await getGamePasses(userId);

  return res.json({ passes });
});

app.get("/", (req, res) => {
  res.send("API Roblox GamePass Ready.");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
