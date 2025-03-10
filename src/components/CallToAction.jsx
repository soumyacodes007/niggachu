function CallToAction() {
  return (
    <section className="py-16 bg-gradient-to-r from-pokemon-blue to-pokemon-red">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Ready to Start Your Pokémon Web3 Journey?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of trainers already collecting, battling, and trading on the blockchain.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-pokemon-red hover:bg-gray-100 font-bold rounded-lg shadow-lg transform transition hover:scale-105">
              Get Started Now
            </button>
            <button className="px-8 py-4 bg-transparent hover:bg-white/10 text-white font-bold rounded-lg border border-white transform transition hover:scale-105">
              Join Discord
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CallToAction; 