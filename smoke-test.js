"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const appPath = path.join(__dirname, "app.js");
const appCode = fs.readFileSync(appPath, "utf8");

const testCode = `
state = createNewState();
queueEventsFor(state, "stage_enter", 1);
const coreResourceKeys = RESOURCES.map(item => item.key).join(",");
if (coreResourceKeys !== "money,reputation,careerLevel,stamina,happiness,morality") {
  throw new Error("core resources did not match the economy redesign: " + coreResourceKeys);
}
if (state.resources.stamina !== 1000 || state.resources.morality !== 0) {
  throw new Error("new game did not start with expected stamina or morality");
}
if (state.age !== 15 || state.stageId !== "teen") {
  throw new Error("new game did not start as a 15-year-old high school student");
}
if (formatGameDate(state.day) !== "高一 · 9月") {
  throw new Error("new game did not start at high school September: " + formatGameDate(state.day));
}
DOM.topResourceBar = { innerHTML: "" };
renderTopResourceBar();
["金钱", "声望", "职级", "体力", "幸福感", "道德"].forEach(label => {
  if (!DOM.topResourceBar.innerHTML.includes(label)) {
    throw new Error("top resource bar missing " + label);
  }
});

const mathBefore = totalSkillXp(state.skills["KNOWLEDGE.MATH.ROOT.001"]);
const tickXp = completeTrainingTick("smoke-training", true);
const mathAfterTick = totalSkillXp(state.skills["KNOWLEDGE.MATH.ROOT.001"]);
if (tickXp <= 0 || mathAfterTick <= mathBefore) {
  throw new Error("training tick did not add math XP");
}

for (let i = 0; i < 32; i += 1) completeTrainingTick("smoke-training", true);
const mathAfterTraining = totalSkillXp(state.skills["KNOWLEDGE.MATH.ROOT.001"]);
if (mathAfterTraining <= mathAfterTick) {
  throw new Error("training loop did not keep adding math XP");
}
if (state.day <= 1 || state.stats.studyStreak < 2) {
  throw new Error("training loop did not advance day or study streak");
}

state.majorEventQueue = [];
state.completedEvents = {};
state.day = SUBJECT_TRACK_MONTH;
refreshStage(state, false);
queueMajorEventsForMonth(state);
if (!state.majorEventQueue.includes("major_subject_track_001")) {
  throw new Error("subject track major event did not queue at high school year 1 June");
}
if (formatGameDate(SUBJECT_TRACK_MONTH) !== "高一 · 6月") {
  throw new Error("subject track month label was wrong: " + formatGameDate(SUBJECT_TRACK_MONTH));
}
state.majorEventQueue = [];
state.tags.track_science = true;
state.day = GAOKAO_MONTH;
refreshStage(state, false);
queueMajorEventsForMonth(state);
if (!state.majorEventQueue.includes("major_gaokao_001")) {
  throw new Error("gaokao major event did not queue at high school year 3 June");
}
if (formatGameDate(GAOKAO_MONTH) !== "高三 · 6月") {
  throw new Error("gaokao month label was wrong: " + formatGameDate(GAOKAO_MONTH));
}
const gaokao = calculateGaokaoScore(state);
if (gaokao.track !== "science" || gaokao.subjects.length !== 6 || !gaokao.subjects.some(item => item.name === "物理")) {
  throw new Error("gaokao science scoring did not include expected subjects");
}
if (gaokao.total <= 0 || gaokao.total > 750) {
  throw new Error("gaokao total score was out of range: " + gaokao.total);
}

const staminaBeforeSocial = state.resources.stamina;
const reputationBeforeSocial = state.resources.reputation;
const friendshipBefore = getNpcRecord("father").friendship;
const socialRootBefore = totalSkillXp(state.skills["LIFE.SOCIAL.ROOT.001"]);
const father = getSocialNpc("father");
const talk = getSocialAction("talk");
const talkProfile = getSocialActionProfile(father, talk);

if (!startSocialAction("father", "talk", false)) {
  throw new Error("social idle action did not start");
}
state.social.action.startedAt = Date.now() - talkProfile.duration - 10;
if (!processSocialTicks()) {
  throw new Error("social idle action did not process completed progress");
}
if ((state.inventory["item.family.advice"] || 0) <= 0) {
  throw new Error("social action did not add fixed drop to inventory");
}
if (getNpcRecord("father").friendship <= friendshipBefore) {
  throw new Error("social action did not increase NPC friendship");
}
if (state.resources.stamina >= staminaBeforeSocial) {
  throw new Error("social action did not consume stamina");
}
if (state.resources.reputation <= reputationBeforeSocial) {
  throw new Error("social action did not increase reputation");
}
if (totalSkillXp(state.skills["LIFE.SOCIAL.ROOT.001"]) <= socialRootBefore) {
  throw new Error("social action did not add communication XP");
}
if (state.social.action?.npcId !== "father" || state.social.action?.actionId !== "talk") {
  throw new Error("social action did not continue idling after settlement");
}

class FakeToastNode {
  constructor() {
    this.children = [];
    this.className = "";
    this.dataset = {};
    this.innerHTML = "";
    this.isConnected = false;
    this.parent = null;
  }
  appendChild(node) {
    node.parent = this;
    node.isConnected = true;
    this.children.push(node);
    return node;
  }
  remove() {
    this.isConnected = false;
    if (this.parent) this.parent.children = this.parent.children.filter(item => item !== this);
  }
  querySelectorAll(selector) {
    return selector === ".toast" ? this.children.filter(item => item.className.includes("toast")) : [];
  }
}
DOM.toastStack = new FakeToastNode();
document.createElement = () => new FakeToastNode();
showToast({ type: "xp", direction: "gain", key: "xp:test", target: "基础数学经验", amount: 17, unit: "点", verb: "获得" });
showToast({ type: "xp", direction: "gain", key: "xp:test", target: "基础数学经验", amount: 21, unit: "点", verb: "获得" });
if (DOM.toastStack.children.length !== 1) {
  throw new Error("same toast key did not aggregate into one node");
}
if (!DOM.toastStack.children[0].innerHTML.includes("获得基础数学经验38点")) {
  throw new Error("same toast key did not aggregate amount");
}
activeToasts.forEach(item => clearTimeout(item.timer));
activeToasts.clear();

checkAchievements();
checkUnlocks(state);
console.log(JSON.stringify({
  skills: SKILLS.length,
  events: EVENTS.length,
  achievements: ACHIEVEMENTS.length,
  day: state.day,
  age: state.age,
  stage: state.stageId,
  date: formatGameDate(state.day),
  queue: state.eventQueue.length,
  majorQueue: state.majorEventQueue.length,
  unlocked: Object.values(state.skills).filter(item => item.unlocked).length,
  gaokao,
  mathXpGainedByTrainingTick: mathAfterTick - mathBefore,
  mathXpGainedByTrainingLoop: mathAfterTraining - mathAfterTick,
  studyStreak: state.stats.studyStreak,
  fatherFriendship: getNpcRecord("father").friendship,
  socialRootXpGained: totalSkillXp(state.skills["LIFE.SOCIAL.ROOT.001"]) - socialRootBefore,
  stamina: state.resources.stamina,
  reputation: state.resources.reputation,
  morality: state.resources.morality,
  inventoryItems: Object.keys(state.inventory).length,
  aggregatedToastCount: DOM.toastStack.children.length,
  activeSocialAction: state.social.action,
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
    createElement: null,
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
