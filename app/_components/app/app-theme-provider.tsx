import { ThemeProvider } from "next-themes"

type Props = {
  children: React.ReactNode
}

export const AppThemeProvider = (props: Props) => {
  return (
    <ThemeProvider
      attribute={"class"}
      defaultTheme={"system"}
      enableSystem
      disableTransitionOnChange
    >
      {props.children}
    </ThemeProvider>
  )
}
