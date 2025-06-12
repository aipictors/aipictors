// ~/routes/($lang)._main._index/components/collapsible-filter-section.tsx
import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "~/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible"

interface CollapsibleFilterSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
}

export function CollapsibleFilterSection({
  title,
  children,
  defaultOpen = true,
  className = "",
}: CollapsibleFilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={className}>
      {/* モバイルでは折りたたみ可能 */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="md:hidden">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="flex w-full justify-between p-2 text-left hover:bg-accent/50"
          >
            <span className="font-medium">{title}</span>
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pb-2">
          {children}
        </CollapsibleContent>
      </Collapsible>

      {/* デスクトップでは常に表示 */}
      <div className="hidden md:block">
        <div className="mb-2 md:hidden">
          <span className="font-medium text-muted-foreground text-sm">
            {title}
          </span>
        </div>
        {children}
      </div>
    </div>
  )
}
