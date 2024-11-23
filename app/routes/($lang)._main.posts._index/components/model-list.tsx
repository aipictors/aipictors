import { Link } from "react-router";

const models = [
  { id: "stablediffusion", name: "StableDiffusion", label: "SD" },
  { id: "nijijourney", name: "niji・journey", label: "NJ" },
  { id: "Dalle-2", name: "Dalle", label: "DA" },
  { id: "midjourney", name: "Midjourney", label: "MJ" },
  { id: "HolaraAI", name: "Holara", label: "HR" },
  { id: "novelai", name: "NovelAI", label: "NA" },
]

export const ModelList = () => {
  return (
    <ul className="grid w-full grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8">
      {models.map((model) => (
        <Link className="h-full" key={model.id} to={`/models/${model.id}`}>
          <li className="flex h-full flex-col items-center justify-center rounded border p-4 text-center">
            <span className="font-bold text-lg">{model.label}</span>
            <span>{model.name}</span>
          </li>
        </Link>
      ))}
    </ul>
  )
}
