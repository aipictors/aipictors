import { load } from "@l4ph/nsfwts"

const modelUrl = "./nsfwjs.onnx"

export interface NsfwResults {
  drawings: number
  hentai: number
  neutral: number
  porn: number
  sexy: number
}

export const getNsfwPredictions = async (
  imageFile: File,
): Promise<NsfwResults> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      const imageUrl = e.target?.result as string

      // Load the image
      const img = new Image()
      img.src = imageUrl
      img.onload = async () => {
        try {
          const results: unknown = await load(img, modelUrl)

          // Ensure results conform to the NsfwResults interface
          if (
            typeof results === "object" &&
            results !== null &&
            "drawings" in results &&
            "hentai" in results &&
            "neutral" in results &&
            "porn" in results &&
            "sexy" in results
          ) {
            const nsfwResults = results as NsfwResults
            resolve(nsfwResults)
          } else {
            reject(new Error("Unexpected result format"))
          }
        } catch (error) {
          reject(error)
        }
      }
      img.onerror = (error) => {
        reject(error)
      }
    }
    reader.onerror = (error) => {
      reject(error)
    }
    reader.readAsDataURL(imageFile)
  })
}
