type Props = {
  children: React.ReactNode
}

const LangLayout = (props: Props) => {
  return props.children
}

export const generateStaticParams = () => {
  return [{ lang: "ja" }, { lang: "en" }]
}

export const revalidate = 3600

export default LangLayout
