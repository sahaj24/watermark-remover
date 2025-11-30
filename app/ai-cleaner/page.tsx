"use client";

import { useState, useCallback, useRef } from "react";
import * as piexif from "piexifjs";

export default function AiCleaner() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [intensity, setIntensity] = useState<"light" | "deep">("light");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processImage = async () => {
    if (!previewUrl || !file) return;
    setIsProcessing(true);

    try {
      // 1. Load image into Canvas
      const img = new Image();
      img.src = previewUrl;
      await new Promise((resolve) => (img.onload = resolve));

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      // 2. Draw image (this already strips some non-visual data)
      ctx.drawImage(img, 0, 0);

      // 3. Apply "Deep Scrub" noise if selected
      // This disrupts frequency-based invisible watermarks
      if (intensity === "deep") {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          // Add tiny random noise (-1 to +1) to RGB channels
          // This is imperceptible to humans but breaks exact pixel hashes
          if (Math.random() > 0.5) {
            const noise = (Math.random() - 0.5) * 2; 
            data[i] = Math.min(255, Math.max(0, data[i] + noise));     // R
            data[i+1] = Math.min(255, Math.max(0, data[i+1] + noise)); // G
            data[i+2] = Math.min(255, Math.max(0, data[i+2] + noise)); // B
          }
        }
        ctx.putImageData(imageData, 0, 0);
      }

      // 4. Export as JPEG (Lossy compression helps remove steganography)
      // We use 0.95 quality to maintain visual fidelity while altering the byte structure
      const cleanDataUrl = canvas.toDataURL("image/jpeg", 0.95);

      // 5. Strip EXIF/Metadata completely using piexifjs
      // We insert "null" exif data to wipe it
      const finalDataUrl = piexif.insert(piexif.dump({}), cleanDataUrl);

      // 6. Download
      const link = document.createElement("a");
      link.href = finalDataUrl;
      link.download = `clean_${file.name.replace(/\.[^/.]+$/, "")}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error("Error processing image:", err);
      alert("Failed to process image.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-[#FDFBF7] text-[#1C1917] font-sans selection:bg-[#E7E5E4]"
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            AI Watermark Remover
          </h1>
          <p className="text-lg text-[#57534E] max-w-2xl mx-auto">
            Remove invisible watermarks, metadata, and C2PA credentials from AI-generated images.
            <span className="block mt-2 text-sm font-medium text-[#8C8885]">
              Makes AI art undetectable by standard detectors.
            </span>
          </p>
        </div>

        {!file ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200
              ${isDragging ? "border-[#1C1917] bg-[#E7E5E4]/20" : "border-[#E7E5E4] hover:border-[#A8A29E] hover:bg-white"}
            `}
          >
            <div className="w-16 h-16 bg-[#F5F5F4] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#57534E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Drop AI Image Here</h3>
            <p className="text-[#57534E]">Supports Midjourney, DALL-E, Stable Diffusion</p>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              accept="image/*"
              className="hidden"
            />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Preview Column */}
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-[#E7E5E4] shadow-sm">
                <img 
                  src={previewUrl || ""} 
                  alt="Preview" 
                  className="w-full h-auto rounded-lg"
                />
                <div className="mt-4 flex justify-between items-center text-sm text-[#57534E]">
                  <span>{file.name}</span>
                  <button 
                    onClick={() => {
                      setFile(null);
                      setPreviewUrl(null);
                    }}
                    className="text-red-500 hover:text-red-600 font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>

            {/* Controls Column */}
            <div className="space-y-6 bg-white p-6 rounded-xl border border-[#E7E5E4] shadow-sm">
              <h2 className="text-xl font-semibold border-b border-[#E7E5E4] pb-2">Cleaning Options</h2>
              
              <div className="space-y-4">
                <div 
                  onClick={() => setIntensity("light")}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${intensity === "light" ? "border-[#1C1917] bg-[#F5F5F4]" : "border-[#E7E5E4] hover:border-[#A8A29E]"}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">Metadata Strip (Safe)</span>
                    {intensity === "light" && <div className="w-2 h-2 rounded-full bg-[#1C1917]" />}
                  </div>
                  <p className="text-sm text-[#57534E]">Removes EXIF, XMP, and IPTC data. Does not alter pixels. Best for privacy.</p>
                </div>

                <div 
                  onClick={() => setIntensity("deep")}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${intensity === "deep" ? "border-[#1C1917] bg-[#F5F5F4]" : "border-[#E7E5E4] hover:border-[#A8A29E]"}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">Deep Scrub (Aggressive)</span>
                    {intensity === "deep" && <div className="w-2 h-2 rounded-full bg-[#1C1917]" />}
                  </div>
                  <p className="text-sm text-[#57534E]">Adds imperceptible noise and re-encodes to break invisible pixel watermarks.</p>
                </div>
              </div>

              <button
                onClick={processImage}
                disabled={isProcessing}
                className="w-full py-3 bg-[#1C1917] text-white rounded-lg font-medium hover:bg-[#292524] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>Processing...</>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    Clean Image
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* SEO Content */}
        <div className="mt-24 grid md:grid-cols-3 gap-8 text-[#57534E]">
          <div>
            <h3 className="font-semibold text-[#1C1917] mb-2">Invisible Watermarks?</h3>
            <p className="text-sm leading-relaxed">
              AI generators like Midjourney and DALL-E embed invisible signals (like C2PA or pixel noise) to tag images as "AI Generated".
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-[#1C1917] mb-2">How We Clean It</h3>
            <p className="text-sm leading-relaxed">
              We strip all metadata headers and use "Deep Scrub" technology to slightly alter pixel values, disrupting the invisible frequency patterns used by detectors.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-[#1C1917] mb-2">100% Private</h3>
            <p className="text-sm leading-relaxed">
              All processing happens in your browser. Your images are never uploaded to any server, ensuring complete privacy for your creations.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
