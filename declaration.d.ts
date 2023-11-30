declare module 'use-image' {
    function useImage(
      url: string,
      crossOrigin?: string
    ): [
      (
        | HTMLImageElement
        | SVGImageElement
        | HTMLVideoElement
        | HTMLCanvasElement
        | ImageBitmap
        | OffscreenCanvas
        | undefined
      ),
      'loaded' | 'loading' | 'failed'
    ]
  
    export default useImage
  }