import { Button } from "@/components/ui/button"

interface ButtonProps {
  label: string
  primary?: boolean
  variant?: "secondary" | "destructive" | "outline" | "ghost" | "link"
  disabled: boolean
  onClick?: () => void
}

export const shadcnButton = ({
  label,
  primary = true,
  variant,
  disabled = false,
  ...props
}: ButtonProps) => {
  return (
    <Button {...(primary ? {} : { variant })} disabled={disabled} {...props}>
      {label}
    </Button>
  )
}
