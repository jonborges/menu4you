import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import styles from './QRCodeGenerator.module.css';

interface QRCodeGeneratorProps {
  restaurantId: number;
  restaurantName: string;
  tableCount: number;
  onTableCountChange: (newCount: number) => void;
}

const MAX_TABLES = 50; // Limite razoável de mesas

export function QRCodeGenerator({ restaurantId, restaurantName, tableCount, onTableCountChange }: QRCodeGeneratorProps) {
  const [visibleCount, setVisibleCount] = useState(Math.min(5, tableCount));
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>QR Codes - ${restaurantName}</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  padding: 20px;
                }
                .print-container {
                  display: grid;
                  grid-template-columns: repeat(2, 1fr);
                  gap: 30px;
                  max-width: 800px;
                  margin: 0 auto;
                }
                .qr-item {
                  text-align: center;
                  border: 2px solid #333;
                  padding: 20px;
                  page-break-inside: avoid;
                }
                .qr-item h2 {
                  margin: 0 0 10px 0;
                  font-size: 24px;
                }
                .qr-item h3 {
                  margin: 0 0 15px 0;
                  font-size: 36px;
                  color: #e94e1b;
                }
                .qr-item p {
                  margin: 10px 0 0 0;
                  font-size: 14px;
                  color: #666;
                }
                @media print {
                  .qr-item {
                    page-break-inside: avoid;
                  }
                }
              </style>
            </head>
            <body>
              <h1 style="text-align: center; margin-bottom: 30px;">${restaurantName} - QR Codes das Mesas</h1>
              <div class="print-container">
                ${Array.from({ length: tableCount }, (_, i) => {
                  const tableNumber = i + 1;
                  const url = `${window.location.origin}/menu/${restaurantId}/mesa/${tableNumber}`;
                  
                  return `
                    <div class="qr-item">
                      <h2>${restaurantName}</h2>
                      <h3>Mesa ${tableNumber}</h3>
                      <div style="display: inline-block;">
                        ${generateSVGString()}
                      </div>
                      <p>Aponte a câmera do celular para ver o cardápio</p>
                    </div>
                  `;
                }).join('')}
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
    }
  };

  const generateSVGString = () => {
    // Placeholder - será substituído pelo QR Code real
    return `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="white"/>
    </svg>`;
  };

  const downloadQRCode = (tableNumber: number) => {
    const canvas = document.createElement('canvas');
    const svg = document.getElementById(`qr-${tableNumber}`) as unknown as SVGElement;
    
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      img.onload = () => {
        canvas.width = 300;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, 300, 300);
          ctx.drawImage(img, 0, 0, 300, 300);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const link = document.createElement('a');
              link.download = `${restaurantName}-Mesa${tableNumber}.png`;
              link.href = URL.createObjectURL(blob);
              link.click();
            }
          });
        }
        URL.revokeObjectURL(url);
      };
      
      img.src = url;
    }
  };

  const handleAddTable = () => {
    if (tableCount < MAX_TABLES) {
      const newCount = tableCount + 1;
      onTableCountChange(newCount);
      setVisibleCount(Math.min(5, newCount));
    }
  };

  const handleRemoveTable = () => {
    if (tableCount > 1) {
      const newCount = tableCount - 1;
      onTableCountChange(newCount);
      setVisibleCount(Math.min(visibleCount, newCount));
    }
  };

  const handleShowMore = () => {
    setVisibleCount(prev => Math.min(prev + 5, tableCount));
  };

  const handleShowLess = () => {
    setVisibleCount(prev => Math.max(5, prev - 5));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>📱 QR Codes das Mesas</h2>
        <div className={styles.actions}>
          <div className={styles.tableControl}>
            <button 
              className={styles.controlButton}
              onClick={handleRemoveTable}
              disabled={tableCount <= 1}
              title="Remover uma mesa"
            >
              −
            </button>
            <span className={styles.tableCount}>{tableCount} mesas</span>
            <button 
              className={styles.controlButton}
              onClick={handleAddTable}
              disabled={tableCount >= MAX_TABLES}
              title="Adicionar uma mesa"
            >
              +
            </button>
          </div>
          <button 
            className={styles.printButton}
            onClick={handlePrint}
          >
            🖨️ Imprimir Todos
          </button>
        </div>
      </div>

      <p className={styles.description}>
        Cada mesa tem um QR Code único. Clientes podem escanear para ver o cardápio diretamente.
        {tableCount >= MAX_TABLES && <span style={{ color: '#ef4444', fontWeight: 'bold' }}> (Limite máximo atingido)</span>}
      </p>

      <div className={styles.qrGrid} ref={printRef}>
        {Array.from({ length: visibleCount }, (_, i) => {
          const tableNumber = i + 1;
          const url = `${window.location.origin}/menu/${restaurantId}/mesa/${tableNumber}`;
          
          return (
            <div key={tableNumber} className={styles.qrCard}>
              <h3>Mesa {tableNumber}</h3>
              <div className={styles.qrCodeWrapper}>
                <QRCodeSVG 
                  id={`qr-${tableNumber}`}
                  value={url}
                  size={160}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <button 
                className={styles.downloadButton}
                onClick={() => downloadQRCode(tableNumber)}
                title="Baixar QR Code"
              >
                💾 Baixar PNG
              </button>
            </div>
          );
        })}
      </div>

      {tableCount > 5 && (
        <div className={styles.paginationActions}>
          {visibleCount < tableCount && (
            <button 
              className={styles.showMoreButton}
              onClick={handleShowMore}
            >
              ▼ Mostrar mais 5 mesas
            </button>
          )}
          {visibleCount > 5 && (
            <button 
              className={styles.showLessButton}
              onClick={handleShowLess}
            >
              ▲ Mostrar menos
            </button>
          )}
        </div>
      )}
    </div>
  );
}
