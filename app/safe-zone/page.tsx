'use client';

import { useState, useRef, useEffect } from 'react';

type Platform = 'tiktok' | 'instagram' | 'youtube';

export default function SafeZoneChecker() {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [platform, setPlatform] = useState<Platform>('tiktok');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (videoSrc) URL.revokeObjectURL(videoSrc);
    };
  }, [videoSrc]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <main 
      className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#FDFBF7] pt-24"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="w-full max-w-4xl flex flex-col items-center">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#1C1917] mb-4 tracking-tight">
            Social Media Safe Zone Checker
          </h1>
          <p className="text-[#57534E] text-lg">
            Overlay TikTok, Reels, and Shorts UI on your video to check if your text is covered.
          </p>
        </div>

        {!videoSrc ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full max-w-xl border-2 border-dashed border-[#E7E5E4] hover:border-[#1C1917] hover:bg-[#F5F5F4] rounded-2xl p-12 text-center cursor-pointer transition-all"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="video/*"
              className="hidden"
            />
            <div className="space-y-4">
              <div className="w-16 h-16 bg-[#E7E5E4] rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-[#78716C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
              </div>
              <div>
                <p className="text-[#1C1917] font-medium text-lg">Upload Vertical Video</p>
                <p className="text-[#78716C]">Drag & drop or click to browse</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8 items-start w-full justify-center">
            {/* Controls */}
            <div className="w-full md:w-64 space-y-6 bg-white p-6 rounded-xl border border-[#E7E5E4] shadow-sm">
              <div>
                <label className="block text-sm font-medium text-[#1C1917] mb-3">Platform</label>
                <div className="space-y-2">
                  <button
                    onClick={() => setPlatform('tiktok')}
                    className={`w-full px-4 py-3 rounded-lg text-left font-medium transition-all flex items-center gap-3 ${
                      platform === 'tiktok' 
                        ? 'bg-[#1C1917] text-white shadow-md' 
                        : 'bg-[#F5F5F4] text-[#57534E] hover:bg-[#E7E5E4]'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v6.16c0 2.52-1.12 4.84-2.9 6.24-1.72 1.36-4.03 1.86-6.17 1.31-2.15-.55-3.95-2.16-4.77-4.21-.84-2.06-.58-4.5.7-6.38 1.23-1.82 3.32-2.95 5.51-3.01v4.07c-.74.02-1.48.24-2.06.72-.6.48-.96 1.21-.96 1.97 0 .76.36 1.49.96 1.97.6.48 1.34.7 2.09.7.75 0 1.49-.22 2.09-.7.6-.48.96-1.21.96-1.97V4.05c0-1.34.01-2.68.01-4.03z"/></svg>
                    TikTok
                  </button>
                  <button
                    onClick={() => setPlatform('instagram')}
                    className={`w-full px-4 py-3 rounded-lg text-left font-medium transition-all flex items-center gap-3 ${
                      platform === 'instagram' 
                        ? 'bg-[#1C1917] text-white shadow-md' 
                        : 'bg-[#F5F5F4] text-[#57534E] hover:bg-[#E7E5E4]'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.069-4.85.069-3.204 0-3.584-.012-4.849-.069-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                    Reels
                  </button>
                  <button
                    onClick={() => setPlatform('youtube')}
                    className={`w-full px-4 py-3 rounded-lg text-left font-medium transition-all flex items-center gap-3 ${
                      platform === 'youtube' 
                        ? 'bg-[#1C1917] text-white shadow-md' 
                        : 'bg-[#F5F5F4] text-[#57534E] hover:bg-[#E7E5E4]'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                    Shorts
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  setVideoSrc(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="w-full py-3 rounded-lg border-2 border-[#E7E5E4] text-[#57534E] font-medium hover:bg-[#F5F5F4] transition-all"
              >
                Change Video
              </button>
            </div>

            {/* Phone Preview */}
            <div className="relative w-[360px] h-[640px] bg-black rounded-[3rem] overflow-hidden shadow-2xl border-8 border-[#1C1917]">
              {/* Video */}
              <video 
                src={videoSrc} 
                className="w-full h-full object-cover"
                autoPlay 
                loop 
                muted 
                playsInline
              />

              {/* Overlays */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Status Bar (Generic) */}
                <div className="absolute top-0 w-full h-8 flex justify-between px-6 items-center text-white text-xs font-bold z-20">
                  <span>9:41</span>
                  <div className="flex gap-1">
                    <div className="w-4 h-3 bg-white rounded-sm"></div>
                    <div className="w-4 h-3 bg-white rounded-sm"></div>
                  </div>
                </div>

                {platform === 'tiktok' && (
                  <>
                    {/* Top Tabs */}
                    <div className="absolute top-8 w-full flex justify-center gap-4 text-white font-bold text-shadow-sm z-10">
                      <span className="opacity-60">Following</span>
                      <span className="border-b-2 border-white pb-1">For You</span>
                    </div>
                    {/* Search */}
                    <div className="absolute top-8 right-4 text-white">
                      <div className="w-6 h-6 bg-white/20 rounded-full"></div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="absolute right-2 bottom-24 flex flex-col items-center gap-6 z-10">
                      <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white"></div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-8 h-8 bg-white/90 rounded-full"></div>
                        <span className="text-white text-xs font-bold text-shadow">824K</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-8 h-8 bg-white/90 rounded-full"></div>
                        <span className="text-white text-xs font-bold text-shadow">5.2K</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-8 h-8 bg-white/90 rounded-full"></div>
                        <span className="text-white text-xs font-bold text-shadow">12K</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-8 h-8 bg-white/90 rounded-full"></div>
                        <span className="text-white text-xs font-bold text-shadow">Share</span>
                      </div>
                    </div>

                    {/* Bottom Info */}
                    <div className="absolute bottom-4 left-4 right-16 text-white z-10">
                      <div className="font-bold mb-2 text-shadow">@username</div>
                      <div className="text-sm mb-4 text-shadow leading-tight">
                        This is where your caption goes. It can be up to 2 lines long usually... #fyp #viral
                      </div>
                      <div className="flex items-center gap-2 opacity-90">
                        <div className="w-4 h-4 bg-white/50 rounded-full"></div>
                        <div className="text-xs scrolling-text w-32">Original Sound - Artist Name</div>
                      </div>
                    </div>
                  </>
                )}

                {platform === 'instagram' && (
                  <>
                    {/* Top Header */}
                    <div className="absolute top-8 w-full flex justify-between px-4 text-white z-10">
                      <span className="font-bold text-xl">Reels</span>
                      <div className="w-6 h-6 bg-white/20 rounded"></div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-10">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-7 h-7 border-2 border-white rounded-full"></div>
                        <span className="text-white text-xs">Like</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-7 h-7 border-2 border-white rounded-full"></div>
                        <span className="text-white text-xs">12K</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-7 h-7 border-2 border-white rounded-full"></div>
                      </div>
                      <div className="w-7 h-7 border-2 border-white rounded-md"></div>
                    </div>

                    {/* Bottom Info */}
                    <div className="absolute bottom-8 left-4 right-16 text-white z-10">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <span className="font-bold text-sm">username</span>
                        <span className="text-xs border border-white/50 px-2 py-0.5 rounded">Follow</span>
                      </div>
                      <div className="text-sm mb-4 opacity-90">
                        Here is the caption area for Instagram Reels... <span className="opacity-50">more</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 bg-white/50 rounded-full"></div>
                        <span>Original Audio</span>
                      </div>
                    </div>
                  </>
                )}

                {platform === 'youtube' && (
                  <>
                    {/* Top Header */}
                    <div className="absolute top-8 w-full flex justify-between px-4 text-white z-10">
                      <div className="w-6 h-6 bg-white/20 rounded-full"></div>
                      <div className="flex gap-4">
                        <div className="w-6 h-6 bg-white/20 rounded-full"></div>
                        <div className="w-6 h-6 bg-white/20 rounded-full"></div>
                      </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="absolute right-2 bottom-24 flex flex-col items-center gap-8 z-10">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 bg-gray-400/50 rounded-full flex items-center justify-center">👍</div>
                        <span className="text-white text-xs font-bold">1.2M</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 bg-gray-400/50 rounded-full flex items-center justify-center">👎</div>
                        <span className="text-white text-xs font-bold">Dislike</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 bg-gray-400/50 rounded-full flex items-center justify-center">💬</div>
                        <span className="text-white text-xs font-bold">4.5K</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 bg-gray-400/50 rounded-full flex items-center justify-center">↗️</div>
                        <span className="text-white text-xs font-bold">Share</span>
                      </div>
                      <div className="w-10 h-10 bg-gray-200 rounded-md border-2 border-white"></div>
                    </div>

                    {/* Bottom Info */}
                    <div className="absolute bottom-4 left-4 right-16 text-white z-10">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <span className="font-bold text-sm">@ChannelName</span>
                        <button className="bg-white text-black text-xs font-bold px-3 py-1.5 rounded-full">Subscribe</button>
                      </div>
                      <div className="text-sm mb-2 font-medium">
                        This is the title of the YouTube Short video #shorts
                      </div>
                    </div>
                  </>
                )}

                {/* Safe Zone Danger Areas (Semi-transparent red for debugging/visualization if needed, currently just UI) */}
              </div>
            </div>
          </div>
        )}

        {/* SEO Content Section */}
        <div className="mt-24 max-w-3xl mx-auto text-left space-y-12 pb-12 w-full px-4">
          <section>
            <h2 className="text-2xl font-bold text-[#1C1917] mb-4">How to Check Social Media Safe Zones?</h2>
            <p className="text-[#57534E] leading-relaxed mb-6">
              Stop guessing where to put your text. FetchSub's Safe Zone Checker overlays the actual interface of TikTok, Instagram Reels, and YouTube Shorts directly onto your video. This ensures your captions, subtitles, and key visual elements are never hidden behind buttons or descriptions.
            </p>

            <h3 className="text-xl font-semibold text-[#1C1917] mb-3">Step-by-Step Guide</h3>
            <ol className="list-decimal pl-5 space-y-3 text-[#57534E] mb-8">
              <li>
                <strong>Upload Video:</strong> Drag and drop your vertical video (9:16) anywhere on the screen.
              </li>
              <li>
                <strong>Select Platform:</strong> Toggle between TikTok, Instagram Reels, or YouTube Shorts to see different UI layouts.
              </li>
              <li>
                <strong>Analyze:</strong> Play the video to see if any text or faces are covered by the "Like" buttons, caption area, or profile picture.
              </li>
              <li>
                <strong>Adjust & Fix:</strong> If elements are covered, go back to your editor (CapCut, Premiere) and move them to the safe area.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1C1917] mb-4">Why is the Safe Zone Important?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-[#E7E5E4]">
                <h3 className="font-bold text-[#1C1917] mb-2">Avoid Blocked Text</h3>
                <p className="text-sm text-[#57534E]">Captions hidden behind the description or "More" button are unreadable and frustrate viewers.</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-[#E7E5E4]">
                <h3 className="font-bold text-[#1C1917] mb-2">Boost Engagement</h3>
                <p className="text-sm text-[#57534E]">Clear visibility of your call-to-action (CTA) ensures users know what to do.</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-[#E7E5E4]">
                <h3 className="font-bold text-[#1C1917] mb-2">Professional Look</h3>
                <p className="text-sm text-[#57534E]">Videos optimized for the platform UI look higher quality and more native.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1C1917] mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-[#1C1917] mb-2">What is the aspect ratio for TikTok and Reels?</h3>
                <p className="text-[#57534E] text-sm">
                  The standard aspect ratio is 9:16 (1080x1920 pixels). Our tool is optimized for this vertical format.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-[#1C1917] mb-2">Do I need to download an app?</h3>
                <p className="text-[#57534E] text-sm">
                  No. FetchSub runs entirely in your browser. You don't need to download any overlay PNGs or install heavy software.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-[#1C1917] mb-2">Is my video uploaded to a server?</h3>
                <p className="text-[#57534E] text-sm">
                  No. Your video is processed locally on your device. It never leaves your computer, ensuring 100% privacy.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
