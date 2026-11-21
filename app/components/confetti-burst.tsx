const COLORS = [
  "#22d3ee",
  "#2dd4bf",
  "#fb923c",
  "#f472b6",
  "#facc15",
  "#a78bfa",
]

/** SSR と同じ並びになるように、乱数ではなく番号から位置を決める */
const PIECES = Array.from({ length: 48 }, (_, index) => {
  const seed = (index * 37) % 100
  return {
    left: (index * 61) % 100,
    delay: (seed % 12) * 0.08,
    duration: 2.4 + (seed % 7) * 0.2,
    drift: ((seed % 9) - 4) * 14,
    spin: 360 + (seed % 5) * 120,
    color: COLORS[index % COLORS.length],
    isRound: index % 3 === 0,
    width: 6 + (seed % 3) * 2,
  }
})

/**
 * 画面の上から紙吹雪を 1 回だけ降らせる（動きを減らす設定では出さない）
 */
export function ConfettiBurst(): React.ReactNode {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50 hidden overflow-hidden motion-safe:block"
    >
      {PIECES.map((piece, index) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: 並びは固定
          key={index}
          className="absolute top-0 block"
          style={
            {
              animation: `aip-confetti ${piece.duration}s ease-in ${piece.delay}s both`,
              left: `${piece.left}%`,
              width: piece.width,
              height: piece.isRound ? piece.width : piece.width * 1.6,
              borderRadius: piece.isRound ? 9999 : 2,
              backgroundColor: piece.color,
              "--aip-drift": `${piece.drift}px`,
              "--aip-spin": `${piece.spin}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
