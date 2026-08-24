---
title: '{{ replace .File.ContentBaseName "-" " " | title }}'
date: {{ .Date }}
draft: true
weight: 10
status: Active
tech: []
summary: >-
  One or two sentences shown on the project card. Keep it concrete.
---

<!--
  Page bundle: screenshots and demo videos go in this folder.

    ![Alt text](screenshot.png "Optional caption")
    {{</* video src="demo.mp4" poster="screenshot.png" caption="Demo" */>}}

  `status` shows as a pill on the card (Active / Archived).
  `tech` lists show as tags — the first 3 appear on the card.
  Set draft: false to publish.
-->
