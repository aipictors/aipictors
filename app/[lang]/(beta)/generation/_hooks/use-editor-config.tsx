import { Config } from "@/config"
import { useState } from "react"

export const useEditorConfig = () => {
  const [promptText, setPromptText] = useState("")

  const [negativePromptText, setNegativePromptText] = useState("")

  const [sampler, setSampler] = useState(Config.generation.defaultSamplerValue)

  const [steps, setSteps] = useState(Config.generation.defaultStepsValue)

  const [scale, setScale] = useState(Config.generation.defaultScaleValue)

  const [sizeType, setSizeType] = useState("SD1_512_768")

  const [vae, setVae] = useState(Config.generation.defaultVaeValue)

  const [seed, setSeed] = useState(-1)

  const updatePrompt = (text: string) => {
    setPromptText(text)
  }

  const updateNegativePrompt = (text: string) => {
    setNegativePromptText(text)
  }

  const updateSampler = (text: string) => {
    setSampler(text)
  }

  const updateSteps = (value: number) => {
    setSteps(value)
  }

  const updateScale = (value: number) => {
    setScale(value)
  }

  const updateSizeType = (text: string) => {
    setSizeType(text)
  }

  const updateVae = (text: string) => {
    setVae(text)
  }

  const updateSeed = (value: number) => {
    console.log(value)
    setSeed(value)
  }

  const isDisabled = () => {
    if (promptText.trim().length === 0) {
      return true
    }
    return false
  }

  // const sizeTypes = []

  return {
    promptText,
    negativePromptText,
    sampler: sampler,
    steps: steps,
    scale: scale,
    sizeType: sizeType,
    vae: vae,
    seed: seed,
    updatePrompt,
    updateNegativePrompt,
    updateSampler,
    updateSteps,
    updateScale,
    updateSizeType: updateSizeType,
    updateVae,
    updateSeed,
    isDisabled: isDisabled(),
  }
}
