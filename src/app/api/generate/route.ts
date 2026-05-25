import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import Redis from "ioredis";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log(">> [API] Recebeu payload:", body);
    
    const { type, prompt, style, obraBase, autor, sujeito, ambiente, clima } = body;

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const USE_MOCK = process.env.USE_MOCK === "true";

    console.log(">> [API] USE_MOCK está ativo?", USE_MOCK);

    // 1. Moderação de Conteúdo (combina campos para moderar tudo)
    const textToModerate = [prompt, sujeito, ambiente, clima, obraBase].filter(Boolean).join(" ");
    if (!USE_MOCK && OPENAI_API_KEY && textToModerate) {
      console.log(">> [API] Verificando Moderação de Conteúdo...");
      const modRes = await fetch("https://api.openai.com/v1/moderations", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify({ input: textToModerate })
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
        const critique = `(Mock Crítico) Uma tentativa curiosa de poesia. Fascinante e rudimentar!`;
        const redis = new Redis(process.env.REDIS_URL || "");
        await redis.lpush('gallery', JSON.stringify({ id: Date.now().toString(), type: "text", prompt, author: autor || "Anônimo", content: text }));
        redis.quit();
        return NextResponse.json({ result: text, critique });
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

      // Gerar Crítica
      const criticRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: "gpt-4-turbo",
          messages: [
            { role: "system", content: "Você é um crítico literário esnobe, dramático e muito exigente, mas no fundo adorável. Faça uma crítica de no máximo 2 frases sobre o poema a seguir. Seja irônico ou exageradamente poético na sua avaliação." },
            { role: "user", content: resultText }
          ]
        })
      });
      const criticData = await criticRes.json();
      const critique = criticData.choices?.[0]?.message?.content || "Sem palavras para essa obra.";
      
      // Salvar no KV
      const redis = new Redis(process.env.REDIS_URL || "");
      await redis.lpush('gallery', JSON.stringify({ id: Date.now().toString(), type: "text", prompt, author: autor || "Anônimo", content: resultText }));
      redis.quit();

      return NextResponse.json({ result: resultText, critique });
    }

    if (type === "image") {
      if (USE_MOCK) {
        const mockUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/400px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg";
        const critique = `(Mock Crítico) As pinceladas são ousadas, quase um desastre genérico, mas eu adorei!`;
        const redis = new Redis(process.env.REDIS_URL || "");
        await redis.lpush('gallery', JSON.stringify({ id: Date.now().toString(), type: "image", prompt: sujeito || prompt, author: autor || "Anônimo", url: mockUrl }));
        redis.quit();
        return NextResponse.json({ url: mockUrl, critique, enhancedPrompt: "Prompt Curado de Mock" });
      }

      if (!OPENAI_API_KEY) return NextResponse.json({ error: "Chave da OpenAI não configurada" }, { status: 500 });

      const finalPrompt = sujeito 
        ? `Uma imagem em estilo ${style}. Sujeito principal: ${sujeito}. Ambiente: ${ambiente}. Clima e Iluminação: ${clima}. Crie algo muito artístico e detalhado.` 
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
      
      // Gerar Crítica Baseada no Prompt
      const criticRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: "gpt-4-turbo",
          messages: [
            { role: "system", content: "Você é um curador de arte francês muito excêntrico e levemente arrogante. O usuário descreveu uma obra de arte. Faça uma crítica de no máximo 2 frases avaliando a 'escolha ousada' dos elementos descritos." },
            { role: "user", content: finalPrompt }
          ]
        })
      });
      const criticData = await criticRes.json();
      const critique = criticData.choices?.[0]?.message?.content || "Uma obra indecifrável.";

      // Fazer download da imagem
      console.log(">> [API] Fazendo upload da imagem para o Vercel Blob...");
      const imgFetchRes = await fetch(imageUrl);
      const blobData = await imgFetchRes.blob();
      const blobResult = await put(`arte-${Date.now()}.png`, blobData, { access: 'public' });
      
      // Salvar no Vercel KV
      const redis = new Redis(process.env.REDIS_URL || "");
      await redis.lpush('gallery', JSON.stringify({ id: Date.now().toString(), type: "image", prompt: sujeito || prompt, author: autor || "Anônimo", url: blobResult.url }));
      redis.quit();

      return NextResponse.json({ url: blobResult.url, critique, enhancedPrompt: finalPrompt });
    }

    if (type === "time_tunnel") {
      if (USE_MOCK) {
        const mockUrl1 = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/400px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg";
        const mockUrl2 = "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/400px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg";
        return NextResponse.json({ url1: mockUrl1, url2: mockUrl2 });
      }

      if (!OPENAI_API_KEY) return NextResponse.json({ error: "Chave da OpenAI não configurada" }, { status: 500 });

      const prompt1 = `Faça uma releitura EXATA da obra '${obraBase}', mas aplicando as seguintes modificações rigorosamente: ${prompt}. Mantenha o estilo clássico original.`;
      const prompt2 = `Faça uma releitura da obra '${obraBase}' no estilo CYBERPUNK 2077, com luzes neon, tecnologia futurista. Aplique a seguinte ideia junto: ${prompt}.`;

      console.log(">> [API] Iniciando Time Tunnel...");
      const genImage = async (p: string) => {
        const response = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
          body: JSON.stringify({ model: "gpt-image-1-mini", prompt: p, n: 1, size: "1024x1024", quality: "low" })
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        
        const imageUrl = data.data[0].url || `data:image/png;base64,${data.data[0].b64_json}`;
        const imgFetchRes = await fetch(imageUrl);
        const blobData = await imgFetchRes.blob();
        const blobResult = await put(`arte-timetunnel-${Date.now()}.png`, blobData, { access: 'public' });
        return blobResult.url;
      };

      // Roda as duas requisições ao DALL-E em paralelo para economizar tempo
      try {
        const [url1, url2] = await Promise.all([genImage(prompt1), genImage(prompt2)]);
        
        const redis = new Redis(process.env.REDIS_URL || "");
        await redis.lpush('gallery', JSON.stringify({ id: Date.now().toString(), type: "image", prompt: `${prompt} (Releitura ${obraBase})`, author: autor || "Anônimo", url: url1 }));
        redis.quit();

        return NextResponse.json({ url1, url2 });
      } catch (e: any) {
         return NextResponse.json({ error: e.message || "Erro no Time Tunnel" }, { status: 500 });
      }
    }

    return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
  } catch (error: any) {
    console.error(">> [API] Erro fatal no servidor:", error.message || error);
    return NextResponse.json({ error: "Falha interna no servidor." }, { status: 500 });
  }
}
