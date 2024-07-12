import { ImageUp } from "lucide-react"
import { useState } from "react"
import { config } from "@/config"
import { load } from "@l4ph/nsfwts"

const modelUrl = "./nsfwjs.onnx"
const isDevelopmentMode = config.isDevelopmentMode

export default function CheckNsfw() {
  const [image, setImage] = useState<string | null>(null)
  const [predictions, setPredictions] = useState<Record<string, number> | null>(
    null,
  )

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const imageUrl = e.target?.result as string
        setImage(imageUrl)

        // 画像の読み込み
        const img = new Image()
        img.src = imageUrl
        img.onload = async () => {
          const results = await load(img, modelUrl)
          setPredictions(results)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  if (!isDevelopmentMode) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background">
        <div className="mb-8 text-center text-muted-foreground">
          This feature is not enabled in the production environment.
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background">
      {image ? (
        <div className="mb-8">
          <img
            src={image}
            alt="Uploaded"
            width={400}
            height={400}
            className="h-auto max-w-full rounded-lg"
          />
        </div>
      ) : (
        <div className="mb-8 text-center text-muted-foreground">
          No image uploaded yet.
        </div>
      )}
      {predictions && (
        <div className="mb-8">
          {Object.entries(predictions).map(([label, percent]) => (
            <div key={label}>
              {label}: {(percent * 100).toFixed(2)}%
            </div>
          ))}
        </div>
      )}
      <div>
        <label
          htmlFor="image-upload"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm shadow-sm hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <ImageUp className="mr-2 h-4 w-4" />
          Upload Image
        </label>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleImageUpload}
        />
      </div>
    </div>
  )
}
