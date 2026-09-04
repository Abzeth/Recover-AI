import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Workspace — RecoverAI" },
      { name: "description", content: "RecoverAI workspace: monitor revenue at risk and approve AI recovery plans." },
      { property: "og:title", content: "Workspace — RecoverAI" },
      { property: "og:description", content: "Monitor revenue at risk and approve AI recovery plans." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AppShell,
});
