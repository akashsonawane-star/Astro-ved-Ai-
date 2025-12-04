declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
    [key: string]: string | undefined;
  }
}

declare module '*.svg' {
  import * as React from 'react';
  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement> & { title?: string }>;
  const svgSrc: string;
  export default svgSrc;
}

declare module '*.png' {
  const pngSrc: string;
  export default pngSrc;
}

declare module '*.jpg' {
  const jpgSrc: string;
  export default jpgSrc;
}

declare module '*.jpeg' {
  const jpegSrc: string;
  export default jpegSrc;
}

declare module '*.gif' {
  const gifSrc: string;
  export default gifSrc;
}

declare module '*.webp' {
  const webpSrc: string;
  export default webpSrc;
}