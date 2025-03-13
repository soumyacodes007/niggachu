import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import FloatingPokemon from './FloatingPokemon';
import Charizard3D from './Charizard3D';

function Hero() {
  const [featuredPokemon, setFeaturedPokemon] = useState(null);
  
  useEffect(() => {
    // Get a random Pokémon (Charizard, Blastoise, or Venusaur)
    const starters = [6, 9, 3]; // Charizard, Blastoise, Venusaur IDs
    const randomId = starters[Math.floor(Math.random() * starters.length)];
    
    fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`)
      .then(response => response.json())
      .then(data => {
        setFeaturedPokemon(data);
      })
      .catch(error => console.error('Error fetching Pokémon:', error));
  }, []);

  return (
    <section className="relative min-h-screen bg-gray-900 overflow-hidden">
      <div className="container mx-auto px-4 pt-20 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Text content */}
          <div className="z-10">
            <h1 className="text-4xl md:text-6xl font-bold text-pokemon-yellow mb-6">
              Welcome to the future of Pokemon Gaming
            </h1>
            <motion.p 
              className="text-xl text-gray-300 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Collect, trade, and battle with digital Pokémon cards on the blockchain. 
              Own your cards truly and participate in the future of gaming.
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <motion.button 
                className="btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
              </motion.button>
              <motion.button 
                className="px-6 py-3 bg-transparent hover:bg-gray-800 text-white font-bold rounded-lg border border-gray-600 transform transition hover:scale-105"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Learn More
              </motion.button>
            </motion.div>
          </div>
          
          {/* Right side - Charizard Model */}
          <div className="absolute lg:relative right-[-20%] lg:right-0 top-1/2 lg:top-0 transform -translate-y-1/2 lg:translate-y-0 w-[800px] h-[800px] lg:w-full lg:h-full">
            <Charizard3D />
          </div>
        </div>
      </div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 rounded-full bg-pokemon-red/20"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i + 10}
            className="absolute w-4 h-4 rounded-full bg-pokemon-blue/20"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </section>
  );
}

export default Hero; 