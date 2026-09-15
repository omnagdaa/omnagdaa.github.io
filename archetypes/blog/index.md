---
title: '{{ replace .File.ContentBaseName "-" " " | title }}'
date: {{ .Date }}
draft: true
tags: []
summary: >-
  One or two sentences shown in listings, in the tag pages, and under the
  title on the page itself. Write it as the answer to "what did you find?".
---

<!--
  Page bundle: drop images and videos in THIS folder next to index.md, then
  reference them by filename:

    ![Alt text](screenshot.png "Optional caption")
    {{</* video src="demo.mp4" poster="screenshot.png" caption="Demo" */>}}

  Dimensions and lazy loading are added automatically.
  Set draft: false above to publish, or run: ./site publish blog/<slug>

  The `##` headings below become the on-page contents rail, so they are
  navigation, not decoration — keep them to the real steps and delete any
  that do not apply.
-->

## The target

What you were given and what the goal was. One paragraph.

## Recon

What you looked at first and what it told you.

## The bug

The actual finding, and how you confirmed it rather than assumed it.

## Exploitation

The working path, with the commands and code that mattered.

```bash
# Real commands beat prose here.
```

## Takeaways

What you would look for faster next time. This is the section people
actually remember, so it is worth more than a sentence.
