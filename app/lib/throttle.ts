export function throttle<T extends (...args: any[]) => any>(
  func: T,
  timeFrame: number,
): (...args: Parameters<T>) => void {
  let lastTime = 0
  return (...args: Parameters<T>): void => {
    const now = performance.now()
    if (now - lastTime >= timeFrame) {
      func(...args)
      lastTime = now
    }
  }
}
