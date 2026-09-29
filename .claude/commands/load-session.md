# /load-session — Load Latest Session Memory

Find the most recently saved session file and display its full contents.

## Steps

1. Run `ls -t notes/memory/*.md 2>/dev/null | head -1` to get the path of the latest session file
2. If the command returns nothing — tell the user "No saved sessions found." and stop
3. If a path is returned — read that file and output its full contents as-is, no summarizing, no paraphrasing
