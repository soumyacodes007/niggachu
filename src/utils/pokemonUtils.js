// Rarity ranges based on Pokemon ID
const RARITY_RANGES = {
  LEGENDARY: { min: 1, max: 150 },      // Legendaries
  ULTRA_RARE: { min: 151, max: 386 },   // Ultra Rare
  RARE: { min: 387, max: 649 },         // Rare
  UNCOMMON: { min: 650, max: 850 },     // Uncommon
  COMMON: { min: 851, max: 1025 }       // Common
};

export const getRarity = (pokemonId) => {
  if (pokemonId <= RARITY_RANGES.LEGENDARY.max) return 'LEGENDARY';
  if (pokemonId <= RARITY_RANGES.ULTRA_RARE.max) return 'ULTRA_RARE';
  if (pokemonId <= RARITY_RANGES.RARE.max) return 'RARE';
  if (pokemonId <= RARITY_RANGES.UNCOMMON.max) return 'UNCOMMON';
  return 'COMMON';
};

export const getRandomPokemonByRarity = (rarity) => {
  const range = RARITY_RANGES[rarity];
  return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
};

export const generateInitialDeck = async () => {
  try {
    // Define the exact deck composition
    const deckComposition = [
      { rarity: 'UNCOMMON', count: 1 },
      { rarity: 'RARE', count: 1 },
      { rarity: 'ULTRA_RARE', count: 2 },
      { rarity: 'LEGENDARY', count: 3 },
      { rarity: 'COMMON', count: 3 }
    ];

    // Generate unique Pokemon IDs for each rarity
    const pokemonIds = [];
    
    for (const { rarity, count } of deckComposition) {
      const range = RARITY_RANGES[rarity];
      const rarityIds = new Set();
      
      // Keep generating IDs until we have enough unique ones for this rarity
      while (rarityIds.size < count) {
        const id = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
        rarityIds.add(id);
      }
      
      pokemonIds.push(...Array.from(rarityIds));
    }

    // Fetch Pokemon data from PokeAPI
    const pokemonPromises = pokemonIds.map(id =>
      fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then(res => res.json())
    );

    const pokemonData = await Promise.all(pokemonPromises);

    // Transform the data into our card format
    return pokemonData.map(pokemon => ({
      id: pokemon.id,
      name: pokemon.name,
      image: pokemon.sprites.other['official-artwork'].front_default,
      hp: pokemon.stats.find(stat => stat.stat.name === 'hp').base_stat,
      attack: pokemon.stats.find(stat => stat.stat.name === 'attack').base_stat,
      defense: pokemon.stats.find(stat => stat.stat.name === 'defense').base_stat,
      rarity: getRarity(pokemon.id)
    }));

  } catch (error) {
    console.error('Error generating deck:', error);
    return [];
  }
}; 