"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const appPath = path.join(__dirname, "app.js");
const contentPath = path.join(__dirname, "content-events.js");
const appCode = fs.readFileSync(appPath, "utf8");
const contentCode = fs.readFileSync(contentPath, "utf8");

const testCode = `
state = createNewState();
queueEventsFor(state, "stage_enter", 1);
const starterNames = getUnlockedSkills().map(item => item.name).sort();
const expectedStarterNames = ["基础数学", "语文基础", "英语听读", "理科基础", "物理直觉", "化学实验", "人文通识", "户外玩耍"].sort();
if (JSON.stringify(starterNames) !== JSON.stringify(expectedStarterNames)) {
  throw new Error("new game starter skills were wrong: " + starterNames.join(","));
}
if (isUnlocked(state, "LIFE.SOCIAL.ROOT.001") || isUnlocked(state, "HEALTH.BASIC.ROOT.001") || isUnlocked(state, "TECH.COMPUTER.ROOT.001")) {
  throw new Error("life-discovery skills appeared before the player experienced them");
}
DOM.skillFilters = { innerHTML: "", querySelectorAll() { return []; } };
DOM.skillGrid = { innerHTML: "" };
renderSkills();
const renderedStarterCards = (DOM.skillGrid.innerHTML.match(/<article class="skill-card /g) || []).length;
if (renderedStarterCards !== 8 || DOM.skillGrid.innerHTML.includes("未解锁") || DOM.skillGrid.innerHTML.includes('<div class="skill-name">沟通表达</div>')) {
  throw new Error("skill page did not hide undiscovered skills: cards=" + renderedStarterCards);
}

const legacyState = JSON.parse(JSON.stringify(state));
legacyState.version = "0.2.0-dev";
legacyState.skills["ART.CREATIVE.ROOT.001"] = { level: 1, xp: 0, unlocked: true };
legacyState.skills["LIFE.SOCIAL.ROOT.001"] = { level: 2, xp: 5, unlocked: true };
const migratedState = migrateState(legacyState);
if (isUnlocked(migratedState, "ART.CREATIVE.ROOT.001")) {
  throw new Error("legacy auto-unlocked zero-progress skill remained visible");
}
if (!isUnlocked(migratedState, "LIFE.SOCIAL.ROOT.001") || getLevel(migratedState, "LIFE.SOCIAL.ROOT.001") !== 2) {
  throw new Error("legacy practiced skill was not preserved during migration");
}
const contentIssues = validateGameContent();
if (contentIssues.length) {
  throw new Error("content validation failed: " + contentIssues.join(" | "));
}
const skillContentEvent = EVENTS.find(item => item.id === "skill_math_classmate_question_001");
const deterministicSkillEvent = { ...skillContentEvent, triggerSpec: { ...skillContentEvent.triggerSpec, chance: 1 } };
if (matchesEventTrigger(deterministicSkillEvent, "skill", { skillId: "KNOWLEDGE.MATH.ROOT.001", count: 7 })) {
  throw new Error("content event ignored its trigger interval");
}
if (!matchesEventTrigger(deterministicSkillEvent, "skill", { skillId: "KNOWLEDGE.MATH.ROOT.001", count: 8 })) {
  throw new Error("content event did not match its skill trigger context");
}
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

const outdoorPlay = getSkill("LIFE.PLAY.ROOT.001");
if (!outdoorPlay || !isUnlocked(state, outdoorPlay.id)) {
  throw new Error("outdoor play skill was not available in teen life skills");
}
const playXpBefore = totalSkillXp(state.skills[outdoorPlay.id]);
const happinessBeforePlay = state.resources.happiness;
state.training = {
  skillId: outdoorPlay.id,
  startedAt: Date.now(),
  duration: getTrainingDuration(outdoorPlay.id),
  completions: 0,
};
const playTickXp = completeTrainingTick("play-smoke", true);
if (playTickXp <= 0 || totalSkillXp(state.skills[outdoorPlay.id]) <= playXpBefore) {
  throw new Error("play training did not add XP");
}
if (state.resources.happiness < happinessBeforePlay) {
  throw new Error("play training reduced happiness unexpectedly");
}
applyEffects([effItem("item.play.fish", 1)], "play-smoke");
if ((state.inventory["item.play.fish"] || 0) !== 1) {
  throw new Error("play event item did not enter inventory");
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
const socialExposureBefore = state.skills["LIFE.SOCIAL.ROOT.001"].discoveryXp;
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
if (state.skills["LIFE.SOCIAL.ROOT.001"].discoveryXp <= socialExposureBefore) {
  throw new Error("social action did not add hidden communication exposure");
}
if (state.social.action?.npcId !== "father" || state.social.action?.actionId !== "talk") {
  throw new Error("social action did not continue idling after settlement");
}

for (let i = 0; i < 9; i += 1) socializeWithNpc("father", false, "talk", false, false);
if (!isUnlocked(state, "LIFE.SOCIAL.ROOT.001") || !isUnlocked(state, "LIFE.SOCIAL.BASIC.001") || !isUnlocked(state, "HEALTH.BASIC.ROOT.001")) {
  throw new Error("family conversations did not reveal communication, listening, and health skills");
}
if (canTrainSkill(state, getSkill("LIFE.SOCIAL.ROOT.001"))) {
  throw new Error("communication became directly trainable during high school");
}

applyEffects([effSkill("LIFE.PLAY.BASIC.004", 100)], "网吧事件");
if (!isUnlocked(state, "LIFE.PLAY.BASIC.004") || isUnlocked(state, "TECH.COMPUTER.ROOT.001")) {
  throw new Error("net cafe discovery chain started in the wrong order");
}
state.training = {
  skillId: "LIFE.PLAY.BASIC.004",
  startedAt: Date.now(),
  duration: getTrainingDuration("LIFE.PLAY.BASIC.004"),
  completions: 0,
};
for (let i = 0; i < 8; i += 1) completeTrainingTick("net-cafe-smoke", true);
if (!isUnlocked(state, "TECH.COMPUTER.ROOT.001") || !canTrainSkill(state, getSkill("TECH.COMPUTER.ROOT.001"))) {
  throw new Error("net cafe gaming did not reveal a trainable computer basics skill");
}

const basketballId = "LIFE.PLAY.BASIC.002";
applyEffects([effSkill(basketballId, 75)], "球场事件");
const staminaMaxBeforeBasketball = getMaxStamina(state);
const staminaBeforeBasketballLevel = state.resources.stamina;
addSkillXp(basketballId, 25, "篮球训练", null, { toast: false });
if (getMaxStamina(state) - staminaMaxBeforeBasketball !== 15) {
  throw new Error("basketball level did not add 15 stamina max");
}
if (state.resources.stamina - staminaBeforeBasketballLevel !== 15) {
  throw new Error("stamina did not rise with the new stamina maximum");
}
if (!String(getDisplayResourceValue("stamina")).includes("/")) {
  throw new Error("stamina display did not include current and maximum values");
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
  playTickXp,
  playInventoryFish: state.inventory["item.play.fish"],
  mathXpGainedByTrainingTick: mathAfterTick - mathBefore,
  mathXpGainedByTrainingLoop: mathAfterTraining - mathAfterTick,
  studyStreak: state.stats.studyStreak,
  fatherFriendship: getNpcRecord("father").friendship,
  communicationUnlocked: isUnlocked(state, "LIFE.SOCIAL.ROOT.001"),
  healthKnowledgeUnlocked: isUnlocked(state, "HEALTH.BASIC.ROOT.001"),
  computerBasicsUnlocked: isUnlocked(state, "TECH.COMPUTER.ROOT.001"),
  staminaMax: getMaxStamina(state),
  contentEvents: EVENTS.filter(item => item.contentPack).length,
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
vm.runInContext(`${contentCode}\n${appCode}\n${testCode}`, context);
