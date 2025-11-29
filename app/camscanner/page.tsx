'use client';

import { useState, useRef } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';

export default function CamScannerRemover() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [processedPdf, setProcessedPdf] = useState<Uint8Array | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setProcessedPdf(null);
      setError('');
    } else {
      setError('Please upload a valid PDF file.');
    }
  };

  const processPdf = async () => {
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      // CamScanner watermark is usually at the bottom.
      // We will cover the bottom 3% of the page with a white rectangle.
      // This preserves the A4/Letter size for printing.
      
      pages.forEach((page) => {
        const { width } = page.getSize();
        
        // Draw a white rectangle at the bottom
        page.drawRectangle({
          x: 0,
          y: 0,
          width: width,
          height: 50, // Height of the mask (approx 50 units covers the footer)
          color: rgb(1, 1, 1), // White
        });
      });

      const pdfBytes = await pdfDoc.save();
      setProcessedPdf(pdfBytes);
    } catch (err) {
      console.error(err);
      setError('Failed to process PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = () => {
    if (!processedPdf || !file) return;

    const blob = new Blob([processedPdf], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name.replace('.pdf', '-clean.pdf');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#FDFBF7]">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#1C1917] mb-4 tracking-tight">
            CamScanner Remover
          </h1>
          <p className="text-[#57534E] text-lg">
            Remove the "Scanned with CamScanner" footer from your PDFs.
            <br />
            Free, private, and runs entirely in your browser.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#E7E5E4] p-8">
          <div className="space-y-6">
            
            {/* File Upload */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                file 
                  ? 'border-[#1C1917] bg-[#F5F5F4]' 
                  : 'border-[#E7E5E4] hover:border-[#1C1917] hover:bg-[#F5F5F4]'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf"
                className="hidden"
              />
              <div className="space-y-2">
                <svg className="mx-auto h-10 w-10 text-[#78716C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {file ? (
                  <p className="text-[#1C1917] font-medium">{file.name}</p>
                ) : (
                  <p className="text-[#78716C]">Click to upload PDF file</p>
                )}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={processPdf}
              disabled={loading || !file}
              className={`w-full py-4 rounded-lg font-medium text-white transition-all ${
                loading || !file
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

            {/* Status Messages */}
            {error && (
              <div className="p-4 rounded-lg bg-red-50 text-red-600 text-sm text-center">
                {error}
              </div>
            )}
            
            {processedPdf && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-4 rounded-lg bg-green-50 text-green-600 text-sm text-center">
                  Successfully processed! Your PDF is ready.
                </div>

                <button
                  onClick={downloadPdf}
                  className="w-full py-4 rounded-lg font-medium text-[#1C1917] bg-white border-2 border-[#1C1917] hover:bg-[#F5F5F4] transition-all shadow-sm"
                >
                  Download Clean PDF
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-[#78716C] space-y-4">
          <p>Files are processed locally in your browser. No data is sent to any server.</p>
        </div>

        {/* SEO Content Section */}
        <div className="mt-24 max-w-3xl mx-auto text-left space-y-12 pb-12">
          <section>
            <h2 className="text-2xl font-bold text-[#1C1917] mb-4">How to Remove CamScanner Watermark Online?</h2>
            <p className="text-[#57534E] leading-relaxed mb-6">
              FetchSub offers the fastest way to clean your scanned documents. Our tool automatically detects the bottom area where CamScanner places its branding and masks it, leaving you with a professional-looking PDF.
            </p>

            <h3 className="text-xl font-semibold text-[#1C1917] mb-3">Step-by-Step Guide</h3>
            <ol className="list-decimal pl-5 space-y-3 text-[#57534E] mb-8">
              <li>
                <strong>Select your PDF:</strong> Click the upload box above or drag and drop your file.
              </li>
              <li>
                <strong>Automatic Processing:</strong> The tool instantly identifies the footer area on every page.
              </li>
              <li>
                <strong>Apply Fix:</strong> Click "Remove Watermark" to apply a clean white mask over the "Scanned with CamScanner" text.
              </li>
              <li>
                <strong>Download:</strong> Save your clean, professional PDF ready for submission.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1C1917] mb-4">FetchSub vs. Other Methods</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E7E5E4]">
                    <th className="py-3 font-semibold text-[#1C1917]">Method</th>
                    <th className="py-3 font-semibold text-[#1C1917]">Cost</th>
                    <th className="py-3 font-semibold text-[#1C1917]">Time</th>
                    <th className="py-3 font-semibold text-[#1C1917]">Privacy</th>
                  </tr>
                </thead>
                <tbody className="text-[#57534E] text-sm">
                  <tr className="border-b border-[#E7E5E4]">
                    <td className="py-3 font-medium">FetchSub</td>
                    <td className="py-3 text-green-600">Free</td>
                    <td className="py-3 text-green-600">Instant</td>
                    <td className="py-3 text-green-600">100% Local</td>
                  </tr>
                  <tr className="border-b border-[#E7E5E4]">
                    <td className="py-3">CamScanner Premium</td>
                    <td className="py-3">$4.99/mo</td>
                    <td className="py-3">Fast</td>
                    <td className="py-3">Cloud</td>
                  </tr>
                  <tr className="border-b border-[#E7E5E4]">
                    <td className="py-3">Manual Cropping</td>
                    <td className="py-3">Free</td>
                    <td className="py-3 text-red-500">Slow (Per Page)</td>
                    <td className="py-3">Local</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1C1917] mb-4">Why use this tool?</h2>
            <ul className="list-disc pl-5 space-y-2 text-[#57534E]">
              <li><strong>Professional:</strong> Clean up your documents before sending them to clients or professors.</li>
              <li><strong>Secure:</strong> Your sensitive documents never leave your computer.</li>
              <li><strong>Free:</strong> No need to pay for a premium CamScanner subscription just to remove a footer.</li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
