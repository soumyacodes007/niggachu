import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Center } from '@react-three/drei';
import * as THREE from 'three';

// Camera adjustment component to ensure model is fully visible
function CameraAdjust() {
  const { camera, size } = useThree();
  
  useEffect(() => {
    // Move camera further back to see the entire model
    camera.position.set(0, 0, 8);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, size]);
  
  return null;
}

// Model component with auto-fitting
function CharizardModel() {
  const { scene } = useGLTF('/make_a_3d_model_of_ch_0313131034_texture.glb');
  const modelRef = useRef();
  
  return (
    <primitive 
      ref={modelRef}
      object={scene.clone()} 
      scale={[2.5, 2.5, 2.5]} // Restored larger scale
      rotation={[0, Math.PI / 4, 0]}
    />
  );
}

const Charizard3D = ({ className = "" }) => {
  return (
    // Increased container size with min-height and min-width
    <div className={`
      w-full 
      h-full 
      min-h-[600px] 
      min-w-[600px] 
      md:min-h-[800px] 
      md:min-w-[800px] 
      ${className}
    `} 
    style={{ 
      position: 'relative',
      margin: 'auto'
    }}>
      <ErrorBoundary>
        <Canvas 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%'
          }}
          camera={{ 
            fov: 45,
            position: [0, 0, 8]
          }}
          dpr={[1, 2]}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={1} />
            <spotLight 
              position={[10, 10, 10]} 
              angle={0.15} 
              penumbra={1} 
              intensity={1.5} 
            />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />
            <Center>
              <CharizardModel />
            </Center>
            <Environment preset="sunset" />
            <OrbitControls 
              enableZoom={false} 
              autoRotate 
              autoRotateSpeed={2}
              enablePan={false}
              minPolarAngle={Math.PI / 6}
              maxPolarAngle={Math.PI * 2/3}
            />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
    </div>
  );
};

// Error boundary to catch and display 3D rendering errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("3D rendering error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="text-red-500 p-4 text-center">Could not load 3D model</div>;
    }

    return this.props.children;
  }
}

// Preload the model
useGLTF.preload('/make_a_3d_model_of_ch_0313131034_texture.glb');

export default Charizard3D;