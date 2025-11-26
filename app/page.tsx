'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';

const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] flex items-center justify-center bg-[#F5F5F4] rounded-xl text-[#78716C]">
      Loading 3D Viewer...
    </div>
  ),
});

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fileName, setFileName] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup preview URL on unmount or change
  // Added cleanup for memory management
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const processBuffer = (buffer: ArrayBuffer) => {
    const modified = new Uint8Array(buffer);
    let modifiedCount = 0;

    // 1. Remove Logo Flag (msgpack boolean)
    // Search for "logo" string followed by boolean true
    const logoPattern = new TextEncoder().encode('logo');
    for (let i = 0; i < modified.length - 10; i++) {
      let match = true;
      for (let j = 0; j < logoPattern.length; j++) {
        if (modified[i + j] !== logoPattern[j]) {
          match = false;
          break;
        }
      }
      
      if (match) {
        // Check if it's a msgpack string key (preceded by string marker)
        // And followed by true (0xc3) or similar
        // We'll just look for the boolean flag nearby
        for (let k = 0; k < 10; k++) {
          if (modified[i + logoPattern.length + k] === 0xc3) { // true
            modified[i + logoPattern.length + k] = 0xc2; // false
            modifiedCount++;
          }
        }
      }
    }

    // 2. Replace Watermark Images
    const watermarkPattern = new TextEncoder().encode('SplineWatermark');
    const pngSignature = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    const pngEnd = new Uint8Array([0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82]);
    
    // Minimal 1x1 transparent PNG
    const transparentPng = new Uint8Array([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89,
      0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, 0x54,
      0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01,
      0x0D, 0x0A, 0x2D, 0xB4,
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,
      0xAE, 0x42, 0x60, 0x82
    ]);

    for (let i = 0; i < modified.length - watermarkPattern.length; i++) {
      let match = true;
      for (let j = 0; j < watermarkPattern.length; j++) {
        if (modified[i + j] !== watermarkPattern[j]) {
          match = false;
          break;
        }
      }

      if (match) {
        // Found watermark object, look for PNG data
        let pngStart = -1;
        for (let k = i; k < Math.min(i + 500, modified.length); k++) {
          let sigMatch = true;
          for (let p = 0; p < pngSignature.length; p++) {
            if (modified[k + p] !== pngSignature[p]) {
              sigMatch = false;
              break;
            }
          }
          if (sigMatch) {
            pngStart = k;
            break;
          }
        }

        if (pngStart !== -1) {
          // Find end of PNG
          let pngEndPos = -1;
          for (let k = pngStart; k < modified.length - pngEnd.length; k++) {
            let endMatch = true;
            for (let p = 0; p < pngEnd.length; p++) {
              if (modified[k + p] !== pngEnd[p]) {
                endMatch = false;
                break;
              }
            }
            if (endMatch) {
              pngEndPos = k + pngEnd.length;
              break;
            }
          }

          if (pngEndPos !== -1) {
            // Replace with transparent PNG
            for (let k = 0; k < transparentPng.length; k++) {
              modified[pngStart + k] = transparentPng[k];
            }
            // Fill rest with zeros
            for (let k = pngStart + transparentPng.length; k < pngEndPos; k++) {
              modified[k] = 0;
            }
            modifiedCount++;
          }
        }
      }
    }

    return modified;
  };

  const handleProcess = async () => {
    if (!url && !fileName) {
      setError('Please enter a URL or upload a file');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);
    setPreviewUrl(null);
    setProcessedBlob(null);

    // Allow UI to update before processing
    setTimeout(async () => {
      try {
        let buffer: ArrayBuffer;

        if (fileName && fileInputRef.current?.files?.[0]) {
          // Handle file upload
          buffer = await fileInputRef.current.files[0].arrayBuffer();
        } else {
          // Handle URL
          let fetchUrl = url;
          if (fetchUrl.startsWith('http://')) {
            fetchUrl = fetchUrl.replace('http://', 'https://');
          }
          
          const response = await fetch(fetchUrl);
          if (!response.ok) throw new Error('Failed to fetch file');
          buffer = await response.arrayBuffer();
        }

        const modified = processBuffer(buffer);

        // Create blob for preview and download
        const blob = new Blob([modified], { type: 'application/octet-stream' });
        const newPreviewUrl = URL.createObjectURL(blob);
        
        setProcessedBlob(blob);
        setPreviewUrl(newPreviewUrl);
        setSuccess(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }, 50);
  };

  const downloadFile = () => {
    if (!processedBlob) return;

    let downloadName = 'scene-clean.splinecode';
    if (fileName) {
      downloadName = fileName.replace('.splinecode', '-clean.splinecode');
    } else if (url) {
      const urlParts = url.split('/');
      const lastPart = urlParts[urlParts.length - 1];
      if (lastPart.endsWith('.splinecode')) {
        downloadName = lastPart.replace('.splinecode', '-clean.splinecode');
      }
    }

    // Track download event in Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'file_download', {
        event_category: 'Engagement',
        event_label: 'Spline File Download',
        value: 1,
      });
    }

    const downloadUrl = URL.createObjectURL(processedBlob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setUrl(''); // Clear URL if file is selected
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#FDFBF7]">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#1C1917] mb-4 tracking-tight">
            FetchSub
          </h1>
          <p className="text-[#57534E] text-lg">
            Remove the Spline logo and watermark from your 3D scenes instantly.
            <br />
            Free, private, and runs entirely in your browser.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#E7E5E4] p-8">
          <div className="space-y-6">
            {/* URL Input */}
            <div>
              <label className="block text-sm font-medium text-[#1C1917] mb-2">
                Spline Scene URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setFileName('');
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                placeholder="https://prod.spline.design/.../scene.splinecode"
                className="w-full px-4 py-3 rounded-lg bg-[#F5F5F4] border border-[#E7E5E4] focus:outline-none focus:ring-2 focus:ring-[#1C1917] focus:border-transparent transition-all"
              />
            </div>

            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E7E5E4]"></div>
              </div>
              <span className="relative bg-white px-4 text-sm text-[#78716C]">OR</span>
            </div>

            {/* File Upload */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                fileName 
                  ? 'border-[#1C1917] bg-[#F5F5F4]' 
                  : 'border-[#E7E5E4] hover:border-[#1C1917] hover:bg-[#F5F5F4]'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".splinecode"
                className="hidden"
              />
              <div className="space-y-2">
                <svg className="mx-auto h-10 w-10 text-[#78716C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {fileName ? (
                  <p className="text-[#1C1917] font-medium">{fileName}</p>
                ) : (
                  <p className="text-[#78716C]">Click to upload .splinecode file</p>
                )}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleProcess}
              disabled={loading || (!url && !fileName)}
              className={`w-full py-4 rounded-lg font-medium text-white transition-all ${
                loading || (!url && !fileName)
                  ? 'bg-[#78716C] cursor-not-allowed'
                  : 'bg-[#1C1917] hover:opacity-90 shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Remove Watermark'
              )}
            </button>

            {/* Status Messages & Preview */}
            {error && (
              <div className="p-4 rounded-lg bg-red-50 text-red-600 text-sm text-center">
                {error}
              </div>
            )}
            
            {success && previewUrl && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-4 rounded-lg bg-green-50 text-green-600 text-sm text-center">
                  Successfully processed! Preview your clean scene below.
                </div>

                <div className="w-full h-[400px] rounded-xl overflow-hidden border border-[#E7E5E4] shadow-inner bg-[#F5F5F4]">
                  <Spline scene={previewUrl} />
                </div>

                <button
                  onClick={downloadFile}
                  className="w-full py-4 rounded-lg font-medium text-[#1C1917] bg-white border-2 border-[#1C1917] hover:bg-[#F5F5F4] transition-all shadow-sm"
                >
                  Download Clean File
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-[#78716C] space-y-4">
          <p>Files are processed locally in your browser. No data is sent to any server.</p>
          
          <div>
            <a href="/terms" className="underline hover:text-[#1C1917]">Terms of Service</a>
          </div>
        </div>

        {/* SEO Content Section */}
        <div className="mt-24 max-w-3xl mx-auto text-left space-y-12 pb-12">
          <section>
            <h2 className="text-2xl font-bold text-[#1C1917] mb-4">How to Remove Spline Watermark for Free?</h2>
            <p className="text-[#57534E] leading-relaxed mb-6">
              FetchSub is the easiest way to remove the Spline logo from your 3D scenes. 
              Simply upload your <code>.splinecode</code> file or paste the URL, and our tool will instantly process the file to hide the watermark. 
              It works by modifying the internal flags of the file without damaging your 3D model or animations.
            </p>
            
            <h3 className="text-xl font-semibold text-[#1C1917] mb-3">Step-by-Step Guide</h3>
            <ol className="list-decimal pl-5 space-y-3 text-[#57534E] mb-8">
              <li>
                <strong>Export your scene:</strong> In Spline, go to Export and choose "Spline Code" (.splinecode).
              </li>
              <li>
                <strong>Upload to FetchSub:</strong> Drag and drop your file into the box above, or paste the public URL.
              </li>
              <li>
                <strong>Process automatically:</strong> Click "Remove Watermark". Our algorithm detects and neutralizes the logo flag.
              </li>
              <li>
                <strong>Preview & Download:</strong> Check the live 3D preview to ensure the logo is gone, then download your clean file.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1C1917] mb-4">FetchSub vs. Other Methods</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E7E5E4]">
                    <th className="py-3 font-semibold text-[#1C1917]">Feature</th>
                    <th className="py-3 font-semibold text-[#1C1917]">FetchSub</th>
                    <th className="py-3 font-semibold text-[#78716C]">Manual Hex Editing</th>
                    <th className="py-3 font-semibold text-[#78716C]">Spline Super</th>
                  </tr>
                </thead>
                <tbody className="text-[#57534E] text-sm">
                  <tr className="border-b border-[#E7E5E4]">
                    <td className="py-3">Cost</td>
                    <td className="py-3 font-medium text-green-600">Free</td>
                    <td className="py-3">Free</td>
                    <td className="py-3">$9/mo</td>
                  </tr>
                  <tr className="border-b border-[#E7E5E4]">
                    <td className="py-3">Difficulty</td>
                    <td className="py-3 font-medium text-green-600">One Click</td>
                    <td className="py-3 text-red-500">Very Hard</td>
                    <td className="py-3">Easy</td>
                  </tr>
                  <tr className="border-b border-[#E7E5E4]">
                    <td className="py-3">Time Required</td>
                    <td className="py-3 font-medium text-green-600">Instant</td>
                    <td className="py-3">15-30 mins</td>
                    <td className="py-3">Instant</td>
                  </tr>
                  <tr>
                    <td className="py-3">Privacy</td>
                    <td className="py-3 font-medium text-green-600">100% Local</td>
                    <td className="py-3">Local</td>
                    <td className="py-3">Cloud</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1C1917] mb-4">Why use FetchSub?</h2>
            <ul className="list-disc pl-5 space-y-2 text-[#57534E]">
              <li><strong>100% Free:</strong> No subscription or credit card needed.</li>
              <li><strong>Private & Secure:</strong> All processing happens in your browser. Your files never leave your device.</li>
              <li><strong>Instant Results:</strong> No waiting for server uploads or downloads.</li>
              <li><strong>Live Preview:</strong> Verify the watermark is gone before you download.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1C1917] mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-[#1C1917] mb-2">Is it legal to remove the Spline logo?</h3>
                <p className="text-[#57534E] text-sm">
                  This tool is intended for educational and personal use. If you are using Spline for commercial projects, we strongly recommend supporting the developers by purchasing a Spline Super subscription, which officially allows you to remove the logo.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-[#1C1917] mb-2">Does this work with all Spline files?</h3>
                <p className="text-[#57534E] text-sm">
                  Yes, FetchSub works with standard <code>.splinecode</code> files exported from the Spline design tool. It handles both binary data modification and texture replacement to ensure the logo is completely invisible.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
