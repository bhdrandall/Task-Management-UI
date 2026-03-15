import { useEffect, useRef, useState } from 'react';
import BpmnJS from 'bpmn-js';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface BpmnViewerProps {
  xml: string;
  className?: string;
}

export function BpmnViewer({ xml, className = '' }: BpmnViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<BpmnJS | null>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!containerRef.current) return;

    const viewer = new BpmnJS({
      container: containerRef.current,
    });
    viewerRef.current = viewer;

    return () => {
      viewer.destroy();
    };
  }, []);

  useEffect(() => {
    if (!viewerRef.current || !xml) return;

    viewerRef.current.importXML(xml).then(() => {
      const canvas = viewerRef.current?.get('canvas') as any;
      if (canvas) {
        canvas.zoom(1);
        setZoom(1);
      }
    }).catch((err: Error) => {
      console.error('Failed to import BPMN XML:', err);
    });
  }, [xml]);

  const handleZoomIn = () => {
    const canvas = viewerRef.current?.get('canvas') as any;
    if (canvas) {
      const newZoom = Math.min(zoom * 1.2, 4);
      canvas.zoom(newZoom);
      setZoom(newZoom);
    }
  };

  const handleZoomOut = () => {
    const canvas = viewerRef.current?.get('canvas') as any;
    if (canvas) {
      const newZoom = Math.max(zoom / 1.2, 0.2);
      canvas.zoom(newZoom);
      setZoom(newZoom);
    }
  };

  const handleFitViewport = () => {
    const canvas = viewerRef.current?.get('canvas') as any;
    if (canvas) {
      canvas.zoom('fit-viewport');
      setZoom(canvas.zoom());
    }
  };

  return (
    <div className={`relative bg-white border border-gray-200 rounded-lg ${className}`} style={{ minHeight: '500px' }}>
      {/* Zoom controls */}
      <div className="absolute top-2 right-2 z-10 flex gap-1 bg-white rounded-lg shadow border border-gray-200 p-1">
        <button
          onClick={handleZoomIn}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={handleFitViewport}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Fit to View"
        >
          <Maximize2 className="w-4 h-4 text-gray-600" />
        </button>
        <span className="px-2 py-1 text-xs text-gray-500 flex items-center">
          {Math.round(zoom * 100)}%
        </span>
      </div>
      
      {/* BPMN container */}
      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ minHeight: '500px' }}
      />
    </div>
  );
}
