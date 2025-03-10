function Testimonials() {
  const testimonials = [
    {
      name: "Alex Johnson",
      role: "Pro Player",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      quote: "PokéWeb3 has revolutionized how I collect and battle with Pokémon cards. The play-to-earn model is a game-changer!"
    },
    {
      name: "Sarah Chen",
      role: "Collector",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      quote: "As a long-time Pokémon card collector, I love that I can now truly own my digital cards and trade them securely on the blockchain."
    },
    {
      name: "Michael Rodriguez",
      role: "Tournament Champion",
      avatar: "https://randomuser.me/api/portraits/men/67.jpg",
      quote: "The battle mechanics are incredibly well-designed, and the tournaments offer real rewards. This is the future of TCGs."
    }
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Trainers Say</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Hear from our community of Pokémon trainers and collectors
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="card p-6 flex flex-col">
              <div className="flex-grow">
                <svg className="h-8 w-8 text-pokemon-yellow mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
              </div>
              <div className="flex items-center">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  className="h-12 w-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-bold">{testimonial.name}</h4>
                  <p className="text-gray-400 text-sm">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials; 