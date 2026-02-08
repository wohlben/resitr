// .opencode/plugins/doc-bead.ts
import type { Plugin } from "@opencode-ai/plugin"

const beadInProgress = new Set<string>()

export const DocBeadPlugin: Plugin = async ({ client, $ }) => {
  return {
    event: async ({ event }) => {
      if (event.type !== "session.idle") return

      const sessionId = event.properties?.sessionID
      if (!sessionId) return
      if (beadInProgress.has(sessionId)) return

      const { data: diffs } = await client.session.diff({
        path: { id: sessionId },
      })

      if (!diffs?.length) return

      // Skip if a bead was already created in this session
      if (diffs.some(d => d.file.startsWith("docs/.beads/"))) return

      // Skip if only docs changed
      const hasSourceChanges = diffs.some(d => !d.file.startsWith("docs/"))
      if (!hasSourceChanges) return

      const docFiles = await $`find docs -name '*.md' -not -path '*/\\.beads/*' 2>/dev/null || echo "no docs"`.text()
      const date = new Date().toISOString().slice(0, 10)

      const diffSummary = diffs
        .map(d => `${d.file} (+${d.additions} -${d.deletions})`)
        .join("\n")

      beadInProgress.add(sessionId)
      try {
        await client.session.prompt({
          path: { id: sessionId },
          body: {
            parts: [
              {
                type: "text",
                text: `You just finished a task. Analyze these changes and determine if documentation in /docs needs updating or extending.

Changed files:
${diffSummary}

Existing docs:
${docFiles}

If user-facing behavior, APIs, configuration, or developer workflows changed or was added:
- Create a bead file at docs/.beads/${date}-<short-slug>.md
- Include: what changed, which doc files are affected or should be added, suggested updates
- Stage the file with git add

If it's pure refactoring/tests/internal with no doc impact or just improved/added docs itself, just say "No doc bead needed" and do nothing.`,
              },
            ],
          },
        })
      } finally {
        beadInProgress.delete(sessionId)
      }
    },
  }
}