import Konva from 'konva';
import React, { MutableRefObject, useCallback, useRef, useState } from 'react';
import { Stage, Layer, Line, Text, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import { KonvaEventObject } from 'konva/lib/Node';
import { getScaledCursorPosition } from '../hooks/utils';
import { Vector2d } from 'konva/lib/types';
import ManageLayers from './ManageLayers';

interface CanvasProps {
  imageUrl: string;
  onSelect: () => void;
  onChange: (newAttrs: any) => void;
}

interface Point {
  x: any;
  y: any;
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
  const isDrawing = useRef<boolean>(false);
  const [image] = useImage(imageUrl);

  const stageRef = useRef<Konva.Stage>(null);
  const didMouseMoveRef = useRef<boolean>(false);
  const lastCursorPositionRef = useRef<Vector2d>({ x: 0, y: 0 });
  const [layers, setLayers] = useState<LineData[][]>([
    [
      {
        tool,
        points: [],
        color: '#000000',
        strokeWidth: 5,
        tension: 0.5,
        lineCap: 'round',
        lineJoin: 'round',
      },
    ],
  ]);
  const [selectedLayer, setSelectedLayer] = useState<number>(0);

  const handleSelectLayer = (index: number) => {
    setSelectedLayer(index);
  };

  const addNewLayer = () => {

    const newLayer:LineData[]= [
      {
        tool,
        points: [],
        color: layers[selectedLayer]?.length > 1 ? layers[selectedLayer][layers[selectedLayer].length-1].color : '#000000',
        strokeWidth: layers[selectedLayer]?.length > 1 ? layers[selectedLayer][layers[selectedLayer].length-1].strokeWidth : 5,
        tension: layers[selectedLayer]?.length > 1 ? layers[selectedLayer][layers[selectedLayer].length-1].tension : 0.5,
        lineCap: layers[selectedLayer]?.length > 1 ? layers[selectedLayer][layers[selectedLayer].length-1].lineCap : 'round',
        lineJoin: layers[selectedLayer]?.length > 1 ? layers[selectedLayer][layers[selectedLayer].length-1].lineJoin : 'round',
      },
    ]

    // more like update layers function

    // updateLayers((prevLayers) => {
    //     const updatedLayers = prevLayers.map((layer, layerIndex) => {
    //       if (layerIndex === selectedLayer) {
    //         // const lastLine = layer[layer.length - 1];
    //         // const updatedPoints = [...lastLine.points, [point?.x, point?.y]];
    //         const updatedLayer = [...layer, ...firstLine];
    //         // layer.splice(layer.length - 1 ,1 , updatedLayer);
    //         layer = updatedLayer;
    //       }
    //       return layer;
    //     });
    //     return updatedLayers;
    //   });
    setLayers((prevLayers) => [...prevLayers, newLayer])
    setSelectedLayer(layers.length);
  };

  const handleMouseDown = useCallback(
    (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (!stageRef.current) return;
      stageRef.current.container().focus();
      e.evt.preventDefault();

      if ((e.evt as MouseEvent).button === 1) {
        stageRef.current.startDrag();
        return;
      }

      const pos = getScaledCursorPosition(stageRef.current);
      if (!pos) return;
      isDrawing.current = true;

      if (tool === layers[selectedLayer][layers[selectedLayer].length - 1].tool) {
        setLayers((prevLayers) => {
            const updatedLayers = prevLayers.map((layer, layerIndex) => {
              if (layerIndex === selectedLayer) {
                const newLine:LineData= 
                    {
                      tool,
                      points: [[pos.x, pos.y]],
                      color: layers[selectedLayer]?.length > 1 ? layers[selectedLayer][layers[selectedLayer].length-1].color : '#000000',
                      strokeWidth: layers[selectedLayer]?.length > 1 ? layers[selectedLayer][layers[selectedLayer].length-1].strokeWidth : 5,
                      tension: layers[selectedLayer]?.length > 1 ? layers[selectedLayer][layers[selectedLayer].length-1].tension : 0.5,
                      lineCap: layers[selectedLayer]?.length > 1 ? layers[selectedLayer][layers[selectedLayer].length-1].lineCap : 'round',
                      lineJoin: layers[selectedLayer]?.length > 1 ? layers[selectedLayer][layers[selectedLayer].length-1].lineJoin : 'round',
                    }
                  
                const updatedLayer = [ ...layer, newLine ];
                // layer.splice(layer.length - 1 ,1 , updatedLayer);
                layer = updatedLayer;
              }
              return layer;
            });
            return updatedLayers;
          });
        // setCurrentLayer((prevLines) => [
        //   ...prevLines,
        //   {
        //     tool,
        //     points: [[pos.x, pos.y]],
        //     color: prevLines[prevLines.length - 1].color,
        //     strokeWidth: prevLines[prevLines.length - 1].strokeWidth,
        //     tension: prevLines[prevLines.length - 1].tension,
        //     lineCap: prevLines[prevLines.length - 1].lineCap,
        //     lineJoin: prevLines[prevLines.length - 1].lineJoin,
        //   },
        // ]);
      } else {
        // setCurrentLayer((prevLayer) => [
        //   ...prevLayer,
        //   {
        //     tool,
        //     points: [[pos.x, pos.y]],
        //     color: '#000000',
        //     strokeWidth: 5,
        //     tension: 0.5,
        //     lineCap: 'round',
        //     lineJoin: 'round',
        //   },
        // ]);
        setLayers((prevLayers) => {
            const updatedLayers = prevLayers.map((layer, layerIndex) => {
              if (layerIndex === selectedLayer) {
                const newLine:LineData= 
                    {
                      tool,
                      points: [[pos.x, pos.y]],
                      color: '#000000',
                      strokeWidth:  5,
                      tension: 0.5,
                      lineCap: 'round',
                      lineJoin: 'round',
                    }
                  
                const updatedLayer = [ ...layer, newLine ];
                // layer.splice(layer.length - 1 ,1 , updatedLayer);
                layer = updatedLayer;
              }
              return layer;
            });
            return updatedLayers;
          });
      }
    },
    [tool, stageRef, layers[selectedLayer]]
  );

  const handleMouseMove = useCallback(() => {
    if (!stageRef.current) return;

    didMouseMoveRef.current = true;
    const point = getScaledCursorPosition(stageRef.current);
    if (!isDrawing.current) {
      return;
    }
    if (tool === 'eraser') {
      setLayers((prevLayers) => {
        const updatedLayers = prevLayers.map((layer, layerIndex) => {
          if (layerIndex === selectedLayer) {
            const updatedLines = layer.map((line) => {
              if (line.points.length > 1) {
                const updatedPoints = line.points.filter((eachPoint) => {
                  const xx: number = point?.x || 0;
                  const yy: number = point?.y || 0;
                  return (
                    Math.abs((eachPoint[0] as number - xx) ** 2 + Math.abs(eachPoint[1] as number - yy) ** 2) ** 0.5 >
                    5 * layers[selectedLayer][layers[selectedLayer].length - 1].strokeWidth
                  );
                });
                return { ...line, points: updatedPoints };
              }
              return line;
            });
            return updatedLines;
          }
          return layer;
        });
        return updatedLayers;
      });
    }
    if (tool === 'pen') {
      setLayers((prevLayers) => {
        const updatedLayers = prevLayers.map((layer, layerIndex) => {
          if (layerIndex === selectedLayer) {
            const lastLine = layer[layer.length - 1];
            // const updatedPoints = [...lastLine.points, [point?.x, point?.y]];
            const updatedLine = { ...lastLine, points: [...lastLine.points, [point?.x, point?.y]] } as LineData;
            layer.splice(layer.length - 1, 1, updatedLine);
          }
          return layer;
        });
        return updatedLayers;
      });
    }
  }, [tool, stageRef, didMouseMoveRef, isDrawing, layers[selectedLayer], selectedLayer]);

  const handleMouseUp = () => {
    let newInvisibleLine = { ...layers[selectedLayer][layers[selectedLayer].length - 1] };
    newInvisibleLine.points = [];
    // setLayers((prevLayers) => [...currentLayer, newInvisibleLine]);
    setLayers((prevLayers) => {
        const updatedLayers = prevLayers.map((layer, layerIndex) => {
          if (layerIndex === selectedLayer) {
            // const lastLine = layer[layer.length - 1];
            // const updatedPoints = [...lastLine.points, [point?.x, point?.y]];
            const updatedLayer = [ ...layer, newInvisibleLine ];
            // layer.splice(layer.length - 1 ,1 , updatedLayer);
            layer = updatedLayer;
          }
          return layer;
        });
        return updatedLayers;
      });
    
    isDrawing.current = false;
  };

  const handleImageLoad = (image: HTMLImageElement) => {
    // Handle image load
    // console.log('Image loaded:', image);
  };

  return (
    <>
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

        {(tool === 'pen' || tool === 'eraser') && (
          <div>
            <label>Color:</label>
            <input
                type="color"
                value={layers[selectedLayer]?.length > 1 ? layers[selectedLayer][layers[selectedLayer].length-1].color : '#df4b26'}
                onChange={(e) => {
                    let newInvisibleLine = { ...layers[selectedLayer][layers[selectedLayer].length - 1] };
                    newInvisibleLine.color = e.target.value.toString();
                    newInvisibleLine.points = [];
                    setLayers((prevLayers) => {
                        const updatedLayers = prevLayers.map((layer, layerIndex) => {
                            if (layerIndex === selectedLayer) {
                            const updatedLayer = [ ...layer, newInvisibleLine ];
                            layer = updatedLayer;
                            }
                            return layer;
                        });
                        return updatedLayers;
                        });
                }}
            />
            <br />

            <label>Stroke Width:</label>
            <input
              type="range"
              min="0"
              max="100"
              value={layers[selectedLayer]?.length > 1 ? layers[selectedLayer][layers[selectedLayer].length-1].strokeWidth : 5}
              onChange={(e) => {
                // let newInvisibleLine = { ...currentLayer[currentLayer.length - 1] };
                // newInvisibleLine.strokeWidth = parseInt(e.target.value);
                // newInvisibleLine.points = [];
                // setCurrentLayer((currentLayer) => [...currentLayer, newInvisibleLine]);
                let newInvisibleLine = { ...layers[selectedLayer][layers[selectedLayer].length - 1] };
                newInvisibleLine.strokeWidth = parseInt(e.target.value);
                newInvisibleLine.points = [];
                setLayers((prevLayers) => {
                    const updatedLayers = prevLayers.map((layer, layerIndex) => {
                        if (layerIndex === selectedLayer) {
                        const updatedLayer = [ ...layer, newInvisibleLine ];
                        layer = updatedLayer;
                        }
                        return layer;
                    });
                    return updatedLayers;
                    });
              }}
            />
            <br />

            <label>Tension:</label>
            <input
              type="range"
              min="0"
              max="7"
              step="0.01"
              value={layers[selectedLayer]?.length > 1 ? layers[selectedLayer][layers[selectedLayer].length-1].tension : 0.5}
              onChange={(e) => {
                // let newInvisibleLine = { ...currentLayer[currentLayer.length - 1] };
                // newInvisibleLine.tension = parseFloat(e.target.value);
                // newInvisibleLine.points = [];
                // setCurrentLayer((currentLayer) => [...currentLayer, newInvisibleLine]);
                let newInvisibleLine = { ...layers[selectedLayer][layers[selectedLayer].length - 1] };
                newInvisibleLine.tension = parseFloat(e.target.value);
                newInvisibleLine.points = [];
                setLayers((prevLayers) => {
                    const updatedLayers = prevLayers.map((layer, layerIndex) => {
                        if (layerIndex === selectedLayer) {
                        const updatedLayer = [ ...layer, newInvisibleLine ];
                        layer = updatedLayer;
                        }
                        return layer;
                    });
                    return updatedLayers;
                    });
              }}
            />
            <br />

            <label>Line Cap:</label>
            <select
              value={layers[selectedLayer]?.length > 1 ? layers[selectedLayer][layers[selectedLayer].length-1].lineCap : 'round'}
              onChange={(e) => {
                // let newInvisibleLine = { ...currentLayer[currentLayer.length - 1] };
                // newInvisibleLine.lineCap = e.target.value as 'butt' | 'round' | 'square';
                // newInvisibleLine.points = [];
                // setCurrentLayer((currentLayer) => [...currentLayer, newInvisibleLine]);
                let newInvisibleLine = { ...layers[selectedLayer][layers[selectedLayer].length - 1] };
                newInvisibleLine.lineCap = e.target.value as 'butt' | 'round' | 'square';
                newInvisibleLine.points = [];
                setLayers((prevLayers) => {
                    const updatedLayers = prevLayers.map((layer, layerIndex) => {
                        if (layerIndex === selectedLayer) {
                        const updatedLayer = [ ...layer, newInvisibleLine ];
                        layer = updatedLayer;
                        }
                        return layer;
                    });
                    return updatedLayers;
                    });
              }}
            >
              <option value="butt">Butt</option>
              <option value="round">Round</option>
              <option value="square">Square</option>
            </select>
            <br />

            <label>Line Join:</label>
            <select
              value={layers[selectedLayer]?.length > 1 ? layers[selectedLayer][layers[selectedLayer].length-1].lineJoin : 'round'}
              onChange={(e) => {
                // let newInvisibleLine = { ...currentLayer[currentLayer.length - 1] };
                // newInvisibleLine.lineJoin = e.target.value as 'round' | 'bevel' | 'miter';
                // newInvisibleLine.points = [];
                // setCurrentLayer((currentLayer) => [...currentLayer, newInvisibleLine]);
                let newInvisibleLine = { ...layers[selectedLayer][layers[selectedLayer].length - 1] };
                newInvisibleLine.lineJoin = e.target.value as 'round' | 'bevel' | 'miter';
                newInvisibleLine.points = [];
                setLayers((prevLayers) => {
                    const updatedLayers = prevLayers.map((layer, layerIndex) => {
                        if (layerIndex === selectedLayer) {
                        const updatedLayer = [ ...layer, newInvisibleLine ];
                        layer = updatedLayer;
                        }
                        return layer;
                    });
                    return updatedLayers;
                    });
              }}
            >
              <option value="round">Round</option>
              <option value="bevel">Bevel</option>
              <option value="miter">Miter</option>
            </select>
            <button className="" onClick={() => addNewLayer()}>
              Add Layer
            </button>
                {/* <div className="p-8">
                    <h1 className="text-2xl font-bold mb-4">Manage Layers Example</h1>
                    <ManageLayers
                        layers={layers}
                        selectedLayer={selectedLayer}
                        onSelectLayer={handleSelectLayer}
                    />
                </div> */}
          </div>
        )}
      </div>
      <Stage
        tabIndex={-1}
        width={window.innerWidth}
        height={window.innerHeight - 20}
        ref={stageRef}
        className={'inpainting-canvas-stage'}
        style={{
          outline: 'none',
          borderRadius: '4px',
          boxShadow: '0px 0px 0px 1px #11182B',
          overflow: 'hidden',
          backgroundColor: '#0D1124',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
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
        </Layer>
        {layers.map((layer: LineData[], index) => (
          <Layer key={index}>
            {layer.map((line, i) => (
              <Line
                key={i}
                points={line.points.flat() as number[]}
                stroke={line.tool === 'pen' ? line.color : 'eraser'}
                strokeWidth={line.strokeWidth}
                tension={line.tension}
                lineCap={line.lineCap as 'butt' | 'round' | 'square'}
                lineJoin={line.lineJoin as 'round' | 'bevel' | 'miter'}
                globalCompositeOperation={line.tool === 'eraser' ? 'destination-out' : 'source-over'}
              />
            ))}
          </Layer>
        ))}
      </Stage>
    </>
  );
};

export default MyCanvas;
