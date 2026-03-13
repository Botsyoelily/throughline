import { ThroughlineLogo } from "@/components/brand/throughline-logo";
import { ChatShell } from "@/components/chat/chat-shell";

export default function ChatPage() {
  return (
    <div className="chat-page">
      <div className="chat-background-grid" aria-hidden="true" />
      <div className="chat-background-orb chat-background-orb-a" aria-hidden="true" />
      <div className="chat-background-orb chat-background-orb-b" aria-hidden="true" />
      <nav className="chat-nav">
        <div className="nav-logo">
          <ThroughlineLogo compact />
        </div>
        <div className="nav-right">
          <span className="nav-tag">PNSA · CONSEQUENCE PROJECTION ENGINE</span>
        </div>
      </nav>
      <ChatShell />
    </div>
  );
}
