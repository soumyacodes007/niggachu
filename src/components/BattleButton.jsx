import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BattleButton = ({ children, onClick, className = '', disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3 ${disabled ? 'bg-gray-500' : 'bg-pokemon-red hover:bg-red-700'} text-white font-bold rounded-lg shadow-lg transform transition ${disabled ? '' : 'hover:scale-105'} ${className}`}
    >
      {children}
    </button>
  );
};

export default BattleButton; 