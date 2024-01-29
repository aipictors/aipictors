import { KonvaEventObject } from "konva/lib/Node"
import { useCallback, useState } from "react"

type LineObject = {
  tool: string
  points: number[]
  brushSize: number
}

const usePainter = (initialBrushSize = 10) => {
  const [lines, setLines] = useState<LineObject[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [brushSize, setBrushSize] = useState(initialBrushSize) // これは使わなくていい
  const [tool, setTool] = useState("pen") // ペンか消しゴムかを保持する状態

  const handleStart = useCallback(
    (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
      setIsDrawing(true)
      const pos = e.target.getStage()?.getPointerPosition()
      if (pos) {
        if (tool === "pen") {
          setLines([
            ...lines,
            { tool: "pen", points: [pos.x, pos.y], brushSize },
          ])
        }
      }
    },
    [lines, brushSize],
  )

  const undo = useCallback(() => {
    setLines((prevLines) => {
      const newLines = [...prevLines]
      newLines.pop()
      return newLines
    })
  }, [])

  const handleMove = useCallback(
    (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (!isDrawing) return
      const point = e.target.getStage()?.getPointerPosition()
      if (point) {
        if (tool === "pen") {
          // 最後の線をコピーし、新しいポイントを追加
          const lastLine = lines[lines.length - 1]
          if (lastLine) {
            const newLine = {
              ...lastLine,
              points: [...lastLine.points, point.x, point.y],
            }

            // 新しい線でlines配列を更新
            setLines([...lines.slice(0, -1), newLine])
          }
        } else if (tool === "eraser") {
          // 消しゴムを使用する時の処理（描画中の線を削除）
          setLines(
            lines.filter(
              (line) =>
                !line.points.includes(point.x) ||
                !line.points.includes(point.y),
            ),
          )
        }
      }
    },
    [isDrawing, lines],
  )

  const handleEnd = useCallback(() => {
    if (tool === "eraser") {
    }
    setIsDrawing(false)
  }, [lines, tool])

  return {
    lines,
    undo,
    tool,
    setLines,
    brushSize,
    setBrushSize,
    handleStart,
    handleMove,
    handleEnd,
    isDrawing,
    setTool,
  }
}

export default usePainter
