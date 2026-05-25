"use client";
import Link from "next/link";
import { useState } from "react";
import DownloadButton from "@/components/DownloadButton";

export default function OriginalArtPage() {
  const [nome, setNome] = useState("");
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("realista");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return alert("Por favor, digite um prompt.");
    setIsLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "image", prompt, style, autor: nome })
      });
      const data = await res.json();
      console.log("Frontend recebeu:", data);
      
      if (res.ok && data.url) {
        setResult(data.url);
      } else {
        alert(data.error || "Erro ao gerar arte.");
      }
    } catch (e) {
      alert("Erro de conexão.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-6 bg-[var(--color-puc-light)]">
      <div className="w-full max-w-md mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/" className="text-[var(--color-puc-brown)] font-bold text-xl">
            ← Voltar
          </Link>
          <h1 className="text-2xl font-bold text-[var(--color-puc-dark)] flex-1 text-center pr-10">
            Arte Original
          </h1>
        </div>

        {/* Instructions */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-600 text-sm">
            Descreva a imagem que você deseja que a IA crie. Seja criativo nos detalhes, cores e elementos!
          </p>
        </div>

        {/* Form */}
        <form className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="nome" className="block text-sm font-bold text-[var(--color-puc-dark)]">
              Seu Nome
            </label>
            <input 
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Ana Silva"
              className="w-full p-4 rounded-xl border border-gray-200 focus:border-[var(--color-puc-brown)] focus:ring-1 focus:ring-[var(--color-puc-brown)] outline-none text-gray-900 bg-white"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="prompt" className="block text-sm font-bold text-[var(--color-puc-dark)]">
              Seu Prompt (Comando)
            </label>
            <textarea 
              id="prompt"
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Um cachorro astronauta flutuando sobre o campus da PUC-Rio, em estilo pintura a óleo..."
              className="w-full p-4 rounded-xl border border-gray-200 focus:border-[var(--color-puc-brown)] focus:ring-1 focus:ring-[var(--color-puc-brown)] outline-none resize-none text-gray-900 bg-white"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="style" className="block text-sm font-bold text-[var(--color-puc-dark)]">
              Estilo da Arte
            </label>
            <select 
              id="style"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full p-4 rounded-xl border border-gray-200 focus:border-[var(--color-puc-brown)] focus:ring-1 focus:ring-[var(--color-puc-brown)] outline-none bg-white text-gray-900"
            >
              <option value="realista">Fotorealismo</option>
              <option value="aquarela">Aquarela</option>
              <option value="grafite">Grafite / Street Art</option>
              <option value="pixel">Pixel Art</option>
              <option value="cyberpunk">Cyberpunk</option>
            </select>
          </div>

          <button 
            type="button"
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full bg-[var(--color-puc-brown)] hover:bg-[#7a321d] text-white font-bold py-4 rounded-xl shadow-md transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Gerando...
              </>
            ) : "Gerar Arte com IA ✨"}
          </button>
        </form>

        {/* Result Area */}
        {result ? (
          <div className="mt-8 p-4 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden text-center">
            <h3 className="font-bold text-[var(--color-puc-dark)] mb-2">Sua Obra:</h3>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={result} alt="Arte gerada" className="w-full rounded-lg shadow-sm" crossOrigin="anonymous" />
            <DownloadButton result={result} type="image" author={nome} />
          </div>
        ) : (
          <div className="mt-8 p-4 border-2 border-dashed border-gray-300 rounded-2xl text-center text-gray-400">
            Sua arte aparecerá aqui...
          </div>
        )}

      </div>
    </main>
  );
}
