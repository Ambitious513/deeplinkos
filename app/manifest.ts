import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name:             "DeepLinkOS",
    short_name:       "DeepLinkOS",
    description:      "Free deep link generator. Auto-detect any URL and generate smart links for iOS, Android, and web.",
    start_url:        "/",
    display:          "standalone",
    background_color: "#0d1117",
    theme_color:      "#3b82f6",
    orientation:      "portrait-primary",
    scope:            "/",
    lang:             "en",
    icons: [
      { src: "/icon.png",         sizes: "512x512",   type: "image/png", purpose: "any" },
      { src: "/icon.png",         sizes: "512x512",   type: "image/png", purpose: "maskable" },
    ],
    categories: ["utilities", "developer tools", "productivity"],
    screenshots: [],
  };
}
