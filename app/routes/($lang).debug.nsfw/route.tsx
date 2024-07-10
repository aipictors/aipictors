import { ImageUp } from "lucide-react"
import { useState } from "react"
import { InferenceSession, Tensor } from "onnxruntime-web"
import { config } from "@/config"

const modelUrl = "./nsfwjs.onnx"
const labels = ["drawings", "hentai", "neutral", "porn", "sexy"]
const size = 224
const isDevelopmentMode = config.isDevelopmentMode

async function loadModel(): Promise<InferenceSession> {
  const session = await InferenceSession.create(modelUrl, {
    executionProviders: ["wasm"],
  })
  return session
}

async function preprocessImage(
  image: HTMLImageElement,
  size: number,
): Promise<Float32Array> {
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")
  ctx?.drawImage(image, 0, 0, size, size)
  const imageData = ctx?.getImageData(0, 0, size, size)

  const data = new Float32Array(size * size * 3)
  for (let i = 0; i < size * size; i++) {
    // 画像データのRGBチャンネルを正規化して格納
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    data[i * 3] = imageData!.data[i * 4] / 255 // R
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    data[i * 3 + 1] = imageData!.data[i * 4 + 1] / 255 // G
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    data[i * 3 + 2] = imageData!.data[i * 4 + 2] / 255 // B
  }
  return data
}

export async function predict(image: HTMLImageElement) {
  const session = await loadModel()
  const input = await preprocessImage(image, size)
  const tensor = new Tensor("float32", input, [1, size, size, 3])
  const feeds: Record<string, Tensor> = { input_1: tensor }
  const output = await session.run(feeds)
  const outputData = output.dense_3.data as Float32Array
  const results: Record<string, number> = {}
  labels.forEach((label, index) => {
    results[label] = outputData[index]
  })
  return results
}

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
          const results = await predict(img)
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
