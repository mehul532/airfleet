import Alert from "../models/Alert.js";
import Reading from "../models/Reading.js";
import Site from "../models/Site.js";
import Unit from "../models/Unit.js";
import {
  DEFAULT_TICK_WEIGHT,
  FAST_FORWARD_SAMPLE_LIMIT,
  FILTER_CAPACITY,
  THRESHOLD_PM25
} from "../config.js";

const wildfireStateBySite = new Map();

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function generateWildfireReading(siteId) {
  const state = wildfireStateBySite.get(String(siteId)) ?? { spikeTicks: 0 };

  if (state.spikeTicks <= 0 && Math.random() < 0.08) {
    state.spikeTicks = Math.floor(randomBetween(3, 9));
  }

  if (state.spikeTicks > 0) {
    state.spikeTicks -= 1;
    wildfireStateBySite.set(String(siteId), state);
    return randomBetween(150, 300);
  }

  wildfireStateBySite.set(String(siteId), state);
  return Math.max(4, randomBetween(8, 18));
}

function generateChronicHighReading() {
  const hourWave = (Math.sin(Date.now() / 1000 / 90) + 1) / 2;
  const base = 80 + hourWave * 130;
  return randomBetween(base - 20, base + 40);
}

export function generatePm25(site) {
  const pm25 =
    site.profile === "wildfire_spike"
      ? generateWildfireReading(site._id)
      : generateChronicHighReading();

  return Number(Math.max(0, pm25).toFixed(1));
}

async function maybeCreateReplacementAlert(unit) {
  if (unit.cumulativeParticulateLoad < FILTER_CAPACITY || unit.status === "needs_replacement") {
    return;
  }

  unit.status = "needs_replacement";
  const existing = await Alert.findOne({
    unitId: unit._id,
    type: "replace_filter",
    resolved: false
  });

  if (!existing) {
    await Alert.create({ unitId: unit._id, type: "replace_filter" });
  }
}

export async function simulateUnitTick(unit, site, options = {}) {
  const tickWeight = options.tickWeight ?? DEFAULT_TICK_WEIGHT;
  const timestamp = options.timestamp ?? new Date();
  const pm25 = options.pm25 ?? generatePm25(site);

  if (pm25 > THRESHOLD_PM25) {
    unit.aboveThresholdTicks += 1;
    unit.belowThresholdTicks = 0;
  } else {
    unit.belowThresholdTicks += 1;
    unit.aboveThresholdTicks = 0;
  }

  if (unit.aboveThresholdTicks >= 2) {
    unit.powerState = true;
  } else if (unit.belowThresholdTicks >= 3) {
    unit.powerState = false;
  }

  if (unit.powerState) {
    unit.cumulativeParticulateLoad += pm25 * tickWeight;
  }

  await maybeCreateReplacementAlert(unit);
  await unit.save();

  return Reading.create({
    unitId: unit._id,
    timestamp,
    pm25,
    powerState: unit.powerState
  });
}

export async function runSimulatorTick(options = {}) {
  const units = await Unit.find({ status: { $in: ["active", "needs_replacement"] } }).populate(
    "siteId"
  );

  const readings = [];
  for (const unit of units) {
    if (!unit.siteId) continue;
    readings.push(await simulateUnitTick(unit, unit.siteId, options));
  }
  return readings;
}

export function startSimulator(intervalMs) {
  const timer = setInterval(() => {
    runSimulatorTick().catch((error) => {
      console.error("Simulator tick failed", error);
    });
  }, intervalMs);

  timer.unref?.();
  return timer;
}

export async function resetUnitFilter(unitId) {
  const unit = await Unit.findById(unitId);
  if (!unit) return null;

  unit.cumulativeParticulateLoad = 0;
  unit.status = "active";
  unit.filterInstallDate = new Date();
  unit.aboveThresholdTicks = 0;
  unit.belowThresholdTicks = 0;
  await unit.save();

  await Alert.updateMany(
    { unitId: unit._id, type: "replace_filter", resolved: false },
    { $set: { resolved: true, resolvedAt: new Date() } }
  );

  return unit;
}

export async function fastForwardSimulation(days = 30) {
  const sampleCount = FAST_FORWARD_SAMPLE_LIMIT;
  const totalTicks = Math.max(1, Math.round((days * 24 * 60 * 60) / 10));
  const tickWeight = totalTicks / sampleCount;
  const sitesById = new Map((await Site.find()).map((site) => [String(site._id), site]));
  const units = await Unit.find();
  let readingsCreated = 0;

  for (const unit of units) {
    const site = sitesById.get(String(unit.siteId));
    if (!site) continue;

    for (let index = 0; index < sampleCount; index += 1) {
      await simulateUnitTick(unit, site, {
        tickWeight,
        timestamp: new Date(Date.now() - (sampleCount - index) * 10 * 1000)
      });
      readingsCreated += 1;
    }
  }

  return { days, totalTicks, sampleCount, readingsCreated };
}
