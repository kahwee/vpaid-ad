/**
 * Assumes the scope to be VpaidAd
 * Intended to be a private function. Do not expose.
 *
 * @param  {[type]} event [description]
 * @param  {[type]} msg   [description]
 * @return {[type]}       [description]
 */
export default function (event, msg) {
  const subscribers = this._subscribers[event] || [];
  subscribers.forEach(handlers => {
    handlers.callback.apply(handlers.context, msg);
  });
}