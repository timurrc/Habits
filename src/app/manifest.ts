import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Habbits",
    short_name: "Habbits",
    description: "Трекер привычек",
    start_url: "/today",
    display: "standalone",
    background_color: "#f4f7f0",
    theme_color: "#1F4A42",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
