import React from "react"

interface AppRadiusProgressProps {
  progressPercent: number // 進捗パーセンテージをpropsとして追加
}

export const AppRadiusProgress: React.FC<AppRadiusProgressProps> = ({
  progressPercent,
}) => {
  const size = 120
  const radius = 50
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset =
    circumference - (progressPercent / 100) * circumference

  return (
    <>
      <style>
        {`@keyframes circleStroke {
              from {
                stroke-dashoffset: ${circumference};
              }
              to {
                stroke-dashoffset: ${strokeDashoffset};
              }
            }
            @keyframes rotationObject {
              from {
                transform: rotate(90deg);
              }
              to {
                transform: rotate(${progressPercent * 3.6 + 90}deg)
              }
            }
            `}
      </style>
      <div className="w-full h-full">
        {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
        <svg
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: "rotate(-90deg)" }}
        >
          <circle
            r={radius}
            cx={size / 2}
            cy={size / 2}
            stroke="#4169e1"
            strokeWidth="5"
            fill="#F6FBF6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{
              animation: "circleStroke 3s ease forwards",
            }}
          />
        </svg>
      </div>
    </>
  )
}
