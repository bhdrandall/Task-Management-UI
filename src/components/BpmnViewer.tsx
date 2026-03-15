import { useEffect, useRef } from 'react';
import BpmnJS from 'bpmn-js';
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';

interface BpmnViewerProps {
  xml: string;
  className?: string;
}

export function BpmnViewer({ xml, className = '' }: BpmnViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<BpmnJS | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create viewer instance
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
        canvas.zoom('fit-viewport');
      }
    }).catch((err: Error) => {
      console.error('Failed to import BPMN XML:', err);
    });
  }, [xml]);

  return (
    <div 
      ref={containerRef} 
      className={`bg-white border border-gray-200 rounded-lg ${className}`}
      style={{ minHeight: '400px' }}
    />
  );
}
