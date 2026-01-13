console.log("🔥 SERVER.JS LOADED FROM:", __filename);
require("dotenv").config();
require("./db/pg");

// ✅ Mongo
const { connectMongo } = require("./db/mongo");
connectMongo();

const app = require("./app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
