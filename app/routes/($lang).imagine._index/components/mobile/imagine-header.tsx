type Props = {
  isSearchOpen: boolean
  setIsSearchOpen: (value: boolean) => void
  isTextView: boolean
  setIsTextView: (value: boolean) => void
  onReload: () => void
  isLoading: boolean
}

export function ImagineHeader (_props: Props) {
  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
      <div className="flex items-center justify-between p-4">
        <h1 className="font-bold text-lg">Imagine</h1>
      </div>
    </header>
  )
}
