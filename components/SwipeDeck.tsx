import React, { useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Movie, InteractionType } from '../types';
import { X, Heart, Eye } from 'lucide-react';

interface SwipeDeckProps {
  movies: Movie[];
  onSwipe: (movie: Movie, type: InteractionType) => void;
  onFinished: () => void;
}

export const SwipeDeck: React.FC<SwipeDeckProps> = ({ movies, onSwipe, onFinished }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | 'up' | null>(null);

  const activeMovie = movies[currentIndex];

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    
    if (info.offset.x > threshold) {
      handleSwipe('liked');
    } else if (info.offset.x < -threshold) {
      handleSwipe('disliked');
    } else if (info.offset.y < -threshold) {
      handleSwipe('seen_liked');
    }
  };

  const handleSwipe = (type: InteractionType) => {
    setDirection(type === 'liked' ? 'right' : type === 'disliked' ? 'left' : 'up');
    
    setTimeout(() => {
      onSwipe(activeMovie, type);
      if (currentIndex < movies.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setDirection(null);
      } else {
        onFinished();
      }
    }, 200);
  };

  if (!activeMovie) return null;

  return (
    <div className="relative w-full max-w-md h-[600px] mx-auto perspective-1000 flex flex-col items-center">
      <div className="absolute top-0 text-center w-full z-10 mb-4 px-4">
        <p className="text-gray-400 text-sm uppercase tracking-widest font-bold">Kalibrace vkusu</p>
        <div className="w-full bg-gray-800 h-1 mt-2 rounded-full overflow-hidden">
            <div 
                className="bg-indigo-500 h-full transition-all duration-300"
                style={{ width: `${((currentIndex) / movies.length) * 100}%` }}
            ></div>
        </div>
      </div>

      <div className="relative w-full h-full flex items-center justify-center mt-6">
        <AnimatePresence>
            {movies.slice(currentIndex, currentIndex + 2).reverse().map((movie, index) => {
                const isTop = movie.id === activeMovie.id;
                
                // Placeholder image generation using a nice gradient/text service or custom logic
                // Using placehold.co for reliability, simulating a poster with text
                const bgImage = `https://placehold.co/600x900/1a1a20/FFFFFF/png?text=${encodeURIComponent(movie.title.replace(/ /g, '+'))}&font=playfair-display`;

                return (
                    <motion.div
                        key={movie.id}
                        initial={{ scale: isTop ? 1 : 0.9, opacity: isTop ? 1 : 0.5, y: isTop ? 0 : 20 }}
                        animate={{ 
                            scale: isTop ? 1 : 0.95, 
                            opacity: isTop ? (direction ? 0 : 1) : 0.6,
                            y: isTop ? 0 : 10,
                            x: isTop && direction === 'right' ? 500 : isTop && direction === 'left' ? -500 : isTop && direction === 'up' ? 0 : 0,
                            rotate: isTop && direction === 'right' ? 20 : isTop && direction === 'left' ? -20 : 0
                        }}
                        transition={{ duration: 0.3 }}
                        drag={isTop ? true : false} // Allow drag in all directions for swipe up logic
                        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                        onDragEnd={isTop ? handleDragEnd : undefined}
                        className="absolute w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-gray-900 border border-gray-800 cursor-grab active:cursor-grabbing"
                        style={{ zIndex: isTop ? 10 : 5 }}
                    >
                        {/* Poster Image Background */}
                        <div 
                            className="absolute inset-0 bg-cover bg-center opacity-60"
                            style={{ backgroundImage: `url('${bgImage}')` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

                        {/* Content */}
                        <div className="absolute bottom-0 left-0 w-full p-6 text-left select-none pointer-events-none">
                            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-bold mb-2 border border-white/10">
                                {movie.genre} • {movie.year}
                            </span>
                            <h2 className="text-3xl font-bold text-white mb-2 leading-tight shadow-black drop-shadow-lg">{movie.title}</h2>
                            <p className="text-gray-300 text-sm line-clamp-3 mb-4 opacity-90">{movie.plot}</p>
                            
                            {/* Swipe Hints */}
                            <div className="flex justify-between text-xs font-bold text-white/50 uppercase tracking-widest mt-4">
                                <span>← Nic moc</span>
                                <span>Chci vidět →</span>
                            </div>
                        </div>

                        {/* Drag Overlays */}
                        <motion.div 
                            style={{ opacity: 0 }}
                            whileDrag={{ opacity: 0.8 }}
                            className="absolute inset-0 flex items-center justify-center bg-green-500/20 pointer-events-none"
                        >
                        </motion.div>
                    </motion.div>
                );
            })}
        </AnimatePresence>
      </div>

      {/* Control Buttons (for accessibility or non-touch) */}
      <div className="flex gap-4 mt-8 z-20">
        <button 
            onClick={() => handleSwipe('disliked')}
            className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center text-red-500 border border-gray-700 hover:scale-110 transition-transform shadow-lg"
        >
            <X size={28} />
        </button>
        <button 
            onClick={() => handleSwipe('seen_liked')}
            className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center text-blue-400 border border-gray-700 hover:scale-110 transition-transform shadow-lg"
            title="Viděl jsem a líbí se mi"
        >
            <Eye size={28} />
        </button>
        <button 
            onClick={() => handleSwipe('liked')}
            className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center text-emerald-400 border border-gray-700 hover:scale-110 transition-transform shadow-lg"
        >
            <Heart size={28} />
        </button>
      </div>
      <p className="text-gray-500 text-xs mt-4">
        Tip: Táhni nahoru pro "Už jsem viděl"
      </p>
    </div>
  );
};