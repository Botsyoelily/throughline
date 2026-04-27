"use client";

import { useState } from "react";

export function ExpandableText({
  text,
  maxLines = 4,
  className
}: {
  text: string;
  maxLines?: number;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <span className={`expandable-text-wrap${className ? ` ${className}` : ""}`}>
      <span
        className={expanded ? "expandable-text" : "expandable-text clamped"}
        style={expanded ? undefined : { WebkitLineClamp: maxLines }}
      >
        {text}
      </span>
      <button
        type="button"
        className="read-more-btn"
        onClick={() => setExpanded((prev) => !prev)}
      >
        {expanded ? "Read less" : "Read more"}
      </button>
    </span>
  );
}
