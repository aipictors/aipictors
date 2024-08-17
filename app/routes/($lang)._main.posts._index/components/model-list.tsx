import { Link } from "@remix-run/react"

const models = [
  { id: "stable-diffusion-sd", name: "Stable Diffusion", label: "SD" },
  { id: "stable-diffusion-xl", name: "Stable Diffusion XL", label: "XL" },
  { id: "nijijourney", name: "niji・journey", label: "NJ" },
  { id: "dalle", name: "Dalle", label: "DA" },
  { id: "midjourney", name: "Midjourney", label: "MJ" },
  { id: "holara", name: "Holara", label: "HR" },
  { id: "tranart", name: "TrinArt", label: "TA" },
  { id: "novelai", name: "NovelAI", label: "NA" },
  { id: "other", name: "その他", label: "OT" },
]

export const ModelList = () => {
  return (
    <ul className="grid w-full grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8">
      {models.map((model) => (
        <Link
          className="h-full"
          key={model.id}
          to={`/posts/models/${model.id}`}
        >
          <li className="flex h-full flex-col items-center justify-center rounded border p-4 text-center">
            <span className="font-bold text-lg">{model.label}</span>
            <span>{model.name}</span>
          </li>
        </Link>
      ))}
    </ul>
  )
}
