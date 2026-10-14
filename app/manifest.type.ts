export interface MetadataRoute {
  Manifest: {
    name?: string;
    short_name?: string;
    description?: string;
    start_url?: string;
    display?: "fullscreen" | "standalone" | "minimal-ui" | "browser";
    background_color?: string;
    theme_color?: string;
    lang?: string;
    icons?: Array<{
      src: string;
      sizes?: string;
      type?: string;
      purpose?: "any" | "maskable";
    }>;
  };
}
