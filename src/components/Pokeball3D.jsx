import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

function Pokeball3D() {
  const ballRef = useRef(null);
  
  useEffect(() => {
    if (!ballRef.current) return;
    
    const ball = ballRef.current;
    let rotation = 0;
    let animationId;
    
    const rotateBall = () => {
      rotation += 0.5;
      if (ball) {
        ball.style.transform = `rotateY(${rotation}deg)`;
      }
      animationId = requestAnimationFrame(rotateBall);
    };
    
    rotateBall();
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="relative h-10 w-10 perspective-1000">
      <motion.div 
        ref={ballRef}
        className="w-full h-full preserve-3d cursor-pointer"
        whileHover={{ scale: 1.2 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-red-600 to-red-500 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-red-600"></div>
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-white"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-[10%] bg-black"></div>
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] bg-white rounded-full border-4 border-black"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[15%] h-[15%] bg-white rounded-full"></div>
        </div>
      </motion.div>
    </div>
  );
}

export default Pokeball3D; 