# Moon — heading typeface

Drop the font files in this folder with exactly these names:

    Moon-Light.woff2   (or Moon-Light.otf)
    Moon-Bold.woff2    (or Moon-Bold.otf)

`woff2` is preferred and is tried first; the `.otf` is only a fallback, so
shipping both is fine but shipping only the `.otf` also works.

The `@font-face` rules live at the top of `app/globals.css`. Moon has two
weights, Light and Bold, and the rules stretch them across the full scale:
100–400 resolves to Light, 500–900 to Bold. Headings in this project ask for
500 and 600, so they land on Bold.

Until the files are here, `--f-head` falls through to MuseoModerno and the
site renders normally — nothing breaks, the headings just aren't Moon yet.

Moon is by Jack Harvatt, free for personal use. Confirm the licence before
this goes live commercially.
