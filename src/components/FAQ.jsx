import { useState } from 'react';

function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);
  
  const faqs = [
    {
      question: "What is PokéWeb3?",
      answer: "PokéWeb3 is a blockchain-based Pokémon card game that allows players to collect, trade, and battle with digital Pokémon cards that they truly own as NFTs on the blockchain."
    },
    {
      question: "How do I get started?",
      answer: "To get started, you'll need to connect your Web3 wallet (like MetaMask), purchase your first card pack, and start building your collection. Our beginner's guide will walk you through the process step by step."
    },
    {
      question: "Are the cards actual NFTs?",
      answer: "Yes, each Pokémon card in our game is a unique NFT (Non-Fungible Token) on the blockchain. This means you truly own your cards and can trade them on our marketplace or other compatible platforms."
    },
    {
      question: "How does the battle system work?",
      answer: "Our battle system combines traditional Pokémon card game mechanics with unique Web3 features. You'll build a deck from your collection, challenge other players, and use strategy to win battles and earn rewards."
    },
    {
      question: "Can I earn rewards by playing?",
      answer: "Absolutely! PokéWeb3 features a play-to-earn model where you can earn rewards by winning battles, participating in tournaments, completing quests, and contributing to the ecosystem."
    },
    {
      question: "Which blockchain does PokéWeb3 use?",
      answer: "PokéWeb3 is built on Ethereum with Layer 2 scaling solutions to ensure fast transactions and low fees. We're also exploring multi-chain support for the future."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Everything you need to know about PokéWeb3
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div key={index} className="mb-4">
              <button
                className={`w-full text-left p-4 rounded-lg flex justify-between items-center ${
                  openIndex === index ? 'bg-gray-800' : 'bg-gray-800/50'
                }`}
                onClick={() => toggleFAQ(index)}
              >
                <span className="font-bold text-lg">{faq.question}</span>
                <svg
                  className={`w-5 h-5 transform transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {openIndex === index && (
                <div className="p-4 bg-gray-800/30 rounded-b-lg mt-1">
                  <p className="text-gray-300">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FAQ; 