---
title: '{{ replace .File.ContentBaseName "-" " " | title }}'
date: {{ .Date }}
draft: true
weight: 10
summary: >-
  One line shown in the notes index.
---

<!--
  Page bundle: put attachments in this folder and reference them by filename.
  Set draft: false to publish. `weight` controls ordering in the notes index.
-->
