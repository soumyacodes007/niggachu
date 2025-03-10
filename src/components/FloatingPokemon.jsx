import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

function FloatingPokemon({ pokemon }) {
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      // Calculate mouse position as percentage of screen
      const x = (clientX / innerWidth) - 0.5;
      const y = (clientY / innerHeight) - 0.5;
      
      // Apply parallax effect to container
      if (containerRef.current) {
        containerRef.current.style.transform = `translate(${x * 20}px, ${y * 20}px)`;
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  if (!pokemon) return null;

  return (
    <div ref={containerRef} className="relative transition-transform duration-200 ease-out">
      <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-pokemon-red via-pokemon-blue to-pokemon-yellow opacity-70 blur-xl animate-pulse"></div>
      
      <motion.div
        initial={{ rotateY: 0 }}
        animate={{ 
          rotateY: 360,
          y: [0, -15, 0]
        }}
        transition={{ 
          rotateY: { duration: 20, repeat: Infinity, ease: "linear" },
          y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }}
        className="relative z-10"
      >
        <motion.img 
          src={pokemon.sprites.other['official-artwork'].front_default} 
          alt={pokemon.name}
          className="w-64 h-64 md:w-80 md:h-80 object-contain z-10 drop-shadow-2xl"
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        />
        
        {/* Particle effects */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-white/50"
              initial={{ 
                x: Math.random() * 100 - 50, 
                y: Math.random() * 100 - 50,
                opacity: 0
              }}
              animate={{ 
                x: Math.random() * 200 - 100, 
                y: Math.random() * 200 - 100,
                opacity: [0, 0.8, 0]
              }}
              transition={{ 
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default FloatingPokemon; 






