import { NextResponse } from "next/server";
import Redis from "ioredis";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const USE_MOCK = process.env.USE_MOCK === "true";
    if (USE_MOCK) {
      const MOCK_GALLERY = [
        { id: "1", type: "image", prompt: "Cachorro astronauta na PUC", author: "João", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/400px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg" },
        { id: "2", type: "text", prompt: "Poema sobre o campus", author: "Maria", content: "No bosque verde do campus,\nA brisa canta devagar,\nAprender é um longo salto,\nNum mar de ideias sem fim." },
      ];
      return NextResponse.json({ items: MOCK_GALLERY });
    }

    const redis = new Redis(process.env.REDIS_URL || "");
    const rawItems = await redis.lrange("gallery", 0, 50);
    const items = rawItems.map(item => JSON.parse(item));
    
    // Close the connection explicitly in serverless environments to prevent hanging
    redis.quit();
    
    return NextResponse.json({ items });
  } catch (error) {
    console.error("Gallery Fetch Error:", error);
    return NextResponse.json({ items: [] });
  }
}
