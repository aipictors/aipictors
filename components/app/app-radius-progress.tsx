import { useEffect, useRef } from "react"

const AppRadiusProgress = ({ percent = 0, size = 100, strokeWidth = 10 }) => {
  const circleRef = useRef<SVGCircleElement>(null)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI

  const integerPercent = Math.floor(percent)

  useEffect(() => {
    const circle = circleRef.current
    if (circle) {
      const offset = circumference - (integerPercent / 100) * circumference
      circle.style.transition = "stroke-dashoffset 0.5s ease-out"
      circle.style.strokeDashoffset = offset.toString()
    }
  }, [integerPercent, circumference])

  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        ref={circleRef}
        stroke="black"
        fill="transparent"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference.toString()} // TypeScriptのためにtoString()を使用
        strokeDashoffset={circumference.toString()} // 初期値も文字列にする
        cx={size / 2}
        cy={size / 2}
        r={radius}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="1em"
      >
        {`${integerPercent}%`}
      </text>
    </svg>
  )
}

export default AppRadiusProgress
