import { InferenceSession, Tensor } from "onnxruntime-web/webgpu"

const modelUrls: Record<"nsfwjs", string> = {
  nsfwjs:
    "https://huggingface.co/deepghs/imgutils-models/resolve/main/nsfw/nsfwjs.onnx",
}

const labels = ["drawings", "hentai", "neutral", "porn", "sexy"]

async function loadModel(modelUrl: string): Promise<InferenceSession> {
  const session = await InferenceSession.create(modelUrl)
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
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  const data = new Float32Array(imageData!.data.length / 4)

  for (let i = 0; i < data.length; i++) {
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    data[i] = imageData!.data[i * 4] / 255
  }
  return data
}

export async function predict(image: HTMLImageElement, modelName: "nsfwjs") {
  const modelUrl = modelUrls[modelName]
  const size = modelName === "nsfwjs" ? 224 : 299
  const session = await loadModel(modelUrl)
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
