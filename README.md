Log That
========

[![NPM][npm-image]][npm-url]
[![Build Status][build-status-img]][build-status-link]
[![codecov][codecov-image]][codecov-url]
[![GitHub Project][github-image]][github-url]
[![API Documentation][api-docs-image]][API documentation]

Logging library for browsers and Node.js.

[npm-image]: https://img.shields.io/npm/v/@run-z/log-z.svg?logo=npm
[npm-url]: https://www.npmjs.com/package/@run-z/log-z
[build-status-img]: https://github.com/run-z/log-z/workflows/Build/badge.svg
[build-status-link]: https://github.com/run-z/log-z/actions?query=workflow%3ABuild
[codecov-image]: https://codecov.io/gh/run-z/log-z/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/run-z/log-z
[github-image]: https://img.shields.io/static/v1?logo=github&label=GitHub&message=project&color=informational
[github-url]: https://github.com/run-z/log-z
[api-docs-image]: https://img.shields.io/static/v1?logo=typescript&label=API&message=docs&color=informational
[API documentation]: https://run-z.github.io/log-z/ 


Examples
--------

Default logger:
```typescript
import { logZ } from '@run-z/log-z';

const logger = logZ();  // Create default logger to `console`.

logger.info('Message'); // Logs with `console.info()`.
logger.error('Error');  // Logs with `console.error()`.
logger.debug('Debug');  // Messages below "Warning" discarded by default.
```

Logger that logs all messages, including debug and trace.
```typescript
import { logZ, zlogDetails } from '@run-z/log-z';

// Create default logger to `console` that logs all messages.
const logger = logZ({ atLeast: 0 });

logger.debug('Debug');  // Logs with `console.log()`.
logger.trace('Without stack trace'); // Logs with `console.debug()`.
logger.trace('With stack trace', zlogDetails({ stackTrace: true })); // Logs with `console.trace()`.
```

Node.js Support
---------------

Log to file
```typescript
import { logZ, zlogDEBUG } from '@run-z/log-z';
import { logZToFile } from '@run-z/log-z/node';

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
})
```

Log to arbitrary stream
```typescript
import { logZ, zlogDEBUG } from '@run-z/log-z';
import { logZToStream } from '@run-z/log-z/node';

// Create a stdout logger.
const streamLogger = logZ({ atLeast: zlogDEBUG, by: logZToStream(process.stdout) });

streamLogger.info('Message');
// [INFO ] Message
```

Log Messages
------------

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

- `text` - Human-readable message text.

  May be empty when unspecified.

- `error` - An error to log, if any.

- `details` - Message details map.

  The keys of this map are specific to application or log recorder implementation.
  
- `extra` - Array of extra uninterpreted parameters of passed to the logging method.   


The `record()` method of the [logger] logs such messages.

The [logger] also has more convenient methods accepting arbitrary parameters and corresponding to each predefined log
levels, like `info()` and `error()`, `warn()`, `trace()`, etc. Each of these methods treats arguments as following:

- Treats the first textual argument as message text.
- Treats the first special value created by [zlogError] function or the first `Error` instance as an error.
- Treats error message as a message text, unless there is another textual argument.
- Treats special values created by [zlogDetails] function as additional message details.
- Treats special values created by [zlogExtra] function as additional uninterpreted message parameters.
- Treats anything else as uninterpreted message parameter.

A [zlogMessage] function can be used to construct a log message, as well as level-specific ones, like `zlogDEBUG`
or `zlogERROR`.

[logger]: https://run-z.github.io/log-z/classes/@run-z_log-z.ZLogger.html
[zlogDetails]: https://run-z.github.io/log-z/modules/@run-z_log-z.html#zlogDetails
[zlogError]: https://run-z.github.io/log-z/modules/@run-z_log-z.html#zlogError
[zlogExtra]: https://run-z.github.io/log-z/modules/@run-z_log-z.html#zlogExtra
[zlogMessage]: https://run-z.github.io/log-z/modules/@run-z_log-z.html#zlogMessage


Loggable Values
---------------

A message error or any uninterpreted message parameter may be a loggable value. For that, it should implement
a `toLog()` method that returns a loggable representation of the value. Such representation will be written to the log
instead of original value. This can be used to log values in a special format.

One possible usage scenario is deferring the actual evaluation of the logged message until it is written to the log.
This can be done with [zlogDefer] function:
```typescript
logger.debug('Debug info', zlogDefer(() => zlogDetails({ info: evaluateDebugInfo() })));
// `evaluateDebugInfo()` will be called only if `DEBUG` log level enabled.
// Note that this will happen right before writing to the log,
// which may happen at a later time, or not happen at all.
``` 

[zlogDefer]: https://run-z.github.io/log-z/modules/@run-z_log-z.html#zlogDefer


