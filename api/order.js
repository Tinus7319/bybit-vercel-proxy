import crypto from "crypto";

const API_KEY = process.env.BYBIT_API_KEY;
const API_SECRET = process.env.BYBIT_API_SECRET;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { symbol, side, order_type, qty } = req.body;

  if (!symbol || !side || !order_type || !qty) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const baseURL = "https://api.bybit.com"; // ✅ Juiste naam
  const timestamp = Date.now().toString();

  const body = {
    category: "spot",
    symbol,
    side,
    orderType: order_type,
    qty: qty.toString(),
    timeInForce: "IOC",
  };

  const bodyStr = JSON.stringify(body);
  const sign = crypto
    .createHmac("sha256", API_SECRET)
    .update(timestamp + API_KEY + bodyStr)
    .digest("hex");

  try {
    const response = await fetch(`${baseURL}/v5/order/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-BAPI-API-KEY": API_KEY,
        "X-BAPI-TIMESTAMP": timestamp,
        "X-BAPI-SIGN": sign,
      },
      body: bodyStr,
    });

    const json = await response.json();
    res.status(response.status).json(json);
  } catch (error) {
    console.error("Request failed:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}
