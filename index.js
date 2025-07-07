const axios = require("axios");

async function getGamePasses(userId) {
  try {
    const url = `https://inventory.roblox.com/v1/users/${userId}/assets?assetTypes=GamePass`;
    const { data } = await axios.get(url);

    const passes = data.data.map((item) => ({
      id: item.id,
      name: item.name,
      price: 0, // tu peux aussi appeler /api/productinfo si tu veux le prix
      assetType: "GamePass"
    }));

    return passes;
  } catch (error) {
    console.error("getGamePasses:", error.message);
    return [];
  }
}

module.exports = { getGamePasses };
