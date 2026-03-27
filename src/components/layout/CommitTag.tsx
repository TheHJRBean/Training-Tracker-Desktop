export function CommitTag() {
  const commitMsg = import.meta.env.VITE_COMMIT_MSG || 'no commits yet'

  return (
    <div className="fixed bottom-2 right-2 z-50 px-2 py-1 text-xs font-mono bg-brand-darkBlue/80 text-brand-turquoise rounded backdrop-blur-sm">
      {commitMsg}
    </div>
  )
}
