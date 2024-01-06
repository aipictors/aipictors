<<<<<<< HEAD
import { Button } from "@/components/ui/button"

interface ButtonProps {
  label: string
  primary?: boolean
  variant?: "secondary" | "destructive" | "outline" | "ghost" | "link"
  disabled: boolean
  onClick?: () => void
}

export const shadcnButton = ({
=======
import "./button.css"

interface ButtonProps {
  /**
   * Is this the principal call to action on the page?
   */
  primary?: boolean
  /**
   * What background color to use
   */
  backgroundColor?: string
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
}

/**
 * Primary UI component for user interaction
 */
export const Button = ({
  primary = false,
  size = "medium",
  backgroundColor,
>>>>>>> main
  label,
  primary = true,
  variant,
  disabled = false,
  ...props
}: ButtonProps) => {
<<<<<<< HEAD
  return (
    <Button {...(primary ? {} : { variant })} disabled={disabled} {...props}>
      {label}
    </Button>
=======
  const mode = primary
    ? "storybook-button--primary"
    : "storybook-button--secondary"
  return (
    <button
      type="button"
      className={["storybook-button", `storybook-button--${size}`, mode].join(
        " ",
      )}
      {...props}
    >
      {label}
      <style jsx>{`
        button {
          background-color: ${backgroundColor};
        }
      `}</style>
    </button>
>>>>>>> main
  )
}
