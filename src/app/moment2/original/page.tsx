"use client";
import Link from "next/link";
import { useState } from "react";
import DownloadButton from "@/components/DownloadButton";

export default function OriginalArtPage() {
  const [nome, setNome] = useState("");
  const [sujeito, setSujeito] = useState("");
  const [ambiente, setAmbiente] = useState("");
  const [clima, setClima] = useState("");
  const [style, setStyle] = useState("realista");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [critique, setCritique] = useState("");
  const [enhancedPrompt, setEnhancedPrompt] = useState("");

  const handleGenerate = async () => {
    if (!sujeito) return alert("Por favor, preencha o sujeito principal.");
    setIsLoading(true);
    setResult(null);
    setCritique("");
    setEnhancedPrompt("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "image", sujeito, ambiente, clima, style, autor: nome })
      });
      const data = await res.json();
      console.log("Frontend recebeu:", data);
      
      if (res.ok && data.url) {
        setResult(data.url);
        setCritique(data.critique || "");
        setEnhancedPrompt(data.enhancedPrompt || "");
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

        {!result ? (
          <>
            {/* Instructions */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-gray-600 text-sm">
                Vamos montar um comando (prompt) perfeito! Responda as 3 perguntas abaixo e a IA vai juntar tudo.
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
                <label htmlFor="sujeito" className="block text-sm font-bold text-[var(--color-puc-dark)]">
                  1. Qual é o sujeito principal?
                </label>
                <input 
                  type="text"
                  id="sujeito"
                  value={sujeito}
                  onChange={(e) => setSujeito(e.target.value)}
                  placeholder="Ex: Um cachorro astronauta"
                  className="w-full p-4 rounded-xl border border-gray-200 focus:border-[var(--color-puc-brown)] focus:ring-1 focus:ring-[var(--color-puc-brown)] outline-none text-gray-900 bg-white"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="ambiente" className="block text-sm font-bold text-[var(--color-puc-dark)]">
                  2. Onde ele está? (Ambiente)
                </label>
                <input 
                  type="text"
                  id="ambiente"
                  value={ambiente}
                  onChange={(e) => setAmbiente(e.target.value)}
                  placeholder="Ex: Flutuando sobre o campus da PUC"
                  className="w-full p-4 rounded-xl border border-gray-200 focus:border-[var(--color-puc-brown)] focus:ring-1 focus:ring-[var(--color-puc-brown)] outline-none text-gray-900 bg-white"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="clima" className="block text-sm font-bold text-[var(--color-puc-dark)]">
                  3. Como é a luz ou o clima?
                </label>
                <input 
                  type="text"
                  id="clima"
                  value={clima}
                  onChange={(e) => setClima(e.target.value)}
                  placeholder="Ex: Pôr do sol, luzes neon, dramático..."
                  className="w-full p-4 rounded-xl border border-gray-200 focus:border-[var(--color-puc-brown)] focus:ring-1 focus:ring-[var(--color-puc-brown)] outline-none text-gray-900 bg-white"
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
          </>
        ) : (
          <div className="mt-8 p-4 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden text-center">
            <h3 className="font-bold text-[var(--color-puc-dark)] mb-2">Sua Obra:</h3>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={result} alt="Arte gerada" className="w-full rounded-lg shadow-sm mb-4" crossOrigin="anonymous" />
            
            {enhancedPrompt && (
              <div className="bg-gray-100 p-3 rounded-lg text-left mb-4 border border-gray-200">
                <p className="text-xs font-bold text-gray-500 uppercase">Seu super prompt:</p>
                <p className="text-sm text-gray-800 italic">"{enhancedPrompt}"</p>
              </div>
            )}

            {critique && (
              <div className="bg-[var(--color-puc-brown)] bg-opacity-10 p-4 rounded-xl text-left border border-[var(--color-puc-brown)] mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">🧐</span>
                  <span className="font-bold text-[var(--color-puc-dark)]">O Crítico Diz:</span>
                </div>
                <p className="text-sm text-gray-800">{critique}</p>
              </div>
            )}

            <DownloadButton result={result} type="image" author={nome} />
            <button 
              onClick={() => setResult(null)} 
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl shadow-sm transition-colors mt-4"
            >
              Criar Nova Arte
            </button>
          </div>
        )}

      </div>
    </main>
  );
}
