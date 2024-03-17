import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aipictors",
    short_name: "Aipictors",
    description: "Aipictors",
    start_url: "/",
    display: "standalone",
    background_color: "#fff",
    theme_color: "#fff",
  }
}
