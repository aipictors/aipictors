import { gql } from "@/_graphql/__generated__"

export const announcementsQuery = gql(`
  query Announcements {
    announcements(offset: 0, limit: 16) {
      id
      title
      body
      publishedAt
    }
  }
`)
