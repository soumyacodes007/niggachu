function Roadmap() {
  const roadmapItems = [
    {
      phase: "Phase 1",
      title: "choose your trainer ",
      items: [
        "Initial card collection release",
        "Web app launch",
        "Community building",
        "Marketplace beta"
      ],
      status: "completed"
    },
    {
      phase: "Phase 2",
      title: "Expansion & Gameplay",
      items: [
        "Battle system implementation",
        "Tournament structure",
        "New card series",
        "Mobile app development"
      ],
      status: "in-progress"
    },
    {
      phase: "Phase 3",
      title: "Ecosystem Growth",
      items: [
        "Governance token launch",
        "Play-to-earn mechanics",
        "Cross-chain integration",
        "Partnership with major brands"
      ],
      status: "upcoming"
    },
    {
      phase: "Phase 4",
      title: "Metaverse Integration",
      items: [
        "3D card animations",
        "Virtual reality battles",
        "Land ownership",
        "Pokémon trainer avatars"
      ],
      status: "upcoming"
    }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case "completed": return "bg-green-500";
      case "in-progress": return "bg-yellow-500";
      case "upcoming": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <section id="roadmap" className="py-16 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Roadmap</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            The journey ahead for PokéWeb3 and our community
          </p>
        </div>
        
        <div className="relative">
          {/* Timeline line */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gray-700"></div>
          
          <div className="space-y-12 md:space-y-0">
            {roadmapItems.map((item, index) => (
              <div key={index} className="relative md:grid md:grid-cols-2 md:gap-8 md:items-center">
                {/* Timeline dot */}
                <div className={`hidden md:block absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full ${getStatusColor(item.status)} z-10`}></div>
                
                {/* Content */}
                <div className={`card p-6 md:p-8 ${index % 2 === 0 ? 'md:mr-12' : 'md:ml-12 md:order-first'}`}>
                  <div className="flex items-center mb-4">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)} mr-3`}></div>
                    <span className="text-sm font-bold text-pokemon-yellow">{item.phase}</span>
                    <span className={`ml-auto text-xs px-2 py-1 rounded-full ${
                      item.status === 'completed' ? 'bg-green-900 text-green-300' : 
                      item.status === 'in-progress' ? 'bg-yellow-900 text-yellow-300' : 
                      'bg-gray-800 text-gray-300'
                    }`}>
                      {item.status === 'completed' ? 'Completed' : 
                       item.status === 'in-progress' ? 'In Progress' : 
                       'Upcoming'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                  <ul className="space-y-2">
                    {item.items.map((listItem, i) => (
                      <li key={i} className="flex items-start">
                        <svg className="h-5 w-5 text-pokemon-yellow mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-gray-400">{listItem}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Roadmap; 