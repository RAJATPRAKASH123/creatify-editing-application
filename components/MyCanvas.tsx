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


interface LineData {
    tool: string;
    points: [any, any][];
    color: string;
    strokeWidth: number;
    tension: number;
    lineCap: 'butt' | 'round' | 'square';
    lineJoin: 'round' | 'bevel' | 'miter';
}


interface Position {
    x: number;
    y: number;
}


const MyCanvas: React.FC<CanvasProps> = ({ imageUrl, onSelect, onChange }) => {
    const [tool, setTool] = useState<string>('pen');
    const isDrawing = useRef<boolean>(false);
    const [image] = useImage(imageUrl);

    const stageRef = useRef<Konva.Stage>(null);
    const didMouseMoveRef = useRef<boolean>(false);
    const lastCursorPositionRef = useRef<Vector2d>({ x: 0, y: 0 });
    const [undoCount, setUndoCount] = useState<number>(0);
    const [redoCount, setRedoCount] = useState<number>(0);
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

    const history = useRef<Array<LineData[] | LineData[][]>>([...layers]);
    const historyIndex = useRef<number>(0);


    const updateHistory = () => {
        const newHistory = [...history.current.slice(0, historyIndex.current + 1), layers];
        history.current = newHistory;
        historyIndex.current = newHistory.length - 1;
        setUndoCount(historyIndex.current);
        setRedoCount(0);
    };

    const handleUndo = () => {
        if (historyIndex.current > 0) {
            historyIndex.current -= 1;
            setLayers(history.current[historyIndex.current] as LineData[][]);
            setUndoCount((prev) => Math.max(prev - 1, 0));
            setRedoCount((prev) => prev + 1);
        }
    };

    const handleRedo = () => {
        if (historyIndex.current < history.current.length - 1) {
            historyIndex.current += 1;
            setLayers(history.current[historyIndex.current] as LineData[][]);
            setUndoCount((prev) => prev + 1);
            setRedoCount((prev) => Math.max(prev - 1, 0));
        }
    };
    const handleSelectLayer = (index: number) => {
        setSelectedLayer(index);
    };


    const addNewLayer = () => {

        const newLayer: LineData[] = [
            {
                tool,
                points: [],
                color: layers[selectedLayer]?.length > 1 ? layers[selectedLayer][layers[selectedLayer].length - 1].color : '#000000',
                strokeWidth: layers[selectedLayer]?.length > 1 ? layers[selectedLayer][layers[selectedLayer].length - 1].strokeWidth : 5,
                tension: layers[selectedLayer]?.length > 1 ? layers[selectedLayer][layers[selectedLayer].length - 1].tension : 0.5,
                lineCap: layers[selectedLayer]?.length > 1 ? layers[selectedLayer][layers[selectedLayer].length - 1].lineCap : 'round',
                lineJoin: layers[selectedLayer]?.length > 1 ? layers[selectedLayer][layers[selectedLayer].length - 1].lineJoin : 'round',
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
                            const newLine: LineData =
                            {
                                tool,
                                points: [[pos.x, pos.y]],
                                color: layers[selectedLayer]?.length > 1 ? layers[selectedLayer][layers[selectedLayer].length - 1].color : '#000000',
                                strokeWidth: layers[selectedLayer]?.length > 1 ? layers[selectedLayer][layers[selectedLayer].length - 1].strokeWidth : 5,
                                tension: layers[selectedLayer]?.length > 1 ? layers[selectedLayer][layers[selectedLayer].length - 1].tension : 0.5,
                                lineCap: layers[selectedLayer]?.length > 1 ? layers[selectedLayer][layers[selectedLayer].length - 1].lineCap : 'round',
                                lineJoin: layers[selectedLayer]?.length > 1 ? layers[selectedLayer][layers[selectedLayer].length - 1].lineJoin : 'round',
                            }

                            const updatedLayer = [...layer, newLine];
                            // layer.splice(layer.length - 1 ,1 , updatedLayer);
                            layer = updatedLayer;
                        }
                        return layer;
                    });
                    return updatedLayers;
                });

            } else {
                setLayers((prevLayers) => {
                    const updatedLayers = prevLayers.map((layer, layerIndex) => {
                        if (layerIndex === selectedLayer) {
                            const newLine: LineData =
                            {
                                tool,
                                points: [[pos.x, pos.y]],
                                color: '#000000',
                                strokeWidth: 5,
                                tension: 0.5,
                                lineCap: 'round',
                                lineJoin: 'round',
                            }

                            const updatedLayer = [...layer, newLine];
                            // layer.splice(layer.length - 1 ,1 , updatedLayer);
                            layer = updatedLayer;
                        }
                        return layer;
                    });
                    return updatedLayers;
                });
            }
            updateHistory();
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
                    const updatedLayer = [...layer, newInvisibleLine];
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
    const isUndoDisabled = () => {
        return undoCount <= 2;
    };


    return (
        <>
            <div>
                <label className='px-8'>Tool:</label>
                <select
                    value={tool}
                    onChange={(e) => {
                        setTool(e.target.value);
                    }}
                >
                    <option value="pen">Pen</option>
                    <option value="eraser">Eraser</option>
                    <option value="add-image">Play With Image</option>
                </select>

                {(tool == 'pen') && (
                    <>
                        <label className='px-8'>Color:</label>
                        <input className='px-2'
                            type="color"
                            value={layers[selectedLayer]?.length > 1 ? layers[selectedLayer][layers[selectedLayer].length - 1].color : '#df4b26'}
                            onChange={(e) => {
                                let newInvisibleLine = { ...layers[selectedLayer][layers[selectedLayer].length - 1] };
                                newInvisibleLine.color = e.target.value.toString();
                                newInvisibleLine.points = [];
                                setLayers((prevLayers) => {
                                    const updatedLayers = prevLayers.map((layer, layerIndex) => {
                                        if (layerIndex === selectedLayer) {
                                            const updatedLayer = [...layer, newInvisibleLine];
                                            layer = updatedLayer;
                                        }
                                        return layer;
                                    });
                                    return updatedLayers;
                                });
                            }}
                        />
                    </>

                )}
                {(tool === 'pen' || tool === 'eraser') && (
                    <>
                        <label className='px-2'>Stroke Width:</label>
                        <input className='px-8'
                            type="range"
                            min="0"
                            max="100"
                            value={layers[selectedLayer]?.length > 1 ? layers[selectedLayer][layers[selectedLayer].length - 1].strokeWidth : 5}
                            onChange={(e) => {
                                let newInvisibleLine = { ...layers[selectedLayer][layers[selectedLayer].length - 1] };
                                newInvisibleLine.strokeWidth = parseInt(e.target.value);
                                newInvisibleLine.points = [];
                                setLayers((prevLayers) => {
                                    const updatedLayers = prevLayers.map((layer, layerIndex) => {
                                        if (layerIndex === selectedLayer) {
                                            const updatedLayer = [...layer, newInvisibleLine];
                                            layer = updatedLayer;
                                        }
                                        return layer;
                                    });
                                    return updatedLayers;
                                });
                            }}
                        />


                        <label>Tension:</label>
                        <input className='px-8'
                            type="range"
                            min="0"
                            max="7"
                            step="0.01"
                            value={layers[selectedLayer]?.length > 1 ? layers[selectedLayer][layers[selectedLayer].length - 1].tension : 0.5}
                            onChange={(e) => {
                                let newInvisibleLine = { ...layers[selectedLayer][layers[selectedLayer].length - 1] };
                                newInvisibleLine.tension = parseFloat(e.target.value);
                                newInvisibleLine.points = [];
                                setLayers((prevLayers) => {
                                    const updatedLayers = prevLayers.map((layer, layerIndex) => {
                                        if (layerIndex === selectedLayer) {
                                            const updatedLayer = [...layer, newInvisibleLine];
                                            layer = updatedLayer;
                                        }
                                        return layer;
                                    });
                                    return updatedLayers;
                                });
                            }}
                        />


                        <label className='px-2'>Line Cap:</label>
                        <select className='px-8 py-2'
                            value={layers[selectedLayer]?.length > 1 ? layers[selectedLayer][layers[selectedLayer].length - 1].lineCap : 'round'}
                            onChange={(e) => {
                                let newInvisibleLine = { ...layers[selectedLayer][layers[selectedLayer].length - 1] };
                                newInvisibleLine.lineCap = e.target.value as 'butt' | 'round' | 'square';
                                newInvisibleLine.points = [];
                                setLayers((prevLayers) => {
                                    const updatedLayers = prevLayers.map((layer, layerIndex) => {
                                        if (layerIndex === selectedLayer) {
                                            const updatedLayer = [...layer, newInvisibleLine];
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


                        <label className='px-2'>Line Join:</label>
                        <select className='px-8 py-2'
                            value={layers[selectedLayer]?.length > 1 ? layers[selectedLayer][layers[selectedLayer].length - 1].lineJoin : 'round'}
                            onChange={(e) => {
                                let newInvisibleLine = { ...layers[selectedLayer][layers[selectedLayer].length - 1] };
                                newInvisibleLine.lineJoin = e.target.value as 'round' | 'bevel' | 'miter';
                                newInvisibleLine.points = [];
                                setLayers((prevLayers) => {
                                    const updatedLayers = prevLayers.map((layer, layerIndex) => {
                                        if (layerIndex === selectedLayer) {
                                            const updatedLayer = [...layer, newInvisibleLine];
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
                    </>
                )}
                <button className="px-8 py-2" onClick={() => addNewLayer()}>
                    Add Layer
                </button>
                <button className='px-2' onClick={() => isUndoDisabled() || handleUndo()} disabled={isUndoDisabled()}>
                    Undo
                </button>
                <button className='px-2' onClick={handleRedo} disabled={redoCount === 0}>Redo</button>
                <div className="p-1">

                    <ManageLayers
                        layers={layers}
                        selectedLayer={selectedLayer}
                        onSelectLayer={handleSelectLayer}
                    />
                </div>
            </div>
            <Stage
                tabIndex={-1}
                width={window.innerWidth}
                height={window.innerHeight - 150}
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
                        {console.log(layer)}
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
