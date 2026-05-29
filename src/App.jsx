import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BookOpen, EyeOff, Download, Upload, Type, Eraser, FileText, X, Image as ImageIcon, File, ChevronLeft, ChevronRight, MapPin, User, Cpu, ShieldOff } from 'lucide-react';
import WelcomeScreen from './WelcomeScreen';
import * as pdfjsLib from 'pdfjs-dist';
import { jsPDF } from 'jspdf';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * STK Anon - PROTECTION DE LA VIE PRIVÉE
 * Version 1.8.0
 */

// --- UI COMPONENTS ---

const Card = ({ children, className = "" }) => (
  <div className={`bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden shadow-xl ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, active, variant = "primary", className = "", disabled = false, title = "" }) => {
  const baseStyle = "px-4 py-2 rounded font-medium transition-all duration-200 flex items-center gap-2 text-sm select-none";
  const variants = {
    primary: active 
      ? "bg-orange-600 text-white shadow-[0_0_15px_rgba(234,88,12,0.4)]" 
      : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white",
    action: "bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-lg shadow-orange-900/20",
    danger: "bg-red-900/20 text-red-500 border border-red-900/50 hover:bg-red-900/40",
    ghost: "bg-transparent text-neutral-500 hover:text-neutral-300"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      title={title}
      className={`${baseStyle} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

const Slider = ({ label, value, min, max, step = 1, onChange }) => (
  <div className="mb-4">
    <div className="flex justify-between mb-1">
      <label className="text-xs text-neutral-400 uppercase tracking-wider">{label}</label>
      <span className="text-xs text-orange-500 font-mono">{value}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step} 
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-orange-600"
    />
  </div>
);

const UploadPrompt = ({ onUpload }) => (
    <div className="flex-1 flex items-center justify-center text-center p-8">
        <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold text-white mb-2">Prêt à commencer ?</h2>
            <p className="text-neutral-400 mb-6 max-w-md mx-auto">Téléversez un document pour activer les outils d'anonymisation, de filigrane et d'analyse des métadonnées.</p>
            <Button onClick={onUpload} variant="action" className="py-3 px-6 text-base">
                <Upload size={18}/> Choisir un document
            </Button>
        </div>
    </div>
);


// --- CORE APPLICATION ---

export default function App() {
  // Application States
  const [file, setFile] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [isPdf, setIsPdf] = useState(false);
  const [mode, setMode] = useState('tuto'); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressText, setProgressText] = useState("");
  
  // Specific PDF States
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);

  // Extended Metadata States
  const [metaInfo, setMetaInfo] = useState({ 
    width: 0, 
    height: 0, 
    mp: 0,
    author: 'N/A',
    producer: 'N/A',
    gps: 'Non détecté' 
  });
  const [isMetaCleaned, setIsMetaCleaned] = useState(false);

  // Watermark Configuration
  const [wmText, setWmText] = useState("CONFIDENTIEL");
  const [wmSize, setWmSize] = useState(40);
  const [wmOpacity, setWmOpacity] = useState(0.3);
  const [wmDensity, setWmDensity] = useState(150);
  const [wmSpacing, setWmSpacing] = useState(100);
  const [wmColor, setWmColor] = useState("#808080");
  const [wmRotate, setWmRotate] = useState(-45);

  // Redaction Configuration
  const [rects, setRects] = useState([]); 
  const [allPageRects, setAllPageRects] = useState({});
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  // --- LOGIC ---

  useEffect(() => {
    if (isPdf && currentPage > 0) {
        setAllPageRects(prev => ({
            ...prev,
            [currentPage]: rects
        }));
    }
  }, [rects, isPdf, currentPage]);
  
  const renderPdfPage = async (pdf, pageNum) => {
    setIsProcessing(true);
    try {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 });
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = viewport.width;
        tempCanvas.height = viewport.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        await page.render({ canvasContext: tempCtx, viewport }).promise;
        
        setImageSrc(tempCanvas.toDataURL('image/jpeg', 0.9));
    } catch (err) {
        console.error("Erreur Rendu Page:", err);
    } finally {
        setIsProcessing(false);
    }
  };

  const processPdfToImage = async (fileData) => {
    setIsProcessing(true);
    setProgressText("Analyse du PDF...");
    try {
        const uri = URL.createObjectURL(fileData);
        const loadingTask = pdfjsLib.getDocument(uri);
        const pdf = await loadingTask.promise;
        
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        setCurrentPage(1);
        setAllPageRects({});

        const metadata = await pdf.getMetadata().catch(() => ({ info: {} }));
        setMetaInfo(prev => ({
            ...prev,
            author: metadata.info?.Author || "Inconnu",
            producer: metadata.info?.Producer || "Inconnu",
            gps: "Non applicable (PDF)"
        }));

        await renderPdfPage(pdf, 1);
        setMode('metadata'); // Switch to metadata view after loading
    } catch (err) {
        console.error("Erreur PDF Engine:", err);
        alert("Impossible de lire le fichier PDF.");
    } finally {
        setIsProcessing(false);
        setProgressText("");
    }
  };

  const changePage = (delta) => {
      const newPage = currentPage + delta;
      if (newPage >= 1 && newPage <= numPages && pdfDoc) {
          setCurrentPage(newPage);
          setRects(allPageRects[newPage] || []);
          renderPdfPage(pdfDoc, newPage);
      }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setRects([]);
    setAllPageRects({});
    setFile(selectedFile);
    setImageSrc(null);
    setPdfDoc(null);
    setNumPages(0);
    setMetaInfo({ width: 0, height: 0, mp: 0, author: 'Analysé...', producer: 'Analysé...', gps: 'Recherche...' });
    setIsMetaCleaned(false);
    
    // Switch mode on file load
    setMode('metadata'); 

    if (selectedFile.type === 'application/pdf') {
      setIsPdf(true);
      processPdfToImage(selectedFile);
    } else if (selectedFile.type.startsWith('image/')) {
      setIsPdf(false);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target.result);
        setMetaInfo(prev => ({ ...prev, author: 'Non détecté', producer: 'Caméra Standard', gps: 'Non détecté' }));
      };
      reader.readAsDataURL(selectedFile);
    } else {
      alert("Format non supporté.");
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current.click();
  };

  const resetApp = () => {
    setFile(null);
    setImageSrc(null);
    setIsPdf(false);
    setPdfDoc(null);
    setRects([]);
    setAllPageRects({});
    setMetaInfo({ width: 0, height: 0, mp: 0, author: 'N/A', producer: 'N/A', gps: 'N/A' });
    setIsMetaCleaned(false);
    setMode('tuto'); // Go back to tuto on reset
  };
  
  const handleCleanExif = () => {
    if (!file) return;

    if (isPdf) {
        // For PDFs, just update the UI state as the download is already clean
        setMetaInfo(prev => ({
            ...prev,
            author: 'Nettoyé',
            producer: 'Nettoyé',
            gps: 'Nettoyé'
        }));
        setIsMetaCleaned(true);
    } else {
        // For images, create a clean version
        const img = new Image();
        img.src = imageSrc;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const cleanedDataUrl = canvas.toDataURL(file.type); // use original file type
            setImageSrc(cleanedDataUrl);
            
            // Update UI state
            setMetaInfo(prev => ({
                ...prev,
                author: 'Nettoyé',
                producer: 'Nettoyé',
                gps: 'Nettoyé'
            }));
            setIsMetaCleaned(true);
        };
    }
  };
  
  const drawOverlays = (ctx, width, height, currentRects) => {
      if (wmText && wmText.trim() !== "" && mode === 'watermark') {
        ctx.save();
        ctx.font = `bold ${wmSize}px Arial, sans-serif`;
        ctx.fillStyle = wmColor;
        ctx.globalAlpha = wmOpacity;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const diagonal = Math.sqrt(width**2 + height**2);
        const textMetrics = ctx.measureText(wmText);
        const textRealWidth = textMetrics.width;
        const stepX = textRealWidth + wmSpacing;
        const stepY = wmDensity;
        ctx.translate(width / 2, height / 2);
        ctx.rotate((wmRotate * Math.PI) / 180);
        ctx.translate(-width / 2, -height / 2);
        let rowIndex = 0;
        for (let y = -diagonal; y < diagonal; y += stepY) {
          const xOffset = (rowIndex % 2 === 1) ? stepX / 2 : 0;
          for (let x = -diagonal - stepX; x < diagonal; x += stepX) {
            ctx.fillText(wmText, x + xOffset, y);
          }
          rowIndex++;
        }
        ctx.restore();
      }
      ctx.fillStyle = "#000000";
      currentRects.forEach(rect => {
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      });
  };

  const draw = useCallback(() => {
    if (!canvasRef.current || !imageSrc) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.src = imageSrc;
    img.onload = () => {
      if(!file) return;
      
      setMetaInfo(prev => ({
        ...prev,
        width: img.width,
        height: img.height,
        mp: (img.width * img.height / 1000000).toFixed(1)
      }));

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const activeRects = allPageRects[currentPage] || rects;
      drawOverlays(ctx, canvas.width, canvas.height, activeRects);
    };
  }, [imageSrc, mode, wmText, wmSize, wmOpacity, wmDensity, wmSpacing, wmColor, wmRotate, rects, file, allPageRects, currentPage]);

  useEffect(() => {
    draw();
  }, [draw]);

  const getPos = (e) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    if (mode !== 'redact' || !file) return;
    setIsDrawing(true);
    setStartPos(getPos(e));
  };

  const drawRect = (e) => {
    if (!isDrawing || mode !== 'redact' || !file) return;
    const currentPos = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    draw(); 
    ctx.fillStyle = "#000000";
    const w = currentPos.x - startPos.x;
    const h = currentPos.y - startPos.y;
    ctx.fillRect(startPos.x, startPos.y, w, h);
  };

  const endDrawing = (e) => {
    if (!isDrawing || mode !== 'redact' || !file) return;
    setIsDrawing(false);
    const endPos = getPos(e);
    const newRect = {
      x: startPos.x,
      y: startPos.y,
      w: endPos.x - startPos.x,
      h: endPos.y - startPos.y
    };
    
    if (newRect.w < 0) { newRect.x += newRect.w; newRect.w = Math.abs(newRect.w); }
    if (newRect.h < 0) { newRect.y += newRect.h; newRect.h = Math.abs(newRect.h); }

    if (newRect.w > 5 && newRect.h > 5) {
      setRects([...rects, newRect]);
    }
  };

  const undoLastRect = () => setRects(rects.slice(0, -1));

  const handleDownload = async () => {
    setIsProcessing(true);
    setProgressText("Initialisation...");

    try {
        const finalCanvas = document.createElement('canvas');
        const finalCtx = finalCanvas.getContext('2d');

        if (isPdf && pdfDoc) {
            const doc = new jsPDF({ unit: 'px' });
            doc.deletePage(1); 

            for (let i = 1; i <= numPages; i++) {
                setProgressText(`Traitement page ${i} sur ${numPages}...`);
                const page = await pdfDoc.getPage(i);
                const viewport = page.getViewport({ scale: 2.0 });
                finalCanvas.width = viewport.width;
                finalCanvas.height = viewport.height;
                await page.render({ canvasContext: finalCtx, viewport }).promise;
                
                const rectsForThisPage = allPageRects[i] || [];
                drawOverlays(finalCtx, finalCanvas.width, finalCanvas.height, rectsForThisPage);
                
                const imgData = finalCanvas.toDataURL('image/jpeg', 0.85);
                doc.addPage([viewport.width, viewport.height], viewport.width > viewport.height ? 'l' : 'p');
                doc.addImage(imgData, 'JPEG', 0, 0, viewport.width, viewport.height);
            }
            
            setProgressText("Finalisation...");
            doc.save(`stk_anon_full_${Date.now()}.pdf`);
        } else if (canvasRef.current) {
            finalCanvas.width = canvasRef.current.width;
            finalCanvas.height = canvasRef.current.height;

            const img = new Image();
            img.src = imageSrc;
            await new Promise(r => img.onload = r);

            finalCtx.drawImage(img, 0, 0);
            drawOverlays(finalCtx, finalCanvas.width, finalCanvas.height, rects);

            finalCanvas.toBlob((blob) => {
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.download = `stk_anon_secure_${Date.now()}.png`;
              link.href = url;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }, 'image/png');
        }
    } catch (e) {
        console.error("Erreur Export:", e);
        alert("Erreur lors de la génération du fichier final.");
    } finally {
        setIsProcessing(false);
        setProgressText("");
    }
  };

  

    const renderMainContent = () => {

      if (mode === 'tuto') {

        return <WelcomeScreen />;

      }

      if (!file) {

        return <UploadPrompt onUpload={triggerFileUpload} />;

      }

      return (

        <>

          {mode === 'redact' && (

            <div className="absolute top-4 bg-black/70 text-white text-xs px-3 py-1 rounded-full pointer-events-none z-10 flex items-center gap-2 border border-orange-500/30">

              <Eraser size={12} className="text-orange-500"/> Mode Caviardage actif

            </div>

          )}

          <canvas 

            ref={canvasRef}

            onMouseDown={startDrawing}

            onMouseMove={drawRect}

            onMouseUp={endDrawing}

            onMouseLeave={endDrawing}

            className={`max-w-full max-h-[80vh] shadow-2xl transition-cursor ${mode === 'redact' ? 'cursor-crosshair' : 'cursor-default'}`}

          />

        </>

      );

    };

  

    return (

      <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-orange-900 selection:text-white pb-20">

        

        {/* HIDDEN FILE INPUT */}

        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*,application/pdf" />

  

        {/* HEADER */}

        <header className="bg-neutral-900 border-b border-orange-900/30 sticky top-0 z-50">

          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

            <div className="flex items-center gap-3">

              <img 

                  src="/logo.png" 

                  alt="STK Logo" 

                  className="w-10 h-10 rounded shadow-lg object-cover"

                  onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/512x512/ea580c/white?text=STK"; }}

              />

              <div>

                <h1 className="text-xl font-bold tracking-tight text-white">STK <span className="text-orange-500">Anon Tool</span></h1>

                <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Protection de la vie privée {isPdf ? '(PDF Mode)' : ''}</p>

              </div>

            </div>

          </div>

        </header>

  

        <main className="max-w-7xl mx-auto px-6 py-8">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">

              

              {/* --- SIDEBAR --- */}

              <div className="lg:col-span-3 space-y-6">

                

                <Card className="p-4">

                  <div className="flex justify-between items-center mb-4 border-b border-neutral-800 pb-2">

                      <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Tool Box</h3>

                      {file ? (

                          <Button variant="danger" onClick={resetApp} className="px-2 py-1 text-xs" title="Fermer le document">

                              <X size={14} /> Fermer

                          </Button>

                      ) : (

                          <Button variant="primary" onClick={triggerFileUpload} className="px-2 py-1 text-xs" title="Téléverser un document">

                              <Upload size={14} /> Téléverser

                          </Button>

                      )}

                  </div>

                  <div className="space-y-2">

                    <Button 

                      className="w-full justify-start" 

                      active={mode === 'tuto'}

                      onClick={() => setMode('tuto')}

                    >

                      <BookOpen size={16} /> Tutoriel

                    </Button>

                    <Button 

                      className="w-full justify-start" 

                      active={mode === 'metadata'}

                      onClick={() => setMode('metadata')}

                      disabled={!file}

                    >

                      <FileText size={16} /> Métadonnées

                    </Button>

                    <Button 

                      className="w-full justify-start" 

                      active={mode === 'watermark'}

                      onClick={() => setMode('watermark')}

                      disabled={!file}

                    >

                      <Type size={16} /> Filigrane

                    </Button>

                    <Button 

                      className="w-full justify-start" 

                      active={mode === 'redact'}

                      onClick={() => setMode('redact')}

                      disabled={!file}

                    >

                      <EyeOff size={16} /> Anonymisation

                    </Button>

                  </div>

                </Card>

  

                {/* --- CONTEXTUAL TOOLS --- */}

                <Card className="p-4 bg-neutral-900/80">

                  {file && mode === 'watermark' && (

                    <div className="animate-fadeIn">

                      <h3 className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-4">Filigrane</h3>

                      <div className="mb-4">

                        <label className="text-xs text-neutral-400 uppercase tracking-wider block mb-1">Texte</label>

                        <input type="text" value={wmText} onChange={(e) => setWmText(e.target.value)} className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-sm text-white focus:border-orange-500 focus:outline-none"/>

                      </div>

                      <div className="mb-4">

                           <label className="text-xs text-neutral-400 uppercase tracking-wider block mb-1">Couleur</label>

                           <input type="color" value={wmColor} onChange={(e) => setWmColor(e.target.value)} className="w-full h-8 bg-transparent cursor-pointer rounded block"/>

                      </div>

                      <Slider label="Taille" value={wmSize} min={10} max={200} onChange={setWmSize} />

                      <Slider label="Opacité" value={wmOpacity} min={0.1} max={1} step={0.05} onChange={setWmOpacity} />

                      <Slider label="Densité Verticale" value={wmDensity} min={50} max={500} onChange={setWmDensity} />

                      <Slider label="Espacement Texte" value={wmSpacing} min={20} max={500} onChange={setWmSpacing} />

                      <Slider label="Rotation" value={wmRotate} min={-90} max={90} onChange={setWmRotate} />

                    </div>

                  )}

  

                  {file && mode === 'redact' && (

                    <div className="animate-fadeIn">

                      <h3 className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-4">Caviardage</h3>

                      <p className="text-sm text-neutral-400 mb-4">Tracez des rectangles sur le document pour masquer les zones sensibles.</p>

                      <Button onClick={undoLastRect} variant="ghost" className="w-full border border-neutral-700" disabled={rects.length === 0}>

                        <Eraser size={14} /> Annuler dernier

                      </Button>

                    </div>

                  )}

  

                  {file && mode === 'metadata' && (

                    <div className="animate-fadeIn">

                      <h3 className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-4">Inspection Fichier</h3>

                      <div className="space-y-3 text-sm">

                        <div className="grid grid-cols-2 gap-2 border-b border-neutral-800 pb-2">

                          <span className="text-neutral-500">Nom</span>

                          <span className="text-neutral-200 text-right truncate">{file.name}</span>

                        </div>

                        <div className="grid grid-cols-2 gap-2 border-b border-neutral-800 pb-2">

                          <span className="text-neutral-500">Type</span>

                          <span className="text-neutral-200 text-right flex items-center justify-end gap-2">

                              {isPdf ? <File size={12} className="text-orange-500"/> : <ImageIcon size={12}/>} {isPdf ? 'PDF Document' : file.type}

                          </span>

                        </div>

                        <div className="grid grid-cols-2 gap-2 border-b border-neutral-800 pb-2">

                             <span className="text-neutral-500 flex items-center gap-1"><User size={10}/> Auteur</span>

                             <span className="text-neutral-200 text-right truncate" title={metaInfo.author}>{metaInfo.author}</span>

                        </div>

                        <div className="grid grid-cols-2 gap-2 border-b border-neutral-800 pb-2">

                             <span className="text-neutral-500 flex items-center gap-1"><Cpu size={10}/> Logiciel</span>

                             <span className="text-neutral-200 text-right truncate" title={metaInfo.producer}>{metaInfo.producer}</span>

                        </div>

                        <div className="grid grid-cols-2 gap-2 border-b border-neutral-800 pb-2">

                             <span className="text-neutral-500 flex items-center gap-1"><MapPin size={10}/> GPS</span>

                             <span className="text-neutral-200 text-right">{metaInfo.gps}</span>

                        </div>

                        {metaInfo.width > 0 && (

                            <div className="grid grid-cols-2 gap-2 border-b border-neutral-800 pb-2">

                            <span className="text-neutral-500">Rendu</span>

                            <span className="text-neutral-200 text-right">{metaInfo.width} x {metaInfo.height} px</span>

                            </div>

                        )}

                      </div>
                        <div className="mt-4 pt-4 border-t border-neutral-800">
                            <p className="text-xs text-neutral-500 mb-2">
                                L'exportation d'un document supprime toujours les métadonnées, mais ce bouton nettoie aussi l'aperçu actuel.
                            </p>
                            <Button onClick={handleCleanExif} className="w-full justify-center" variant={isMetaCleaned ? "ghost" : "danger"} disabled={isMetaCleaned}>
                                <ShieldOff size={14} /> {isMetaCleaned ? 'Métadonnées nettoyées' : 'Nettoyer les métadonnées'}
                            </Button>
                        </div>
                    </div>
                  )}

                  

                  {(!file || (mode !== 'metadata' && mode !== 'redact' && mode !== 'watermark')) && (

                      <div className="text-center text-neutral-500 text-sm animate-fadeIn">

                          <h3 className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-2">Instructions</h3>

                          {mode === 'tuto' ? <p>Parcourez le tutoriel pour commencer.</p> : <p>Sélectionnez un outil pour commencer.</p>}

                      </div>

                  )}

                </Card>

  

                {file && (

                    <Button variant="action" className="w-full justify-center py-4 mt-6" onClick={handleDownload} disabled={isProcessing}>

                      {isProcessing ? 'Génération...' : `ENREGISTRER ${isPdf ? '(Complet)' : ''}`} 

                      <Download size={18} />

                    </Button>

                )}

              </div>

  

              {/* --- MAIN AREA --- */}

              <div className="lg:col-span-9 h-full flex flex-col">

                <div 

                  ref={containerRef}

                  className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg shadow-inner flex items-center justify-center overflow-auto p-4 relative"

                  style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '20px 20px' }}

                >

                  {isProcessing && (

                      <div className="absolute inset-0 z-50 bg-black/50 flex flex-col items-center justify-center backdrop-blur-sm">

                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>

                          <span className="text-white font-mono text-sm">{progressText || "Traitement..."}</span>

                      </div>

                  )}

                  

                  {renderMainContent()}

  

                </div>

  

                {isPdf && numPages > 1 && file && (

                    <div className="mt-4 flex justify-center items-center gap-4 bg-neutral-900 border border-neutral-800 p-3 rounded-lg mx-auto">

                        <Button onClick={() => changePage(-1)} disabled={currentPage <= 1} variant="ghost" className="px-3">

                            <ChevronLeft size={20}/>

                        </Button>

                        <span className="font-mono text-sm text-white">

                            PAGE <span className="text-orange-500">{currentPage}</span> / {numPages}

                        </span>

                        <Button onClick={() => changePage(1)} disabled={currentPage >= numPages} variant="ghost" className="px-3">

                            <ChevronRight size={20}/>

                        </Button>

                    </div>

                )}

              </div>

          </div>

        </main>

      </div>

    );

  }

  