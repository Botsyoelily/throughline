import Link from "next/link";

import { ThroughlineLogo } from "@/components/brand/throughline-logo";
import { ChatShell } from "@/components/chat/chat-shell";

export default function ChatPage() {
  return (
    <div className="page-shell">
      <header className="top-bar">
        <ThroughlineLogo compact />
        <nav>
          <Link href="/">Access</Link>
        </nav>
      </header>
      <ChatShell />
    </div>
  );
}

