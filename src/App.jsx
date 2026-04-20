import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, Environment } from '@react-three/drei';
import { Layers, Zap, MapPin, Activity } from 'lucide-react';
import Terrain from './components/Terrain';

const LOCATIONS = {
  'Grand Canyon': { lat: 36.05, lon: -112.10, heightMod: 4, roughness: 2, label: 'Erosional Plateau' },
  'Mount Fuji': { lat: 35.36, lon: 138.72, heightMod: 5, roughness: 0.5, label: 'Stratovolcano' },
  'Manhattan': { lat: 40.78, lon: -73.96, heightMod: 1, roughness: 0.1, label: 'Urban Grid' }
};

const SERVICES = {
  'NASA SRTM': { res: 30, verticalErr: '±16m', cost: 'Free', color: '#ef4444' },
  'Copernicus': { res: 10, verticalErr: '±4m', cost: 'Open', color: '#f59e0b' },
  'TerraPrecision (LiDAR)': { res: 1, verticalErr: '±0.1m', cost: 'Premium', color: '#10b981' }
};

function App() {
  const [activeLoc, setActiveLoc] = useState('Mount Fuji');
  const [activeService, setActiveService] = useState('NASA SRTM');
  const [flood, setFlood] = useState(false);

  // Map Service resolution to our 3D mesh (1m = 120 segments, 30m = 10 segments)
  const meshRes = activeService === 'NASA SRTM' ? 12 : activeService === 'Copernicus' ? 40 : 120;

  return (
    <div className="h-screen w-full flex flex-col bg-slate-950 text-white font-sans">
      <nav className="p-4 border-b border-white/10 flex justify-between bg-slate-900 items-center">
        <div className="flex items-center gap-2 font-bold">
          <Layers className="text-blue-500" size={22} /> 
          <span className="text-xl">Terra<span className="text-blue-500">GIS</span> Benchmark</span>
        </div>
        <div className="flex gap-4">
          {Object.keys(LOCATIONS).map(loc => (
            <button key={loc} onClick={() => setActiveLoc(loc)}
              className={`text-xs px-3 py-1 rounded-full border transition ${activeLoc === loc ? 'bg-blue-600 border-blue-400' : 'border-white/10 hover:bg-white/5'}`}>
              <MapPin size={10} className="inline mr-1"/> {loc}
            </button>
          ))}
        </div>
      </nav>

      <div className="flex flex-1 relative">
        <aside className="w-80 p-6 bg-slate-900/90 backdrop-blur-xl border-r border-white/10 z-10 space-y-8">
          
          {/* Service Comparison Section */}
          <section className="space-y-4">
            <label className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">Data Source Comparison</label>
            <div className="space-y-2">
              {Object.entries(SERVICES).map(([name, info]) => (
                <div key={name} onClick={() => setActiveService(name)}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${activeService === name ? 'border-blue-500 bg-blue-500/10' : 'border-white/5 bg-white/5 opacity-60 hover:opacity-100'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm">{name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black" style={{color: info.color}}>{info.res}m</span>
                  </div>
                  <div className="grid grid-cols-2 text-[10px] text-slate-400 font-mono">
                    <span>Err: {info.verticalErr}</span>
                    <span className="text-right">Cost: {info.cost}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Real-time Analysis Result */}
          <section className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-4">
             <div className="flex items-center gap-2 text-cyan-400">
               <Activity size={16}/>
               <span className="text-xs font-bold uppercase tracking-widest">Terrain Reliability</span>
             </div>
             <div className="space-y-1">
                <div className="text-2xl font-black">{activeService === 'NASA SRTM' ? 'LOW' : activeService === 'Copernicus' ? 'MED' : 'HIGH'}</div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  {activeLoc} analysis using {activeService} shows a 
                  {activeService === 'NASA SRTM' ? ' high risk of structure miscalculation' : ' surgical level of detail for engineering'}.
                </p>
             </div>
          </section>

          <button onClick={() => setFlood(!flood)} 
            className={`w-full py-4 rounded-2xl border-2 font-black transition-all ${flood ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'border-white/10 text-slate-500 hover:border-white/20'}`}>
            SIMULATE WATER FLOW
          </button>
        </aside>

        <div className="flex-1 bg-black relative">
          <Canvas shadows camera={{ position: [10, 10, 10], fov: 35 }}>
            <Sky sunPosition={[10, 5, 10]} />
            <ambientLight intensity={0.4} />
            <pointLight position={[20, 20, 20]} intensity={1.5} castShadow />
    
            <Terrain 
              resolution={meshRes} 
              location={LOCATIONS[activeLoc]} 
              showFlood={flood} 
              isDSM={activeService === 'TerraPrecision (LiDAR)'}
            />
    
            <OrbitControls autoRotate={!flood} />
    
            {/* Use a valid preset here */}
            <Environment preset="forest" /> 
          </Canvas>
          
          <div className="absolute top-6 right-6 text-right">
            <h2 className="text-4xl font-black text-white/20 uppercase italic select-none">{activeLoc}</h2>
            <p className="text-blue-500 font-mono text-sm tracking-tighter">{LOCATIONS[activeLoc].label}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;