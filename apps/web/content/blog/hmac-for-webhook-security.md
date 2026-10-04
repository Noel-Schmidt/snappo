---
title: 'HMAC Explained: Verify Webhooks Without Encrypting Them'
description: Understand how HMAC uses a shared secret to authenticate a message, and how to verify webhook signatures safely.
category: Security
publishedAt: '2026-10-04'
toolLabel: HMAC Generator
toolPath: /tools/hmac-generator
---

HMAC is a keyed message authentication code. A sender combines a message, a secret key, and a hash function to produce a tag. A receiver with the same key can calculate the tag again and check whether the message matches.

HMAC helps detect tampering and confirm that a message came from someone who knows the shared key. It does not encrypt the message: anyone who can read the request can still read its contents. [RFC 2104](https://www.rfc-editor.org/rfc/rfc2104)

## How webhook signatures work

In a typical webhook flow, the sender computes an HMAC over a precisely defined request value and includes the result in a signature header. Your server uses the shared secret to calculate its own HMAC, then compares that result with the supplied signature.

The exact input matters. Providers may sign the raw request body, a timestamp plus the body, or another documented byte sequence. Parse and re-serialize JSON only if the provider's specification tells you to: whitespace, property order, and character encoding can change the bytes and therefore change the tag.

## Verify the signature safely

Use the provider's documented algorithm and follow its exact encoding rules. For a new integration, use a currently recommended hash such as SHA-256 when the provider supports it. Snappo's [HMAC Generator](/tools/hmac-generator) defaults to SHA-256; its MD5 and SHA-1 options are available for compatibility with older systems, not as a recommendation for new protocols.

On your server, compare the calculated tag with the received tag using a constant-time comparison. A regular string comparison can stop at the first different character and leak timing information. Also validate the expected tag's length and encoding before comparing it.

## Prevent replay attacks

A valid signature proves that someone with the key signed the message. It does not prove the message is new. An attacker who captures a valid request may be able to send it again.

Follow the provider's replay-protection scheme. Common approaches include signing a timestamp and rejecting requests outside a short time window, or tracking unique event identifiers so they can only be processed once. Make the time window and duplicate handling part of your server's verification logic.

## Protect and rotate the key

Treat the shared secret like a password for the integration. Keep it in a server-side secret manager or protected environment variable, restrict access, and never place it in frontend code, public repositories, logs, or error messages. If a secret is exposed, replace it and update both systems; if the provider supports overlapping keys, use its rotation process to avoid downtime.

Do not paste production keys into a tool or site unless your security policy allows it and you trust how that environment handles secrets. Snappo's HMAC tool calculates values in the browser, but sensitive production workflows should use your reviewed local or server-side tooling.

## HMAC is not password storage

HMAC is designed to authenticate messages with a shared key. It is not a password-hashing scheme. Password storage requires a unique salt and a deliberately expensive password-hashing algorithm such as Argon2id, scrypt, or bcrypt. A fast hash or HMAC alone is not a suitable replacement. See the [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).
