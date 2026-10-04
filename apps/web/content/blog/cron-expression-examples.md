---
title: 'Cron Expression Examples: A Practical Guide to Scheduling Jobs'
description: Learn the five cron fields, read common schedule expressions, avoid calendar pitfalls, and preview a schedule with Snappo.
category: Scheduling
publishedAt: '2026-10-04'
toolLabel: Cron Tool
toolPath: /tools/cron-tool
---

Cron expressions describe calendar times when a scheduler should run a task. They are compact, but a small change in one field can turn a weekday schedule into a daily one. This guide explains the common five-field format and gives examples you can adapt.

## Read the five fields from left to right

A common user crontab expression has five time fields:

```text
minute hour day-of-month month day-of-week
```

For example, `30 8 * * 1-5` means minute 30, hour 8, any day of the month, any month, and weekdays Monday through Friday on many cron implementations. The command to run follows the five fields in a crontab entry; the Snappo Cron Tool works with the expression itself.

| Field        | Typical values  | Meaning                           |
| ------------ | --------------- | --------------------------------- |
| Minute       | `0–59`          | Minute within the hour            |
| Hour         | `0–23`          | Hour of the day                   |
| Day of month | `1–31`          | Calendar day                      |
| Month        | `1–12` or names | Month of the year                 |
| Day of week  | `0–7` or names  | Weekday; Sunday may be `0` or `7` |

Cron implementations differ in accepted names, extensions, and edge cases. Check the manual for the scheduler that will run your job.

## Common cron schedule examples

| Expression       | Intended schedule                                              |
| ---------------- | -------------------------------------------------------------- |
| `0 * * * *`      | At the start of every hour                                     |
| `*/15 * * * *`   | Every 15 minutes                                               |
| `30 9 * * *`     | Every day at 09:30                                             |
| `0 2 * * 1`      | Mondays at 02:00                                               |
| `0 8 1 * *`      | On the first day of each month at 08:00                        |
| `0 18 * * 1-5`   | Weekdays at 18:00                                              |
| `15 10,14 * * *` | Every day at 10:15 and 14:15                                   |
| `0 9-17 * * 1-5` | At the start of each hour from 09:00 through 17:00 on weekdays |

These examples use the conventional five-field format. A scheduler may add fields or special shortcuts, so confirm its dialect before copying an expression into production.

## What `*`, lists, ranges, and steps mean

An asterisk means every allowed value in that field. A list selects several values, a range selects a sequence, and a step selects values at an interval within a field:

- `1,5,10` selects the first, fifth, and tenth values.
- `1-5` selects a range of values, such as weekdays when used in the day-of-week field.
- `*/10` selects every tenth value in that field, such as minutes `0`, `10`, `20`, `30`, `40`, and `50`.

Step values follow the field’s range. For example, a step of seven in the day-of-month field does not mean “every seven days since the last run”; calendar fields reset, and months have different lengths.

## Check day-of-month and day-of-week together

The third and fifth positions are easy to confuse: the third field is day of month, and the fifth is day of week. If you restrict both fields, cron implementations can interpret the relationship differently. Traditional cron commonly runs when either restricted day field matches, while some schedulers use different rules.

If a job must run on a specific calendar rule, test the exact expression on the target scheduler. “The first Monday of the month” is not the same as “every Monday” or “the first day of the month”; standard five-field cron syntax does not express every calendar rule directly.

## Account for time zones and daylight saving time

Cron schedules are evaluated in the time zone configured for the scheduler or job environment. Daylight saving transitions can skip or repeat local clock times, depending on the scheduler. If the task must run at a precise instant worldwide, decide whether the system should use UTC or a named local time zone and verify how its scheduler handles clock changes.

## Preview an expression before deploying it

Read each field in order, check the scheduler’s documentation, and inspect several upcoming run times. A preview can catch an incorrect weekday, hour, or unit, but it cannot confirm the command will succeed or that the host uses the time zone you expect.

Use the [Snappo Cron Tool](/tools/cron-tool) to parse an expression into a readable schedule and inspect upcoming run times. For Linux cron syntax, see the [`crontab(5)` manual](https://man7.org/linux/man-pages/man5/crontab.5.html).
