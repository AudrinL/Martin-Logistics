/* The corner arrow that sits inside every button. Was a hand-copied SVG
   literal in build_pages.py and in each page's markup. */
export default function Arrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 17L17 7M17 7H8M17 7V16" />
    </svg>
  );
}
