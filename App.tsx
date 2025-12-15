import React, { useState, useEffect } from 'react';
import { Sparkles, Film, RotateCcw, PlayCircle, Star } from 'lucide-react';
import { AppScreen, Movie, Interaction, InteractionType, Recommendation } from './types';
import { getCalibrationMovies, getRecommendation } from './services/geminiService';
import { SwipeDeck } from './components/SwipeDeck';
import { Button } from './components/Button';

// Animation variants
const fadeIn = "animate-[fadeIn_0.5s_ease-out_forwards]";

export default function App() {
  const [screen, setScreen] = useState<AppScreen>(AppScreen.WELCOME);
  const [calibrationMovies, setCalibrationMovies] = useState<Movie[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loadingText, setLoadingText] = useState("");

  const startCalibration = async () => {
    setLoadingText("Načítám filmy pro kalibraci...");
    setScreen(AppScreen.ANALYZING);
    try {
      const movies = await getCalibrationMovies();
      setCalibrationMovies(movies);
      setScreen(AppScreen.CALIBRATION);
    } catch (e) {
      console.error(e);
      setScreen(AppScreen.ERROR);
    }
  };

  const handleInteraction = (movie: Movie, type: InteractionType) => {
    setInteractions(prev => [...prev, { movieTitle: movie.title, type }]);
  };

  const finishCalibration = async () => {
    setLoadingText("Analyzuji tvůj vkus a hledám ten pravý film...");
    setScreen(AppScreen.ANALYZING);
    try {
      const result = await getRecommendation(interactions);
      setRecommendation(result);
      setScreen(AppScreen.RESULT);
    } catch (e) {
      console.error(e);
      setScreen(AppScreen.ERROR);
    }
  };

  const resetApp = () => {
    setInteractions([]);
    setRecommendation(null);
    setScreen(AppScreen.WELCOME);
  };

  return (
    <div className="min-h-screen bg-[#0f0f12] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-2">
            <Film className="text-indigo-500" />
            <h1 className="text-xl font-bold tracking-tight">Filmový<span className="text-indigo-500">Parťák</span></h1>
        </div>
        {screen !== AppScreen.WELCOME && (
             <button onClick={resetApp} className="text-sm text-gray-500 hover:text-white transition-colors">Restart</button>
        )}
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-4xl relative z-10 flex flex-col items-center justify-center min-h-[80vh]">
        
        {/* SCREEN: WELCOME */}
        {screen === AppScreen.WELCOME && (
          <div className={`text-center space-y-8 max-w-2xl ${fadeIn}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300 text-sm font-medium mb-4">
              <Sparkles size={16} />
              <span>AI Doporučovač Filmů</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
              Nevíš na co <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">koukat?</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-lg mx-auto leading-relaxed">
              Zapomeň na nekonečné scrollování Netflixem. Swipeuj přes pár filmů, které znáš, a AI ti najde perfektní film pro dnešní večer.
            </p>
            <div className="pt-8">
              <Button onClick={startCalibration} size="lg" icon={<PlayCircle size={24} />}>
                Najít film
              </Button>
            </div>
            <p className="text-xs text-gray-600 mt-8">Powered by Gemini AI</p>
          </div>
        )}

        {/* SCREEN: ANALYZING / LOADING */}
        {screen === AppScreen.ANALYZING && (
           <div className="flex flex-col items-center justify-center space-y-6 text-center">
             <div className="relative w-24 h-24">
               <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-full"></div>
               <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
               <div className="absolute inset-0 flex items-center justify-center">
                 <Sparkles className="text-white animate-pulse" size={32} />
               </div>
             </div>
             <p className="text-xl font-medium animate-pulse text-indigo-200">{loadingText}</p>
           </div>
        )}

        {/* SCREEN: CALIBRATION (SWIPING) */}
        {screen === AppScreen.CALIBRATION && (
            <div className="w-full">
                <SwipeDeck 
                    movies={calibrationMovies} 
                    onSwipe={handleInteraction}
                    onFinished={finishCalibration}
                />
            </div>
        )}

        {/* SCREEN: RESULT */}
        {screen === AppScreen.RESULT && recommendation && (
            <div className={`w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center ${fadeIn}`}>
                
                {/* Poster Side */}
                <div className="relative group">
                     {/* Glow effect behind poster */}
                    <div className="absolute -inset-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-gray-800 bg-gray-900">
                         <img 
                            src={`https://placehold.co/800x1200/1a1a20/FFFFFF/png?text=${encodeURIComponent(recommendation.title.replace(/ /g, '+'))}`}
                            alt={recommendation.title}
                            className="w-full h-full object-cover"
                         />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                         <div className="absolute bottom-6 left-6">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="bg-emerald-500 text-black font-bold px-2 py-0.5 rounded text-sm flex items-center gap-1">
                                    <Star size={12} fill="currentColor" />
                                    {recommendation.matchScore}% shoda
                                </div>
                                <span className="bg-white/20 backdrop-blur text-xs px-2 py-1 rounded border border-white/10">
                                    {recommendation.year}
                                </span>
                            </div>
                         </div>
                    </div>
                </div>

                {/* Info Side */}
                <div className="space-y-6 text-left">
                    <div>
                        <p className="text-indigo-400 font-bold uppercase tracking-widest text-sm mb-2">Tvůj výběr</p>
                        <h2 className="text-4xl md:text-6xl font-black leading-none mb-4">{recommendation.title}</h2>
                        <div className="flex flex-wrap gap-2 text-gray-400 text-sm">
                            <span className="text-white font-medium">{recommendation.genre}</span>
                            <span>•</span>
                            <span>{recommendation.director}</span>
                        </div>
                    </div>

                    <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl">
                        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                            <Sparkles size={18} className="text-indigo-400" />
                            Proč právě tento film?
                        </h3>
                        <p className="text-gray-300 leading-relaxed italic">
                            "{recommendation.reason}"
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold text-gray-500 uppercase text-xs tracking-wider mb-2">Děj</h3>
                        <p className="text-gray-300 leading-relaxed">
                            {recommendation.plot}
                        </p>
                    </div>
                    
                    {recommendation.similarTo.length > 0 && (
                        <div>
                             <h3 className="font-bold text-gray-500 uppercase text-xs tracking-wider mb-2">Podobné jako</h3>
                             <div className="flex gap-2 flex-wrap">
                                {recommendation.similarTo.map((sim, i) => (
                                    <span key={i} className="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-300 border border-gray-700">
                                        {sim}
                                    </span>
                                ))}
                             </div>
                        </div>
                    )}

                    <div className="pt-6 flex gap-4">
                        <Button onClick={resetApp} variant="secondary" icon={<RotateCcw size={20}/>}>
                            Zkusit znovu
                        </Button>
                        <Button 
                            onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(recommendation.title + ' film online')}`, '_blank')}
                            variant="primary" 
                            icon={<PlayCircle size={20}/>}
                        >
                            Najít kde sledovat
                        </Button>
                    </div>
                </div>
            </div>
        )}

        {/* SCREEN: ERROR */}
        {screen === AppScreen.ERROR && (
             <div className="text-center max-w-md">
                <div className="bg-red-500/10 text-red-500 p-4 rounded-full inline-block mb-4">
                    <RotateCcw size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-2">Něco se pokazilo</h3>
                <p className="text-gray-400 mb-6">Omlouváme se, AI mozek měl krátký výpadek. Zkuste to prosím znovu.</p>
                <Button onClick={resetApp} variant="secondary">Zkusit znovu</Button>
             </div>
        )}

      </main>
    </div>
  );
}
