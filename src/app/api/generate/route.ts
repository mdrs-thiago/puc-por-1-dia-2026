import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import Redis from "ioredis";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log(">> [API] Recebeu payload:", body);
    
    const { type, prompt, style, obraBase, autor } = body;

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const USE_MOCK = process.env.USE_MOCK === "true";

    console.log(">> [API] USE_MOCK está ativo?", USE_MOCK);

    // 1. Moderação de Conteúdo
    if (!USE_MOCK && OPENAI_API_KEY) {
      console.log(">> [API] Verificando Moderação de Conteúdo...");
      const modRes = await fetch("https://api.openai.com/v1/moderations", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify({ input: prompt })
      });
      const modData = await modRes.json();
      if (modData.results && modData.results[0]?.flagged) {
        console.warn(">> [API] CONTEÚDO BLOQUEADO PELA MODERAÇÃO:", prompt);
        return NextResponse.json({ error: "Este conteúdo não é permitido pelas diretrizes do evento (Violência, ódio, etc)." }, { status: 400 });
      }
    }

    if (type === "text") {
      if (USE_MOCK) {
        const text = `(Mock) Poema sobre ${prompt} no estilo ${style}. A brisa do mar, leva o meu olhar...`;
        const redis = new Redis(process.env.REDIS_URL || "");
        await redis.lpush('gallery', JSON.stringify({ id: Date.now().toString(), type: "text", prompt, author: autor || "Anônimo", content: text }));
        redis.quit();
        return NextResponse.json({ result: text });
      }

      if (!OPENAI_API_KEY) {
        console.error(">> [API] ERRO: OPENAI_API_KEY não encontrada.");
        return NextResponse.json({ error: "Chave da OpenAI não configurada no .env" }, { status: 500 });
      }

      console.log(">> [API] Chamando OpenAI (Texto)...");
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "Você é um poeta. Escreva um poema curto, de no máximo 2 estrofes." },
            { role: "user", content: `Escreva um poema no estilo ${style} sobre: ${prompt}` }
          ]
        })
      });
      const data = await response.json();
      if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 });
      
      const resultText = data.choices[0].message.content;
      
      // Salvar no KV
      const redis = new Redis(process.env.REDIS_URL || "");
      await redis.lpush('gallery', JSON.stringify({ id: Date.now().toString(), type: "text", prompt, author: autor || "Anônimo", content: resultText }));
      redis.quit();

      return NextResponse.json({ result: resultText });
    }

    if (type === "image") {
      if (USE_MOCK) {
        const mockUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/400px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg";
        const redis = new Redis(process.env.REDIS_URL || "");
        await redis.lpush('gallery', JSON.stringify({ id: Date.now().toString(), type: "image", prompt, author: autor || "Anônimo", url: mockUrl }));
        redis.quit();
        return NextResponse.json({ url: mockUrl });
      }

      if (!OPENAI_API_KEY) return NextResponse.json({ error: "Chave da OpenAI não configurada" }, { status: 500 });

      const finalPrompt = obraBase 
        ? `Faça uma releitura da famosa obra de arte '${obraBase}', aplicando as seguintes modificações: ${prompt}.` 
        : `Crie uma imagem no estilo ${style}. Descrição: ${prompt}`;

      console.log(">> [API] Chamando OpenAI (Imagem) com prompt:", finalPrompt);
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: "gpt-image-1-mini",
          prompt: finalPrompt,
          n: 1,
          size: "1024x1024",
          quality: "low"
        })
      });
      const data = await response.json();
      if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 });

      const imageUrl = data.data[0].url || `data:image/png;base64,${data.data[0].b64_json}`;
      
      // Fazer download da imagem (seja URL ou base64) para o servidor e enviar pro Vercel Blob
      console.log(">> [API] Fazendo upload da imagem para o Vercel Blob...");
      const imgFetchRes = await fetch(imageUrl);
      const blobData = await imgFetchRes.blob();
      const blobResult = await put(`arte-${Date.now()}.png`, blobData, { access: 'public' });
      console.log(">> [API] Imagem salva no Blob:", blobResult.url);

      // Salvar no Vercel KV apenas os metadados levinho
      const redis = new Redis(process.env.REDIS_URL || "");
      await redis.lpush('gallery', JSON.stringify({ id: Date.now().toString(), type: "image", prompt, author: autor || "Anônimo", url: blobResult.url }));
      redis.quit();

      return NextResponse.json({ url: blobResult.url });
    }

    return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
  } catch (error: any) {
    console.error(">> [API] Erro fatal no servidor:", error.message || error);
    return NextResponse.json({ error: "Falha interna no servidor." }, { status: 500 });
  }
}
