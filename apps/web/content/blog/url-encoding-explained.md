---
title: 'URL Encoding Explained: Encode a Value or a Full URL?'
description: Learn when to percent-encode a URL component, how query parameters differ from a full URL, and why encoding is not encryption.
category: Web development
publishedAt: '2026-10-04'
toolLabel: URL Encoder / Decoder
toolPath: /tools/url-encoder
---

URL encoding usually refers to percent-encoding: representing characters with percent signs and hexadecimal bytes so they can be used safely in a particular part of a URL. The right encoding depends on whether you are working with a query value, a path component, or a complete URL.

## Encode the part you are inserting

Suppose a search term contains spaces and an ampersand:

```text
tea & coffee
```

If this is one query parameter value, encode the value before adding it to the URL. Otherwise, the `&` can be interpreted as a separator between parameters.

```text
search=tea%20%26%20coffee
```

The exact serialized form depends on the API used. Form-style query serialization often represents spaces as `+`, while percent-encoding APIs may represent them as `%20`. Use the format expected by the server or library that will read the URL.

## Build query parameters with a query-parameter API

When JavaScript code constructs query strings, `URL` and `URLSearchParams` handle separators and encoding for individual parameter names and values:

```js
const url = new URL('https://example.com/search')
url.searchParams.set('q', 'tea & coffee')
console.log(url.toString())
```

This avoids manually concatenating `?`, `&`, and `=` and helps prevent a value from being mistaken for URL syntax. `URLSearchParams` uses form-style serialization, including `+` for spaces.

## Component encoding and full-URL encoding are different

Encoding one value and encoding an entire URL are not interchangeable operations. A URL has structural characters such as `:`, `/`, `?`, `&`, and `=`. Encoding a complete URL as one value can turn those separators into encoded characters; that may be correct when the URL itself is being passed as data, but it is usually wrong when you want a browser to navigate to that URL.

For JavaScript, `encodeURIComponent()` is designed for individual URI components. `encodeURI()` preserves more characters that have meaning in URI syntax. If you are assembling query parameters, prefer `URLSearchParams` or the `URL` API rather than encoding the whole address by hand.

## Decode only the layer that was encoded

Percent-encoded values can be decoded back to text when they use a compatible encoding. Avoid repeatedly decoding user-controlled input: a value may contain literal percent sequences, and decoding them more than once can change its meaning.

Also distinguish percent-encoding from Base64. Base64 converts bytes into a text representation; it does not protect the data. Neither operation encrypts a value or makes a secret safe to expose.

## Try the right encoding mode

The [Snappo URL Encoder / Decoder](/tools/url-encoder) offers separate actions for encoding a value and encoding a full URL. Choose based on how the result will be used, then check the output in its destination context.

For API details, read MDN’s references for [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams), [`encodeURIComponent()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent), and [`encodeURI()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI).
