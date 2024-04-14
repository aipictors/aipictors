type Props = {
  error: Error
  reset(): void
}

export default function RootError(props: Props) {
  return (
    <div className="flex h-screen items-center justify-center p-4">
      <div className="items-center space-y-8">
        <p>エラーが発生しました</p>
      </div>
    </div>
  )
}
