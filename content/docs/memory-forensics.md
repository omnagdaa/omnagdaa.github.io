---
title: Memory Forensics
weight: 1
summary: Acquiring and analysing memory images with Volatility3 — workflow, plugin order, and the failure modes worth knowing about.
---

Working notes on memory image acquisition and analysis. This is the reference I
keep coming back to, written down so I stop re-deriving it.

<!-- TODO(om): This page is an outline. The headings below are the shape the
     note should take — fill each one with what you actually do, and delete
     any that do not apply to your workflow. -->

## Acquisition

How the image was captured constrains everything downstream, so it belongs at
the top of any writeup.

<!-- TODO(om): cover the tools you use per platform (e.g. WinPmem, AVML, LiME),
     and the one thing that most often goes wrong. -->

## Establishing the profile

Volatility3 resolves symbols automatically rather than using Volatility2-style
profiles, which removes the single most common source of "it just doesn't
work".

<!-- TODO(om): note where the symbol cache lives, and what to do when it is
     corrupted — this is the failure DumpScope has a threading lock for, so
     it is worth writing down. -->

## Plugin order

There is a rough triage sequence that answers "what was this machine doing"
faster than picking plugins ad hoc.

<!-- TODO(om): your actual order. Something like:
     1. `windows.info` — confirm the image parses and identify the build
     2. `windows.pslist` / `windows.psscan` — processes, including unlinked
     3. `windows.netscan` — network endpoints
     4. `windows.cmdline` — how each process was invoked
     5. `windows.malfind` — injected regions
     Each with a sentence on what you are looking for, not just what it does. -->

## Extracting artefacts

<!-- TODO(om): process dumping, file recovery, registry hives. -->

## Failure modes

<!-- TODO(om): the ones that cost you time. Smeared images from a live
     acquisition, version mismatches, symbol download failures offline. -->

## References

- [Volatility3 documentation](https://volatility3.readthedocs.io/)
