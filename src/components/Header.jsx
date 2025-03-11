import { useState } from 'react';
import Pokeball3D from './Pokeball3D';

const Header = ({ walletConnected, walletAddress, onConnectWallet }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <header className="fixed w-full z-50 bg-gray-900/80 backdrop-blur-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Pokeball3D />
          <h1 className="text-xl font-pokemon text-pokemon-yellow ml-3">PokéWeb3</h1>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8">
          <a href="#home" className="text-white hover:text-pokemon-yellow transition">Home</a>
          <a href="#features" className="text-white hover:text-pokemon-yellow transition">Features</a>
          <a href="#cards" className="text-white hover:text-pokemon-yellow transition">Cards</a>
          <a href="#roadmap" className="text-white hover:text-pokemon-yellow transition">Roadmap</a>
        </nav>
        
        <div>
          {walletConnected ? (
            <div className="bg-gray-800 px-4 py-2 rounded-lg text-white">
              {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
            </div>
          ) : (
            <button 
              onClick={onConnectWallet}
              className="bg-pokemon-blue hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Connect Wallet
            </button>
          )}
        </div>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-800 py-4">
          <div className="container mx-auto px-4 flex flex-col space-y-3">
            <a href="#home" className="text-white hover:text-pokemon-yellow transition py-2">Home</a>
            <a href="#features" className="text-white hover:text-pokemon-yellow transition py-2">Features</a>
            <a href="#cards" className="text-white hover:text-pokemon-yellow transition py-2">Cards</a>
            <a href="#roadmap" className="text-white hover:text-pokemon-yellow transition py-2">Roadmap</a>
            <button className="btn-primary w-full mt-4">Connect Wallet</button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 