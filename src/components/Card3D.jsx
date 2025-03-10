import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function Card3D({ pokemon }) {
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateXValue = (y - centerY) / 10;
    const rotateYValue = (centerX - x) / 10;
    
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  const getTypeColor = (type) => {
    const colors = {
      fire: 'from-red-500 to-orange-500',
      water: 'from-blue-500 to-cyan-500',
      grass: 'from-green-500 to-emerald-500',
      electric: 'from-yellow-400 to-amber-500',
      psychic: 'from-purple-500 to-pink-500',
      dragon: 'from-indigo-500 to-purple-600',
      normal: 'from-gray-400 to-gray-500',
      fighting: 'from-red-700 to-red-800',
      flying: 'from-sky-400 to-indigo-400',
      poison: 'from-purple-600 to-fuchsia-700',
      ground: 'from-amber-600 to-yellow-700',
      rock: 'from-stone-500 to-stone-700',
      bug: 'from-lime-500 to-green-600',
      ghost: 'from-purple-800 to-indigo-900',
      steel: 'from-gray-400 to-slate-500',
      ice: 'from-cyan-300 to-blue-400',
      dark: 'from-gray-700 to-gray-900',
      fairy: 'from-pink-400 to-rose-500',
    };
    
    return colors[type] || 'from-gray-500 to-gray-700';
  };

  return (
    <motion.div
      ref={cardRef}
      className="relative w-full aspect-[3/4] cursor-pointer perspective-1000"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <motion.div
        className={`w-full h-full rounded-xl bg-gradient-to-br ${getTypeColor(pokemon.types[0])} p-3 preserve-3d shadow-xl`}
        style={{
          rotateX: rotateX,
          rotateY: rotateY,
          transition: 'all 0.1s ease'
        }}
      >
        <div className="h-full bg-gray-900/30 backdrop-blur-sm rounded-lg p-3 flex flex-col relative overflow-hidden">
          {/* Holographic effect */}
          <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent holographic-shine ${isHovered ? 'opacity-70' : 'opacity-0'}`}></div>
          
          <div className="flex justify-between items-start mb-2 z-10">
            <h3 className="capitalize text-white font-bold">{pokemon.name}</h3>
            <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded-full font-bold">
              {pokemon.rarity}
            </span>
          </div>
          
          <div className="flex-grow flex items-center justify-center p-2 z-10">
            <motion.img 
              src={pokemon.image} 
              alt={pokemon.name}
              className="w-full h-auto object-contain drop-shadow-lg"
              animate={isHovered ? { 
                y: [0, -10, 0],
                scale: [1, 1.1, 1],
              } : {}}
              transition={{ 
                duration: 2, 
                ease: "easeInOut", 
                repeat: Infinity,
                repeatType: "loop" 
              }}
            />
          </div>
          
          <div className="flex gap-1 mt-2 z-10">
            {pokemon.types.map(type => (
              <span 
                key={type} 
                className="text-xs capitalize px-2 py-1 bg-white/20 rounded-full"
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Card3D; 