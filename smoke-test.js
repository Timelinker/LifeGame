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

const energyBeforeSocial = state.attrs.energy;
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
if (state.attrs.energy >= energyBeforeSocial) {
  throw new Error("social action did not consume energy");
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
  socialRootXpGained: totalSkillXp(state.skills["LIFE.SOCIAL.ROOT.001"]) - socialRootBefore,
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
