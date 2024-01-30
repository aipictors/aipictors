"use client"

type Props = {
  error: Error
  reset(): void
}

export default function RootError(props: Props) {
  return (
    <div className="p-4 h-screen flex justify-center items-center">
      <div className="space-y-8 items-center">
        <p>エラーが発生しました</p>
      </div>
    </div>
  )
}
