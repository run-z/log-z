# Log That

[![NPM][npm-image]][npm-url]
[![Build Status][build-status-img]][build-status-link]
[![Code Quality][quality-img]][quality-link]
[![Coverage][coverage-img]][coverage-link]
[![GitHub Project][github-image]][github-url]
[![API Documentation][api-docs-image]][api documentation]

Logging library for browsers and Node.js.

This is a reference implementation of the logging API defined by [@proc7ts/logger] package.

[npm-image]: https://img.shields.io/npm/v/@run-z/log-z.svg?logo=npm
[npm-url]: https://www.npmjs.com/package/@run-z/log-z
[build-status-img]: https://github.com/run-z/log-z/workflows/Build/badge.svg
[build-status-link]: https://github.com/run-z/log-z/actions?query=workflow:Build
[quality-img]: https://app.codacy.com/project/badge/Grade/17c8d581b0254f379875ec1355dcdce4
[quality-link]: https://app.codacy.com/gh/run-z/log-z/dashboard?utm_source=gh&utm_medium=referral&utm_content=run-z/log-z&utm_campaign=Badge_Grade
[coverage-img]: https://app.codacy.com/project/badge/Coverage/17c8d581b0254f379875ec1355dcdce4
[coverage-link]: https://app.codacy.com/gh/run-z/log-z/dashboard?utm_source=gh&utm_medium=referral&utm_content=run-z/log-z&utm_campaign=Badge_Coverage
[github-image]: https://img.shields.io/static/v1?logo=github&label=GitHub&message=project&color=informational
[github-url]: https://github.com/run-z/log-z
[api-docs-image]: https://img.shields.io/static/v1?logo=typescript&label=API&message=docs&color=informational
[api documentation]: https://run-z.github.io/log-z/
[@proc7ts/logger]: https://www.npmjs.com/package/@proc7ts/logger

## Examples

Default logger:

```typescript
import { logZ } from '@run-z/log-z';

const logger = logZ(); // Create default logger to `console`.

logger.info('Message'); // Logs with `console.info()`.
logger.error('Error'); // Logs with `console.error()`.
logger.debug('Debug'); // Messages below "Warning" discarded by default.
```

Logger that logs all messages, including debug and trace.

```typescript
import { logZ, zlogDetails } from '@run-z/log-z';

// Create default logger to `console` that logs all messages.
const logger = logZ({ atLeast: 0 });

logger.debug('Debug'); // Logs with `console.log()`.
logger.trace('Without stack trace'); // Logs with `console.debug()`.
logger.trace('With stack trace', zlogDetails({ stackTrace: true })); // Logs with `console.trace()`.
```

## Node.js Support

Log to file

```typescript
import { logZ, zlogDEBUG } from '@run-z/log-z';
import { logZToFile } from '@run-z/log-z/node.js';

// Create a file logger to `test.log`.
const fileLogger = logZ({ atLeast: zlogDEBUG, by: logZToFile('test.log') });

fileLogger.debug('Message');
// [DEBUG] Message

// Create a daily rolling file logger.
const rollingLogger = logZ({
  by: logZToFile(() => {
    const now = new Date();

    return `test.${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}.log`;
  }),
});
```

Log to arbitrary stream

```typescript
import { logZ, zlogDEBUG } from '@run-z/log-z';
import { logZToStream } from '@run-z/log-z/node.js';

// Create a stdout logger.
const streamLogger = logZ({ atLeast: zlogDEBUG, by: logZToStream(process.stdout) });

streamLogger.info('Message');
// [INFO ] Message
```

## Log Messages

A log message is an object with the following properties:

