import React, { useRef, useState } from 'react';

interface DownloadButtonProps {
  result: string;
  type: "image" | "text";
  author: string;
}

export default function DownloadButton({ result, type, author }: DownloadButtonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (type === "image") {
        // Objeto imagem
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = result;

        await new Promise((resolve, reject) => { 
          img.onload = resolve; 
          img.onerror = reject;
        });

        // Configurações do Canvas (Imagem + 150px de rodapé)
        const width = img.width;
        const height = img.height + 150; 
        canvas.width = width;
        canvas.height = height;

        // Desenhar imagem gerada
        ctx.drawImage(img, 0, 0);

        // Desenhar rodapé
        ctx.fillStyle = '#653024'; // PUC Brown
        ctx.fillRect(0, img.height, width, 150);

        // Textos
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 48px sans-serif';
        ctx.fillText('PUC por 1 dia', 40, img.height + 65);
        
        ctx.font = '32px sans-serif';
        ctx.fillText(`Obra de: ${author || 'Anônimo'}`, 40, img.height + 115);

        // Logo
        const logo = new Image();
        logo.crossOrigin = "anonymous";
        logo.src = "/puc-rio.png"; 
        
        await new Promise((resolve) => { 
          logo.onload = resolve; 
          logo.onerror = resolve; // se falhar, continua sem logo
        });
        
        if (logo.width > 0) {
          const logoHeight = 100;
          const logoWidth = (logo.width / logo.height) * logoHeight;
          ctx.drawImage(logo, width - logoWidth - 40, img.height + 25, logoWidth, logoHeight);
        }

        // Fazer o download
        const link = document.createElement('a');
        link.download = `puc-arte-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } else {
         // Para poesia, vamos gerar um card em imagem!
         canvas.width = 1024;
         canvas.height = 1024;
         
         // Fundo
         ctx.fillStyle = '#f8f9fa';
         ctx.fillRect(0,0, 1024, 1024);

         // Borda
         ctx.strokeStyle = '#653024';
         ctx.lineWidth = 10;
         ctx.strokeRect(20, 20, 984, 984);

         // Texto Poesia
         ctx.fillStyle = '#212529';
         ctx.font = '36px serif';
         const lines = result.split('\n');
         let y = 120;
         for (const line of lines) {
           ctx.fillText(line, 80, y);
           y += 50;
         }

         // Rodapé
         ctx.fillStyle = '#653024';
         ctx.fillRect(0, 1024 - 150, 1024, 150);

         ctx.fillStyle = '#FFFFFF';
         ctx.font = 'bold 48px sans-serif';
         ctx.fillText('PUC por 1 dia', 40, 1024 - 85);

         ctx.font = '32px sans-serif';
         ctx.fillText(`Poesia de: ${author || 'Anônimo'}`, 40, 1024 - 35);

         // Logo
         const logo = new Image();
         logo.crossOrigin = "anonymous";
         logo.src = "/puc-rio.png";
         await new Promise((resolve) => { 
           logo.onload = resolve; 
           logo.onerror = resolve; 
         });
         
         if (logo.width > 0) {
           const logoHeight = 100;
           const logoWidth = (logo.width / logo.height) * logoHeight;
           ctx.drawImage(logo, 1024 - logoWidth - 40, 1024 - 125, logoWidth, logoHeight);
         }

         const link = document.createElement('a');
         link.download = `puc-poesia-${Date.now()}.png`;
         link.href = canvas.toDataURL('image/png');
         link.click();
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao preparar a imagem para download.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <button 
        type="button"
        onClick={handleDownload}
        disabled={isDownloading}
        className="w-full bg-gray-800 disabled:opacity-50 hover:bg-gray-900 text-white font-bold py-3 rounded-xl shadow-md transition-colors mt-4 flex justify-center items-center gap-2"
      >
        {isDownloading ? "Preparando..." : "⬇️ Baixar e Compartilhar"}
      </button>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </>
  );
}
