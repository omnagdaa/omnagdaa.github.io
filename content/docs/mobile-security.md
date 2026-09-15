---
title: Mobile Security
weight: 2
summary: Android and iOS application security testing — environment setup, static and dynamic analysis, and traffic interception.
---

Working notes on mobile application security testing, across both platforms.

<!-- TODO(om): This page is an outline. Fill each heading with your actual
     process and delete what you do not use. -->

## Test environment

The setup cost is most of the work, and it is the part worth writing down
because it is the part you forget between engagements.

<!-- TODO(om): emulator vs. physical device, rooting/jailbreak approach, and
     how you pin a reproducible environment. -->

## Static analysis

<!-- TODO(om): unpacking an APK/IPA, what you grep for first, the tools
     (jadx, apktool, Ghidra for native libs), and where hardcoded material
     tends to hide. -->

## Dynamic analysis

<!-- TODO(om): Frida workflow — the hooks you reach for repeatedly are worth
     pasting in full here, since that is the thing you actually reuse. -->

## Traffic interception

<!-- TODO(om): proxy setup, installing a CA that the OS will trust, and
     defeating certificate pinning. Note the Android 7+ user-CA behaviour —
     it is the thing that trips people up most. -->

## Common findings

<!-- TODO(om): the issues that turn up repeatedly — insecure storage, weak
     cryptography, exported components, webview misconfiguration. -->

## References

- [OWASP Mobile Application Security Testing Guide](https://mas.owasp.org/MASTG/)
