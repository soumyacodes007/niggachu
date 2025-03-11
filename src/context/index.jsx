import { createContext, useContext, useState } from 'react';

const BattleContext = createContext();

export const BattleProvider = ({ children }) => {
  const [battleState, setBattleState] = useState({
    battleCode: '',
    battleName: '',
  });

  return (
    <BattleContext.Provider value={{ battleState, setBattleState }}>
      {children}
    </BattleContext.Provider>
  );
};

export const useBattle = () => useContext(BattleContext);