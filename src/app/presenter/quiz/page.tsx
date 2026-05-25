"use client";
import { useState, useEffect } from "react";

const REAL_ARTWORKS = [
  { id: "r1", type: "image", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/The_Great_Wave_off_Kanagawa.jpg/500px-The_Great_Wave_off_Kanagawa.jpg", isAI: false, title: "A Grande Onda de Kanagawa (Hokusai)" },
  { id: "r2", type: "image", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Las_Meninas%2C_by_Diego_Vel%C3%A1zquez%2C_from_Prado_in_Google_Earth.jpg/500px-Las_Meninas%2C_by_Diego_Vel%C3%A1zquez%2C_from_Prado_in_Google_Earth.jpg", isAI: false, title: "Las Meninas (Velázquez)" },
  { id: "r3", type: "image", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Grant_Wood_-_American_Gothic_-_Google_Art_Project.jpg/500px-Grant_Wood_-_American_Gothic_-_Google_Art_Project.jpg", isAI: false, title: "American Gothic (Grant Wood)" },
  { id: "r4", type: "image", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Eug%C3%A8ne_Delacroix_-_Le_28_Juillet._La_Libert%C3%A9_guidant_le_peuple.jpg/500px-Eug%C3%A8ne_Delacroix_-_Le_28_Juillet._La_Libert%C3%A9_guidant_le_peuple.jpg", isAI: false, title: "A Liberdade Guiando o Povo (Delacroix)" },
  { id: "r5", type: "image", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/The_Night_Watch_-_HD.jpg/500px-The_Night_Watch_-_HD.jpg", isAI: false, title: "Ronda Noturna (Rembrandt)" }
];

export default function PresenterQuizPage() {
  const [rounds, setRounds] = useState<any[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const fetchGalleryForQuiz = async () => {
      try {
        const res = await fetch("/api/gallery");
        const data = await res.json();
        
        let aiImages = [];
        if (data.items) {
          aiImages = data.items
            .filter((item: any) => item.type === "image")
            .map((item: any) => ({
              id: item.id,
              type: "image",
              url: item.url,
              isAI: true,
              title: `Criado por ${item.author}`
            }))
            .slice(0, 5); // Pega as 5 artes de IA mais recentes
        }

        // Junta as Reais com as de IA e embaralha
        const combined = [...REAL_ARTWORKS, ...aiImages].sort(() => Math.random() - 0.5);
        setRounds(combined);
      } catch (e) {
        console.error("Erro ao buscar galeria para o quiz:", e);
        setRounds(REAL_ARTWORKS); // Fallback para as reais se der erro
      }
    };
    
    fetchGalleryForQuiz();
  }, []);

  if (rounds.length === 0) {
    return (
      <main className="min-h-screen bg-[var(--color-puc-dark)] text-white p-10 flex items-center justify-center">
        <h1 className="text-3xl animate-pulse">Carregando Quiz...</h1>
      </main>
    );
  }

  const nextRound = () => {
    if (currentRound < rounds.length - 1) {
      setCurrentRound(prev => prev + 1);
      setShowResult(false);
    }
  };

  const round = rounds[currentRound];

  return (
    <main className="min-h-screen bg-[var(--color-puc-dark)] text-white p-10 flex flex-col">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-[var(--color-puc-light)]">Desafio: IA ou Humano?</h1>
        <div className="text-2xl bg-white/20 px-6 py-2 rounded-full backdrop-blur-sm">
          Rodada {currentRound + 1} de {rounds.length}
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center space-y-12">
        
        <div className="bg-white/10 p-10 rounded-3xl backdrop-blur-md border border-white/20 w-full max-w-4xl shadow-2xl flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden">
          
          {!showResult && (
            <div className="absolute top-4 bg-black/50 px-4 py-2 rounded-full z-10">
              <p className="text-lg font-bold text-yellow-300">Levantem as mãos! Quem acha que é IA?</p>
            </div>
          )}

          {round.type === "image" ? (
             // eslint-disable-next-line @next/next/no-img-element
            <img src={round.url} alt="Desafio" className="max-w-full max-h-[500px] rounded-xl shadow-lg object-contain" />
          ) : (
            <p className="text-4xl italic font-serif text-center whitespace-pre-wrap leading-relaxed">
              &quot;{round.content}&quot;
            </p>
          )}

          {showResult && (
            <div className="absolute inset-0 bg-[var(--color-puc-dark)]/90 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-10 animate-in fade-in duration-500 z-20">
              <h2 className={`text-6xl font-extrabold mb-6 ${round.isAI ? 'text-cyan-400' : 'text-green-400'}`}>
                {round.isAI ? "🤖 FEITO POR IA!" : "👩‍🎨 FEITO POR HUMANO!"}
              </h2>
              <p className="text-3xl text-white font-serif italic text-center max-w-2xl">{round.title}</p>
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
            Revelar Resposta 👀
          </button>
        ) : (
          <button 
            onClick={nextRound}
            disabled={currentRound === rounds.length - 1}
            className="bg-[var(--color-puc-light)] hover:bg-white text-[var(--color-puc-dark)] text-2xl font-bold py-6 px-12 rounded-full shadow-2xl transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentRound === rounds.length - 1 ? "Fim do Quiz 🎉" : "Próxima Rodada →"}
          </button>
        )}
      </footer>

    </main>
  );
}
