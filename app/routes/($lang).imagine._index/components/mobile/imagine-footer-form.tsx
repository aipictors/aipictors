type Props = {
  fetcher: unknown
  isSubmitting: boolean
}

export function ImagineFooterForm (_props: Props) {
  return (
    <footer className="sticky bottom-0 border-t bg-background p-4">
      <p className="text-muted-foreground">フッターフォーム</p>
    </footer>
  )
}
