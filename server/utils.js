import { FILTER_CAPACITY } from "./config.js";

export function serializeUnit(unit, latestReading = null) {
  const load = unit.cumulativeParticulateLoad ?? 0;
  const filterUsedPercent = Math.min(100, Math.round((load / FILTER_CAPACITY) * 100));
  const filterLifeRemaining = Math.max(0, 100 - filterUsedPercent);

  return {
    ...unit.toObject(),
    latestReading,
    filterCapacity: FILTER_CAPACITY,
    filterUsedPercent,
    filterLifeRemaining
  };
}

export function asyncHandler(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}