Log Formats
-----------

The Node.js loggers write messages in predefined format by default:
```typescript
import { logZ } from '@run-z/log-z';
import { logZToStream } from '@run-z/log-z/node';

const logger = logZ({ by: logZToStream(process.stdout) });

logger.info('Message', new Error('Failed'), zlogDetails({ detail1: 'value', detail2: 2 }), 'Extra 1', [2, 3])
// [INFO ] Message ("Extra 1", [2, 3]) { detail1: "value"; detail2: 2 } Error: Failed
//    at file:///.../example.mjs:6:24
//    at ModuleJob.run (internal/modules/esm/module_job.js:146:37)
//    at async Loader.import (internal/modules/esm/loader.js:182:24)
//    at async Object.loadESM (internal/process/esm_loader.js:84:5)
```

This format can be customized:
```typescript
import { levelZLogField, logZ, messageZLogField, zlogDetails, zlogLevelName } from '@run-z/log-z';
import { logZToStream } from '@run-z/log-z/node';

const logger = logZ({
  by: logZToStream(
    process.stdout,
    {
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
    },
  ),
});

logger.info('Message', zlogDetails({ detail1: 'value', detail2: 2 }));
// >>> Info "Message" {"detail1":"value","detail2":2}
```

Or completely replaced:
```typescript
import { logZ, zlogDetails } from '@run-z/log-z';
import { logZToStream } from '@run-z/log-z/node';

const logger = logZ({
  by: logZToStream(
    process.stdout,
    {
      format: JSON.stringify,
    },
  ),
});

logger.info('Message', zlogDetails({ detail1: 'value', detail2: 2 }));
// {"level":30,"text":"Message","details":{"detail1":"value","detail2":2},"extra":[]}
```


Custom Loggers
--------------

Custom logger can be built by implementing a [ZLogRecorder] interface. The latter has three methods:

- `record(message: ZLogMessage): void` - Records a log message.

  The actual logging of the message can be asynchronous.

- `whenLogged(which?: 'all' | 'last'): Promise<boolean>` - Awaits for the recorded message(s) to be either logged or
  discarded.  

  The optional `which` parrameter can be one of:
  
  - `"all"` to wait for all messages,
  - `"last"` (the default) to wait for the last recorded message only.

- `end(): Promise<void>` - Ends log recording and returns a promise resolved when recorder stopped.

  All messages discarded after this method call. 


The [logZ] and [logZBy] functions converts arbitrary [ZLogRecorder] to [logger]. The former accepts additional
parameters, e.g. is able to filter out some debug messages.

[logZ]: https://run-z.github.io/log-z/modules/@run-z_log-z.html#logZ
[logZBy]: https://run-z.github.io/log-z/modules/@run-z_log-z.html#logZBy
[ZLogRecorder]: https://run-z.github.io/log-z/interfaces/@run-z_log-z.ZLogRecorder.html


Additional Log Recorders
------------------------

There are several additional log recorders that can combine or modify the behavior of other recorders:

- [logZAtopOf] - Logs messages atop of the target log recorder.
  When it ends logging, the target recorder still can record messages.
  This, combined with [logZWithDetails], can be treated as "child" logger.
- [logZByAll] - Logs messages by all the given recorders.
- [logZByAny] - Logs messages by any of the given recorders.
- [logZTimestamp] - Timestamp log recorder.
  Adds a timestamp property to message details.
- [logZToBuffer] - A log buffer that can be drained to another log recorder.   
- [logZToConsole] - Logs to global console. This is the default recorder used by [logZ] function.
- [logZUpdated] - Updates log messages.
- [logZWhenLevel] - A log recorder of messages with required level.
  Messages not satisfying the condition either logged by another recorder, or discarded.
- [logZWithDetails] - Updates message details.     

[logZAtopOf]: https://run-z.github.io/log-z/modules/@run-z_log-z.html#logZAtopOf
[logZByAll]: https://run-z.github.io/log-z/modules/@run-z_log-z.html#logZByAll
[logZByAny]: https://run-z.github.io/log-z/modules/@run-z_log-z.html#logZByAny
[logZTimestamp]: https://run-z.github.io/log-z/modules/@run-z_log-z.html#logZTimestamp
[logZToBuffer]: https://run-z.github.io/log-z/modules/@run-z_log-z.html#logZToBuffer
[logZToConsole]: https://run-z.github.io/log-z/modules/@run-z_log-z.html#logZToConsole
[logZUpdated]: https://run-z.github.io/log-z/modules/@run-z_log-z.html#logZUpdated
[logZWhenLevel]: https://run-z.github.io/log-z/modules/@run-z_log-z.html#logZWhenLevel
[logZWithDetails]: https://run-z.github.io/log-z/modules/@run-z_log-z.html#logZWithDetails
