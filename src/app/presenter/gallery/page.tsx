"use client";
import { useEffect, useState } from "react";

export default function GalleryPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await fetch("/api/gallery");
        const data = await res.json();
        if (data.items) {
          setItems(data.items);
        }
      } catch (e) {
        console.error("Erro ao buscar galeria:", e);
      }
    };

    fetchGallery();
    const interval = setInterval(fetchGallery, 3000); // 3 segundos para parecer real-time
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-[var(--color-puc-light)] p-10">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-12 border-b-4 border-[var(--color-puc-brown)] pb-6">
          <div>
            <h1 className="text-5xl font-bold text-[var(--color-puc-dark)] tracking-tight">Galeria da Oficina</h1>
            <p className="text-2xl text-[var(--color-puc-brown)] mt-2">IA & Arte na PUC-Rio</p>
          </div>
          <div className="w-24 h-24 bg-[var(--color-puc-brown)] text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-xl">
            PUC
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transform hover:-translate-y-2 transition-transform duration-300">
              {item.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.url} alt={item.prompt} className="w-full h-64 object-cover" />
              ) : (
                <div className="w-full h-64 p-6 bg-gray-50 flex items-center justify-center overflow-y-auto">
                  <p className="text-lg italic text-gray-700 whitespace-pre-wrap text-center font-serif">
                    &quot;{item.content}&quot;
                  </p>
                </div>
              )}
              <div className="p-5 bg-white border-t border-gray-100">
                <h3 className="font-bold text-[var(--color-puc-dark)] text-lg line-clamp-1">{item.prompt}</h3>
                <p className="text-[var(--color-puc-brown)] text-sm">Criado por: {item.author}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
