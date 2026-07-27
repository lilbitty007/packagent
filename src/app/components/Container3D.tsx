import { useState } from 'react';

interface FaceProps {
  w: number;
  h: number;
  transform: string;
  color: string;
  borderStyle?: string;
  opacity?: number;
}

const Face = ({ w, h, transform, color, borderStyle = 'solid', opacity = 1 }: FaceProps) => (
  <div style={{
    position: 'absolute',
    left: '50%', top: '50%',
    width: w, height: h,
    marginLeft: -w/2, marginTop: -h/2,
    transform,
    backgroundColor: color,
    border: `1px ${borderStyle} rgba(0,0,0,0.4)`,
    boxSizing: 'border-box',
    opacity
  }} />
);

interface BoxProps {
  w: number;
  h: number;
  d: number;
  color: string;
  x?: number;
  y?: number;
  z?: number;
  opacity?: number;
  isContainer?: boolean;
  showFaces?: { front?: boolean, back?: boolean, left?: boolean, right?: boolean, top?: boolean, bottom?: boolean };
  borderStyle?: string;
}

export const Box = ({ 
  w, h, d, color, 
  x = 0, y = 0, z = 0, 
  opacity = 1, 
  isContainer = false,
  showFaces = { front: true, back: true, left: true, right: true, top: true, bottom: true },
  borderStyle = 'solid'
}: BoxProps) => {
  return (
    <div style={{
      position: 'absolute',
      left: '50%', top: '50%',
      transformStyle: 'preserve-3d',
      transform: `translate3d(${x}px, ${-y}px, ${z}px)`,
    }}>
      <div style={{ transformStyle: 'preserve-3d', opacity }}>
        {showFaces.front && <Face w={w} h={h} color={color} transform={`translateZ(${d/2}px)`} borderStyle={borderStyle} opacity={isContainer ? 0.05 : 1} />}
        {showFaces.back && <Face w={w} h={h} color={color} transform={`translateZ(${-d/2}px) rotateY(180deg)`} borderStyle={borderStyle} opacity={isContainer ? 0.3 : 1} />}
        {showFaces.left && <Face w={d} h={h} color={color} transform={`translateX(${-w/2}px) rotateY(-90deg)`} borderStyle={borderStyle} opacity={isContainer ? 0.1 : 1} />}
        {showFaces.right && <Face w={d} h={h} color={color} transform={`translateX(${w/2}px) rotateY(90deg)`} borderStyle={borderStyle} opacity={isContainer ? 0.1 : 1} />}
        {showFaces.top && <Face w={w} h={d} color={color} transform={`translateY(${-h/2}px) rotateX(90deg)`} borderStyle={borderStyle} opacity={isContainer ? 0.1 : 1} />}
        {showFaces.bottom && <Face w={w} h={d} color={color} transform={`translateY(${h/2}px) rotateX(-90deg)`} borderStyle={borderStyle} opacity={isContainer ? 0.4 : 1} />}
      </div>
    </div>
  );
};

export function Container3D() {
  const [rotation, setRotation] = useState({ x: -15, y: -35 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  // Container dimensions (scaled for view)
  const cW = 160;
  const cH = 160;
  const cD = 400;

  // Mock boxes packed inside (simulating an optimized layout)
  const boxes = [
    // Bottom Layer
    { w: 60, h: 50, d: 80, color: '#ef4444', x: -cW/2 + 30, y: -cH/2 + 25, z: -cD/2 + 40 },
    { w: 60, h: 50, d: 80, color: '#f97316', x: -cW/2 + 90, y: -cH/2 + 25, z: -cD/2 + 40 },
    { w: 40, h: 50, d: 80, color: '#3b82f6', x: -cW/2 + 140, y: -cH/2 + 25, z: -cD/2 + 40 },
    
    { w: 80, h: 50, d: 100, color: '#10b981', x: -cW/2 + 40, y: -cH/2 + 25, z: -cD/2 + 130 },
    { w: 80, h: 50, d: 100, color: '#8b5cf6', x: -cW/2 + 120, y: -cH/2 + 25, z: -cD/2 + 130 },

    // Middle Layer
    { w: 60, h: 60, d: 80, color: '#ec4899', x: -cW/2 + 30, y: -cH/2 + 50 + 30, z: -cD/2 + 40 },
    { w: 60, h: 60, d: 80, color: '#06b6d4', x: -cW/2 + 90, y: -cH/2 + 50 + 30, z: -cD/2 + 40 },
    
    // Front Section
    { w: 100, h: 80, d: 100, color: '#eab308', x: -cW/2 + 50, y: -cH/2 + 40, z: cD/2 - 60 },
    { w: 60, h: 80, d: 100, color: '#14b8a6', x: -cW/2 + 130, y: -cH/2 + 40, z: cD/2 - 60 },
    
    // Top front
    { w: 100, h: 40, d: 100, color: '#6366f1', x: -cW/2 + 50, y: -cH/2 + 80 + 20, z: cD/2 - 60 },
  ];

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - startPos.x;
    const dy = e.clientY - startPos.y;
    setRotation(prev => ({
      x: Math.max(-80, Math.min(80, prev.x - dy * 0.4)),
      y: prev.y + dx * 0.4
    }));
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div 
      className="absolute inset-0 cursor-move flex items-center justify-center group"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ perspective: '1200px' }}
    >
       <div className="absolute bottom-4 right-4 z-10 pointer-events-none">
         <span className="text-xs text-slate-500 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-md border border-slate-200 shadow-sm font-medium">
           💡 按住鼠标左键可拖动旋转视角
         </span>
       </div>

       <div 
          style={{
             transformStyle: 'preserve-3d',
             transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
             transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
       >
          {/* Main Container Wireframe */}
          <Box 
             w={cW} h={cH} d={cD} 
             color="#94a3b8" 
             opacity={1}
             borderStyle="dashed"
             isContainer={true}
             showFaces={{ front: false, back: true, left: true, right: true, top: true, bottom: true }}
          />

          {/* Cargo Boxes */}
          {boxes.map((b, i) => (
             <Box key={i} w={b.w} h={b.h} d={b.d} color={b.color} x={b.x} y={b.y} z={b.z} />
          ))}
       </div>
    </div>
  );
}
