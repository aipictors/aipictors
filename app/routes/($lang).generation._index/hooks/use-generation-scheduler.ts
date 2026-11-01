import { useLocalStorage } from "usehooks-ts"
import { toGenerationSchedulerValue } from "~/lib/generation-sampler"

const STORAGE_KEY = "generation.scheduler"

/**
 * 生成の Schedule type（null は自動）。ほかの生成設定と同じく localStorage に覚える
 */
export function useGenerationScheduler() {
  const [stored, setStored] = useLocalStorage<string | null>(
    STORAGE_KEY,
    null,
    { initializeWithValue: false },
  )

  const scheduler = toGenerationSchedulerValue(stored)

  const setScheduler = (value: string | null | undefined) => {
    setStored(toGenerationSchedulerValue(value))
  }

  return [scheduler, setScheduler] as const
}
