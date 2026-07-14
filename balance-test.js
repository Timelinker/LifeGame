"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const appCode = fs.readFileSync(path.join(__dirname, "app.js"), "utf8");
const contentCode = fs.readFileSync(path.join(__dirname, "content-events.js"), "utf8");
const checkCode = `
const results = {
  skillCount: SKILLS.length,
  levelCap: SKILL_LEVEL_CAP,
  xpPerSkill: getSkillMasteryXp(),
  ticksPerMonth: TRAINING_TICKS_PER_MONTH,
  baseHours: estimateAllSkillMasteryHours("base"),
  normalHours: estimateAllSkillMasteryHours("normal"),
  optimizedHours: estimateAllSkillMasteryHours("optimized"),
};
if (SKILLS.some(item => item.max !== SKILL_LEVEL_CAP)) throw new Error("not every skill uses the level cap");
if (results.optimizedHours < 100) throw new Error("optimized route is below 100 hours");
if (!(results.baseHours > results.normalHours && results.normalHours > results.optimizedHours)) {
  throw new Error("balance profiles are not ordered from slowest to fastest");
}
if (results.ticksPerMonth !== 240) throw new Error("month pacing is not 240 skill settlements");
console.log(JSON.stringify(Object.fromEntries(Object.entries(results).map(([key, value]) => [key, typeof value === "number" ? Number(value.toFixed(1)) : value])), null, 2));
`;

const context = {
  console,
  document: { addEventListener() {} },
  Math,
  Date,
  JSON,
  setTimeout,
  clearTimeout,
};

vm.createContext(context);
vm.runInContext(`${contentCode}\n${appCode}\n${checkCode}`, context);
