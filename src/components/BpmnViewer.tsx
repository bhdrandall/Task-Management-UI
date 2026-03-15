import { useEffect, useRef, useState } from 'react';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface BpmnViewerProps {
  xml: string;
  className?: string;
}

export function BpmnViewer({ xml, className = '' }: BpmnViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || !xml) return;

    let viewer: any = null;
    let isMounted = true;

    const initViewer = async () => {
      try {
        // Dynamic import to get NavigatedViewer
        const { default: NavigatedViewer } = await import('bpmn-js/lib/NavigatedViewer');
        
        if (!isMounted || !containerRef.current) return;

        // Destroy previous viewer if exists
        if (viewerRef.current) {
          viewerRef.current.destroy();
          viewerRef.current = null;
        }

        viewer = new NavigatedViewer({
          container: containerRef.current,
        });
        viewerRef.current = viewer;

        await viewer.importXML(xml);
        
        if (!isMounted) return;

        const canvas = viewer.get('canvas');
        if (canvas) {
          canvas.zoom('fit-viewport');
          setZoom(canvas.zoom());
        }
        setError(null);
      } catch (err: any) {
        console.error('Failed to import BPMN XML:', err);
        setError(err.message || 'Failed to load diagram');
      }
    };

    initViewer();

    return () => {
      isMounted = false;
      if (viewer) {
        viewer.destroy();
      }
    };
  }, [xml]);

  const handleZoomIn = () => {
    const canvas = viewerRef.current?.get('canvas');
    if (canvas) {
      const newZoom = Math.min(zoom * 1.2, 4);
      canvas.zoom(newZoom);
      setZoom(newZoom);
    }
  };

  const handleZoomOut = () => {
    const canvas = viewerRef.current?.get('canvas');
    if (canvas) {
      const newZoom = Math.max(zoom / 1.2, 0.2);
      canvas.zoom(newZoom);
      setZoom(newZoom);
    }
  };

  const handleFitViewport = () => {
    const canvas = viewerRef.current?.get('canvas');
    if (canvas) {
      canvas.zoom('fit-viewport');
      setZoom(canvas.zoom());
    }
  };

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-red-50 border border-red-200 rounded-lg ${className}`} style={{ minHeight: '500px' }}>
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className={`relative bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`} style={{ minHeight: '500px' }}>
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
      
      {/* BPMN container - NavigatedViewer enables mouse wheel zoom and drag to pan */}
      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ minHeight: '500px', cursor: 'grab' }}
      />
    </div>
  );
}
