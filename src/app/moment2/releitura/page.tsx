"use client";
import Link from "next/link";
import { useState } from "react";
import DownloadButton from "@/components/DownloadButton";

const OBRAS = [
  { id: 1, name: "Monalisa (Da Vinci)", imgUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/500px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg" },
  { id: 2, name: "A Noite Estrelada (Van Gogh)", imgUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/500px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg" },
  { id: 3, name: "O Grito (Munch)", imgUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/500px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg" },
  { id: 4, name: "A Criação de Adão (Michelangelo)", imgUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg/500px-Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg" }
];

export default function ReleituraPage() {
  const [selectedObra, setSelectedObra] = useState<number | null>(null);
  const [nome, setNome] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{url1: string, url2: string} | null>(null);
  const [sliderPos, setSliderPos] = useState(50);

  const handleGenerate = async () => {
    if (!prompt || !selectedObra) return alert("Por favor, selecione uma obra e digite um prompt.");
    setIsLoading(true);
    setResult(null);
    const obraBase = OBRAS.find(o => o.id === selectedObra)?.name;
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "time_tunnel", prompt, obraBase, autor: nome })
      });
      const data = await res.json();
      if (data.url1 && data.url2) {
        setResult({ url1: data.url1, url2: data.url2 });
        setSliderPos(50);
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
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/" className="text-[var(--color-puc-brown)] font-bold text-xl">
            ← Voltar
          </Link>
          <h1 className="text-2xl font-bold text-[var(--color-puc-dark)] flex-1 text-center pr-10">
            Releitura
          </h1>
        </div>

        {!result ? (
          <>
            {/* Instructions */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-gray-600 text-sm mb-4">
                1. Escolha uma obra clássica abaixo.<br/>
                2. Diga à IA como você quer transformar essa obra. A IA gerará uma nova imagem baseada apenas na sua descrição e no nome da obra!
              </p>
              
              {/* Gallery Selection */}
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                {OBRAS.map((obra) => (
                  <div 
                    key={obra.id}
                    onClick={() => setSelectedObra(obra.id)}
                    className={`relative rounded-xl overflow-hidden cursor-pointer border-4 transition-all ${
                      selectedObra === obra.id ? "border-[var(--color-puc-brown)] scale-105" : "border-transparent"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={obra.imgUrl} alt={obra.name} className="w-full h-32 object-cover" />
                    <div className="absolute bottom-0 w-full bg-black/60 text-white text-xs p-1 text-center font-bold">
                      {obra.name}
                    </div>
                  </div>
                ))}
              </div>
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
                  placeholder="Ex: João Souza"
                  className="w-full p-4 rounded-xl border border-gray-200 focus:border-[var(--color-puc-brown)] focus:ring-1 focus:ring-[var(--color-puc-brown)] outline-none text-gray-900 bg-white"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="prompt" className="block text-sm font-bold text-[var(--color-puc-dark)]">
                  Como você quer transformar essa obra?
                </label>
                <textarea 
                  id="prompt"
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ex: Adicione óculos de sol nela e um fundo cyberpunk neon..."
                  className="w-full p-4 rounded-xl border border-gray-200 focus:border-[var(--color-puc-brown)] focus:ring-1 focus:ring-[var(--color-puc-brown)] outline-none resize-none text-gray-900 bg-white disabled:bg-gray-100"
                  disabled={!selectedObra}
                />
              </div>

              <button 
                type="button"
                onClick={handleGenerate}
                disabled={!selectedObra || isLoading}
                className="w-full bg-[var(--color-puc-brown)] disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-[#7a321d] text-white font-bold py-4 rounded-xl shadow-md transition-colors mt-4 flex justify-center items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Transformando...
                  </>
                ) : "Transformar Obra 🎨"}
              </button>
            </form>
          </>
        ) : null}

        {result && (
          <div className="mt-8 p-4 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-2xl">⏳</span>
              <h3 className="font-bold text-[var(--color-puc-dark)]">Túnel do Tempo</h3>
            </div>
            
            <div className="relative w-full aspect-square rounded-lg overflow-hidden select-none mb-2 shadow-inner bg-gray-100">
              {/* Imagem 2 (Futuro) */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={result.url2} alt="Futuro" className="absolute inset-0 w-full h-full object-cover" crossOrigin="anonymous" />
              
              {/* Imagem 1 (Passado) - Cortada */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={result.url1} 
                alt="Passado"
                className="absolute inset-0 w-full h-full object-cover" 
                style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
                crossOrigin="anonymous"
              />

              {/* Linha do Slider */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-white flex items-center justify-center z-0"
                style={{ left: `calc(${sliderPos}% - 2px)` }}
              >
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-200 text-gray-400">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18-6-6 6-6"/><path d="m15 18 6-6-6-6"/></svg>
                </div>
              </div>

              {/* Input invisível para controle */}
              <input 
                type="range" 
                min="0" max="100" 
                value={sliderPos} 
                onChange={(e) => setSliderPos(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
              />
            </div>
            
            <div className="flex justify-between px-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-6">
              <span>Passado Fiel</span>
              <span>Futuro Cyberpunk</span>
            </div>

            <DownloadButton result={result.url2} type="image" author={nome} />
            <button 
              onClick={() => setResult(null)} 
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl shadow-sm transition-colors mt-4"
            >
              Fazer Nova Viagem
            </button>
          </div>
        )}

      </div>
    </main>
  );
}
