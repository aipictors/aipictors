import { Metadata } from "next"
import { BoxFooter } from "app/components/BoxFooter"
import { BoxSectionAboutWakiaiai } from "app/events/wakiaiai/components/BoxSectionAboutWakiaiai"

export const revalidate = 60

export const metadata: Metadata = {
  title: "和気あいAI",
}

const EventWakiaiaiPage = async () => {
  return (
    <>
      <BoxSectionAboutWakiaiai />
      <BoxFooter />
    </>
  )
}

export default EventWakiaiaiPage
