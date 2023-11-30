import { LineCap, LineJoin } from 'konva/lib/Shape';
import React, { useRef, useState } from 'react';
import { Stage, Layer, Line, Text, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';

interface CanvasProps {
  imageUrl: string;
  onSelect: () => void;
  onChange: (newAttrs: any) => void;
}

interface LineData {
  tool: string;
  points: number[];
  color: string;
  strokeWidth: number;
  tension: number;
  lineCap: 'butt' | 'round' | 'square';
  lineJoin: 'round' | 'bevel' | 'miter';
//   lineCap: string;
//   lineJoin: string;
}

const MyCanvas: React.FC<CanvasProps> = ({ imageUrl, onSelect, onChange }) => {
  const [tool, setTool] = useState<string>('pen');
  const [lines, setLines] = useState<LineData[]>([]);
  const isDrawing = useRef<boolean>(false);
  const [image] = useImage(imageUrl);

  const handleMouseDown = (e: any) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    console.log("papa")
  
    // Check if lines array is empty
    if (lines.length === 0) {
      setLines([
        {
          tool,
          points: [pos.x, pos.y],
          color: '#000000', // default color
          strokeWidth: 5, // default strokeWidth
          tension: 0.5, // default tension
          lineCap: 'round' as 'butt' | 'round' | 'square', // default lineCap
          lineJoin: 'round' as 'round' | 'bevel' | 'miter', // default lineJoin
        },
      ]);
    } else {
      // Take it from the previous element only if the tool has not changed
      if (tool === lines[lines.length - 1].tool) {
        setLines((prevLines) => [
          ...prevLines,
          {
            tool,
            points: [pos.x, pos.y],
            color: prevLines[prevLines.length - 1].color,
            strokeWidth: prevLines[prevLines.length - 1].strokeWidth,
            tension: prevLines[prevLines.length - 1].tension,
            lineCap: prevLines[prevLines.length - 1].lineCap,
            lineJoin: prevLines[prevLines.length - 1].lineJoin,
          },
        ]);
      } else {
        // If tool has changed, add a new line with default values
        setLines((prevLines) => [
          ...prevLines,
          {
            tool,
            points: [pos.x, pos.y],
            color: '#000000', // default color
            strokeWidth: 5, // default strokeWidth
            tension: 0.5, // default tension
            lineCap: 'round' as 'butt' | 'round' | 'square', // default lineCap
            lineJoin: 'round' as 'round' | 'bevel' | 'miter', // default lineJoin
          },
        ]);
      }
    }
  };
  

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current) {
      return;
    }
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];
    lastLine.points = lastLine.points.concat([point.x, point.y]);
    lines.splice(lines.length - 1, 1, lastLine);
    setLines([...lines]);
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const handleImageLoad = (image: HTMLImageElement) => {
    // Handle image load
    console.log('Image loaded:', image);
  };

  return (
    <div>
      <div>
        <label>Tool:</label>
        <select
          value={tool}
          onChange={(e) => {
            setTool(e.target.value);
          }}
        >
          <option value="pen">Pen</option>
          <option value="eraser">Eraser</option>
        </select>
      </div>
      {(tool === 'pen' || tool === 'eraser') && (
        <div>
          <label>Color:</label>
          <input
            type="color"
            value={lines.length > 0 ? lines[lines.length - 1].color : '#df4b26'}
            onChange={(e) => {
              let lastLine = lines[lines.length - 1];
              lastLine.color = e.target.value;
              lines.splice(lines.length - 1, 1, lastLine);
              setLines([...lines]);
            }}
          />
          <br />
          <label>Stroke Width:</label>
          <input
            type="range"
            min="1"
            max="20"
            value={lines.length > 0 ? lines[lines.length - 1].strokeWidth : 5}
            onChange={(e) => {
              let lastLine = lines[lines.length - 1];
              lastLine.strokeWidth = parseInt(e.target.value);
              lines.splice(lines.length - 1, 1, lastLine);
              setLines([...lines]);
            }}
          />
          <br />
          <label>Tension:</label>
          <input
            type="range"
            min="0"
            max="0.5"
            step="0.01"
            value={lines.length > 0 ? lines[lines.length - 1].tension : 0.5}
            onChange={(e) => {
              let lastLine = lines[lines.length - 1];
              lastLine.tension = parseFloat(e.target.value);
              lines.splice(lines.length - 1, 1, lastLine);
              setLines([...lines]);
            }}
          />
          <br />
          <label>Line Cap:</label>
          <select
            value={lines.length > 0 ? lines[lines.length - 1].lineCap : 'round'}
            onChange={(e) => {
              let lastLine = lines[lines.length - 1];
              lastLine.lineCap = e.target.value as 'butt' | 'round' | 'square';
              lines.splice(lines.length - 1, 1, lastLine);
              setLines([...lines]);
            }}
          >
            <option value="butt">Butt</option>
            <option value="round">Round</option>
            <option value="square">Square</option>
          </select>
          <br />
          <label>Line Join:</label>
          <select
            value={lines.length > 0 ? lines[lines.length - 1].lineJoin : 'round'}
            onChange={(e) => {
              let lastLine = lines[lines.length - 1];
              lastLine.lineJoin = e.target.value as 'round' | 'bevel' | 'miter';
              lines.splice(lines.length - 1, 1, lastLine);
              setLines([...lines]);
            }}
          >
            <option value="round">Round</option>
            <option value="bevel">Bevel</option>
            <option value="miter">Miter</option>
          </select>
        </div>
      )}
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Layer>
          {image && (
            <KonvaImage
              image={image as unknown as HTMLImageElement}
              width={window.innerWidth}
              height={window.innerHeight}
              onLoad={() => handleImageLoad(image as unknown as HTMLImageElement)}
            />
          )}
          <Text text="Just start drawing" x={5} y={30} />
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke={line.tool === 'eraser' ? 'white' : line.color}
              strokeWidth={line.strokeWidth}
              tension={line.tension}
              lineCap={line.lineCap as 'butt' | 'round' | 'square'}
              lineJoin={line.lineJoin as 'round' | 'bevel' | 'miter'}
              globalCompositeOperation={
                line.tool === 'eraser' ? 'destination-out' : 'source-over'
              }
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default MyCanvas;
