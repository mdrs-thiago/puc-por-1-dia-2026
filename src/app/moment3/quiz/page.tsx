"use client";
import Link from "next/link";
import { useState } from "react";

export default function QuizPage() {
  const [voted, setVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleVote = (option: "humano" | "ia") => {
    setVoted(true);
    setSelectedOption(option);
    // In a real app, this would send the vote to the backend (Firebase, Supabase, KV)
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-[var(--color-puc-dark)] text-white">
      <div className="w-full max-w-md mx-auto space-y-8 text-center">
        
        {/* Header */}
        <div className="absolute top-6 left-6">
          <Link href="/" className="text-white/70 font-bold hover:text-white">
            ← Sair
          </Link>
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">Desafio Final</h1>
          <p className="text-[var(--color-puc-light)] opacity-80">
            Olhe para o telão! A arte exibida foi feita por um Humano ou por Inteligência Artificial?
          </p>
        </div>

        {!voted ? (
          <div className="grid grid-cols-1 gap-4 mt-8">
            <button 
              onClick={() => handleVote("humano")}
              className="bg-[#2E8B57] hover:bg-[#236b43] text-white font-bold py-10 rounded-2xl shadow-lg text-2xl transition-transform transform hover:scale-105"
            >
              👩‍🎨 Feito por Humano
            </button>
            <button 
              onClick={() => handleVote("ia")}
              className="bg-[#4682B4] hover:bg-[#346288] text-white font-bold py-10 rounded-2xl shadow-lg text-2xl transition-transform transform hover:scale-105"
            >
              🤖 Feito por IA
            </button>
          </div>
        ) : (
          <div className="mt-10 bg-white/10 p-8 rounded-3xl backdrop-blur-sm border border-white/20">
            <h2 className="text-2xl font-bold mb-4">Voto Registrado!</h2>
            <p className="text-lg mb-6">Você escolheu: <span className="font-bold text-[var(--color-puc-brown)]">{selectedOption === "humano" ? "Humano" : "IA"}</span></p>
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-t-[var(--color-puc-brown)] border-white/20 rounded-full animate-spin mb-4"></div>
              <p>Aguarde o professor revelar a resposta no telão...</p>
            </div>
            
            <button 
              onClick={() => { setVoted(false); setSelectedOption(null); }}
              className="mt-8 text-sm text-white/50 underline"
            >
              Nova Rodada (Modo Teste)
            </button>
          </div>
        )}

      </div>
    </main>
  );
}
