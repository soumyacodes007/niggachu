import React from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

const WaitingRoom = ({ battleCode, battleName, betAmount, onExit, onSimulateJoin }) => {
  const [copied, setCopied] = React.useState(false);
  
  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full text-white text-center">
        <h1 className="text-2xl font-bold mb-6">{battleName}</h1>
        
        <div className="mb-8">
          <p className="text-gray-400 mb-2">Share this code with your opponent:</p>
          <div className="flex items-center justify-center mb-2">
            <div className="bg-gray-700 px-4 py-2 rounded-lg text-xl font-mono mr-2">
              {battleCode}
            </div>
            <CopyToClipboard text={battleCode} onCopy={handleCopy}>
              <button className="bg-pokemon-blue p-2 rounded-lg hover:bg-blue-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
              </button>
            </CopyToClipboard>
          </div>
          {copied && <p className="text-green-500 text-sm">Copied to clipboard!</p>}
        </div>
        
        <div className="bg-gray-700 p-4 rounded-lg mb-8">
          <div className="flex justify-between mb-2">
            <span>Battle Name:</span>
            <span>{battleName}</span>
          </div>
          <div className="flex justify-between">
            <span>Bet Amount:</span>
            <span>${betAmount}</span>
          </div>
        </div>
        
        <div className="animate-pulse mb-8">
          <p className="text-xl">Waiting for opponent to join...</p>
        </div>
        
        <div className="flex space-x-4">
          <button 
            onClick={onExit}
            className="flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-lg font-semibold"
          >
            Cancel
          </button>
          
          {/* This button is for demonstration purposes only */}
          <button 
            onClick={onSimulateJoin}
            className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-lg font-semibold"
          >
            Simulate Join (Demo)
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaitingRoom; 