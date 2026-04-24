/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, BookOpen, Volume2, Globe, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchBibleVerse, BibleVerse } from './services/gemini';

export default function App() {
  const [query, setQuery] = useState('');
  const [verse, setVerse] = useState<BibleVerse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setError(null);
    setVerse(null);

    try {
      const result = await fetchBibleVerse(searchTerm);
      if (result) {
        setVerse(result);
      } else {
        setError('성경 구절을 찾을 수 없습니다. 정확한 장과 절을 입력해 주세요.');
      }
    } catch (err) {
      setError('검색 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    performSearch(query);
  };

  const handleSpeak = (text: string, lang: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('클립보드에 복사되었습니다.');
  };

  return (
    <div className="min-h-screen bg-natural-bg text-natural-ink font-sans flex flex-col">
      {/* Header Navigation */}
      <header className="w-full h-16 border-b border-natural-border bg-white flex items-center justify-between px-6 md:px-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-natural-accent rounded-lg flex items-center justify-center text-white font-serif italic">B</div>
          <span className="text-xl font-medium tracking-tight">하늘 말씀 <span className="text-natural-muted font-normal text-sm ml-2 hidden sm:inline uppercase tracking-widest">Bible Reader</span></span>
        </div>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-6 text-sm font-medium">
            <a href="#" className="text-natural-accent border-b-2 border-natural-accent pb-1">Home</a>
            <a href="#" className="text-natural-muted hover:text-natural-accent transition-colors">Collections</a>
            <a href="#" className="text-natural-muted hover:text-natural-accent transition-colors">About</a>
          </nav>
          <div className="w-8 h-8 rounded-full bg-natural-subtle border border-natural-border"></div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center gap-12">
        {/* Search Section */}
        <div className="w-full max-w-2xl text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-serif text-natural-ink font-medium">말씀을 검색하세요</h1>
            <p className="text-natural-muted italic serif underline decoration-natural-border underline-offset-4">“Thy word is a lamp unto my feet, and a light unto my path.”</p>
          </div>
          
          <form onSubmit={handleSearch} className="relative flex items-center group">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="마태복음 1:1 또는 Matthew 1:1"
              className="w-full h-14 pl-6 pr-32 rounded-full border border-natural-border bg-white focus:outline-none focus:ring-2 focus:ring-natural-accent shadow-inner text-lg serif italic" 
              id="bible-search-input"
            />
            <button 
              type="submit"
              disabled={isLoading}
              className="absolute right-2 h-10 px-6 bg-natural-accent text-white rounded-full font-medium hover:bg-opacity-90 transition-opacity disabled:opacity-50"
              id="search-button"
            >
              {isLoading ? '검색 중...' : '검색하기'}
            </button>
          </form>

          <div className="flex justify-center flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full bg-natural-subtle text-[10px] text-natural-muted uppercase font-bold tracking-wider">Bible Version: NIV / KRV</span>
            <div className="flex gap-2">
              {['요한복음 3:16', '시편 23:1', '빌립보서 4:13'].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setQuery(s);
                    performSearch(s);
                  }}
                  className="px-3 py-1 rounded-full border border-natural-border text-[10px] text-natural-muted uppercase font-bold tracking-wider hover:bg-natural-accent hover:text-white hover:border-natural-accent transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results / Feedback Area */}
        <div className="w-full max-w-5xl">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-red-50 text-red-800 px-6 py-4 rounded-2xl border border-red-100 serif italic text-center mx-auto max-w-md"
              >
                {error}
              </motion.div>
            )}

            {verse && !isLoading && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch"
              >
                {/* Main Content Card */}
                <div className="col-span-1 md:col-span-7 bg-white p-8 md:p-10 rounded-[2.5rem] border border-natural-border shadow-sm flex flex-col justify-center min-h-[340px]">
                  <div className="mb-8 items-center flex gap-3">
                    <BookOpen className="w-5 h-5 text-natural-accent" />
                    <span className="text-natural-accent font-serif italic text-xl border-b border-natural-accent/20 pb-1">
                      {verse.book} {verse.chapter}:{verse.verse}
                    </span>
                  </div>
                  
                  <div className="space-y-10">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] text-natural-muted font-bold uppercase tracking-[0.2em]">Korean Translation (KRV)</p>
                        <button 
                          onClick={() => handleSpeak(verse.koreanText, 'ko-KR')}
                          className="p-1 hover:text-natural-accent transition-colors text-natural-muted"
                          title="Listen in Korean"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                      <h2 className="text-3xl md:text-4xl leading-snug font-serif text-natural-ink font-medium">
                        {verse.koreanText}
                      </h2>
                    </div>
                    
                    <div className="h-[1px] bg-natural-subtle"></div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] text-natural-muted font-bold uppercase tracking-[0.2em]">English Translation (NIV)</p>
                        <button 
                          onClick={() => handleSpeak(verse.englishText, 'en-US')}
                          className="p-1 hover:text-natural-accent transition-colors text-natural-muted"
                          title="Listen in English"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xl md:text-2xl leading-relaxed text-natural-ink/80 font-light italic serif">
                        {verse.englishText}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sidebar Card */}
                <div className="col-span-1 md:col-span-5 flex flex-col gap-6">
                  <div className="flex-1 bg-natural-subtle p-8 rounded-[2.5rem] border border-natural-border flex flex-col relative overflow-hidden group">
                    <div className="absolute -right-8 -top-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                      <Globe className="w-48 h-48" />
                    </div>
                    
                    <p className="text-[10px] text-natural-muted font-bold uppercase tracking-[0.2em] mb-6 relative">Phonetic Guide (English)</p>
                    <div className="flex-1 flex flex-col justify-center relative">
                      <div className="flex items-start gap-4">
                        <Volume2 className="w-6 h-6 text-natural-accent shrink-0 mt-1" />
                        <p className="text-xl md:text-2xl leading-relaxed text-natural-accent font-medium serif italic">
                          {verse.pronunciation}
                        </p>
                      </div>
                      
                      <div className="mt-10 flex gap-2">
                        <button 
                          onClick={() => handleSpeak(verse.englishText, 'en-US')}
                          className="flex-1 px-4 py-3 bg-white rounded-2xl border border-natural-border text-xs font-bold uppercase tracking-widest text-natural-muted hover:text-natural-accent hover:border-natural-accent transition-all"
                        >
                          Listen
                        </button>
                        <button 
                          onClick={() => handleCopy(`${verse.koreanText}\n${verse.englishText}`)}
                          className="flex-1 px-4 py-3 bg-white rounded-2xl border border-natural-border text-xs font-bold uppercase tracking-widest text-natural-muted hover:text-natural-accent hover:border-natural-accent transition-all"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Decorative Card */}
                  <div className="bg-natural-accent text-white/90 p-8 rounded-[2.5rem] flex items-center justify-between shadow-lg shadow-natural-accent/10">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-[0.3em] opacity-50 mb-1">Spirit</p>
                      <p className="font-serif italic text-lg leading-tight">Faith, Hope, & Love</p>
                    </div>
                    <Heart className="w-8 h-8 opacity-40 fill-white" />
                  </div>
                </div>
              </motion.div>
            )}

            {!verse && !isLoading && !error && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center opacity-20 py-20"
              >
                <div className="w-20 h-20 mx-auto border-2 border-natural-accent border-dashed rounded-full flex items-center justify-center mb-6">
                   <BookOpen className="w-8 h-8" />
                </div>
                <p className="serif italic text-lg">마음속에 새길 한 구절의 말씀을 찾아보세요.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer Strip */}
      <footer className="w-full h-16 flex flex-col md:flex-row items-center px-10 text-[10px] text-natural-muted font-bold uppercase tracking-[0.2em] border-t border-natural-border shrink-0 bg-white/50 backdrop-blur-sm">
        <div className="flex-1 py-2">
          © 2024 HEAVENLY WORDS • BIBLICAL INSIGHT
        </div>
        <div className="flex gap-8 py-2">
          <span className="hover:text-natural-accent cursor-pointer transition-colors">Peace be with you</span>
          <span className="hover:text-natural-accent cursor-pointer transition-colors">Search & Discover</span>
        </div>
      </footer>
    </div>
  );
}
