'use client'
import Konva from 'konva';
import React, { MutableRefObject, useCallback, useRef, useState } from 'react';
import { Stage, Layer, Line, Text, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import { KonvaEventObject } from 'konva/lib/Node';
import { getScaledCursorPosition } from '../hooks/utils';
import { Vector2d } from 'konva/lib/types';

interface CanvasProps {
  imageUrl: string;
  onSelect: () => void;
  onChange: (newAttrs: any) => void;
}
interface Point {
    x:any;
    y:any;
}

interface LineData {
  tool: string;
  points: [any, any][];
  color: string;
  strokeWidth: number;
  tension: number;
  lineCap: 'butt' | 'round' | 'square';
  lineJoin: 'round' | 'bevel' | 'miter';
}

const groupOrigin = new Konva.Group({
    x: 30,
    rotation: 10,
    scaleX: 1.5,
  });

const MyCanvas: React.FC<CanvasProps> = ({ imageUrl, onSelect, onChange }) => {
  const [tool, setTool] = useState<string>('pen');
//   const [penToolState, setPenToolState] = useState<PenToolState>();
//   const [eraserToolState, setEraserToolState] = useState<EraserToolState>();
  const [lines, setLines] = useState<LineData[]>([]);
  const isDrawing = useRef<boolean>(false);
  const [image] = useImage(imageUrl);

  const stageRef = useRef(null);
  const didMouseMoveRef = useRef(false);
  const lastCursorPositionRef = useRef({ x: 0, y: 0 });


//   const handleMouseDown = useCanvasMouseDown(stageRef);
//   const handleMouseOut = useCanvasMouseOut();
//   const handleMouseMove = useCanvasMouseMove(
//     stageRef,
//     didMouseMoveRef,
//     lastCursorPositionRef
//   );
//   const handleMouseUp = useCanvasMouseUp(stageRef, didMouseMoveRef);

  const handleMouseDown = (stageRef: MutableRefObject<Konva.Stage | null>) => {

    return useCallback(
        (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
            if (!stageRef.current) return;
            stageRef.current.container().focus();

            e.evt.preventDefault();
      
            if ((e.evt as MouseEvent).button === 1) {
              stageRef.current.startDrag();
              return;
            }
      
            // const scaledCursorPosition = getScaledCursorPosition(stageRef.current);
            const pos = getScaledCursorPosition(stageRef.current);
            if (!pos) return;
            isDrawing.current = true;
            
            console.log("papa")
          
            // Check if lines array is empty
            if (lines.length === 0) {
              setLines([
                {
                  tool,
                  points: [[pos.x, pos.y]],
                  color: '#000000', // default color
                  strokeWidth: 5, // default strokeWidth
                  tension: 0.5, // default tension
                  lineCap: 'round' as 'butt' | 'round' | 'square', // default lineCap
                  lineJoin: 'round' as 'round' | 'bevel' | 'miter', // default lineJoin
                },
              ]);
            } else {
              // Take it from the previous element only if the tool has not changed
            //   if (tool === "eraser") {}
              if (tool === lines[lines.length - 1].tool) {
                setLines((prevLines) => [
                  ...prevLines,
                  {
                    tool,
                    points: [[pos.x, pos.y]],
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
                    points: [[pos.x, pos.y]],
                    color: '#000000', // default color
                    strokeWidth: 5, // default strokeWidth
                    tension: 0.5, // default tension
                    lineCap: 'round' as 'butt' | 'round' | 'square', // default lineCap
                    lineJoin: 'round' as 'round' | 'bevel' | 'miter', // default lineJoin
                  },
                ]);
              }
            }
        },
        [tool, stageRef, lines]
      );

  };  
  

  const handleMouseMove = (
    stageRef: MutableRefObject<Konva.Stage | null>,
    didMouseMoveRef: MutableRefObject<boolean>,
    lastCursorPositionRef: MutableRefObject<Vector2d>
  ) => {
    return useCallback(() => {
        if (!stageRef.current) return;
    
    didMouseMoveRef.current = true;
    const point = getScaledCursorPosition(stageRef.current);
    if (!isDrawing.current) {
        return;
      }
    if (tool === 'eraser'){
        setLines((prevLines) => {
            const updatedLines = prevLines.map((line) => {
              if (line.points.length > 1) {
                // Ensure there are at least two points before removing
                // console.log(line.points.length);
                const updatedPoints = line.points.filter((eachPoint) => {
                    // console.log("x", eachPoint[0], point?.x);
                    // console.log("y", eachPoint[1], point?.y);
                    const xx:number = point?.x || 0;
                    const yy:number = point?.y || 0;

                    return (Math.abs((eachPoint[0] as number - xx)**2 + Math.abs(eachPoint[1] as number - yy)**2)**0.5 > lines[lines.length - 1].strokeWidth ) ;
                  });                  
                // console.log(line.points.length);
                // Return the updated line only if it has more than one point
                return { ...line, points: updatedPoints };
              }
              // Return the line as is if it has fewer than two points
              return line;
            });
            return updatedLines;
          });
    } 
    if (tool === 'pen'){
        let lastLine = lines[lines.length - 1];
        lastLine.points.push([point?.x, point?.y]);
        lines.splice(lines.length - 1, 1, lastLine);
        setLines([...lines]);
    }
    }, [tool, stageRef, didMouseMoveRef, isDrawing, lines]);
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const handleImageLoad = (image: HTMLImageElement) => {
    // Handle image load
    // console.log('Image loaded:', image);
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
              let newInvisibleLine = {...lines[lines.length - 1]}
              newInvisibleLine.color = e.target.value.toString();
              newInvisibleLine.points = [];
              setLines([...lines, newInvisibleLine]);
            }}
          />
          <br />
          <label>Stroke Width:</label>
          <input
            type="range"
            min="0"
            max="100"
            value={lines.length > 0 ? lines[lines.length - 1].strokeWidth : 5}
            onChange={(e) => {
              let newInvisibleLine = {...lines[lines.length - 1]}
              newInvisibleLine.strokeWidth = parseInt(e.target.value);
              newInvisibleLine.points = [];
              setLines([...lines, newInvisibleLine]);
            }}
          />
          <br />
          <label>Tension:</label>
          <input
            type="range"
            min="0"
            max="7"
            step="0.01"
            value={lines.length > 0 ? lines[lines.length - 1].tension : 0.5}
            onChange={(e) => {
              let newInvisibleLine = {...lines[lines.length - 1]}
              newInvisibleLine.tension = parseFloat(e.target.value);
              newInvisibleLine.points = [];
              setLines([...lines, newInvisibleLine]);
            }}
          />
          <br />
          <label>Line Cap:</label>
          <select
            value={lines.length > 0 ? lines[lines.length - 1].lineCap : 'round'}
            onChange={(e) => {
              let newInvisibleLine = {...lines[lines.length - 1]}
              newInvisibleLine.lineCap = e.target.value as 'butt' | 'round' | 'square';
              newInvisibleLine.points = [];
              setLines([...lines, newInvisibleLine]);
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
              let newInvisibleLine = {...lines[lines.length - 1]}
              newInvisibleLine.lineJoin = e.target.value as 'round' | 'bevel' | 'miter';
              newInvisibleLine.points = [];
              setLines([...lines, newInvisibleLine]);
            }}
          >
            <option value="round">Round</option>
            <option value="bevel">Bevel</option>
            <option value="miter">Miter</option>
          </select>
        </div>
      )}
      <Stage
        tabIndex={-1}
        width={window.innerWidth}
        height={window.innerHeight-20}
        ref={stageRef}
        className={"inpainting-canvas-stage"}
        style={{
            outline: "none",
            borderRadius: "4px",
            boxShadow: "0px 0px 0px 1px #11182B",
            overflow: "hidden",
            backgroundColor: "#0D1124"
          }}
        // width={1000}
        // height={600}
        onMouseDown={handleMouseDown(stageRef)}
        onMouseMove={handleMouseMove(stageRef, didMouseMoveRef,
            lastCursorPositionRef)}
        onMouseUp={handleMouseUp}
        onContextMenu={(e) => e.evt.preventDefault()}
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
              points={line.points.flat() as number[]}
              stroke={line.tool === 'pen' ? line.color : 'eraser'}
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
