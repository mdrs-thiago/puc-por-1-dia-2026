import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-[var(--color-puc-light)]">
      <div className="w-full max-w-md mx-auto space-y-8">
        
        {/* Header / Logo Area */}
        <div className="text-center space-y-2">
          <div className="w-32 h-52 mx-auto bg-[var(--color-puc-brown)] text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-lg">
            <img src="https://soulscience.com.br/wp-content/uploads/2023/10/logo-puc-rio1.png" alt="PUC" className="w-full h-42 object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--color-puc-dark)]">IA & Arte</h1>
          <p className="text-[var(--color-puc-brown)] font-medium">Oficina Criativa</p>
        </div>

        {/* Welcome Text */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
          <p className="text-gray-600">
            Bem-vindo(a) ao nosso ateliê virtual! Escolha uma atividade abaixo para começar a criar usando Inteligência Artificial.
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="space-y-4">
          <Link href="/moment2/original" className="block w-full">
            <div className="bg-[var(--color-puc-brown)] hover:bg-[#7a321d] transition-colors text-white p-4 rounded-xl shadow-md text-center">
              <h2 className="text-xl font-bold">Arte Original</h2>
              <p className="text-sm opacity-90">Crie uma obra do zero com a IA</p>
            </div>
          </Link>
          
          <Link href="/moment2/releitura" className="block w-full">
            <div className="bg-[var(--color-puc-dark)] hover:bg-[#4a3131] transition-colors text-white p-4 rounded-xl shadow-md text-center">
              <h2 className="text-xl font-bold">Releitura</h2>
              <p className="text-sm opacity-90">Transforme obras de arte famosas</p>
            </div>
          </Link>

          <Link href="/moment2/poesia" className="block w-full">
            <div className="bg-white border-2 border-[var(--color-puc-brown)] hover:bg-gray-50 transition-colors text-[var(--color-puc-brown)] p-4 rounded-xl shadow-sm text-center">
              <h2 className="text-xl font-bold">Poesia Algorítmica</h2>
              <p className="text-sm">Gere um poema com suas ideias</p>
            </div>
          </Link>

          <div className="pt-6">
            <Link href="/moment3/quiz" className="block w-full">
              <div className="bg-gradient-to-r from-[var(--color-puc-brown)] to-[var(--color-puc-dark)] text-white p-4 rounded-xl shadow-lg text-center transform hover:scale-[1.02] transition-transform">
                <h2 className="text-xl font-bold">Desafio Final</h2>
                <p className="text-sm opacity-90">Humano ou IA? Teste seus conhecimentos!</p>
              </div>
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
