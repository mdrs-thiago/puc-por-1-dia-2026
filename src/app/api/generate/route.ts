import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log(">> [API] Recebeu payload:", body);
    
    const { type, prompt, style, obraBase } = body;

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const USE_MOCK = process.env.USE_MOCK === "true";

    console.log(">> [API] USE_MOCK está ativo?", USE_MOCK);

    if (type === "text") {
      if (USE_MOCK) {
        return NextResponse.json({ result: `(Mock) Poema sobre ${prompt} no estilo ${style}. A brisa do mar, leva o meu olhar...` });
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
          model: "gpt-4-turbo",
          messages: [
            { role: "system", content: "Você é um poeta. Escreva um poema curto, de no máximo 2 estrofes." },
            { role: "user", content: `Escreva um poema no estilo ${style} sobre: ${prompt}` }
          ]
        })
      });
      const data = await response.json();
      console.log(">> [API] Resposta OpenAI (Texto):", data);
      
      if (data.error) {
         return NextResponse.json({ error: data.error.message }, { status: 500 });
      }
      return NextResponse.json({ result: data.choices[0].message.content });
    }

    if (type === "image") {
      if (USE_MOCK) {
        return NextResponse.json({ url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/400px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg" });
      }

      if (!OPENAI_API_KEY) {
        console.error(">> [API] ERRO: OPENAI_API_KEY não encontrada.");
        return NextResponse.json({ error: "Chave da OpenAI não configurada no .env" }, { status: 500 });
      }

      const finalPrompt = obraBase 
        ? `Faça uma releitura da famosa obra de arte '${obraBase}', aplicando as seguintes modificações: ${prompt}.` 
        : `Crie uma imagem no estilo ${style}. Descrição: ${prompt}`;

      console.log(">> [API] Chamando OpenAI (Imagem) com prompt:", finalPrompt);
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: "gpt-image-1",
          prompt: finalPrompt,
          size: "1024x1024",
          quality: "low"
        })
      });
      const data = await response.json();
      console.log(">> [API] Resposta OpenAI (Imagem):", JSON.stringify(data, null, 2));
      
      if (data.error) {
         console.error(">> [API] Erro da OpenAI:", data.error);
         return NextResponse.json({ error: data.error.message }, { status: 500 });
      }

      if (!data.data || !data.data[0] || (!data.data[0].url && !data.data[0].b64_json)) {
         console.error(">> [API] Resposta não contém URL nem b64_json:", data);
         return NextResponse.json({ error: "A API não retornou uma imagem válida." }, { status: 500 });
      }

      const imageUrl = data.data[0].url || `data:image/png;base64,${data.data[0].b64_json}`;
      return NextResponse.json({ url: imageUrl });
    }

    return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
  } catch (error: any) {
    console.error(">> [API] Erro fatal no servidor:", error.message || error);
    return NextResponse.json({ error: "Falha interna no servidor." }, { status: 500 });
  }
}
