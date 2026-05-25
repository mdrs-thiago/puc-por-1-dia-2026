"use client";
import Link from "next/link";
import { useState } from "react";
import DownloadButton from "@/components/DownloadButton";

export default function PoesiaPage() {
  const [nome, setNome] = useState("");
  const [theme, setTheme] = useState("");
  const [style, setStyle] = useState("soneto");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!theme) return alert("Por favor, digite um tema.");
    setIsLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "text", prompt: theme, style, autor: nome })
      });
      const data = await res.json();
      if (data.result) {
        setResult(data.result);
      } else {
        alert(data.error || "Erro ao gerar poema.");
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
            Poesia com IA
          </h1>
        </div>

        {/* Instructions */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-600 text-sm">
            Escolha um tema e um estilo literário. A inteligência artificial escreverá um poema inédito baseado nas suas escolhas.
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
              placeholder="Ex: Carlos Oliveira"
              className="w-full p-4 rounded-xl border border-gray-200 focus:border-[var(--color-puc-brown)] focus:ring-1 focus:ring-[var(--color-puc-brown)] outline-none text-gray-900 bg-white"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="theme" className="block text-sm font-bold text-[var(--color-puc-dark)]">
              Tema do Poema
            </label>
            <input 
              type="text"
              id="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="Ex: O pôr do sol na praia de Ipanema"
              className="w-full p-4 rounded-xl border border-gray-200 focus:border-[var(--color-puc-brown)] focus:ring-1 focus:ring-[var(--color-puc-brown)] outline-none text-gray-900 bg-white"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="style" className="block text-sm font-bold text-[var(--color-puc-dark)]">
              Estilo Literário
            </label>
            <select 
              id="style"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full p-4 rounded-xl border border-gray-200 focus:border-[var(--color-puc-brown)] focus:ring-1 focus:ring-[var(--color-puc-brown)] outline-none bg-white text-gray-900"
            >
              <option value="soneto">Soneto Clássico</option>
              <option value="cordel">Literatura de Cordel</option>
              <option value="haikai">Haikai Japonês</option>
              <option value="rap">Rap / Hip Hop</option>
              <option value="modernista">Modernista</option>
            </select>
          </div>

          <button 
            type="button"
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full bg-[var(--color-puc-brown)] hover:bg-[#7a321d] text-white font-bold py-4 rounded-xl shadow-md transition-colors mt-4 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Escrevendo...
              </>
            ) : "Escrever Poema 📝"}
          </button>
        </form>

        {/* Result Area */}
        {result && (
          <div className="mt-8 p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
            <h3 className="font-bold text-[var(--color-puc-dark)] mb-2">Seu Poema:</h3>
            <p className="text-gray-700 whitespace-pre-wrap italic mb-4">
              {result}
            </p>
            <DownloadButton result={result} type="text" author={nome} />
          </div>
        )}

      </div>
    </main>
  );
}
