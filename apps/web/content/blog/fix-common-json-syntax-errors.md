---
title: How to Fix Common JSON Syntax Errors
description: Find the causes of common JSON parse errors, including trailing commas, unquoted keys, invalid strings, and comments.
category: Code and data
publishedAt: '2026-10-04'
toolLabel: JSON Tool
toolPath: /tools/json-tool
---

JSON is a text format for structured data. A JSON parser expects exact punctuation and value types, so a missing quote or extra comma can make an entire document invalid. This guide walks through frequent syntax mistakes and shows how to find them.

## Start with a valid JSON value

A JSON value can be an object, array, string, number, `true`, `false`, or `null`. Objects contain quoted property names and values separated by commas; arrays contain values separated by commas.

```json
{
  "name": "Snappo",
  "tools": ["JSON", "Cron", "URL encoding"],
  "active": true
}
```

The outer object is not required for every JSON document. A top-level array, string, number, boolean, or `null` can also be valid JSON.

## 1. Remove a trailing comma

Strict JSON does not allow a comma after the final item in an object or array.

```json
{
  "name": "Snappo"
}
```

Remove the comma after the last property:

```json
{
  "name": "Snappo"
}
```

Some JavaScript and configuration formats allow trailing commas, but JSON exchanged between systems generally requires strict JSON syntax.

## 2. Put double quotes around property names and strings

JSON strings use double quotation marks. Single quotes and unquoted property names are not valid JSON:

```text
{ name: 'Snappo' }
```

Write the object with double quotes instead:

```json
{ "name": "Snappo" }
```

## 3. Use JSON values instead of JavaScript-only values

JSON supports strings, numbers, objects, arrays, `true`, `false`, and `null`. It does not support JavaScript values such as `undefined`, `NaN`, or `Infinity`.

Use `null` when the JSON data needs an explicit empty value. If a number is not finite, decide how your application should represent it before serializing the data.

## 4. Escape special characters inside strings

An unescaped quotation mark ends a JSON string. A backslash also begins an escape sequence, so Windows paths and text containing quotation marks need careful escaping.

```json
{
  "message": "She said, \"hello\".",
  "path": "C:\\projects\\app"
}
```

Common JSON escapes include `\"` for a quotation mark, `\\` for a backslash, `\n` for a line feed, and `\t` for a tab.

## 5. Add commas between items, but not after the last one

Every item except the last item in an object or array needs a comma. A missing comma often causes the parser to report an error at the next property, even though the problem is just before it.

```json
{
  "first": 1,
  "second": 2
}
```

When the error location looks correct but the nearby token seems valid, inspect the preceding line for a missing comma or quotation mark.

## 6. Know when the input is JSONC instead

JSONC is a JSON-like format that can allow comments and trailing commas in some tools and configuration files. Standard JSON does not include comments. If your source intentionally uses JSONC, use a parser that supports it rather than silently removing text that may carry meaning.

The Snappo JSON Tool has an option to allow JSONC input. Turn it on only when your input is intended to use that format. A result that parses as JSONC is not necessarily accepted by a service that expects strict JSON.

## Parsing is different from schema validation

Formatting a JSON document changes its whitespace and indentation. Parsing checks whether the text follows JSON syntax. Neither step proves that required application fields exist or that their values meet your API’s rules.

For example, `{"count":"three"}` is valid JSON even if an application expects `count` to be a number. Validate application-specific data against its schema or code after checking syntax.

Paste a sample into the [Snappo JSON Tool](/tools/json-tool) to format or validate it. For the JSON grammar and value types, see [RFC 8259](https://www.rfc-editor.org/rfc/rfc8259).