- `level` - numeric log level. A `ZLogLevel` enum can be used to specify one of predefined levels:

  - `Fatal` - The service/app is going to stop or become unusable now.
    An operator should definitely look into this soon.
  - `Error` - Fatal for a particular request, but the service/app continues servicing other requests.
    An operator should look at this soon(ish).
  - `Warning` - A note on something that should probably be looked at by an operator eventually.
  - `Info` - Detail on regular operation.
  - `Debug` - Anything else, i.e. too verbose to be included in "info" level.
  - `Trace` - Logging from external libraries used by your app or very detailed application logging.

- `line` - Log line containing arbitrary values to log.

- `details` - Message details map.

  The keys of this map are specific to application or log recorder implementation.

The `record()` method of the [logger] logs such messages.

The [logger] also has more convenient methods accepting arbitrary parameters and corresponding to each predefined log
level, like `info()` and `error()`, `warn()`, `trace()`, etc. Each of these methods processes [Loggable] values. E.g.
the one created by [zlogDetails()].

A [zlogMessage()] function can be used to construct a log message. A level-specific messages can be constructed by
dedicated functions like [zlogDEBUG] or [zlogERROR].

[logger]: https://run-z.github.io/log-z/interfaces/_run_z_log_z.ZLogger.html
[Loggable]: https://run-z.github.io/log-z/interfaces/_run_z_log_z.ZLoggable.html
[zlogDetails()]: https://run-z.github.io/log-z/functions/_run_z_log_z.zlogDetails-2.html
[zlogMessage()]: https://run-z.github.io/log-z/functions/_run_z_log_z.zlogMessage-1.html
[zlogDEBUG]: https://run-z.github.io/log-z/functions/_run_z_log_z.zlogDEBUG.html
[zlogERROR]: https://run-z.github.io/log-z/functions/_run_z_log_z.zlogERROR.html

## Loggable Values

A message error or any message parameter can customize how it is logged by implementing [Loggable] or [ZLoggable]
interface. I.e. it should implement [toLog()] method. See the [@proc7ts/logger] for the details.

For example, a [zlogDetails()] creates a loggable value that adjusts the details of the logged message.

Another possible usage scenario is deferring the actual evaluation of the logged message until it is written to the log.
This can be done with `logDefer()` function:

```typescript
import { logDefer } from '@proc7ts/logger';

logger.debug(
  'Debug info',
  logDefer(() => zlogDetails({ info: evaluateDebugInfo() })),
);
// `evaluateDebugInfo()` will be called only if `DEBUG` log level enabled.
// Note that this will happen right before writing to the log,
// which may happen at a later time, or not happen at all.
```

[ZLoggable]: https://run-z.github.io/log-z/interfaces/_run_z_log_z.ZLoggable.html
[toLog()]: https://run-z.github.io/log-z/interfaces/_run_z_log_z.ZLoggable.html#toLog

## Log Formats

The Node.js loggers write messages in predefined format by default:

```typescript
import { logZ } from '@run-z/log-z';
import { logZToStream } from '@run-z/log-z/node.js';

const logger = logZ({ by: logZToStream(process.stdout) });

logger.info('Message', new Error('Failed'), zlogDetails({ detail1: 'value', detail2: 2 }), 'Extra 1', [2, 3]);
// [INFO ] Message ("Extra 1", [2, 3]) { detail1: "value"; detail2: 2 } Error: Failed
//    at file:///.../example.mjs:6:24
//    at ModuleJob.run (internal/modules/esm/module_job.js:146:37)
//    at async Loader.import (internal/modules/esm/loader.js:182:24)
//    at async Object.loadESM (internal/process/esm_loader.js:84:5)
```

This format can be customized:

```typescript
import { levelZLogField, logZ, messageZLogField, zlogDetails, zlogLevelName } from '@run-z/log-z';
import { logZToStream } from '@run-z/log-z/node.js';

const logger = logZ({
  by: logZToStream(process.stdout, {
    format: {
      fields: [
        '>>> ',
        levelZLogField(zlogLevelName),
        ' "',
        messageZLogField(),
        '" ',
        line => {
          line.write(JSON.stringify(line.message.details));
        },
      ],
    },
  }),
});

logger.info('Message', zlogDetails({ detail1: 'value', detail2: 2 }));
// >>> Info "Message" {"detail1":"value","detail2":2}
```

