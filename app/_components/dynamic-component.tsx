import dynamic from "next/dynamic"

type Props = {
  children: React.ReactNode
}

export const DynamicComponent = dynamic(
  () => {
    return import("@/app/_components/client-side-component")
  },
  { ssr: false },
)
