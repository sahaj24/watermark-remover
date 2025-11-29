"use client";

import { useState, useCallback, useRef } from "react";
import * as piexif from "piexifjs";

// Helper to convert Decimal GPS to DMS (Degrees, Minutes, Seconds) for EXIF
const toRational = (number: number) => {
  const sign = number < 0 ? -1 : 1;
  const abs = Math.abs(number);
  const deg = Math.floor(abs);
  const minFloat = (abs - deg) * 60;
  const min = Math.floor(minFloat);
  const sec = Math.round((minFloat - min) * 60 * 10000);
  
  return [[deg, 1], [min, 1], [sec, 10000]];
};

// Helper to convert DMS to Decimal for display
const fromRational = (rational: number[][]) => {
  if (!rational || rational.length < 3) return 0;
  const deg = rational[0][0] / rational[0][1];
  const min = rational[1][0] / rational[1][1];
  const sec = rational[2][0] / rational[2][1];
  return deg + min / 60 + sec / 3600;
};

export default function ExifEditor() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [exifData, setExifData] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State
  const [dateTaken, setDateTaken] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [cameraMake, setCameraMake] = useState("");
  const [cameraModel, setCameraModel] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (selectedFile: File) => {
    if (selectedFile.type !== "image/jpeg" && selectedFile.type !== "image/jpg") {
      alert("Currently only JPEG/JPG images are supported for EXIF editing.");
      return;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);
      
      try {
        const exifObj = piexif.load(result);
        setExifData(exifObj);
        
        // Parse Date
        // EXIF Date format: "YYYY:MM:DD HH:MM:SS"
        const dateTimeOriginal = exifObj["Exif"][piexif.ExifIFD.DateTimeOriginal] as string;
        if (dateTimeOriginal) {
          // Convert to HTML datetime-local format: "YYYY-MM-DDTHH:MM"
          const [date, time] = dateTimeOriginal.split(" ");
          const formattedDate = date.replace(/:/g, "-") + "T" + time.substring(0, 5);
          setDateTaken(formattedDate);
        }

        // Parse GPS
        const gps = exifObj["GPS"];
        if (gps && gps[piexif.GPSIFD.GPSLatitude] && gps[piexif.GPSIFD.GPSLongitude]) {
          const lat = fromRational(gps[piexif.GPSIFD.GPSLatitude] as number[][]);
          const lon = fromRational(gps[piexif.GPSIFD.GPSLongitude] as number[][]);
          
          const latRef = gps[piexif.GPSIFD.GPSLatitudeRef] as string;
          const lonRef = gps[piexif.GPSIFD.GPSLongitudeRef] as string;

          setLatitude((latRef === "S" ? -lat : lat).toFixed(6));
          setLongitude((lonRef === "W" ? -lon : lon).toFixed(6));
        }

        // Parse Camera
        const make = exifObj["0th"][piexif.ImageIFD.Make] as string;
        const model = exifObj["0th"][piexif.ImageIFD.Model] as string;
        if (make) setCameraMake(make.replace(/\0/g, ''));
        if (model) setCameraModel(model.replace(/\0/g, ''));

      } catch (err) {
        console.error("Error parsing EXIF:", err);
        // If no EXIF, just init empty
        setExifData({});
      }
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

  const handleDownload = async () => {
    if (!previewUrl || !exifData) return;
    setIsProcessing(true);

    try {
      // Clone existing exif data or create new
      const newExif = { ...exifData };
      if (!newExif["0th"]) newExif["0th"] = {};
      if (!newExif["Exif"]) newExif["Exif"] = {};
      if (!newExif["GPS"]) newExif["GPS"] = {};

      // Update Date
      if (dateTaken) {
        // Convert "YYYY-MM-DDTHH:MM" to "YYYY:MM:DD HH:MM:SS"
        const dateObj = new Date(dateTaken);
        const formatted = 
          `${dateObj.getFullYear()}:${(dateObj.getMonth()+1).toString().padStart(2, '0')}:${dateObj.getDate().toString().padStart(2, '0')} ` +
          `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}:00`;
        
        newExif["0th"][piexif.ImageIFD.DateTime] = formatted;
        newExif["Exif"][piexif.ExifIFD.DateTimeOriginal] = formatted;
        newExif["Exif"][piexif.ExifIFD.DateTimeDigitized] = formatted;
      }

      // Update GPS
      if (latitude && longitude) {
        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);

        newExif["GPS"][piexif.GPSIFD.GPSLatitudeRef] = lat < 0 ? "S" : "N";
        newExif["GPS"][piexif.GPSIFD.GPSLatitude] = toRational(lat);
        
        newExif["GPS"][piexif.GPSIFD.GPSLongitudeRef] = lon < 0 ? "W" : "E";
        newExif["GPS"][piexif.GPSIFD.GPSLongitude] = toRational(lon);
      }

      // Update Camera
      if (cameraMake) {
        newExif["0th"][piexif.ImageIFD.Make] = cameraMake;
      }
      if (cameraModel) {
        newExif["0th"][piexif.ImageIFD.Model] = cameraModel;
      }

      const exifBytes = piexif.dump(newExif);
      const newJpeg = piexif.insert(exifBytes, previewUrl);

      // Trigger Download
      const link = document.createElement("a");
      link.href = newJpeg;
      link.download = `spoofed_${file?.name || "image.jpg"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error("Error saving EXIF:", err);
      alert("Failed to save EXIF data. Please try a different image.");
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
            Exif Editor & Location Spoofer
          </h1>
          <p className="text-lg text-[#57534E] max-w-2xl mx-auto">
            Change the GPS location, date, and camera data of your photos. 
            Create a digital alibi or protect your privacy. 
            <span className="block mt-2 text-sm font-medium text-[#8C8885]">
              Works locally in your browser. No uploads.
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Drop your photo here</h3>
            <p className="text-[#57534E]">or click to browse (JPEG/JPG only)</p>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              accept="image/jpeg, image/jpg"
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
                      setExifData(null);
                    }}
                    className="text-red-500 hover:text-red-600 font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>

            {/* Editor Column */}
            <div className="space-y-6 bg-white p-6 rounded-xl border border-[#E7E5E4] shadow-sm">
              <h2 className="text-xl font-semibold border-b border-[#E7E5E4] pb-2">Edit Metadata</h2>
              
              {/* Date & Time */}
              <div>
                <label className="block text-sm font-medium text-[#57534E] mb-1">Date Taken</label>
                <input 
                  type="datetime-local" 
                  value={dateTaken}
                  onChange={(e) => setDateTaken(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E7E5E4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C1917]/10 focus:border-[#1C1917]"
                />
              </div>

              {/* GPS */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#57534E] mb-1">Latitude</label>
                  <input 
                    type="number" 
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="e.g. 48.8584"
                    className="w-full px-3 py-2 border border-[#E7E5E4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C1917]/10 focus:border-[#1C1917]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#57534E] mb-1">Longitude</label>
                  <input 
                    type="number" 
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="e.g. 2.2945"
                    className="w-full px-3 py-2 border border-[#E7E5E4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C1917]/10 focus:border-[#1C1917]"
                  />
                </div>
              </div>
              <div className="text-xs text-[#8C8885]">
                Tip: Use Google Maps to find coordinates. Right-click any spot and select the numbers.
              </div>

              {/* Camera Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#57534E] mb-1">Camera Make</label>
                  <input 
                    type="text" 
                    value={cameraMake}
                    onChange={(e) => setCameraMake(e.target.value)}
                    placeholder="e.g. Apple"
                    className="w-full px-3 py-2 border border-[#E7E5E4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C1917]/10 focus:border-[#1C1917]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#57534E] mb-1">Camera Model</label>
                  <input 
                    type="text" 
                    value={cameraModel}
                    onChange={(e) => setCameraModel(e.target.value)}
                    placeholder="e.g. iPhone 15 Pro"
                    className="w-full px-3 py-2 border border-[#E7E5E4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C1917]/10 focus:border-[#1C1917]"
                  />
                </div>
              </div>

              <button
                onClick={handleDownload}
                disabled={isProcessing}
                className="w-full py-3 bg-[#1C1917] text-white rounded-lg font-medium hover:bg-[#292524] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>Processing...</>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Spoofed Image
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* SEO Content */}
        <div className="mt-24 grid md:grid-cols-3 gap-8 text-[#57534E]">
          <div>
            <h3 className="font-semibold text-[#1C1917] mb-2">What is EXIF Data?</h3>
            <p className="text-sm leading-relaxed">
              EXIF (Exchangeable Image File Format) is hidden data stored in your photos. It contains details like the date taken, GPS location, camera model, and settings.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-[#1C1917] mb-2">Why Spoof Location?</h3>
            <p className="text-sm leading-relaxed">
              Protect your privacy by hiding your real home address, or create a "digital alibi" by changing the location and time stamp of a photo to match a specific narrative.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-[#1C1917] mb-2">Is it Private?</h3>
            <p className="text-sm leading-relaxed">
              Yes. This tool runs 100% in your browser. Your photos are never uploaded to our servers. All processing happens locally on your device.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