Or completely replaced:

```typescript
import { logZ, zlogDetails } from '@run-z/log-z';
import { logZToStream } from '@run-z/log-z/node.js';

const logger = logZ({
  by: logZToStream(process.stdout, {
    format: JSON.stringify,
  }),
});

logger.info('Message', zlogDetails({ detail1: 'value', detail2: 2 }));
// {"level":30,"text":"Message","details":{"detail1":"value","detail2":2},"extra":[]}
```

## Custom Loggers

Custom logger can be built by implementing a [ZLogRecorder] interface. The latter has three methods:

- `record(message: ZLogMessage): void` - Records a log message.

  The actual logging of the message can be asynchronous.

- `whenLogged(which?: 'all' | 'last'): Promise<boolean>` - Awaits for the recorded message(s) to be either logged or
  discarded.

  The optional `which` parameter can be one of:

  - `"all"` to wait for all messages,
  - `"last"` (the default) to wait for the last recorded message only.

- `end(): Promise<void>` - Ends log recording and returns a promise resolved when recorder stopped.

  All messages discarded after this method call.

The [logZ] and [logZBy] functions converts arbitrary [ZLogRecorder] to [logger]. The former accepts additional
parameters, e.g. is able to filter out some debug messages.

[logZ]: https://run-z.github.io/log-z/functions/_run_z_log_z.logZ.html
[logZBy]: https://run-z.github.io/log-z/functions/_run_z_log_z.logZBy.html
[ZLogRecorder]: https://run-z.github.io/log-z/interfaces/_run_z_log_z.ZLogRecorder.html

## Additional Log Recorders

There are several additional log recorders that can combine or modify the behavior of other recorders:

- [logZAtopOf] - Logs messages atop of the target log recorder.
  When it ends logging, the target recorder still can record messages.
  This, combined with [logZWithDetails], can be treated as "child" logger.
- [logZByAll] - Logs messages by all the given recorders.
- [logZByAny] - Logs messages by any of the given recorders.
- [logZTimestamp] - Timestamp log recorder.
  Adds a timestamp property to message details.
- [logZToBuffer] - A log buffer that can be drained to another log recorder.
- [logZToLogger] - Logs to another `Logger`. To `consoleLogger` by default. This is the default recorder used by [logZ]
  function.
- [logZToOther] - Logs to another log recorder provided by function.
- [logZUpdated] - Updates log messages.
- [logZWhenLevel] - A log recorder of messages with required level.
  Messages not satisfying the condition either logged by another recorder, or discarded.
- [logZWithDetails] - Updates message details.

[logZAtopOf]: https://run-z.github.io/log-z/functions/_run_z_log_z.logZAtopOf.html
[logZByAll]: https://run-z.github.io/log-z/functions/_run_z_log_z.logZByAll.html
[logZByAny]: https://run-z.github.io/log-z/functions/_run_z_log_z.logZByAny.html
[logZTimestamp]: https://run-z.github.io/log-z/functions/_run_z_log_z.logZTimestamp.html
[logZToBuffer]: https://run-z.github.io/log-z/functions/_run_z_log_z.logZToBuffer.html
[logZToLogger]: https://run-z.github.io/log-z/functions/_run_z_log_z.logZToLogger.html
[logZToOther]: https://run-z.github.io/log-z/functions/_run_z_log_z.logZToOther.html
[logZUpdated]: https://run-z.github.io/log-z/functions/_run_z_log_z.logZUpdated.html
[logZWhenLevel]: https://run-z.github.io/log-z/functions/_run_z_log_z.logZWhenLevel.html
[logZWithDetails]: https://run-z.github.io/log-z/functions/_run_z_log_z.logZWithDetails.html
