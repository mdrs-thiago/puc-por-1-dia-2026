"use client";
import { useState } from "react";

const ROUNDS = [
  { id: 1, type: "image", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/400px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg", isAI: false, title: "Monalisa (Da Vinci)" },
  { id: 2, type: "text", content: "A máquina pensa em binário,\nO humano sonha em cores,\nMas juntos pintam um cenário,\nDe novos e vivos amores.", isAI: true, title: "Poema Binário" },
];

export default function PresenterQuizPage() {
  const [currentRound, setCurrentRound] = useState(0);
  const [showResult, setShowResult] = useState(false);

  // Mock votes
  const mockVotes = { humano: 24, ia: 15 };

  const nextRound = () => {
    if (currentRound < ROUNDS.length - 1) {
      setCurrentRound(prev => prev + 1);
      setShowResult(false);
    }
  };

  const round = ROUNDS[currentRound];

  return (
    <main className="min-h-screen bg-[var(--color-puc-dark)] text-white p-10 flex flex-col">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-[var(--color-puc-light)]">Desafio: IA ou Humano?</h1>
        <div className="text-2xl bg-white/20 px-6 py-2 rounded-full backdrop-blur-sm">
          Rodada {currentRound + 1} de {ROUNDS.length}
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center space-y-12">
        
        <div className="bg-white/10 p-10 rounded-3xl backdrop-blur-md border border-white/20 w-full max-w-4xl shadow-2xl flex flex-col items-center justify-center min-h-[500px]">
          {round.type === "image" ? (
             // eslint-disable-next-line @next/next/no-img-element
            <img src={round.url} alt="Desafio" className="max-w-full max-h-[400px] rounded-xl shadow-lg" />
          ) : (
            <p className="text-4xl italic font-serif text-center whitespace-pre-wrap leading-relaxed">
              &quot;{round.content}&quot;
            </p>
          )}

          {showResult && (
            <div className="absolute inset-0 bg-[var(--color-puc-dark)]/90 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-10 animate-in fade-in duration-500">
              <h2 className="text-6xl font-extrabold mb-6">
                {round.isAI ? "🤖 FEITO POR IA!" : "👩‍🎨 FEITO POR HUMANO!"}
              </h2>
              <p className="text-2xl mb-12 text-[var(--color-puc-light)]">Obra: {round.title}</p>
              
              <div className="flex w-full max-w-2xl gap-8">
                <div className="flex-1 bg-[#2E8B57] rounded-2xl p-6 text-center">
                  <p className="text-xl mb-2">Votos Humano</p>
                  <p className="text-5xl font-bold">{mockVotes.humano}</p>
                </div>
                <div className="flex-1 bg-[#4682B4] rounded-2xl p-6 text-center">
                  <p className="text-xl mb-2">Votos IA</p>
                  <p className="text-5xl font-bold">{mockVotes.ia}</p>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      <footer className="flex justify-center gap-6 mt-10">
        {!showResult ? (
          <button 
            onClick={() => setShowResult(true)}
            className="bg-[var(--color-puc-brown)] hover:bg-[#7a321d] text-white text-2xl font-bold py-6 px-12 rounded-full shadow-2xl transition-transform hover:scale-105"
          >
            Revelar Resposta e Votos 👀
          </button>
        ) : (
          <button 
            onClick={nextRound}
            disabled={currentRound === ROUNDS.length - 1}
            className="bg-[var(--color-puc-light)] hover:bg-white text-[var(--color-puc-dark)] text-2xl font-bold py-6 px-12 rounded-full shadow-2xl transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Próxima Rodada →
          </button>
        )}
      </footer>

    </main>
  );
}
