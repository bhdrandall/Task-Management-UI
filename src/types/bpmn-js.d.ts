declare module 'bpmn-js/lib/NavigatedViewer' {
  import Viewer from 'bpmn-js/lib/Viewer';
  export default class NavigatedViewer extends Viewer {}
}

declare module 'bpmn-js/lib/Viewer' {
  export default class Viewer {
    constructor(options: { container: HTMLElement });
    importXML(xml: string): Promise<{ warnings: string[] }>;
    get(name: string): any;
    destroy(): void;
  }
}
