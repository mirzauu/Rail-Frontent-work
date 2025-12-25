The markdown rendering issue has been addressed with a two-pronged approach:

1.  **Styling Enforcement**: Added a custom `strong` component override in `ChatBubble.tsx` to explicitly force `font-bold` and appropriate coloring. This ensures that when markdown is parsed, it is visually bold.
2.  **Data Sanitization**: Added a preprocessing step to unescape `\*\*` to `**`. This handles cases where the backend/LLM might be sending escaped characters, which would otherwise result in literal `**Alstom**` text being displayed instead of bold text.

These changes ensure robust handling of bold syntax in the chat interface.