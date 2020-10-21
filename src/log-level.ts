/**
 * @packageDocumentation
 * @module @run-z/log-z
 */

/**
 * Default log level values.
 *
 * The same as [Bunyan log levels].
 *
 * [Bunyan log levels]: https://github.com/trentm/node-bunyan#levels
 */
export const enum ZLogLevel {

  /**
   * The service/app is going to stop or become unusable now. An operator should definitely look into this soon.
   */
  Fatal = 60,

  /**
   * Fatal for a particular request, but the service/app continues servicing other requests.
   * An operator should look at this soon(ish).
   */
  Error = 50,

  /**
   * A note on something that should probably be looked at by an operator eventually.
   */
  Warning = 40,

  /**
   * Detail on regular operation.
   */
  Info = 30,

  /**
   * Anything else, i.e. too verbose to be included in "info" level.
   */
  Debug = 20,

  /**
   * Logging from external libraries used by your app or very detailed application logging.
   */
  Trace = 10,

}
