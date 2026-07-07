"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const appPath = path.join(__dirname, "app.js");
const appCode = fs.readFileSync(appPath, "utf8");

const testCode = `
state = createNewState();
queueEventsFor(state, "stage_enter", 1);
const mathBefore = totalSkillXp(state.skills["KNOWLEDGE.MATH.ROOT.001"]);
const tickXp = completeTrainingTick("smoke-training", true);
const mathAfterTick = totalSkillXp(state.skills["KNOWLEDGE.MATH.ROOT.001"]);
if (tickXp <= 0 || mathAfterTick <= mathBefore) {
  throw new Error("点击技能挂机训练没有给基础数学增加经验");
}
for (let i = 0; i < 32; i += 1) completeTrainingTick("smoke-training", true);
const mathAfterTraining = totalSkillXp(state.skills["KNOWLEDGE.MATH.ROOT.001"]);
if (mathAfterTraining <= mathAfterTick) {
  throw new Error("连续挂机训练没有给基础数学增加经验");
}
if (state.day <= 1 || state.stats.studyStreak < 2) {
  throw new Error("技能挂机没有推进日期或连续学习统计");
}
const energyBeforeSocial = state.attrs.energy;
const friendshipBefore = getNpcRecord("father").friendship;
socializeWithNpc("father", false);
if ((state.inventory["item.family.advice"] || 0) <= 0) {
  throw new Error("社交没有把固定道具放入背包");
}
if (getNpcRecord("father").friendship <= friendshipBefore) {
  throw new Error("社交没有增加 NPC 友好度");
}
if (state.attrs.energy >= energyBeforeSocial) {
  throw new Error("社交没有消耗精力");
}
checkAchievements();
checkUnlocks(state);
console.log(JSON.stringify({
  skills: SKILLS.length,
  events: EVENTS.length,
  achievements: ACHIEVEMENTS.length,
  day: state.day,
  age: state.age,
  stage: state.stageId,
  queue: state.eventQueue.length,
  unlocked: Object.values(state.skills).filter(item => item.unlocked).length,
  mathXpGainedByTrainingTick: mathAfterTick - mathBefore,
  mathXpGainedByTrainingLoop: mathAfterTraining - mathAfterTick,
  studyStreak: state.stats.studyStreak,
  fatherFriendship: getNpcRecord("father").friendship,
  inventoryItems: Object.keys(state.inventory).length,
  lastSettlement: state.lastSettlement,
  logs: state.logs.length
}, null, 2));
`;

const context = {
  console,
  localStorage: {
    getItem() { return null; },
    setItem() {},
    removeItem() {},
  },
  document: {
    addEventListener() {},
    getElementById() { return null; },
    querySelectorAll() { return []; },
  },
  confirm() { return true; },
  Date,
  Math,
  JSON,
  setTimeout,
  clearTimeout,
};

vm.createContext(context);
vm.runInContext(`${appCode}\n${testCode}`, context);
