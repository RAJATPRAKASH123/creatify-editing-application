'use client'
import React, { useState } from 'react';

interface LineData {
    tool: string;
    points: [any, any][];
    color: string;
    strokeWidth: number;
    tension: number;
    lineCap: 'butt' | 'round' | 'square';
    lineJoin: 'round' | 'bevel' | 'miter';
  }

interface ManageLayersProps {
  layers: LineData[][];
  selectedLayer: number;
  onSelectLayer: (layerIndex: number) => void;
}

const ManageLayers: React.FC<ManageLayersProps> = ({ layers, selectedLayer, onSelectLayer }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const handleToggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleSelectLayer = (layerIndex: number) => {
    onSelectLayer(layerIndex);
    setDropdownOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
        <div>
        <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            id="options-menu"
            aria-haspopup="true"
            aria-expanded="true"
            onClick={handleToggleDropdown}
            >
            Layer {selectedLayer + 1}
            <svg
                className="ml-2 h-5 w-1 text-gray-400"
            >
                <path
                fillRule="evenodd"
                d="M10 12a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
                />
                <path
                fillRule="evenodd"
                d="M2 10a2 2 0 114 0 2 2 0 01-4 0zM18 10a2 2 0 114 0 2 2 0 01-4 0z"
                clipRule="evenodd"
                />
            </svg>
        </button>

      </div>

      {isDropdownOpen && (
        <div className="">
          <div
            className="py-1"
            role="menu"
            aria-orientation="horizontal"
            aria-labelledby="options-menu"
          >
            {layers.map((layer, index) => (
              <button
                key={index}
                onClick={() => handleSelectLayer(index)}
                className={`${
                  index === selectedLayer
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-700'
                } block px-4 py-2 text-sm text-left`}
                role="menuitem"
              >
                Layer {index + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageLayers;