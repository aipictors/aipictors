import type { GenerationConfigState } from "@/routes/($lang).generation._index/_machines/models/generation-config-state"
import { assign, createMachine } from "xstate"

/**
 * 画像生成の状態
 */
export const generationConfigMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QCUDyqAqA6AkgORwxwEEAZAYn0IG0AGAXUVAAcB7WASwBcPWA7JiAAeiAIwAWABxYA7AGZxcmbTlyATGtGi1ANgA0IAJ6I5ktVjUBOGTvHjROgKyjJMgL5uDaTFgAKaAFlfDAB9ADUcAFEAdXIAYQAJYjwAcUiQgNQAEUjSOkYkEDZOHn5BEQQ1OUcsSzq6yUkXR2taRwNjBDlRS1kJXTVXKXE1Dy90bH9UINCImPIAVV8s4gx0uNQ8ADEcFPzBYu5eAUKKqp1ZFS1JRzNHOUtHfSNEDTlZHS0dM21HyXUxiBvJNAsFwlFYgBlXKROKhZCRSELUgYfaFQ6lE6gCriFpYXFyWh1GRmZS0WjPTojaQyRzk3SWUSmTSjTxAiZ+UGzCHkVC+SJ4EKkVDIYgZbK5SHgmJoljsI5lU6IXG9AlE6yk8kUjqvSzmcT1b5qOwyUS0VnjHxTGbS2J8gXinKkKVzaKyoryzHlZV4tXEzXkyliVRYRxVUxNSQ6GyMySA4FYBI4SEYEUATVt8WF0PdGOO3oQn3EoZJRPN5zaah1XRJFjpbRuDkZOh08Y5SZT6cz0NIsPhiORqIYB09+aVCBkGgsTTUbRbtBJ7ReXXutXqJNMYZkikcbZ8mSdLp5cWzkVzo8V2MQRZLkjLbx0ler-yw5tUpfEOlndPcbITB8lTNiCyLJHVyc8SjHK8JwUWRLG+bpmR6Rwl06Jp8XqOx7kUU1Bj3bBhVFMDnSAkChRFMUALyYd0QvLFhEQeR3lEJ5ZzMPUVSDSoHjXOpbjNexP1EfCsEIyiJRI10s1QHMaLlSDLwYwsJFve8KzDatjVEXi-gEiRPg8Nk+FYCA4EEYERwU+iKgAWi4myanqJznLqOQRKoIgyEshVrOVKtl2ZOCbCcFRlAcOM-w5a0wVdbyvXHY0LkcT8o26LQXAkaslBqTRFAkWlLApJ4RI7VNkAzWLaKsgtJ2kPUXEGWlK1oSRq3EIkMIaG41FuTcRKoo8YjiqClNq2pNDMVw6TDFrqyZC4nOS6MDWqcQRLE4jBuiYbFIqScZGnbQ50fRdNMeTr4LME0zVZDwgA */
  id: "ROOT",
  initial: "PROMPT_VIEW",
  types: {} as {
    context: GenerationConfigState
    input: GenerationConfigState
  },
  context(props) {
    return props.input
  },
  states: {
    INITIAL: {
      on: {
        INIT: "PROMPT_VIEW",
      },
    },
    PROMPT_VIEW: {
      description: "プロンプト入力",

      on: {
        CHANGE_MODEL: "PROMPT_VIEW",
        OPEN_LORA_MODELS_VIEW: "LORA_MODELS_VIEW",
        OPEN_MODELS_VIEW: {
          target: "MODELS_VIEW",
          actions: assign((props) => {
            return props.context
          }),
        },
        UPDATE_CONFIG: {
          target: "PROMPT_VIEW",
          actions: assign((props) => {
            return props.event.value
          }),
        },
        OPEN_HISTORY_PREVIEW: {
          target: "HISTORY_PREVIEW",
          actions: assign((props) => {
            return props.event.value
          }),
        },
        OPEN_FULL_HISTORY_ON_MAIN_AND_HEADER: "HISTORY_VIEW_ON_MAIN_AND_HEADER",
        OPEN_FULL_HISTORY_ON_ASIDE: "HISTORY_VIEW_ON_ASIDE",
        OPEN_FULL_HISTORY_LIST: "HISTORY_LIST_FULL",
        OPEN_WORKS_FROM_MODEL: "WORKS_FROM_MODEL",
        OPEN_COMMUNICATION: "COMMUNICATION",
      },
    },

    HISTORY_PREVIEW: {
      description: "履歴プレビュー",

      on: {
        CLOSE: "PROMPT_VIEW",
        OPEN_FULL_HISTORY_ON_MAIN_AND_HEADER: "HISTORY_VIEW_ON_MAIN_AND_HEADER",
        OPEN_FULL_HISTORY_ON_ASIDE: "HISTORY_VIEW_ON_ASIDE",
        OPEN_WORK_PREVIEW: "WORK_PREVIEW",
        OPEN_WORKS_FROM_MODEL: "WORKS_FROM_MODEL",
        OPEN_COMMUNICATION: "COMMUNICATION",
        UPDATE_CONFIG: {
          actions: assign((props) => {
            return props.event.value
          }),
        },
      },
    },

    HISTORY_VIEW_ON_MAIN_AND_HEADER: {
      description: "生成履歴（メイン、ヘッダーコンテンツに重ねて表示）",

      on: {
        CLOSE_PREVIEW: "PROMPT_VIEW",
        OPEN_FULL_HISTORY_LIST: "HISTORY_LIST_FULL",
        OPEN_WORKS_FROM_MODEL: "WORKS_FROM_MODEL",
        OPEN_COMMUNICATION: "COMMUNICATION",
        UPDATE_CONFIG: {
          actions: assign((props) => {
            return props.event.value
          }),
        },
      },
    },

    HISTORY_VIEW_ON_ASIDE: {
      description: "生成履歴（サイドコンテンツに重ねて表示）",

      on: {
        CLOSE_PREVIEW: "PROMPT_VIEW",
        OPEN_WORKS_FROM_MODEL: "WORKS_FROM_MODEL",
        OPEN_COMMUNICATION: "COMMUNICATION",
        UPDATE_CONFIG: {
          actions: assign((props) => {
            return props.event.value
          }),
        },
      },
    },

    HISTORY_LIST_FULL: {
      description: "履歴全画面表示",

      on: {
        OPEN_FULL_HISTORY_LIST: "PROMPT_VIEW",
        CHANGE_FULL_HISTORY_LIST: "HISTORY_LIST_FULL",
        CHANGE_FULL_WORK_LIST: "WORK_LIST_FULL",
        OPEN_COMMUNICATION: "COMMUNICATION",
        UPDATE_CONFIG: {
          actions: assign((props) => {
            return props.event.value
          }),
        },
      },
    },

    WORKS_FROM_MODEL: {
      description: "モデルから作品検索",

      on: {
        CLOSE: "PROMPT_VIEW",
        CLOSE_PREVIEW: "PROMPT_VIEW",
        OPEN_WORK_PREVIEW: "WORK_PREVIEW",
        OPEN_FULL_WORK_LIST: "WORK_LIST_FULL",
        OPEN_COMMUNICATION: "COMMUNICATION",
        UPDATE_CONFIG: {
          actions: assign((props) => {
            return props.event.value
          }),
        },
      },
    },

    WORK_PREVIEW: {
      on: {
        CLOSE: "WORKS_FROM_MODEL",
        OPEN_FULL_WORK_LIST: "WORK_LIST_FULL",
        OPEN_COMMUNICATION: "COMMUNICATION",
        UPDATE_CONFIG: {
          actions: assign((props) => {
            return props.event.value
          }),
        },
      },
    },

    WORK_LIST_FULL: {
      description: "作品一覧全画面表示",

      on: {
        OPEN_FULL_HISTORY_LIST: "WORKS_FROM_MODEL",
        CHANGE_FULL_HISTORY_LIST: "HISTORY_LIST_FULL",
        CHANGE_FULL_WORK_LIST: "WORK_LIST_FULL",
        OPEN_FULL_WORK_LIST: "WORKS_FROM_MODEL",
        OPEN_COMMUNICATION: "COMMUNICATION",
        UPDATE_CONFIG: {
          actions: assign((props) => {
            return props.event.value
          }),
        },
      },
    },

    COMMUNICATION: {
      description: "コミュニケーション画面",

      on: {
        CLOSE: "PROMPT_VIEW",
        OPEN_WORKS_FROM_MODEL: "WORKS_FROM_MODEL",
        UPDATE_CONFIG: {
          actions: assign((props) => {
            return props.event.value
          }),
        },
      },
    },

    MODELS_VIEW: {
      description: "モデル検索",

      on: {
        CLOSE: "PROMPT_VIEW",
        ADD_MODEL: "MODELS_VIEW",
      },
    },

    LORA_MODELS_VIEW: {
      on: {
        ADD_LORA_MODEL: "LORA_MODELS_VIEW",
        CLOSE: "PROMPT_VIEW",
      },
    },
  },
})
