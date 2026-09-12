/* Pure date calculation, shared by the browser and the local validation test. */
(function (root) {
  "use strict";

  function remaining(target, now) {
    // An explicit offset avoids different countdowns in visitors' time zones.
    if (typeof target !== "string") return null;
    const parts = target.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(Z|[+-]\d{2}:\d{2})$/);
    if (!parts) return null;
    const year = Number(parts[1]), month = Number(parts[2]), day = Number(parts[3]);
    if (month < 1 || month > 12 || day < 1 || day > new Date(Date.UTC(year, month, 0)).getUTCDate() ||
        Number(parts[4]) > 23 || Number(parts[5]) > 59 || Number(parts[6]) > 59) return null;
    const timestamp = Date.parse(target);
    if (!Number.isFinite(timestamp) || !Number.isFinite(now)) return null;
    const total = Math.max(0, Math.ceil((timestamp - now) / 1000));
    return {
      days: Math.floor(total / 86400),
      hours: Math.floor(total / 3600) % 24,
      minutes: Math.floor(total / 60) % 60,
      seconds: total % 60,
      complete: timestamp <= now
    };
  }

  if (typeof module !== "undefined" && module.exports) module.exports = remaining;
  else root.centennialTimeRemaining = remaining;
})(typeof window !== "undefined" ? window : globalThis);
