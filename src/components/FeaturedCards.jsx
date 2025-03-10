import { useState, useEffect } from 'react';
import Card3D from './Card3D';

function FeaturedCards() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Featured Pokémon IDs (some popular ones)
    const pokemonIds = [25, 6, 150, 149, 384, 249, 151, 248];
    
    const fetchPokemon = async () => {
      try {
        const promises = pokemonIds.map(id => 
          fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
            .then(response => response.json())
        );
        
        const results = await Promise.all(promises);
        
        const pokemonCards = results.map(pokemon => ({
          id: pokemon.id,
          name: pokemon.name,
          image: pokemon.sprites.other['official-artwork'].front_default,
          types: pokemon.types.map(type => type.type.name),
          rarity: getRarity(pokemon.base_experience)
        }));
        
        setCards(pokemonCards);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching Pokémon cards:', error);
        setLoading(false);
      }
    };
    
    fetchPokemon();
  }, []);
  
  // Function to determine card rarity based on base experience
  const getRarity = (baseExp) => {
    if (baseExp >= 300) return 'Legendary';
    if (baseExp >= 250) return 'Ultra Rare';
    if (baseExp >= 200) return 'Rare';
    if (baseExp >= 150) return 'Uncommon';
    return 'Common';
  };
  
  // Function to get background color based on Pokémon type
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
    <section id="cards" className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Cards</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Discover some of the most powerful and rare Pokémon cards in our collection
          </p>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="aspect-[3/4] bg-gray-800 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {cards.map(card => (
              <Card3D key={card.id} pokemon={card} />
            ))}
          </div>
        )}
        
        <div className="text-center mt-12">
          <button className="btn-primary">
            Explore All Cards
          </button>
        </div>
      </div>
    </section>
  );
}

export default FeaturedCards; 