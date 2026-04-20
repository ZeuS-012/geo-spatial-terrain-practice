import React, { useMemo, useRef, useLayoutEffect } from 'react';

export default function Terrain({ resolution, location, showFlood, isDSM }) {
  const geoRef = useRef();

  const terrainData = useMemo(() => {
    const size = resolution + 1;
    const data = new Float32Array(size * size);
    
    for (let i = 0; i < size * size; i++) {
      const x = (i % size) / size - 0.5;
      const y = Math.floor(i / size) / size - 0.5;
      
      let h = 0;
      
      // Real-world site simulation logic
      if (location.label === 'Stratovolcano') { // Mount Fuji
        const dist = Math.sqrt(x*x + y*y);
        h = Math.max(0, (0.5 - dist) * 10);
      } else if (location.label === 'Erosional Plateau') { // Canyon
        h = (Math.sin(x*10) * Math.cos(y*10)) + (Math.sin(x*20) * 0.5);
        if (h < 0) h *= 2.5; // Deepen the canyons
      } else { // Manhattan
        h = Math.sin(x * 50) * Math.cos(y * 50) * 0.1;
        // LiDAR adds the buildings
        if (isDSM && i % 15 === 0) h += 2.5;
      }

      data[i] = h * location.heightMod;
    }
    return data;
  }, [resolution, location, isDSM]);

  useLayoutEffect(() => {
    if (geoRef.current) {
      const pos = geoRef.current.attributes.position;
      for (let i = 0; i < terrainData.length; i++) {
        pos.setZ(i, terrainData[i]);
      }
      pos.needsUpdate = true;
      geoRef.current.computeVertexNormals();
    }
  }, [terrainData]);

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <mesh receiveShadow castShadow>
        <planeGeometry ref={geoRef} args={[12, 12, resolution, resolution]} />
        <meshStandardMaterial 
          color={isDSM ? "#64748b" : "#475569"} 
          flatShading={resolution < 30} 
          roughness={0.7} 
        />
      </mesh>

      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[12, 12, resolution, resolution]} />
        <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.1} />
      </mesh>

      {showFlood && (
        <mesh position={[0, 0, 0.2]}>
          <planeGeometry args={[15, 15]} />
          <meshStandardMaterial color="#0ea5e9" transparent opacity={0.7} metalness={0.9} />
        </mesh>
      )}
    </group>
  );
}