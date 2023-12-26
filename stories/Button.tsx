import { Button } from "@/components/ui/button"

interface ButtonProps {
  /**
   * Is this the principal call to action on the page?
   */
  primary?: boolean
  /**
   * What background color to use
   */
  variant?: "secondary" | "destructive" | "outline" | "ghost" | "link"
  /**
   * How large should the button be?
   */
  size?: "small" | "medium" | "large"
  /**
   * Button contents
   */
  label: string
  /**
   * Optional click handler
   */
  onClick?: () => void
  disable: boolean
}

export const shadcnButton = ({
  primary = false,
  size = "medium",
  variant,
  label,
  disable,
  ...props
}: ButtonProps) => {
  return (
    <Button variant={variant} {...props}>
      {label}
    </Button>
  )
}
