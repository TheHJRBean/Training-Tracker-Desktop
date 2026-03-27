/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_COMMIT_MSG: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
