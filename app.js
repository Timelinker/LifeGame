"use strict";

const STORAGE_KEY = "life-idle-web-save-v1";
const VERSION = "0.3.0-dev";

const NAV_ITEMS = [
  { id: "home", label: "首页", icon: "i-home" },
  { id: "skills", label: "技能", icon: "i-skill" },
  { id: "events", label: "事件", icon: "i-event" },
  { id: "social", label: "社交", icon: "i-social" },
  { id: "inventory", label: "背包", icon: "i-bag" },
  { id: "career", label: "职业", icon: "i-career" },
  { id: "achievements", label: "成就", icon: "i-trophy" },
];

const STAGES = [
  { id: "teen", name: "高中期", minAge: 15, maxAge: 17, defaultScene: "SCHOOL" },
  { id: "college", name: "大学期", minAge: 18, maxAge: 22, defaultScene: "COLLEGE" },
  { id: "work", name: "职场前期", minAge: 23, maxAge: 35, defaultScene: "WORKING" },
];

const START_AGE = 15;
const ACADEMIC_MONTHS = [9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8];
const SUBJECT_TRACK_MONTH = 10;
const GAOKAO_MONTH = 34;

const STARTER_SKILL_IDS = new Set([
  "KNOWLEDGE.MATH.ROOT.001",
  "KNOWLEDGE.LANGUAGE.ROOT.001",
  "KNOWLEDGE.ENGLISH.ROOT.001",
  "KNOWLEDGE.SCIENCE.ROOT.001",
  "KNOWLEDGE.SCIENCE.BASIC.001",
  "KNOWLEDGE.SCIENCE.BASIC.002",
  "KNOWLEDGE.HUMANITIES.ROOT.001",
  "LIFE.PLAY.ROOT.001",
]);

const SKILL_TRAINING_RULES = {
  "LIFE.SOCIAL.ROOT.001": { trainableStages: ["work"], growthHint: "高中和大学阶段主要通过与人交谈提升，进入职场后开放主动训练。" },
  "LIFE.SOCIAL.BASIC.001": { trainableStages: ["work"], growthHint: "主要通过与父母、老师和同学交谈提升。" },
  "HEALTH.BASIC.ROOT.001": { trainableStages: ["college", "work"], growthHint: "高中阶段主要通过家庭、老师和生活事件提升。" },
};

const SKILL_DISCOVERY_THRESHOLDS = {
  "LIFE.SOCIAL.ROOT.001": 60,
  "LIFE.SOCIAL.BASIC.001": 45,
  "HEALTH.BASIC.ROOT.001": 50,
  "TECH.COMPUTER.ROOT.001": 60,
};

const SCENES = {
  FAMILY: { name: "家庭", modifiers: { LIFE: 1.1, HEALTH: 1.1 } },
  SCHOOL: { name: "学校", modifiers: { KNOWLEDGE: 1.15, LIFE: 1.05 } },
  COLLEGE: { name: "大学", modifiers: { KNOWLEDGE: 1.2, TECH: 1.1, ART: 1.08 } },
  WORKING: { name: "职场", modifiers: { CAREER: 1.2, TECH: 1.08, KNOWLEDGE: 1.05 } },
  COMMUNITY: { name: "社区", modifiers: { LIFE: 1.12, HEALTH: 1.12 } },
  ONLINE: { name: "网络", modifiers: { TECH: 1.18, ART: 1.08, CAREER: 1.05 } },
  STUDIO: { name: "工作室", modifiers: { ART: 1.25, TECH: 1.06 } },
};

const ATTRS = [
  { key: "health", name: "健康", color: "#4f8f46" },
  { key: "intelligence", name: "智力", color: "#4267b2" },
  { key: "creativity", name: "创造力", color: "#d85c4a" },
  { key: "charm", name: "魅力", color: "#7357a5" },
  { key: "discipline", name: "纪律", color: "#c98a17" },
  { key: "fitness", name: "体能", color: "#4f8f46" },
  { key: "stability", name: "情绪稳定", color: "#1a8a8a" },
];

const RESOURCES = [
  { key: "money", name: "金钱" },
  { key: "reputation", name: "声望" },
  { key: "careerLevel", name: "职级" },
  { key: "stamina", name: "体力" },
  { key: "happiness", name: "幸福感" },
  { key: "morality", name: "道德" },
];

const ACTIONS = {
  study: {
    name: "学习",
    scene: "SCHOOL",
    xp: 24,
    cost: { stamina: -11 },
    reward: {},
    attrs: { intelligence: 0.25, discipline: 0.18 },
    domains: ["KNOWLEDGE", "TECH", "ART"],
  },
  practice: {
    name: "练习",
    scene: "STUDIO",
    xp: 22,
    cost: { stamina: -10 },
    reward: {},
    attrs: { creativity: 0.24, discipline: 0.14 },
    domains: ["ART", "HEALTH", "TECH", "LIFE"],
  },
  work: {
    name: "工作",
    scene: "WORKING",
    xp: 18,
    cost: { stamina: -14, happiness: -4 },
    reward: { money: 36 },
    attrs: { discipline: 0.16, charm: 0.08 },
    domains: ["CAREER", "TECH", "KNOWLEDGE", "LIFE", "ART"],
  },
  create: {
    name: "创作",
    scene: "STUDIO",
    xp: 20,
    cost: { stamina: -12, happiness: -2 },
    reward: { reputation: 6 },
    attrs: { creativity: 0.28, stability: 0.08 },
    domains: ["ART", "CAREER", "TECH", "LIFE"],
  },
  social: {
    name: "社交",
    scene: "COMMUNITY",
    xp: 14,
    cost: { stamina: -8, money: -6 },
    reward: { reputation: 4, happiness: 6 },
    attrs: { charm: 0.24, stability: 0.08 },
    domains: ["LIFE", "CAREER", "ART"],
  },
  rest: {
    name: "休息",
    scene: "FAMILY",
    xp: 0,
    cost: {},
    reward: { stamina: 24, health: 2, happiness: 6 },
    attrs: { stability: 0.18 },
    domains: [],
  },
  explore: {
    name: "探索",
    scene: "ONLINE",
    xp: 13,
    cost: { stamina: -10, money: -4 },
    reward: { reputation: 2 },
    attrs: { creativity: 0.12, charm: 0.1 },
    domains: ["KNOWLEDGE", "TECH", "ART", "LIFE", "HEALTH", "CAREER"],
  },
  play: {
    name: "玩耍",
    scene: "COMMUNITY",
    xp: 17,
    cost: { stamina: -8 },
    reward: { happiness: 5 },
    attrs: { fitness: 0.18, creativity: 0.12, stability: 0.12 },
    domains: ["LIFE", "HEALTH", "ART"],
  },
  gaming: {
    name: "电玩",
    scene: "ONLINE",
    xp: 18,
    cost: { stamina: -7, money: -8 },
    reward: { happiness: 7 },
    attrs: { intelligence: 0.14, creativity: 0.18, stability: 0.08 },
    domains: ["LIFE", "TECH", "ART"],
  },
  exercise: {
    name: "锻炼",
    scene: "COMMUNITY",
    xp: 20,
    cost: { stamina: -12 },
    reward: { health: 3, happiness: 4 },
    attrs: { fitness: 0.28, discipline: 0.1 },
    domains: ["HEALTH", "LIFE"],
  },
};

const INVENTORY_ITEMS = [
  item("item.family.advice", "家庭建议", "关系", "来自家人的生活经验，记录着一段稳定的支持。"),
  item("item.family.snack", "家常点心", "消耗品", "母亲准备的小点心，暂时先作为收藏道具。"),
  item("item.teacher.note", "课堂笔记", "学习", "老师补充的知识点，后续可作为学习事件材料。"),
  item("item.classmate.gossip", "同学情报", "关系", "校园里流动的小道消息，可能引出新的事件。"),
  item("item.park.leaf", "公园叶片", "收藏", "散步时收到的小礼物，带着轻松的记忆。"),
  item("item.play.fish", "河边小鱼", "玩耍", "少年期在河边抓到的小鱼，更多是一段鲜活记忆。"),
  item("item.play.river_stone", "漂亮石头", "玩耍", "河岸边捡到的石头，颜色和纹理都很特别。"),
  item("item.play.arcade_ticket", "网吧点卡", "玩耍", "一张快用完的点卡，记录着几次放学后的开黑。"),
  item("item.play.basketball_mark", "磨旧篮球贴纸", "玩耍", "球场边随手贴在本子上的贴纸，带着汗水和夕阳。"),
  item("item.play.football_mark", "球场队标", "玩耍", "一次临时组队后留下的小纪念。"),
  item("item.club.flyer", "社团传单", "关系", "大学社团活动的入口线索。"),
  item("item.office.memo", "办公室备忘", "职业", "职场关系里的细碎信息。"),
  item("item.client.card", "客户名片", "职业", "需要花钱维护的弱关系，也可能带来机会。"),
];

const SOCIAL_SCENES = [
  socialScene("family", "家庭", ["teen", "college", "work"], "低压力关系场景，适合稳定培养亲密关系。", ["father", "mother"]),
  socialScene("school", "学校", ["teen"], "少年期核心社交场景，老师和同学会影响学习路线。", ["teacher", "classmate"]),
  socialScene("park", "公园", ["teen", "college", "work"], "轻量社交场景，消耗低，回报偏生活向。", ["neighbour", "runner"]),
  socialScene("campus", "大学校园", ["college"], "大学阶段开放，社团和学长会带来方向选择。", ["club_senior", "study_partner"]),
  socialScene("office", "办公室", ["work"], "职场阶段开放，部分 NPC 会消耗金钱维护关系。", ["colleague", "client"]),
];

const SOCIAL_ACTIONS = [
  socialAction("talk", "交谈", "基础社交行为，稳定提升友好度，并锻炼沟通表达。", 3200, 0, 0, 0, [
    { id: "LIFE.SOCIAL.ROOT.001", amount: 8, exposure: true, threshold: 60 },
    { id: "LIFE.SOCIAL.BASIC.001", amount: 5, exposure: true, threshold: 45 },
  ]),
];

const SOCIAL_NPC_SKILL_EXPOSURE = {
  father: [{ id: "HEALTH.BASIC.ROOT.001", amount: 5, exposure: true, threshold: 50 }],
  mother: [{ id: "HEALTH.BASIC.ROOT.001", amount: 7, exposure: true, threshold: 50 }],
  teacher: [{ id: "HEALTH.BASIC.ROOT.001", amount: 4, exposure: true, threshold: 50 }],
  classmate: [{ id: "HEALTH.BASIC.ROOT.001", amount: 2, exposure: true, threshold: 50 }],
};

const SOCIAL_NPCS = [
  npc("father", "family", "父亲", "可靠后盾", "关系越高，越可能获得零花钱或实际建议。", 8, 0, 12, [{ id: "item.family.advice", qty: 1 }], [
    socialBonus(40, 0.35, [effResource("money", 30)], "父亲给了你一点零花钱。"),
    socialBonus(70, 0.25, [effAttr("discipline", 1)], "父亲的经验让你更有纪律。"),
  ]),
  npc("mother", "family", "母亲", "温柔照顾", "稳定降低压力，也会留下家常点心。", 7, 0, 12, [{ id: "item.family.snack", qty: 1 }], [
    socialBonus(35, 0.4, [effResource("stress", -4), effResource("happiness", 2)], "母亲的关心让你放松下来。"),
  ]),
  npc("teacher", "school", "老师", "课堂引导", "提高友好度后，有机会获得基础数学经验。", 10, 0, 14, [{ id: "item.teacher.note", qty: 1 }], [
    socialBonus(30, 0.45, [effSkill("KNOWLEDGE.MATH.ROOT.001", 16)], "老师额外讲解了一个数学问题。"),
    socialBonus(60, 0.25, [effSkill("KNOWLEDGE.MATH.BASIC.001", 20)], "老师帮你整理了算术训练思路。"),
  ]),
  npc("classmate", "school", "同学", "校园伙伴", "同学关系会带来声望和校园情报。", 8, 0, 13, [{ id: "item.classmate.gossip", qty: 1 }], [
    socialBonus(30, 0.45, [effResource("social", 3)], "同学把你拉进了新的小圈子。"),
  ]),
  npc("neighbour", "park", "邻居", "闲聊对象", "低成本社交对象，适合积累轻关系。", 6, 0, 10, [{ id: "item.park.leaf", qty: 1 }], [
    socialBonus(25, 0.35, [effResource("happiness", 2)], "邻居分享了一件有趣的小事。"),
  ]),
  npc("runner", "park", "晨跑者", "运动熟人", "公园里规律出现的人，关系提高后影响健康路线。", 8, 0, 11, [{ id: "item.park.leaf", qty: 1 }], [
    socialBonus(35, 0.35, [effAttr("fitness", 1)], "晨跑者给了你一点运动建议。"),
  ]),
  npc("club_senior", "campus", "社团学长", "活动组织者", "大学社交入口，带来社团材料和创作机会。", 10, 0, 13, [{ id: "item.club.flyer", qty: 1 }], [
    socialBonus(40, 0.35, [effResource("inspiration", 4)], "学长介绍了一个社团活动。"),
  ]),
  npc("study_partner", "campus", "学习搭子", "共同进步", "适合稳定提升学习类收益。", 9, 0, 13, [{ id: "item.teacher.note", qty: 1 }], [
    socialBonus(35, 0.35, [effResource("knowledge", 4)], "学习搭子帮你复盘了知识点。"),
  ]),
  npc("colleague", "office", "同事", "协作关系", "职场基础关系，能提供备忘信息。", 10, 0, 12, [{ id: "item.office.memo", qty: 1 }], [
    socialBonus(35, 0.35, [effResource("social", 3), effResource("stress", -2)], "同事帮你分担了一点压力。"),
  ]),
  npc("client", "office", "客户", "商务弱关系", "需要花钱维护，但可能带来更多职业机会。", 9, 12, 12, [{ id: "item.client.card", qty: 1 }], [
    socialBonus(45, 0.35, [effResource("money", 60), effResource("reputation", 1)], "客户给你介绍了一个小机会。"),
  ]),
];

const SKILLS = [
  skill("KNOWLEDGE.MATH.ROOT.001", "基础数学", "KNOWLEDGE", "数学", "ROOT", ["SCHOOL", "COLLEGE"], ["intelligence", "discipline"], "提高学习和逻辑类收益。", []),
  skill("KNOWLEDGE.MATH.BASIC.001", "算术", "KNOWLEDGE", "数学", "BASIC", ["SCHOOL"], ["intelligence"], "提升基础计算和金钱判断。", [reqSkill("KNOWLEDGE.MATH.ROOT.001", 2)]),
  skill("KNOWLEDGE.MATH.BASIC.002", "代数入门", "KNOWLEDGE", "数学", "BASIC", ["SCHOOL", "COLLEGE"], ["intelligence"], "理解变量、方程和函数。", [reqSkill("KNOWLEDGE.MATH.BASIC.001", 3)]),
  skill("KNOWLEDGE.MATH.BASIC.003", "几何", "KNOWLEDGE", "数学", "BASIC", ["SCHOOL", "COLLEGE"], ["intelligence", "creativity"], "提升空间关系和图形理解。", [reqSkill("KNOWLEDGE.MATH.ROOT.001", 3)]),
  skill("KNOWLEDGE.MATH.BASIC.004", "三角函数", "KNOWLEDGE", "数学", "BASIC", ["SCHOOL", "COLLEGE"], ["intelligence"], "连接几何、函数和图形学。", [reqSkill("KNOWLEDGE.MATH.BASIC.002", 3)]),
  skill("KNOWLEDGE.MATH.BRANCH.001", "高等数学", "KNOWLEDGE", "数学", "BRANCH", ["COLLEGE"], ["intelligence", "discipline"], "打开概率、线代和科学计算路线。", [reqSkill("KNOWLEDGE.MATH.BASIC.002", 5), reqSkill("KNOWLEDGE.MATH.BASIC.004", 3)]),
  skill("KNOWLEDGE.MATH.BRANCH.002", "概率统计", "KNOWLEDGE", "数学", "BRANCH", ["COLLEGE", "WORKING"], ["intelligence"], "提高数据类事件成功率。", [reqSkill("KNOWLEDGE.MATH.BRANCH.001", 3)]),
  skill("KNOWLEDGE.MATH.BRANCH.003", "线性代数", "KNOWLEDGE", "数学", "BRANCH", ["COLLEGE", "WORKING"], ["intelligence"], "支撑 AI、图形学和建模方向。", [reqSkill("KNOWLEDGE.MATH.BRANCH.001", 5)]),
  skill("KNOWLEDGE.MATH.PRO.001", "数据分析", "KNOWLEDGE", "数学", "PRO", ["COLLEGE", "WORKING"], ["intelligence", "discipline"], "从数据中提取可行动的信息。", [anyOf([reqSkill("KNOWLEDGE.MATH.BRANCH.002", 3), reqEvent("work_data_need_001")]), reqSkill("TECH.PROGRAMMING.BASIC.001", 2)]),
  skill("KNOWLEDGE.MATH.PRO.002", "离散数学", "KNOWLEDGE", "数学", "PRO", ["COLLEGE"], ["intelligence"], "提高算法和系统设计收益。", [reqSkill("KNOWLEDGE.MATH.BASIC.002", 5), reqSkill("TECH.PROGRAMMING.BASIC.001", 3)]),
  skill("KNOWLEDGE.MATH.APPLICATION.001", "生活理财", "KNOWLEDGE", "数学", "APPLICATION", ["FAMILY", "WORKING"], ["intelligence", "discipline"], "降低生活成本，提高储蓄效率。", [reqSkill("KNOWLEDGE.MATH.BASIC.001", 3), reqResource("money", 1000)]),
  skill("KNOWLEDGE.MATH.HIDDEN.001", "量化投资", "KNOWLEDGE", "数学", "HIDDEN", ["WORKING", "ONLINE"], ["intelligence", "discipline"], "高收益高波动的投资路线。", [reqSkill("KNOWLEDGE.MATH.BRANCH.002", 5), reqSkill("TECH.PROGRAMMING.BASIC.001", 4), reqSkill("KNOWLEDGE.MATH.APPLICATION.001", 5), reqEvent("hidden_quant_001")]),

  skill("KNOWLEDGE.LANGUAGE.ROOT.001", "语文基础", "KNOWLEDGE", "语文", "ROOT", ["SCHOOL", "FAMILY"], ["intelligence", "creativity"], "提高阅读理解、语文成绩和表达类收益。", []),
  skill("KNOWLEDGE.LANGUAGE.BASIC.001", "文学阅读", "KNOWLEDGE", "语文", "BASIC", ["SCHOOL", "FAMILY"], ["intelligence", "creativity"], "从小说、散文和古文中积累语感与叙事能力。", [reqSkill("KNOWLEDGE.LANGUAGE.ROOT.001", 2)]),
  skill("KNOWLEDGE.ENGLISH.ROOT.001", "英语听读", "KNOWLEDGE", "英语", "ROOT", ["SCHOOL", "ONLINE"], ["intelligence", "charm"], "提高英语成绩，也会受沟通表达能力影响。", []),
  skill("KNOWLEDGE.SCIENCE.ROOT.001", "理科基础", "KNOWLEDGE", "理科", "ROOT", ["SCHOOL"], ["intelligence", "discipline"], "连接物理、化学、生物和数学建模。", []),
  skill("KNOWLEDGE.SCIENCE.BASIC.001", "物理直觉", "KNOWLEDGE", "理科", "BASIC", ["SCHOOL"], ["intelligence", "discipline"], "理解力、运动、能量和模型化思考。", [reqSkill("KNOWLEDGE.SCIENCE.ROOT.001", 1), reqSkill("KNOWLEDGE.MATH.ROOT.001", 2)]),
  skill("KNOWLEDGE.SCIENCE.BASIC.002", "化学实验", "KNOWLEDGE", "理科", "BASIC", ["SCHOOL"], ["intelligence", "discipline"], "把物质变化、实验安全和观察记录连起来。", [reqSkill("KNOWLEDGE.SCIENCE.ROOT.001", 1)]),
  skill("KNOWLEDGE.SCIENCE.BASIC.003", "生命科学", "KNOWLEDGE", "理科", "BASIC", ["SCHOOL", "COMMUNITY"], ["intelligence", "stability"], "理解身体、生态和生物系统。", [reqSkill("KNOWLEDGE.SCIENCE.ROOT.001", 2)]),
  skill("KNOWLEDGE.HUMANITIES.ROOT.001", "人文通识", "KNOWLEDGE", "文科", "ROOT", ["SCHOOL", "FAMILY"], ["intelligence", "stability"], "支撑政治、历史、地理和社会理解。", []),
  skill("KNOWLEDGE.HUMANITIES.BASIC.001", "历史脉络", "KNOWLEDGE", "文科", "BASIC", ["SCHOOL", "FAMILY"], ["intelligence"], "理解事件、人物和时代之间的因果关系。", [reqSkill("KNOWLEDGE.HUMANITIES.ROOT.001", 2)]),
  skill("KNOWLEDGE.HUMANITIES.BASIC.002", "政治常识", "KNOWLEDGE", "文科", "BASIC", ["SCHOOL"], ["intelligence", "charm"], "理解规则、公共议题和价值判断。", [reqSkill("KNOWLEDGE.HUMANITIES.ROOT.001", 2)]),
  skill("KNOWLEDGE.HUMANITIES.BASIC.003", "地理观察", "KNOWLEDGE", "文科", "BASIC", ["SCHOOL", "COMMUNITY"], ["intelligence", "creativity"], "理解空间、环境和区域变化。", [reqSkill("KNOWLEDGE.HUMANITIES.ROOT.001", 2)]),

  skill("TECH.COMPUTER.ROOT.001", "电脑基础", "TECH", "科技", "ROOT", ["SCHOOL", "ONLINE"], ["intelligence"], "从网吧上网和实际接触电脑开始，开启科技类行动和网络场景。", []),
  skill("TECH.PROGRAMMING.BASIC.001", "编程入门", "TECH", "编程", "BASIC", ["SCHOOL", "COLLEGE", "ONLINE"], ["intelligence", "discipline"], "学会用程序拆解问题。", [reqSkill("TECH.COMPUTER.ROOT.001", 2), reqSkill("KNOWLEDGE.MATH.BASIC.002", 2)]),
  skill("TECH.PROGRAMMING.BRANCH.001", "数据结构", "TECH", "编程", "BRANCH", ["COLLEGE", "ONLINE"], ["intelligence"], "提高程序开发效率。", [reqSkill("TECH.PROGRAMMING.BASIC.001", 4)]),
  skill("TECH.PROGRAMMING.BRANCH.002", "Web 开发", "TECH", "编程", "BRANCH", ["COLLEGE", "WORKING", "ONLINE"], ["intelligence", "creativity"], "快速获得兼职和职场机会。", [reqSkill("TECH.PROGRAMMING.BASIC.001", 3)]),
  skill("TECH.PROGRAMMING.BRANCH.003", "游戏开发", "TECH", "编程", "BRANCH", ["COLLEGE", "STUDIO", "ONLINE"], ["intelligence", "creativity"], "开启游戏项目和独立游戏路线。", [reqSkill("TECH.PROGRAMMING.BASIC.001", 4), reqSkill("ART.CREATIVE.APPLICATION.002", 2)]),
  skill("TECH.PROGRAMMING.PRO.001", "算法设计", "TECH", "编程", "PRO", ["COLLEGE", "WORKING"], ["intelligence", "discipline"], "高级程序技能。", [reqSkill("TECH.PROGRAMMING.BRANCH.001", 5), reqSkill("KNOWLEDGE.MATH.PRO.002", 3)]),
  skill("TECH.PROGRAMMING.PRO.002", "后端开发", "TECH", "编程", "PRO", ["WORKING", "ONLINE"], ["intelligence", "discipline"], "提高程序员收入和稳定性。", [reqSkill("TECH.PROGRAMMING.BASIC.001", 5), reqSkill("TECH.PROGRAMMING.BRANCH.001", 3)]),
  skill("TECH.PROGRAMMING.PRO.003", "AI 入门", "TECH", "编程", "PRO", ["COLLEGE", "WORKING", "ONLINE"], ["intelligence"], "开启 AI 项目和研究事件。", [reqSkill("KNOWLEDGE.MATH.BRANCH.003", 3), reqSkill("TECH.PROGRAMMING.BASIC.001", 4)]),
  skill("TECH.TOOL.BASIC.001", "办公软件", "TECH", "工具", "BASIC", ["COLLEGE", "WORKING"], ["discipline"], "提高普通职员和数据工作效率。", [reqSkill("TECH.COMPUTER.ROOT.001", 2)]),
  skill("TECH.TOOL.APPLICATION.001", "自动化工具", "TECH", "工具", "APPLICATION", ["WORKING", "ONLINE"], ["intelligence", "discipline"], "降低重复工作压力。", [reqSkill("TECH.TOOL.BASIC.001", 4), reqSkill("TECH.PROGRAMMING.BASIC.001", 2)]),

  skill("ART.CREATIVE.ROOT.001", "基础艺术感知", "ART", "艺术", "ROOT", ["FAMILY", "SCHOOL", "STUDIO"], ["creativity"], "开启艺术类技能和灵感收益。", []),
  skill("ART.CREATIVE.BASIC.001", "色彩感知", "ART", "艺术", "BASIC", ["SCHOOL", "STUDIO"], ["creativity"], "提升绘画和设计收益。", [reqSkill("ART.CREATIVE.ROOT.001", 1)]),
  skill("ART.CREATIVE.BASIC.002", "构图基础", "ART", "艺术", "BASIC", ["SCHOOL", "STUDIO"], ["creativity", "intelligence"], "提高视觉作品质量。", [reqSkill("ART.CREATIVE.ROOT.001", 1)]),
  skill("ART.CREATIVE.BASIC.003", "审美直觉", "ART", "艺术", "BASIC", ["SCHOOL", "STUDIO"], ["creativity"], "提高艺术事件触发权重。", [reqSkill("ART.CREATIVE.ROOT.001", 2)]),
  skill("ART.CREATIVE.BRANCH.001", "素描", "ART", "艺术", "BRANCH", ["SCHOOL", "STUDIO"], ["creativity", "discipline"], "解锁数字绘画和设计路线。", [reqSkill("ART.CREATIVE.BASIC.001", 2)]),
  skill("ART.CREATIVE.BRANCH.002", "数字绘画", "ART", "艺术", "BRANCH", ["COLLEGE", "STUDIO", "ONLINE"], ["creativity", "discipline"], "提高创作收益，开启接稿事件。", [reqSkill("ART.CREATIVE.BRANCH.001", 3), reqSkill("TECH.COMPUTER.ROOT.001", 2)]),
  skill("ART.CREATIVE.BRANCH.003", "平面设计", "ART", "艺术", "BRANCH", ["COLLEGE", "WORKING", "STUDIO"], ["creativity"], "解锁设计师职业资格。", [reqSkill("ART.CREATIVE.BASIC.002", 3), reqSkill("ART.CREATIVE.BRANCH.002", 2)]),
  skill("ART.CREATIVE.APPLICATION.001", "UI 设计", "ART", "艺术", "APPLICATION", ["WORKING", "STUDIO"], ["creativity", "intelligence"], "提高互联网职业机会。", [reqSkill("ART.CREATIVE.BRANCH.003", 3), reqSkill("TECH.PROGRAMMING.BRANCH.002", 2)]),
  skill("ART.CREATIVE.APPLICATION.002", "游戏地形编辑", "ART", "艺术", "APPLICATION", ["COLLEGE", "STUDIO", "ONLINE"], ["creativity", "intelligence"], "创造游戏地形与空间体验。", [anyOf([reqSkill("ART.CREATIVE.BRANCH.002", 2), reqSkill("KNOWLEDGE.MATH.BASIC.003", 3)]), reqEvent("college_game_editor_001")]),
  skill("ART.CREATIVE.PRO.001", "关卡设计", "ART", "艺术", "PRO", ["COLLEGE", "STUDIO", "WORKING"], ["creativity", "intelligence"], "解锁游戏策划和关卡策划事件。", [reqSkill("ART.CREATIVE.APPLICATION.002", 3), reqSkill("KNOWLEDGE.MATH.BASIC.003", 3)]),
  skill("ART.MEDIA.BASIC.001", "摄影", "ART", "媒体", "BASIC", ["COLLEGE", "COMMUNITY", "ONLINE"], ["creativity"], "提高内容创作和记录类事件收益。", [anyOf([reqSkill("ART.CREATIVE.BASIC.002", 2), reqEvent("college_volunteer_001")])]),
  skill("ART.MEDIA.BRANCH.001", "剪辑", "ART", "媒体", "BRANCH", ["ONLINE", "STUDIO"], ["creativity", "discipline"], "开启视频作品和平台创作者路线。", [reqSkill("ART.MEDIA.BASIC.001", 3), reqSkill("TECH.COMPUTER.ROOT.001", 3)]),
  skill("ART.MUSIC.BASIC.001", "乐理基础", "ART", "音乐", "BASIC", ["SCHOOL", "COLLEGE", "STUDIO"], ["creativity", "intelligence"], "理解节奏、音程和旋律结构。", [reqSkill("ART.CREATIVE.BASIC.003", 2)]),
  skill("ART.MUSIC.BRANCH.001", "乐器演奏", "ART", "音乐", "BRANCH", ["SCHOOL", "COLLEGE", "STUDIO"], ["creativity", "discipline"], "提升音乐创作和舞台事件收益。", [reqSkill("ART.MUSIC.BASIC.001", 3)]),

  skill("LIFE.SOCIAL.ROOT.001", "沟通表达", "LIFE", "社交", "ROOT", ["FAMILY", "SCHOOL", "COLLEGE", "WORKING"], ["charm", "stability"], "提高社交和职业事件成功率。", []),
  skill("LIFE.SOCIAL.BASIC.001", "倾听", "LIFE", "社交", "BASIC", ["FAMILY", "SCHOOL", "WORKING"], ["charm", "stability"], "降低冲突事件损失。", [reqSkill("LIFE.SOCIAL.ROOT.001", 2)]),
  skill("LIFE.SOCIAL.BASIC.002", "写作", "LIFE", "社交", "BASIC", ["SCHOOL", "COLLEGE", "ONLINE"], ["intelligence", "creativity"], "提高创作、策划和汇报收益。", [anyOf([reqEvent("school_reading_001"), reqSkill("LIFE.SOCIAL.ROOT.001", 3)])]),
  skill("LIFE.SOCIAL.BRANCH.001", "主持表达", "LIFE", "社交", "BRANCH", ["COLLEGE", "WORKING", "ONLINE"], ["charm"], "提高演讲、直播和提案事件成功率。", [reqSkill("LIFE.SOCIAL.ROOT.001", 5), reqAttr("charm", 50)]),
  skill("LIFE.SOCIAL.BRANCH.002", "人脉经营", "LIFE", "社交", "BRANCH", ["COLLEGE", "WORKING", "COMMUNITY"], ["charm", "stability"], "提高职业机会和合作事件权重。", [reqSkill("LIFE.SOCIAL.ROOT.001", 4), reqResource("social", 30)]),
  skill("LIFE.SOCIAL.APPLICATION.001", "销售沟通", "LIFE", "社交", "APPLICATION", ["WORKING", "ONLINE"], ["charm"], "提高收入类机会和客户事件成功率。", [reqSkill("LIFE.SOCIAL.ROOT.001", 4), reqAttr("charm", 45)]),
  skill("LIFE.MIND.PASSIVE.001", "时间管理", "LIFE", "心智", "PASSIVE", ["SCHOOL", "COLLEGE", "WORKING"], ["discipline"], "提高挂机训练效率，降低拖延。", [anyOf([reqEvent("school_pressure_001"), reqAttr("discipline", 45)])]),
  skill("LIFE.MIND.PASSIVE.002", "毅力", "LIFE", "心智", "PASSIVE", ["SCHOOL", "COLLEGE", "WORKING"], ["discipline", "stability"], "提高长期挂机收益稳定性。", [reqAchievement("achievement_streak_001")]),
  skill("LIFE.MIND.BASIC.001", "情绪管理", "LIFE", "心智", "BASIC", ["SCHOOL", "COLLEGE", "WORKING"], ["stability"], "降低压力收益惩罚。", [reqEvent("state_high_stress_001")]),
  skill("LIFE.PLAY.ROOT.001", "户外玩耍", "LIFE", "玩耍", "ROOT", ["FAMILY", "SCHOOL", "COMMUNITY"], ["fitness", "creativity", "stability"], "在街巷、操场和河边消磨时间，恢复幸福感，也留下少年期记忆。", []),
  skill("LIFE.PLAY.BASIC.001", "河边抓鱼", "LIFE", "玩耍", "BASIC", ["COMMUNITY"], ["fitness", "stability"], "在河岸边观察水流、耐心等待，偶尔带回一点小收获。", []),
  skill("LIFE.PLAY.BASIC.002", "篮球", "LIFE", "玩耍", "BASIC", ["SCHOOL", "COMMUNITY"], ["fitness", "charm"], "放学后的球场运动，提升体能，也让同伴关系更自然。", []),
  skill("LIFE.PLAY.BASIC.003", "足球", "LIFE", "玩耍", "BASIC", ["SCHOOL", "COMMUNITY"], ["fitness", "charm"], "临时组队、奔跑和配合，带来体能与团队感。", []),
  skill("LIFE.PLAY.BASIC.004", "网吧打游戏", "LIFE", "电玩", "BASIC", ["ONLINE"], ["intelligence", "creativity", "stability"], "在网吧接触游戏和电脑，花一点零花钱换来放松与新鲜体验。", []),
  skill("LIFE.PLAY.BRANCH.001", "街机手感", "LIFE", "电玩", "BRANCH", ["ONLINE", "COMMUNITY"], ["intelligence", "creativity"], "从重复挑战和即时反馈里练出操作手感。", [reqSkill("LIFE.PLAY.BASIC.004", 2)]),
  skill("LIFE.PLAY.APPLICATION.001", "游戏理解", "LIFE", "电玩", "APPLICATION", ["ONLINE", "STUDIO"], ["intelligence", "creativity"], "理解关卡、节奏、反馈和玩家动机，为未来游戏路线埋下种子。", [reqSkill("LIFE.PLAY.BASIC.004", 3), reqSkill("TECH.COMPUTER.ROOT.001", 2)]),
  skill("LIFE.DAILY.BASIC.001", "烹饪", "LIFE", "生活", "BASIC", ["FAMILY", "COMMUNITY"], ["discipline", "creativity"], "降低生活成本，提高健康恢复。", [reqEvent("family_cooking_001")]),
  skill("LIFE.DAILY.BASIC.002", "收纳整理", "LIFE", "生活", "BASIC", ["FAMILY", "COMMUNITY"], ["discipline"], "提高长期训练稳定性。", []),
  skill("LIFE.EMERGENCY.HIDDEN.001", "急救", "LIFE", "生活", "HIDDEN", ["COMMUNITY", "WORKING"], ["stability"], "降低事故损失，开启公益事件。", [reqEvent("state_accident_001")]),

  skill("HEALTH.BASIC.ROOT.001", "健康常识", "HEALTH", "健康", "ROOT", ["FAMILY", "SCHOOL", "COMMUNITY"], ["stability"], "降低疾病事件权重。", []),
  skill("HEALTH.SPORT.BASIC.001", "运动习惯", "HEALTH", "运动", "BASIC", ["SCHOOL", "COMMUNITY"], ["fitness", "discipline"], "提高健康、体能、纪律。", [anyOf([reqSkill("LIFE.PLAY.BASIC.002", 2), reqSkill("LIFE.PLAY.BASIC.003", 2), reqEvent("sport_invite_001")])]),
  skill("HEALTH.SPORT.BRANCH.001", "力量训练", "HEALTH", "运动", "BRANCH", ["COMMUNITY"], ["fitness", "discipline"], "提高体能上限和健康恢复。", [reqSkill("HEALTH.SPORT.BASIC.001", 3), reqAttr("fitness", 45)]),
  skill("HEALTH.SPORT.BRANCH.002", "有氧训练", "HEALTH", "运动", "BRANCH", ["COMMUNITY"], ["fitness", "stability"], "降低压力，提升精力恢复。", [reqSkill("HEALTH.SPORT.BASIC.001", 3)]),
  skill("HEALTH.LIFE.APPLICATION.001", "营养管理", "HEALTH", "健康", "APPLICATION", ["FAMILY", "COMMUNITY"], ["intelligence", "discipline"], "提高健康恢复，降低生活病事件。", [reqSkill("LIFE.DAILY.BASIC.001", 4), reqSkill("HEALTH.BASIC.ROOT.001", 4)]),
  skill("HEALTH.MIND.APPLICATION.001", "睡眠管理", "HEALTH", "健康", "APPLICATION", ["FAMILY", "COMMUNITY"], ["stability", "discipline"], "提高离线收益质量，降低深夜惩罚。", [anyOf([reqEvent("state_low_energy_001"), reqSkill("HEALTH.BASIC.ROOT.001", 3)])]),

  skill("CAREER.BASIC.ROOT.001", "职业素养", "CAREER", "通用", "ROOT", ["COLLEGE", "WORKING"], ["discipline", "charm"], "提高入职和工作事件成功率。", [reqStage("college")]),
  skill("CAREER.BASIC.BASIC.001", "简历面试", "CAREER", "通用", "BASIC", ["COLLEGE", "WORKING"], ["charm", "discipline"], "提高入职成功率。", [reqSkill("CAREER.BASIC.ROOT.001", 2)]),
  skill("CAREER.BASIC.BASIC.002", "汇报表达", "CAREER", "通用", "BASIC", ["WORKING"], ["charm", "discipline"], "提高职场评价和晋升事件成功率。", [reqSkill("LIFE.SOCIAL.ROOT.001", 3), reqSkill("TECH.TOOL.BASIC.001", 2)]),
  skill("CAREER.MANAGEMENT.BRANCH.001", "项目管理", "CAREER", "管理", "BRANCH", ["WORKING"], ["discipline", "charm"], "提高团队协作和复杂项目收益。", [reqSkill("LIFE.MIND.PASSIVE.001", 4), reqSkill("LIFE.SOCIAL.ROOT.001", 4)]),
  skill("CAREER.MANAGEMENT.PRO.001", "团队管理", "CAREER", "管理", "PRO", ["WORKING"], ["charm", "stability"], "解锁管理岗和领导力事件。", [reqSkill("CAREER.MANAGEMENT.BRANCH.001", 5), reqSkill("LIFE.SOCIAL.BRANCH.002", 3)]),
  skill("CAREER.BUSINESS.APPLICATION.001", "产品设计", "CAREER", "商业", "APPLICATION", ["WORKING", "ONLINE"], ["creativity", "charm"], "解锁产品经理和创业事件。", [anyOf([reqSkill("ART.CREATIVE.APPLICATION.001", 2), reqSkill("TECH.PROGRAMMING.BRANCH.002", 3)]), reqSkill("LIFE.SOCIAL.APPLICATION.001", 2)]),
  skill("CAREER.BUSINESS.PRO.001", "创业", "CAREER", "商业", "PRO", ["WORKING", "ONLINE"], ["discipline", "charm"], "高风险高收益路线。", [reqSkill("CAREER.BUSINESS.APPLICATION.001", 4), reqSkill("LIFE.SOCIAL.APPLICATION.001", 4), reqSkill("LIFE.SOCIAL.BRANCH.002", 4)]),
  skill("CAREER.CREATOR.APPLICATION.001", "内容创作", "CAREER", "创作", "APPLICATION", ["ONLINE", "STUDIO"], ["creativity", "charm"], "开启平台创作者事件和声望收益。", [anyOf([reqSkill("LIFE.SOCIAL.BASIC.002", 3), reqSkill("ART.MEDIA.BASIC.001", 3), reqSkill("ART.CREATIVE.BRANCH.002", 3)])]),
];

const BOOSTS = [
  boost("KNOWLEDGE.MATH.ROOT.001", "ART.MUSIC.BASIC.001", [[3, 0.05], [5, 0.1], [8, 0.15], [10, 0.2]], "比例、节奏、模式识别迁移"),
  boost("KNOWLEDGE.MATH.ROOT.001", "KNOWLEDGE.SCIENCE.ROOT.001", [[3, 0.05], [5, 0.1], [8, 0.15], [10, 0.2]], "数学建模能力迁移到理科学习"),
  boost("KNOWLEDGE.MATH.BASIC.002", "KNOWLEDGE.SCIENCE.BASIC.001", [[3, 0.05], [5, 0.1], [8, 0.15]], "方程和函数理解物理模型"),
  boost("TECH.COMPUTER.ROOT.001", "KNOWLEDGE.MATH.BASIC.002", [[3, 0.05], [5, 0.1], [8, 0.15]], "工具化思维帮助代数训练"),
  boost("KNOWLEDGE.LANGUAGE.ROOT.001", "KNOWLEDGE.ENGLISH.ROOT.001", [[3, 0.05], [5, 0.1], [8, 0.15]], "语感和阅读策略迁移到英语"),
  boost("KNOWLEDGE.LANGUAGE.BASIC.001", "LIFE.SOCIAL.BASIC.002", [[3, 0.05], [5, 0.1], [8, 0.15]], "阅读积累提升写作表达"),
  boost("KNOWLEDGE.LANGUAGE.BASIC.001", "KNOWLEDGE.HUMANITIES.BASIC.001", [[3, 0.05], [5, 0.1], [8, 0.15]], "文本阅读帮助理解历史叙事"),
  boost("KNOWLEDGE.HUMANITIES.BASIC.001", "KNOWLEDGE.LANGUAGE.BASIC.001", [[3, 0.05], [5, 0.1], [8, 0.15]], "历史背景反哺文学理解"),
  boost("LIFE.SOCIAL.ROOT.001", "KNOWLEDGE.ENGLISH.ROOT.001", [[3, 0.05], [5, 0.1], [8, 0.15]], "交流意愿和表达信心迁移到语言学习"),
  boost("KNOWLEDGE.MATH.BASIC.002", "TECH.PROGRAMMING.BASIC.001", [[3, 0.05], [5, 0.1], [8, 0.15]], "抽象变量和逻辑表达迁移"),
  boost("KNOWLEDGE.MATH.BRANCH.001", "KNOWLEDGE.MATH.PRO.001", [[3, 0.05], [5, 0.1], [8, 0.15], [10, 0.2]], "函数、模型和变化率理解迁移"),
  boost("KNOWLEDGE.MATH.BRANCH.003", "TECH.PROGRAMMING.PRO.003", [[3, 0.05], [5, 0.1], [8, 0.15], [10, 0.2]], "向量、矩阵和模型思维迁移"),
  boost("KNOWLEDGE.MATH.BASIC.003", "ART.CREATIVE.BASIC.002", [[3, 0.05], [5, 0.1], [8, 0.15]], "空间关系和结构感迁移"),
  boost("KNOWLEDGE.MATH.BASIC.003", "ART.CREATIVE.PRO.001", [[3, 0.05], [5, 0.1], [8, 0.15]], "空间布局、路线和形体理解迁移"),
  boost("ART.CREATIVE.BASIC.002", "ART.MEDIA.BASIC.001", [[3, 0.05], [5, 0.1], [8, 0.15]], "画面组织能力迁移"),
  boost("ART.CREATIVE.BASIC.003", "ART.CREATIVE.APPLICATION.001", [[3, 0.05], [5, 0.1], [8, 0.15]], "视觉判断和风格敏感度迁移"),
  boost("ART.CREATIVE.BRANCH.001", "ART.CREATIVE.BRANCH.002", [[3, 0.05], [5, 0.1], [8, 0.15]], "造型和观察能力迁移"),
  boost("LIFE.SOCIAL.BASIC.002", "LIFE.SOCIAL.BRANCH.001", [[3, 0.05], [5, 0.1], [8, 0.15]], "语言组织能力迁移"),
  boost("LIFE.SOCIAL.BASIC.002", "ART.CREATIVE.PRO.001", [[3, 0.05], [5, 0.1], [8, 0.15]], "叙事、规则说明和表达结构迁移"),
  boost("LIFE.SOCIAL.ROOT.001", "LIFE.SOCIAL.APPLICATION.001", [[3, 0.05], [5, 0.1], [8, 0.15]], "说服、倾听和反馈能力迁移"),
  boost("LIFE.SOCIAL.BASIC.001", "CAREER.MANAGEMENT.PRO.001", [[3, 0.05], [5, 0.1], [8, 0.15]], "理解他人需求有助于管理"),
  boost("LIFE.PLAY.BASIC.001", "HEALTH.BASIC.ROOT.001", [[3, 0.05], [5, 0.1], [8, 0.15]], "在自然里玩耍让身体常识更具体"),
  boost("LIFE.PLAY.BASIC.002", "HEALTH.SPORT.BASIC.001", [[3, 0.05], [5, 0.1], [8, 0.15]], "篮球训练带来运动习惯迁移"),
  boost("LIFE.PLAY.BASIC.003", "LIFE.SOCIAL.ROOT.001", [[3, 0.05], [5, 0.1], [8, 0.15]], "足球配合让沟通更自然"),
  boost("LIFE.PLAY.BASIC.004", "TECH.COMPUTER.ROOT.001", [[3, 0.05], [5, 0.1], [8, 0.15]], "键鼠熟悉度迁移到电脑基础"),
  boost("LIFE.PLAY.APPLICATION.001", "TECH.PROGRAMMING.BRANCH.003", [[3, 0.05], [5, 0.1], [8, 0.15], [10, 0.2]], "玩过的关卡和反馈迁移到游戏开发"),
  boost("LIFE.PLAY.APPLICATION.001", "ART.CREATIVE.PRO.001", [[3, 0.05], [5, 0.1], [8, 0.15]], "游戏体验沉淀为关卡设计直觉"),
  boost("LIFE.MIND.PASSIVE.001", "LIFE.MIND.PASSIVE.002", [[3, 0.05], [5, 0.1], [8, 0.15]], "计划能力迁移为长期坚持"),
  boost("HEALTH.SPORT.BASIC.001", "HEALTH.MIND.APPLICATION.001", [[3, 0.05], [5, 0.1], [8, 0.15]], "身体状态改善睡眠习惯建立"),
  boost("LIFE.DAILY.BASIC.001", "HEALTH.LIFE.APPLICATION.001", [[3, 0.05], [5, 0.1], [8, 0.15]], "食材和饮食经验迁移"),
  boost("TECH.PROGRAMMING.BASIC.001", "TECH.TOOL.APPLICATION.001", [[3, 0.05], [5, 0.1], [8, 0.15]], "任务拆解和脚本思维迁移"),
  boost("TECH.TOOL.BASIC.001", "KNOWLEDGE.MATH.PRO.001", [[3, 0.05], [5, 0.1], [8, 0.15]], "表格、整理和报表经验迁移"),
  boost("CAREER.MANAGEMENT.BRANCH.001", "CAREER.BUSINESS.PRO.001", [[3, 0.05], [5, 0.1], [8, 0.15]], "资源协调和风险推进能力迁移"),
  boost("CAREER.CREATOR.APPLICATION.001", "LIFE.SOCIAL.BRANCH.001", [[3, 0.05], [5, 0.1], [8, 0.15]], "面向受众表达的经验迁移"),
];

const CAREERS = [
  career("none", "学生/自由探索", "当前阶段以成长为主。", [], 0, 0, []),
  career("clerk", "普通职员", "稳定收入，适合积累通用职业技能。", [reqStage("work"), reqSkill("CAREER.BASIC.ROOT.001", 2), reqSkill("TECH.TOOL.BASIC.001", 2)], 82, 10, ["CAREER.BASIC.BASIC.002", "LIFE.MIND.PASSIVE.001"]),
  career("programmer", "程序员", "科技线核心职业，收入成长快。", [reqStage("work"), reqSkill("TECH.PROGRAMMING.BASIC.001", 4), reqSkill("TECH.PROGRAMMING.BRANCH.001", 2)], 112, 16, ["TECH.PROGRAMMING.PRO.002", "TECH.PROGRAMMING.PRO.001"]),
  career("data_analyst", "数据分析师", "数学和办公工具结合的职业路线。", [reqStage("work"), reqSkill("KNOWLEDGE.MATH.PRO.001", 3), reqSkill("TECH.TOOL.BASIC.001", 3)], 106, 14, ["KNOWLEDGE.MATH.PRO.001", "TECH.TOOL.APPLICATION.001"]),
  career("designer", "设计师", "艺术线的职业落点。", [reqStage("work"), reqSkill("ART.CREATIVE.BRANCH.003", 3), reqSkill("ART.CREATIVE.BRANCH.002", 3)], 96, 13, ["ART.CREATIVE.APPLICATION.001", "ART.CREATIVE.BASIC.003"]),
  career("game_planner", "游戏策划", "跨艺术、写作和数据的复合路线。", [reqStage("work"), reqSkill("LIFE.SOCIAL.BASIC.002", 3), reqSkill("ART.CREATIVE.PRO.001", 2), reqSkill("LIFE.SOCIAL.ROOT.001", 3)], 102, 15, ["ART.CREATIVE.PRO.001", "KNOWLEDGE.MATH.PRO.001"]),
  career("creator", "独立创作者", "以作品换取声望和机会。", [reqStage("work"), reqSkill("CAREER.CREATOR.APPLICATION.001", 3), reqSkill("LIFE.MIND.PASSIVE.002", 2)], 88, 11, ["CAREER.CREATOR.APPLICATION.001", "LIFE.SOCIAL.BRANCH.001"]),
  career("pm", "产品经理", "整合设计、沟通和数据。", [reqStage("work"), reqSkill("CAREER.BUSINESS.APPLICATION.001", 3), reqSkill("LIFE.SOCIAL.ROOT.001", 4)], 118, 17, ["CAREER.BUSINESS.APPLICATION.001", "KNOWLEDGE.MATH.PRO.001"]),
  career("entrepreneur", "创业者", "高风险高回报，依赖人脉和执行。", [reqStage("work"), reqSkill("CAREER.BUSINESS.PRO.001", 1), reqSkill("LIFE.SOCIAL.APPLICATION.001", 4), reqSkill("LIFE.SOCIAL.BRANCH.002", 4)], 140, 24, ["CAREER.BUSINESS.PRO.001", "CAREER.MANAGEMENT.BRANCH.001"]),
];

const LEGACY_EVENTS = [
  event("social_father_allowance_001", "父亲的额外零花钱", "关系熟起来后，父亲开始更愿意用实际方式支持你。", ["social_relation"], ["teen", "college", "work"], [reqTag("friendship_father_40")], 100, 90, false, [
    choice("收下并记账", [effResource("money", 60), effAttr("discipline", 1)], "你获得了零花钱，也更认真地规划怎么用。"),
    choice("聊聊他的经验", [effSkill("LIFE.MIND.PASSIVE.001", 70), effResource("happiness", 2)], "你听到了一些关于长期坚持的朴素经验。"),
  ]),
  event("social_teacher_guidance_001", "老师的额外讲解", "你和老师的关系足够熟悉，对方愿意多花一点时间帮你理清问题。", ["social_relation"], ["teen"], [reqTag("friendship_teacher_30")], 100, 75, false, [
    choice("请教数学", [effSkill("KNOWLEDGE.MATH.ROOT.001", 90), effResource("knowledge", 6)], "几个卡住的概念突然顺了。"),
    choice("请教学习方法", [effSkill("LIFE.MIND.PASSIVE.001", 60), effAttr("discipline", 1)], "你学到了一种更稳的复习节奏。"),
  ]),
  event("social_classmate_circle_001", "同学的小圈子", "同学开始把你拉进更多课间聊天和活动里。", ["social_relation"], ["teen"], [reqTag("friendship_classmate_30")], 75, 60, false, [
    choice("积极加入", [effResource("social", 8), effSkill("LIFE.SOCIAL.ROOT.001", 50)], "你在轻松的互动里更自然了。"),
    choice("保持距离", [effResource("stress", -4), effResource("knowledge", 3)], "你保留了自己的节奏。"),
  ]),
  event("school_pc_access_001", "第一次认真研究电脑", "几次网吧经历后，你开始注意游戏之外的系统、文件和网络。", ["weekly_check"], ["teen"], [reqSkill("LIFE.PLAY.BASIC.004", 1)], 32, 0, true, [
    choice("深入研究", [effSkillExposure("TECH.COMPUTER.ROOT.001", 40, 60), effResource("knowledge", 8)], "你开始主动理解电脑是怎么工作的。"),
    choice("只是娱乐", [effResource("happiness", 6), effResource("inspiration", 4)], "你获得了一段轻松的放松时间。"),
  ]),
  event("school_math_interest_001", "数学老师的额外题", "老师递来一张额外习题，题目比课堂内容更绕。", ["weekly_check"], ["teen"], [reqSkill("KNOWLEDGE.MATH.ROOT.001", 2), reqAttr("energy", 30)], 30, 60, false, [
    choice("接受挑战", [effSkill("KNOWLEDGE.MATH.ROOT.001", 70), effAttr("discipline", 2), effResource("stress", 5)], "你开始享受抽丝剥茧的感觉。"),
    choice("先稳住课堂", [effResource("stress", -4), effResource("knowledge", 4)], "你把基础打得更扎实。"),
  ]),
  event("school_art_club_001", "美术社团邀请", "社团海报上的色块和线条让你停下脚步。", ["weekly_check"], ["teen"], [reqSkill("ART.CREATIVE.ROOT.001", 2), reqAttr("creativity", 35)], 28, 90, false, [
    choice("加入社团", [effSkill("ART.CREATIVE.BASIC.001", 70), effSkill("ART.CREATIVE.BRANCH.001", 35), effResource("inspiration", 4)], "你拥有了固定练习的地方。"),
    choice("先观望", [effResource("inspiration", 8), effResource("stress", -2)], "灵感先在脑子里慢慢发酵。"),
  ]),
  event("school_reading_001", "图书馆角落", "你在书架角落发现了一本很对胃口的书。", ["weekly_check"], ["teen"], [reqAttr("energy", 25)], 25, 45, false, [
    choice("借书阅读", [effSkill("LIFE.SOCIAL.BASIC.002", 60), effResource("knowledge", 8)], "文字开始成为你的工具。"),
    choice("去运动", [effSkill("HEALTH.SPORT.BASIC.001", 45), effAttr("fitness", 2)], "身体先热起来。"),
  ]),
  event("school_pressure_001", "考前焦虑", "复习计划堆在桌上，你开始意识到时间不够用。", ["resource_state"], ["teen"], [reqResource("stress", 60)], 60, 90, false, [
    choice("制定计划", [effSkill("LIFE.MIND.PASSIVE.001", 80), effResource("stress", -10), effAttr("discipline", 2)], "你把混乱拆成了一个个小格子。"),
    choice("硬扛过去", [effResource("knowledge", 14), effAttr("health", -4), effResource("stress", 5)], "短期有效，但身体记下了账。"),
  ]),
  event("family_cooking_001", "独自准备晚餐", "家里临时没人做饭，厨房第一次像一个可探索的系统。", ["weekly_check"], ["teen"], [reqAttr("energy", 20)], 18, 60, false, [
    choice("认真学做", [effSkill("LIFE.DAILY.BASIC.001", 80), effAttr("health", 1)], "你学会了照顾自己的入口。"),
    choice("随便应付", [effResource("money", 10), effResource("happiness", -1)], "省事，但有点凑合。"),
  ]),
  event("sport_invite_001", "操场上的邀请", "同学喊你一起去跑几圈。", ["weekly_check"], ["teen"], [reqAttr("health", 40)], 24, 45, false, [
    choice("一起运动", [effSkill("HEALTH.SPORT.BASIC.001", 70), effAttr("fitness", 2), effResource("stress", -4)], "汗水把压力带走了一些。"),
    choice("回教室学习", [effResource("knowledge", 8), effSkill("KNOWLEDGE.MATH.ROOT.001", 25)], "你把注意力留给了习题。"),
  ]),
  event("school_court_after_class_001", "放学后的球场", "夕阳落在篮板和球门上，几个人随口一喊，就凑成了一场。", ["weekly_check"], ["teen"], [reqSkill("LIFE.PLAY.ROOT.001", 1), reqAttr("energy", 20)], 34, 45, false, [
    choice("打篮球", [effSkill("LIFE.PLAY.BASIC.002", 75), effSkill("HEALTH.SPORT.BASIC.001", 35), effAttr("fitness", 2), effResource("happiness", 4), effResource("stamina", -18), effItem("item.play.basketball_mark", 1)], "投进一个球的声音比晚自习铃声更清脆。"),
    choice("踢足球", [effSkill("LIFE.PLAY.BASIC.003", 75), effSkill("LIFE.SOCIAL.ROOT.001", 35), effAttr("fitness", 2), effResource("happiness", 4), effResource("stamina", -18), effItem("item.play.football_mark", 1)], "临时队友之间的配合让人开心。"),
  ]),
  event("school_riverside_fishing_001", "河边抓鱼", "放学路上有人提议绕去河边，水草下面偶尔闪过银色的小影子。", ["weekly_check"], ["teen"], [reqSkill("LIFE.PLAY.ROOT.001", 2), reqAttr("energy", 18)], 24, 75, false, [
    choice("蹲下抓鱼", [effSkill("LIFE.PLAY.BASIC.001", 85), effSkill("HEALTH.BASIC.ROOT.001", 25), effResource("happiness", 5), effResource("stamina", -12), effItem("item.play.fish", 1)], "你没抓到多少，但笑了很久。"),
    choice("捡漂亮石头", [effSkill("LIFE.PLAY.ROOT.001", 55), effSkill("ART.CREATIVE.BASIC.003", 25), effResource("happiness", 3), effItem("item.play.river_stone", 1)], "口袋里多了一块很适合把玩的石头。"),
  ]),
  event("school_net_cafe_001", "网吧开黑", "有人说新游戏更新了，几个人把零花钱凑一凑，放学后去打一小时。", ["weekly_check"], ["teen"], [reqSkill("LIFE.PLAY.ROOT.001", 1), reqResource("money", 12)], 22, 6, false, [
    choice("组队开黑", [effSkill("LIFE.PLAY.BASIC.004", 80), effSkillExposure("TECH.COMPUTER.ROOT.001", 25, 60), effSkillExposure("LIFE.SOCIAL.ROOT.001", 18, 60), effResource("money", -12), effResource("stamina", -10), effResource("happiness", 7), effItem("item.play.arcade_ticket", 1)], "配合、吵闹和胜负欲搅在一起，像一段偷偷亮着的青春。"),
    choice("研究打法", [effSkill("LIFE.PLAY.BASIC.004", 65), effSkillExposure("TECH.COMPUTER.ROOT.001", 35, 60), effResource("money", -8), effResource("happiness", 4)], "你开始注意到键鼠、系统和游戏反馈背后的规律。"),
  ]),
  event("online_forum_001", "网络社区启蒙", "你看到陌生人分享代码、画作和学习笔记。", ["weekly_check"], ["teen"], [reqSkill("TECH.COMPUTER.ROOT.001", 1)], 22, 60, false, [
    choice("潜水学习", [effSkill("TECH.PROGRAMMING.BASIC.001", 55), effResource("knowledge", 5)], "你开始照着教程敲下第一行代码。"),
    choice("参与讨论", [effSkill("LIFE.SOCIAL.ROOT.001", 45), effResource("social", 4)], "你第一次感到网络也有同伴。"),
  ]),
  event("school_morning_reading_001", "清晨早读", "教室里还带着一点困意，朗读声逐渐把一天推起来。", ["weekly_check"], ["teen"], [reqAttr("energy", 20)], 34, 36, false, [
    choice("认真晨读", [effSkill("KNOWLEDGE.LANGUAGE.ROOT.001", 65), effSkill("KNOWLEDGE.ENGLISH.ROOT.001", 35), effResource("stamina", -10)], "语感和专注一起醒过来。"),
    choice("小声背单词", [effSkill("KNOWLEDGE.ENGLISH.ROOT.001", 70), effResource("happiness", -1)], "重复有点枯燥，但有效。"),
  ]),
  event("school_literature_novel_001", "课外小说", "一本小说在同学之间悄悄传阅，故事比习题更有吸引力。", ["weekly_check"], ["teen"], [reqSkill("KNOWLEDGE.LANGUAGE.ROOT.001", 2)], 26, 54, false, [
    choice("认真读完", [effSkill("KNOWLEDGE.LANGUAGE.BASIC.001", 80), effSkill("LIFE.SOCIAL.BASIC.002", 45), effResource("happiness", 3)], "人物和情节留在脑子里，写作也多了材料。"),
    choice("只读精彩段落", [effSkill("KNOWLEDGE.LANGUAGE.ROOT.001", 45), effResource("stamina", 8)], "你保留了体力，但理解没那么完整。"),
  ]),
  event("school_physics_lab_001", "物理实验课", "小车、斜面和秒表摆在桌上，公式终于有了实体。", ["monthly_check"], ["teen"], [reqSkill("KNOWLEDGE.SCIENCE.ROOT.001", 1), reqSkill("KNOWLEDGE.MATH.ROOT.001", 2)], 28, 72, false, [
    choice("自己动手测量", [effSkill("KNOWLEDGE.SCIENCE.BASIC.001", 85), effSkill("KNOWLEDGE.MATH.BASIC.002", 35), effResource("stamina", -12)], "数据和图像连成了一条线。"),
    choice("整理实验报告", [effSkill("KNOWLEDGE.LANGUAGE.ROOT.001", 35), effSkill("KNOWLEDGE.SCIENCE.ROOT.001", 55), effAttr("discipline", 1)], "表达清楚也是理解的一部分。"),
  ]),
  event("school_chemistry_lab_001", "化学实验安全", "老师反复提醒试剂用量，实验台上每一步都要稳。", ["monthly_check"], ["teen"], [reqSkill("KNOWLEDGE.SCIENCE.ROOT.001", 1)], 24, 78, false, [
    choice("严格按流程操作", [effSkill("KNOWLEDGE.SCIENCE.BASIC.002", 80), effAttr("discipline", 1), effResource("morality", 1)], "谨慎让实验结果更可靠。"),
    choice("观察同组操作", [effSkill("KNOWLEDGE.SCIENCE.ROOT.001", 45), effSkill("LIFE.SOCIAL.BASIC.001", 30)], "你从别人的习惯里学到了一点细节。"),
  ]),
  event("school_history_documentary_001", "历史纪录片", "班主任临时放了一段纪录片，旧时代突然有了声音和颜色。", ["weekly_check"], ["teen"], [reqSkill("KNOWLEDGE.HUMANITIES.ROOT.001", 1)], 25, 60, false, [
    choice("记下时间线", [effSkill("KNOWLEDGE.HUMANITIES.BASIC.001", 80), effSkill("KNOWLEDGE.LANGUAGE.BASIC.001", 25)], "事件之间的因果关系开始清晰。"),
    choice("讨论人物选择", [effSkill("LIFE.SOCIAL.ROOT.001", 35), effResource("morality", 1), effSkill("KNOWLEDGE.HUMANITIES.ROOT.001", 45)], "历史变成了真实的人做出的决定。"),
  ]),
  event("school_geography_weather_001", "地理天气图", "地图上的风向、气压和城市名字像一张正在变化的棋盘。", ["weekly_check"], ["teen"], [reqSkill("KNOWLEDGE.HUMANITIES.ROOT.001", 1)], 24, 60, false, [
    choice("分析天气图", [effSkill("KNOWLEDGE.HUMANITIES.BASIC.003", 75), effSkill("KNOWLEDGE.SCIENCE.ROOT.001", 25)], "空间和自然系统在脑子里合上了。"),
    choice("画一张示意图", [effSkill("ART.CREATIVE.BASIC.002", 35), effSkill("KNOWLEDGE.HUMANITIES.BASIC.003", 45)], "图形让复杂信息更容易记住。"),
  ]),
  event("school_biology_club_001", "生物社团观察", "显微镜下的叶片切片像一个陌生但有秩序的小世界。", ["monthly_check"], ["teen"], [reqSkill("KNOWLEDGE.SCIENCE.ROOT.001", 2)], 20, 90, false, [
    choice("留下观察", [effSkill("KNOWLEDGE.SCIENCE.BASIC.003", 90), effSkill("HEALTH.BASIC.ROOT.001", 30), effResource("stamina", -8)], "身体和生命系统突然离你更近。"),
    choice("帮忙整理器材", [effSkill("LIFE.DAILY.BASIC.002", 45), effResource("reputation", 1)], "秩序感让社团活动顺畅了不少。"),
  ]),
  event("school_class_debate_001", "班会辩论", "一个校园话题引发了争论，大家都想说服别人。", ["monthly_check"], ["teen"], [reqSkill("LIFE.SOCIAL.ROOT.001", 2)], 22, 84, false, [
    choice("站起来发言", [effSkill("KNOWLEDGE.HUMANITIES.BASIC.002", 65), effSkill("LIFE.SOCIAL.ROOT.001", 55), effResource("reputation", 1)], "观点需要证据，也需要表达。"),
    choice("认真听完双方", [effSkill("LIFE.SOCIAL.BASIC.001", 65), effSkill("KNOWLEDGE.HUMANITIES.ROOT.001", 35), effResource("morality", 1)], "你发现理解别人比反驳更难。"),
  ]),

  event("college_major_choice_001", "专业选择窗口", "大学生活展开，你需要给这一阶段定一个主方向。", ["stage_enter"], ["college"], [], 100, 0, true, [
    choice("选择理工方向", [effSkill("KNOWLEDGE.MATH.BRANCH.001", 90), effSkill("TECH.PROGRAMMING.BASIC.001", 60), effTag("major_science")], "理性工具箱开始扩展。"),
    choice("选择艺术方向", [effSkill("ART.CREATIVE.BRANCH.001", 90), effResource("inspiration", 10), effTag("major_art")], "创作成了更稳定的生活部分。"),
    choice("选择综合方向", [effSkill("LIFE.SOCIAL.ROOT.001", 70), effResource("social", 8), effTag("major_general")], "你把触角伸向更多人和事。"),
  ]),
  event("college_math_course_001", "高数挫败感", "高数课后，黑板上的符号还在脑子里盘旋。", ["monthly_check"], ["college"], [reqSkill("KNOWLEDGE.MATH.BASIC.002", 3), maxResource("stress", 80)], 35, 120, false, [
    choice("死磕到底", [effSkill("KNOWLEDGE.MATH.BRANCH.001", 90), effResource("stress", 6), effAttr("discipline", 1)], "抽象概念开始变得可控。"),
    choice("找同学请教", [effSkill("KNOWLEDGE.MATH.BRANCH.001", 55), effResource("social", 5), effResource("stress", -2)], "你发现提问也是能力。"),
  ]),
  event("college_coding_night_001", "宿舍编程夜", "室友在做一个小网页，你被运行起来的页面吸引住了。", ["weekly_check"], ["college"], [reqSkill("TECH.COMPUTER.ROOT.001", 2)], 32, 90, false, [
    choice("跟着写代码", [effSkill("TECH.PROGRAMMING.BASIC.001", 85), effResource("stress", 4)], "程序的反馈让你上头。"),
    choice("早点睡", [effAttr("health", 3), effAttr("energy", 14), effSkill("HEALTH.MIND.APPLICATION.001", 30)], "明天会感谢今晚的你。"),
  ]),
  event("college_design_workshop_001", "设计工作坊", "学院里有人办了一场设计工作坊。", ["monthly_check"], ["college"], [anyOf([reqSkill("ART.CREATIVE.BASIC.002", 2), reqSkill("ART.CREATIVE.BRANCH.002", 1)])], 26, 120, false, [
    choice("报名参加", [effSkill("ART.CREATIVE.BRANCH.003", 80), effResource("money", -40), effResource("inspiration", 4)], "你开始用约束看待美感。"),
    choice("线上围观", [effSkill("ART.CREATIVE.BASIC.003", 55), effResource("knowledge", 4)], "审美判断被慢慢校准。"),
  ]),
  event("college_part_time_001", "第一次兼职", "一个短期兼职机会摆在面前。", ["monthly_check"], ["college"], [reqAttr("energy", 35)], 30, 90, false, [
    choice("去兼职", [effResource("money", 160), effSkill("CAREER.BASIC.ROOT.001", 70), effResource("stress", 6)], "现实的节奏比课堂更直接。"),
    choice("专心学习", [effResource("knowledge", 14), effResource("stress", -2)], "你保住了学习节奏。"),
  ]),
  event("college_club_leader_001", "社团组织者", "社团缺一个能把事情推进下去的人。", ["monthly_check"], ["college"], [reqSkill("LIFE.SOCIAL.ROOT.001", 3)], 24, 150, false, [
    choice("接下组织工作", [effSkill("LIFE.SOCIAL.BRANCH.002", 80), effResource("social", 8), effResource("stress", 5)], "人和事开始在你手里对齐。"),
    choice("做普通成员", [effResource("happiness", 5), effResource("stress", -3)], "轻松一点也不错。"),
  ]),
  event("college_data_competition_001", "数据竞赛报名", "公告栏上有一场数据竞赛。", ["monthly_check"], ["college"], [anyOf([reqSkill("KNOWLEDGE.MATH.BRANCH.002", 2), reqSkill("TECH.PROGRAMMING.BASIC.001", 3)])], 22, 180, false, [
    choice("组队参加", [effSkill("KNOWLEDGE.MATH.PRO.001", 90), effResource("social", 6), effResource("stress", 5)], "你第一次用数据回答问题。"),
    choice("独自练习", [effResource("knowledge", 16), effSkill("KNOWLEDGE.MATH.BRANCH.002", 40)], "基础工具更熟了。"),
  ]),
  event("college_game_editor_001", "发现游戏地形编辑器", "你发现一款游戏的地形编辑器，山脊、路径和视野都能亲手调整。", ["skill_level", "monthly_check"], ["college"], [anyOf([reqSkill("ART.CREATIVE.BRANCH.002", 2), reqSkill("KNOWLEDGE.MATH.BASIC.003", 3)]), reqSkill("TECH.COMPUTER.ROOT.001", 2)], 35, 9999, true, [
    choice("尝试编辑", [effSkill("ART.CREATIVE.APPLICATION.002", 100), effResource("inspiration", 8)], "空间变成了可以设计的体验。"),
    choice("收藏以后再看", [effResource("inspiration", 10), effResource("knowledge", 4)], "一颗种子先放进了收藏夹。"),
  ]),
  event("college_public_speech_001", "课堂展示", "小组展示需要一个人上台讲清楚思路。", ["monthly_check"], ["college"], [reqSkill("LIFE.SOCIAL.ROOT.001", 2)], 30, 90, false, [
    choice("主动上台", [effSkill("LIFE.SOCIAL.BRANCH.001", 70), effResource("stress", 5), effResource("reputation", 1)], "台前的紧张变成了经验。"),
    choice("让队友讲", [effResource("social", 4), effResource("stress", -2)], "你把协作放在了第一位。"),
  ]),
  event("college_volunteer_001", "志愿服务活动", "社区活动需要志愿者记录现场。", ["monthly_check"], ["college"], [reqAttr("health", 35), reqAttr("energy", 25)], 20, 120, false, [
    choice("参加拍摄记录", [effSkill("ART.MEDIA.BASIC.001", 75), effResource("happiness", 5), effTag("public_spirit")], "镜头成了观察世界的方式。"),
    choice("负责现场协助", [effSkill("LIFE.SOCIAL.ROOT.001", 45), effResource("social", 5), effTag("public_spirit")], "你在真实场景里练习沟通。"),
  ]),

  event("work_entry_001", "入职第一周", "新的办公桌、新的节奏、新的评价体系。", ["stage_enter"], ["work"], [], 100, 0, true, [
    choice("主动适应", [effSkill("CAREER.BASIC.ROOT.001", 100), effResource("stress", 6), effResource("money", 120)], "你迅速进入职场节奏。"),
    choice("慢慢观察", [effResource("stress", -5), effSkill("LIFE.SOCIAL.BASIC.001", 45)], "你先看清规则再行动。"),
  ]),
  event("work_data_need_001", "工作中的数据需求", "团队需要有人整理数据，找出真正的问题。", ["scene_enter", "monthly_check"], ["work"], [reqSkill("KNOWLEDGE.MATH.ROOT.001", 5), reqSkill("TECH.TOOL.BASIC.001", 2)], 35, 180, false, [
    choice("主动学习数据分析", [effSkill("KNOWLEDGE.MATH.PRO.001", 100), effResource("stress", 5), effResource("reputation", 2)], "你把表格背后的趋势翻了出来。"),
    choice("先完成手头工作", [effResource("money", 120), effResource("stress", -2)], "稳妥地交付也有价值。"),
  ]),
  event("work_overtime_001", "连续加班", "项目进入紧急阶段，深夜还亮着屏幕。", ["resource_state"], ["work"], [anyOf([reqResource("stress", 55), reqTag("worked_5_days")])], 45, 120, false, [
    choice("接受加班", [effResource("money", 180), effSkill("CAREER.BASIC.ROOT.001", 55), effAttr("health", -5), effResource("stress", 7)], "收入涨了，身体也记下了账。"),
    choice("拒绝调整", [effResource("stress", -12), effResource("happiness", 4), effResource("money", -30)], "你守住了自己的恢复节奏。"),
  ]),
  event("work_mentor_001", "前辈指点", "一位前辈愿意花时间看你的工作方式。", ["monthly_check"], ["work"], [reqSkill("CAREER.BASIC.ROOT.001", 2), reqSkill("LIFE.SOCIAL.ROOT.001", 2)], 25, 180, false, [
    choice("认真请教", [effSkill("CAREER.BASIC.BASIC.002", 75), effResource("social", 5)], "经验少走了一些弯路。"),
    choice("保持距离", [effResource("stress", -4), effSkill("LIFE.SOCIAL.BASIC.001", 30)], "你保留了自己的节奏。"),
  ]),
  event("work_promotion_001", "晋升机会", "主管暗示有一个更复杂的项目可以交给你。", ["monthly_check"], ["work"], [reqSkill("CAREER.BASIC.BASIC.002", 3), reqSkill("CAREER.MANAGEMENT.BRANCH.001", 2)], 18, 240, false, [
    choice("争取晋升", [effResource("careerLevel", 1), effResource("money", 260), effResource("happiness", -4), effResource("reputation", 4), effSkill("CAREER.MANAGEMENT.BRANCH.001", 80)], "责任更重，天花板也更高。"),
    choice("保持当前节奏", [effResource("happiness", 6), effResource("stress", -6)], "你选择让生活留一点空间。"),
  ]),
  event("work_side_project_001", "下班后的项目", "脑子里有个小项目，不做会一直惦记。", ["weekly_check"], ["work"], [anyOf([reqSkill("TECH.PROGRAMMING.BASIC.001", 3), reqSkill("CAREER.CREATOR.APPLICATION.001", 2)])], 24, 120, false, [
    choice("启动项目", [effProject(18), effSkill("LIFE.MIND.PASSIVE.002", 45), effResource("stress", 6)], "作品进度条出现了。"),
    choice("休息恢复", [effAttr("health", 3), effResource("happiness", 4), effAttr("energy", 12)], "长期路线需要留力。"),
  ]),
  event("work_client_pitch_001", "客户提案", "客户不太确定自己想要什么，需要有人把方案讲清楚。", ["monthly_check"], ["work"], [anyOf([reqSkill("LIFE.SOCIAL.BRANCH.001", 2), reqSkill("LIFE.SOCIAL.APPLICATION.001", 2)])], 22, 150, false, [
    choice("主动提案", [effSkill("LIFE.SOCIAL.APPLICATION.001", 80), effResource("reputation", 3), effResource("stress", 4)], "表达带来了真实机会。"),
    choice("协助准备", [effSkill("TECH.TOOL.BASIC.001", 55), effSkill("CAREER.BASIC.BASIC.002", 45)], "你让材料更扎实。"),
  ]),
  event("work_design_task_001", "临时设计任务", "团队临时需要一个能看的视觉方案。", ["monthly_check"], ["work"], [anyOf([reqSkill("ART.CREATIVE.BRANCH.003", 2), reqSkill("ART.CREATIVE.BASIC.003", 3)])], 20, 150, false, [
    choice("接下任务", [effSkill("ART.CREATIVE.BRANCH.003", 80), effResource("reputation", 3), effResource("stress", 4)], "你把审美变成了交付。"),
    choice("推荐他人", [effResource("social", 7), effResource("stress", -2)], "人脉也能解决问题。"),
  ]),
  event("work_bug_crisis_001", "线上故障", "产品线上出现故障，消息不断刷新。", ["resource_state", "monthly_check"], ["work"], [anyOf([reqCareer("programmer"), reqSkill("TECH.PROGRAMMING.PRO.002", 2)])], 28, 180, false, [
    choice("参与修复", [effSkill("TECH.PROGRAMMING.PRO.002", 85), effResource("stress", 8), effResource("reputation", 4)], "压力让经验刻得更深。"),
    choice("交给同事", [effResource("stress", -5), effResource("social", -1)], "你躲开了火线。"),
  ]),
  event("work_career_switch_001", "转岗窗口", "公司开放内部转岗，你的副技能突然有了用武之地。", ["monthly_check"], ["work"], [hasAnyNonCareerSkillLevel(4)], 18, 240, false, [
    choice("申请转岗", [effResource("stress", 6), effResource("reputation", 2), effTag("career_switcher")], "人生路径拐出一个新角度。"),
    choice("继续积累", [effSkill("CAREER.BASIC.ROOT.001", 60), effResource("stress", -2)], "稳扎稳打也能带来复利。"),
  ]),

  event("state_low_energy_001", "体力透支", "你的注意力开始断线，身体在催你停一停。", ["resource_state"], ["teen", "college", "work"], [reqAttrMax("energy", 15)], 70, 60, false, [
    choice("好好睡觉", [effSkill("HEALTH.MIND.APPLICATION.001", 70), effAttr("energy", 26), effResource("stress", -10)], "睡眠重新接管了修复工作。"),
    choice("继续硬撑", [effResource("knowledge", 12), effAttr("health", -4), effResource("stress", 6)], "短期收益换来长期代价。"),
  ]),
  event("state_high_stress_001", "幸福感低谷", "生活质量开始发出提醒，继续硬撑会让效率变差。", ["resource_state"], ["teen", "college", "work"], [reqResourceMax("happiness", 30)], 75, 90, false, [
    choice("调整节奏", [effSkill("LIFE.MIND.BASIC.001", 80), effResource("happiness", 12)], "你开始学习照顾自己的状态。"),
    choice("压榨自己", [effResource("knowledge", 18), effResource("happiness", -8), effAttr("health", -4)], "效率上去了，生活颜色淡了一些。"),
  ]),
  event("state_inspiration_001", "灵感爆发", "灵感突然涌出来，像是很多线索终于连在一起。", ["resource_state"], ["teen", "college", "work"], [reqResource("inspiration", 60)], 35, 90, false, [
    choice("立即创作", [effProject(22), effResource("inspiration", -22), effResource("reputation", 2)], "你把想法推进成了作品。"),
    choice("记录想法", [effResource("knowledge", 8), effSkill("CAREER.CREATOR.APPLICATION.001", 45)], "灵感被保存成之后能用的素材。"),
  ]),
  event("state_social_invite_001", "周末邀约", "有人约你周末出去聊聊近况。", ["weekly_check"], ["teen", "college", "work"], [reqResource("social", 20), reqAttr("energy", 25)], 28, 60, false, [
    choice("赴约", [effResource("social", 6), effResource("happiness", 5), effResource("money", -18)], "关系在无事发生时慢慢变厚。"),
    choice("婉拒", [effAttr("energy", 12), effResource("stress", -4)], "安静恢复也是一种选择。"),
  ]),
  event("state_health_warning_001", "体检提醒", "身体状态发来提醒，不能再完全无视。", ["monthly_check"], ["teen", "college", "work"], [anyOf([reqAttrMax("health", 35), reqResource("stress", 70)])], 50, 180, false, [
    choice("认真调整", [effSkill("HEALTH.BASIC.ROOT.001", 65), effSkill("HEALTH.MIND.APPLICATION.001", 45), effAttr("health", 6), effResource("stress", -8)], "你开始把健康当成系统底座。"),
    choice("不当回事", [effResource("money", 40), effAttr("health", -5)], "侥幸让风险继续积累。"),
  ]),
  event("state_accident_001", "路遇事故", "路边有人受伤，周围的人还在犹豫。", ["monthly_check"], ["college", "work"], [], 8, 365, true, [
    choice("上前帮忙", [effSkill("LIFE.EMERGENCY.HIDDEN.001", 100), effResource("stress", 6), effResource("reputation", 3)], "危急时刻让你学会了真正有用的东西。"),
    choice("报警等待", [effResource("social", 3), effResource("stress", 1)], "你做了稳妥的选择。"),
  ]),
  event("achievement_streak_001", "连续学习百日", "稳定学习终于从计划变成了习惯。", ["achievement"], ["teen", "college", "work"], [reqAchievement("achievement_streak_001")], 100, 0, true, [
    choice("形成习惯", [effSkill("LIFE.MIND.PASSIVE.002", 100), effAttr("discipline", 3), effTag("disciplined")], "毅力成为了长期收益的一部分。"),
    choice("放松庆祝", [effResource("happiness", 8), effResource("knowledge", 10)], "偶尔庆祝能让下一段路更轻。"),
  ]),
  event("achievement_first_work_001", "第一件作品完成", "你的第一个作品终于达到了可以展示的状态。", ["achievement"], ["teen", "college", "work"], [reqAchievement("achievement_first_work_001")], 100, 0, true, [
    choice("发布作品", [effResource("reputation", 10), effResource("social", 8), effTag("first_public_work")], "世界开始对你的作品做出回应。"),
    choice("私人收藏", [effResource("happiness", 8), effResource("inspiration", 12)], "它先成为你自己的里程碑。"),
  ]),
  event("hidden_indie_game_001", "独立游戏萌芽", "技能拼图突然合上，你意识到自己可以做一个小游戏。", ["monthly_check"], ["college", "work"], [reqSkill("TECH.PROGRAMMING.BRANCH.003", 3), reqSkill("ART.CREATIVE.BRANCH.002", 3), reqSkill("ART.CREATIVE.PRO.001", 2)], 18, 240, true, [
    choice("开始做原型", [effProject(35), effTag("indie_game_seed"), effResource("stress", 8), effResource("reputation", 4)], "一个可玩的原型开始成形。"),
    choice("先积累素材", [effResource("inspiration", 18), effSkill("ART.CREATIVE.PRO.001", 60)], "你让准备更充分。"),
  ]),
  event("hidden_ai_interest_001", "AI 新闻冲击", "你看到 AI 工具改变行业工作流，感觉必须跟上。", ["monthly_check"], ["college", "work"], [reqSkill("TECH.PROGRAMMING.BASIC.001", 3), reqSkill("KNOWLEDGE.MATH.BRANCH.003", 2)], 25, 180, false, [
    choice("跟进学习", [effSkill("TECH.PROGRAMMING.PRO.003", 95), effResource("knowledge", 8), effResource("stress", 4)], "你打开了新一轮技术浪潮。"),
    choice("保持观望", [effResource("knowledge", 12), effResource("stress", -2)], "先看清楚再下注。"),
  ]),
  event("hidden_quant_001", "量化投资话题", "朋友聊起用程序辅助投资，你听出了数学和代码的交集。", ["monthly_check"], ["work"], [reqSkill("KNOWLEDGE.MATH.BRANCH.002", 4), reqSkill("KNOWLEDGE.MATH.APPLICATION.001", 3), reqResource("money", 3000)], 15, 240, false, [
    choice("小额尝试", [effSkill("KNOWLEDGE.MATH.HIDDEN.001", 100), effResource("money", -300), effTag("risk_taker")], "高收益路线从来不安静。"),
    choice("先做功课", [effResource("knowledge", 18), effSkill("KNOWLEDGE.MATH.APPLICATION.001", 60)], "你选择先扩展理解。"),
  ]),
  event("hidden_content_creator_001", "平台创作者邀请", "平台活动邀请你持续更新一个主题。", ["monthly_check"], ["college", "work"], [reqSkill("CAREER.CREATOR.APPLICATION.001", 3)], 22, 180, false, [
    choice("开始更新", [effResource("reputation", 6), effResource("stress", 5), effResource("social", 4)], "观众开始记住你。"),
    choice("偶尔发布", [effResource("happiness", 4), effResource("reputation", 2)], "轻松一点，慢慢来。"),
  ]),
  event("hidden_late_bloomer_001", "大器晚成", "你在更晚的阶段终于把一项能力磨到很亮。", ["achievement"], ["work"], [anySkillAt(8), reqAge(30)], 100, 0, true, [
    choice("接受新身份", [effTag("late_bloomer"), effResource("happiness", 8), effResource("reputation", 4)], "晚一点开花，也是开花。"),
    choice("低调继续", [effResource("stress", -8), effAttr("discipline", 2)], "你把掌声留给下一次进步。"),
  ]),
  event("hidden_mystic_001", "街角占卜", "一个小摊让你短暂停下。你不确定这是巧合，还是另一种观察人生的方式。", ["monthly_check"], ["work"], [anyOf([reqResourceMax("happiness", 30), reqResource("stress", 80)])], 6, 365, true, [
    choice("听听也无妨", [effTag("mystic_seed"), effResource("happiness", 4), effResource("money", -30)], "你得到了一句奇怪但耐人寻味的话。"),
    choice("转身离开", [effAttr("discipline", 1), effResource("stress", -2)], "你更相信可执行的计划。"),
  ]),
];

const EVENTS = [...LEGACY_EVENTS, ...loadContentEvents()];

const MAJOR_EVENTS = [
  majorEvent("major_subject_track_001", "文理分科", "高一结束前，你需要给之后两年的学习路线定一个方向。文科更重视语文、人文通识和表达，理科更重视数学、理科基础和实验能力。", SUBJECT_TRACK_MONTH, ["teen"], [], true, [
    choice("选择文科", [effTag("track_liberal_arts"), effSkill("KNOWLEDGE.HUMANITIES.ROOT.001", 120), effSkill("KNOWLEDGE.LANGUAGE.ROOT.001", 80), effResource("happiness", 2)], "你选择了文科路线。之后高考会考政治、历史、地理。"),
    choice("选择理科", [effTag("track_science"), effSkill("KNOWLEDGE.SCIENCE.ROOT.001", 120), effSkill("KNOWLEDGE.MATH.ROOT.001", 80), effResource("happiness", 2)], "你选择了理科路线。之后高考会考物理、化学、生物。"),
  ]),
  majorEvent("major_gaokao_001", "高考", "高三六月，三年的训练在这个夏天集中结算。系统会根据你的学科技能、状态和分科路线评估高考分数。", GAOKAO_MONTH, ["teen"], [], true, [
    choice("参加高考", [], "高考结束，成绩已经结算。", { resolver: "gaokao" }),
  ]),
];

const ACHIEVEMENTS = [
  achievement("achievement_first_week", "第七个月", "推进到高中第七个月", s => s.day >= 7, [effResource("knowledge", 10)]),
  achievement("achievement_college", "进入大学", "抵达大学期", s => s.stageId === "college" || s.stageId === "work", [effResource("knowledge", 20)]),
  achievement("achievement_work", "初入职场", "抵达职场前期", s => s.stageId === "work", [effResource("money", 200)]),
  achievement("achievement_streak_001", "坚持学习", "连续学习 100 个结算周期", s => s.stats.studyStreak >= 100, [effSkill("LIFE.MIND.PASSIVE.002", 100)]),
  achievement("achievement_first_level3", "入门成型", "任意技能达到 3 级", s => Object.values(s.skills).some(x => x.level >= 3), [effResource("knowledge", 12)]),
  achievement("achievement_first_level5", "熟练之门", "任意技能达到 5 级", s => Object.values(s.skills).some(x => x.level >= 5), [effResource("reputation", 2)]),
  achievement("achievement_math_fan", "数学爱好者", "数学技能任一达到 8 级", s => skillIdsByBranch("数学").some(id => getLevel(s, id) >= 8), [effResource("knowledge", 30)]),
  achievement("achievement_artist", "初露审美", "艺术技能任一达到 5 级", s => SKILLS.some(k => k.domain === "ART" && getLevel(s, k.id) >= 5), [effResource("inspiration", 20)]),
  achievement("achievement_programmer", "代码成形", "编程入门达到 5 级", s => getLevel(s, "TECH.PROGRAMMING.BASIC.001") >= 5, [effResource("reputation", 2)]),
  achievement("achievement_social", "社交连接", "声望达到 50", s => s.resources.reputation >= 50, [effTag("social_connector")]),
  achievement("achievement_health", "健康生活家", "健康、体能都达到 70", s => s.attrs.health >= 70 && s.attrs.fitness >= 70, [effResource("happiness", 8)]),
  achievement("achievement_pressure", "情绪复原", "幸福感从低谷恢复到 60 以上", s => s.tags.stress_peak && s.resources.happiness >= 60, [effSkill("LIFE.MIND.BASIC.001", 80)]),
  achievement("achievement_first_work_001", "第一件作品", "作品进度达到 100", s => s.projectProgress >= 100, [effResource("reputation", 10), effResource("social", 8)]),
  achievement("achievement_cross", "跨界新人", "3 个领域各有 3 级技能", s => domainCountAt(s, 3) >= 3, [effResource("inspiration", 18)]),
  achievement("achievement_career_ready", "职业资格", "解锁任意正式职业", s => CAREERS.some(c => c.id !== "none" && meetsAll(s, c.requirements)), [effResource("money", 150)]),
  achievement("achievement_data_path", "数据路径", "解锁数据分析", s => isUnlocked(s, "KNOWLEDGE.MATH.PRO.001"), [effResource("knowledge", 16)]),
  achievement("achievement_creator_path", "创作者路径", "解锁内容创作", s => isUnlocked(s, "CAREER.CREATOR.APPLICATION.001"), [effResource("inspiration", 16)]),
  achievement("achievement_money_1000", "第一桶金", "金钱达到 1000", s => s.resources.money >= 1000, [effResource("happiness", 5)]),
  achievement("achievement_reputation", "有人记得你", "声望达到 20", s => s.resources.reputation >= 20, [effResource("happiness", 4)]),
  achievement("achievement_stage_master", "阶段复盘", "完成两次阶段转换", s => s.stats.stageTransitions >= 2, [effResource("knowledge", 20), effResource("happiness", 5)]),
];

const DOM = {};
let state = null;
let activeView = "home";
let activeSkillFilter = "ALL";
let realtimeFrame = null;
let toastSerial = 0;
const TOAST_TTL_MS = 3000;
const MAX_VISIBLE_TOASTS = 4;
const BASE_STAMINA_MAX = 1000;
const activeToasts = new Map();

document.addEventListener("DOMContentLoaded", () => {
  cacheDom();
  bindStaticEvents();
  state = loadState();
  processOffline();
  render();
  startRealtimeLoop();
});

function skill(id, name, domain, branch, type, scenes, relatedAttrs, desc, unlock) {
  return {
    id,
    name,
    domain,
    branch,
    type,
    scenes,
    relatedAttrs,
    desc,
    unlock,
    max: 10,
    starter: STARTER_SKILL_IDS.has(id),
    ...(SKILL_TRAINING_RULES[id] || {}),
  };
}

function career(id, name, desc, requirements, income, stress, focusSkills) {
  return { id, name, desc, requirements, income, stress, focusSkills };
}

function event(id, title, text, triggers, stages, conditions, weight, cooldown, once, choices) {
  return { id, title, text, triggers, stages, conditions, weight, cooldown, once, choices };
}

function loadContentEvents() {
  const packs = Array.isArray(globalThis.LIFE_EVENT_PACKS) ? globalThis.LIFE_EVENT_PACKS : [];
  return packs.flatMap(pack => (Array.isArray(pack.events) ? pack.events : []).map(item => ({
    id: item.id,
    title: item.title,
    text: item.text,
    type: item.type || "random",
    triggers: [item.trigger?.source || "manual"],
    triggerSpec: item.trigger || { source: "manual" },
    stages: item.stages || [],
    conditions: item.conditions || [],
    weight: item.repeat?.weight ?? 10,
    cooldown: item.repeat?.cooldown ?? 0,
    once: Boolean(item.repeat?.once),
    choices: item.choices || [],
    contentPack: pack.id,
  })));
}

function validateGameContent() {
  const issues = [];
  const skillIds = new Set(SKILLS.map(item => item.id));
  const npcIds = new Set(SOCIAL_NPCS.map(item => item.id));
  const itemIds = new Set(INVENTORY_ITEMS.map(item => item.id));
  const careerIds = new Set(CAREERS.map(item => item.id));
  const allowedSources = new Set(["skill", "social", "time", "resource", "item", "career", "manual"]);
  const allowedEffects = new Set(["resource", "attr", "skillXp", "skillExposure", "unlockSkill", "trainingAccess", "staminaMax", "tag", "project", "item"]);
  const allEventIds = [...EVENTS, ...MAJOR_EVENTS].map(item => item.id);
  const eventIds = new Set(allEventIds);

  const validateRequirement = (req, ownerId) => {
    if (!req) return;
    if (req.type === "skill" && !skillIds.has(req.id)) issues.push(`${ownerId} 的条件引用了不存在的技能：${req.id}`);
    if (req.type === "event" && !eventIds.has(req.id)) issues.push(`${ownerId} 的条件引用了不存在的事件：${req.id}`);
    if (req.type === "career" && !careerIds.has(req.id)) issues.push(`${ownerId} 的条件引用了不存在的职业：${req.id}`);
    if (req.type === "anyOf") (req.items || []).forEach(child => validateRequirement(child, ownerId));
  };

  findDuplicates(SKILLS.map(item => item.id)).forEach(id => issues.push(`重复技能 ID：${id}`));
  findDuplicates(allEventIds).forEach(id => issues.push(`重复事件 ID：${id}`));

  EVENTS.filter(item => item.contentPack).forEach(item => {
    if (!item.title || !item.text) issues.push(`${item.id} 缺少标题或正文`);
    if (!item.choices.length) issues.push(`${item.id} 没有可选项`);
    const trigger = item.triggerSpec || {};
    if (!allowedSources.has(trigger.source)) issues.push(`${item.id} 使用了未知触发来源：${trigger.source}`);
    if (trigger.skillId && !skillIds.has(trigger.skillId)) issues.push(`${item.id} 引用了不存在的触发技能：${trigger.skillId}`);
    if (trigger.npcId && !npcIds.has(trigger.npcId)) issues.push(`${item.id} 引用了不存在的 NPC：${trigger.npcId}`);
    if (trigger.itemId && !itemIds.has(trigger.itemId)) issues.push(`${item.id} 引用了不存在的触发道具：${trigger.itemId}`);
    if (trigger.careerId && !careerIds.has(trigger.careerId)) issues.push(`${item.id} 引用了不存在的职业：${trigger.careerId}`);
    item.conditions.forEach(req => validateRequirement(req, item.id));
    item.choices.forEach((choiceItem, choiceIndex) => {
      if (!choiceItem.text || !choiceItem.result) issues.push(`${item.id} 的第 ${choiceIndex + 1} 个选项缺少文案`);
      (choiceItem.effects || []).forEach(effect => {
        if (!allowedEffects.has(effect.type)) issues.push(`${item.id} 使用了未知效果：${effect.type}`);
        if (["skillXp", "skillExposure", "unlockSkill", "trainingAccess"].includes(effect.type) && !skillIds.has(effect.id)) {
          issues.push(`${item.id} 引用了不存在的技能：${effect.id}`);
        }
        if (effect.type === "item" && !itemIds.has(effect.id)) issues.push(`${item.id} 引用了不存在的道具：${effect.id}`);
      });
    });
  });

  return issues;
}

function findDuplicates(values) {
  const seen = new Set();
  return Array.from(new Set(values.filter(value => {
    if (seen.has(value)) return true;
    seen.add(value);
    return false;
  })));
}

function majorEvent(id, title, text, month, stages, conditions, once, choices) {
  return { id, title, text, month, stages, conditions, once, choices, major: true };
}

function choice(text, effects, result, meta = {}) {
  return { text, effects, result, ...meta };
}

function achievement(id, title, desc, condition, effects) {
  return { id, title, desc, condition, effects };
}

function item(id, name, category, desc) {
  return { id, name, category, desc };
}

function socialScene(id, name, stages, desc, npcIds) {
  return { id, name, stages, desc, npcIds };
}

function socialAction(id, name, desc, duration, energyCost, moneyCost, friendshipGain, skillXp) {
  return { id, name, desc, duration, energyCost, moneyCost, friendshipGain, skillXp };
}

function npc(id, sceneId, name, role, desc, energyCost, moneyCost, friendshipGain, drops, bonuses) {
  return { id, sceneId, name, role, desc, energyCost, moneyCost, friendshipGain, drops, bonuses };
}

function socialBonus(threshold, chance, effects, text) {
  return { threshold, chance, effects, text };
}

function boost(sourceId, targetId, thresholds, reason) {
  return { sourceId, targetId, thresholds, reason };
}

function reqSkill(id, level) {
  return { type: "skill", id, level };
}

function reqAttr(key, value) {
  return { type: "attr", key, value };
}

function reqAttrMax(key, value) {
  return { type: "attrMax", key, value };
}

function reqResource(key, value) {
  return { type: "resource", key, value };
}

function reqResourceMax(key, value) {
  return { type: "resourceMax", key, value };
}

function maxResource(key, value) {
  return reqResourceMax(key, value);
}

function reqStage(id) {
  return { type: "stage", id };
}

function reqEvent(id) {
  return { type: "event", id };
}

function reqAchievement(id) {
  return { type: "achievement", id };
}

function reqCareer(id) {
  return { type: "career", id };
}

function reqTag(id) {
  return { type: "tag", id };
}

function reqAge(age) {
  return { type: "age", age };
}

function anyOf(items) {
  return { type: "anyOf", items };
}

function anySkillAt(level) {
  return { type: "anySkillAt", level };
}

function hasAnyNonCareerSkillLevel(level) {
  return { type: "nonCareerSkill", level };
}

function effResource(key, amount) {
  return { type: "resource", key, amount };
}

function effAttr(key, amount) {
  return { type: "attr", key, amount };
}

function effSkill(id, amount) {
  return { type: "skillXp", id, amount };
}

function effSkillExposure(id, amount, threshold) {
  return { type: "skillExposure", id, amount, threshold };
}

function effUnlockSkill(id) {
  return { type: "unlockSkill", id };
}

function effTrainingAccess(id) {
  return { type: "trainingAccess", id };
}

function effStaminaMax(amount) {
  return { type: "staminaMax", amount };
}

function effTag(id) {
  return { type: "tag", id };
}

function effProject(amount) {
  return { type: "project", amount };
}

function effItem(id, count = 1) {
  return { type: "item", id, count };
}

function cacheDom() {
  DOM.navList = document.getElementById("navList");
  DOM.sidebarSkillList = document.getElementById("sidebarSkillList");
  DOM.topResourceBar = document.getElementById("topResourceBar");
  DOM.stageLabel = document.getElementById("stageLabel");
  DOM.metaLine = document.getElementById("metaLine");
  DOM.noticeRow = document.getElementById("noticeRow");
  DOM.sceneBadge = document.getElementById("sceneBadge");
  DOM.vitalsGrid = document.getElementById("vitalsGrid");
  DOM.resourceGrid = document.getElementById("resourceGrid");
  DOM.trainingPanel = document.getElementById("trainingPanel");
  DOM.eventCountBadge = document.getElementById("eventCountBadge");
  DOM.homeEventBox = document.getElementById("homeEventBox");
  DOM.logList = document.getElementById("logList");
  DOM.skillFilters = document.getElementById("skillFilters");
  DOM.skillGrid = document.getElementById("skillGrid");
  DOM.eventPanel = document.getElementById("eventPanel");
  DOM.eventHistory = document.getElementById("eventHistory");
  DOM.socialStageBadge = document.getElementById("socialStageBadge");
  DOM.socialSceneBadge = document.getElementById("socialSceneBadge");
  DOM.socialNpcBadge = document.getElementById("socialNpcBadge");
  DOM.socialSceneList = document.getElementById("socialSceneList");
  DOM.socialNpcGrid = document.getElementById("socialNpcGrid");
  DOM.socialDetail = document.getElementById("socialDetail");
  DOM.inventoryBadge = document.getElementById("inventoryBadge");
  DOM.inventoryGrid = document.getElementById("inventoryGrid");
  DOM.careerGrid = document.getElementById("careerGrid");
  DOM.currentCareerBadge = document.getElementById("currentCareerBadge");
  DOM.achievementGrid = document.getElementById("achievementGrid");
  DOM.achievementBadge = document.getElementById("achievementBadge");
  DOM.modalBackdrop = document.getElementById("modalBackdrop");
  DOM.modalBody = document.getElementById("modalBody");
  DOM.toastStack = document.getElementById("toastStack");
}

function bindStaticEvents() {
  DOM.navList.innerHTML = NAV_ITEMS.map(item => `
    <button class="icon-button nav-button" type="button" data-view="${item.id}" id="tab-${item.id}">
      <svg><use href="#${item.icon}"></use></svg><span>${item.label}</span>
    </button>
  `).join("");

  DOM.navList.addEventListener("click", event => {
    const button = event.target.closest("[data-view]");
    if (!button) return;
    activeView = button.dataset.view;
    render();
  });

  document.getElementById("saveBtn").addEventListener("click", () => {
    saveState();
    pushLog("进度已保存。");
    render();
  });

  document.getElementById("resetBtn").addEventListener("click", () => {
    if (!confirm("确认重开一局？当前本地存档会被覆盖。")) return;
    localStorage.removeItem(STORAGE_KEY);
    state = createNewState();
    queueEvents("stage_enter", 1);
    saveState();
    activeView = "home";
    render();
  });

  document.getElementById("modalCloseBtn").addEventListener("click", closeModal);
  DOM.modalBackdrop.addEventListener("click", event => {
    if (event.target === DOM.modalBackdrop) closeModal();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !DOM.modalBackdrop.hidden) closeModal();
  });
}

function createNewState() {
  const next = {
    version: VERSION,
    day: 1,
    age: START_AGE,
    stageId: "teen",
    sceneId: "SCHOOL",
    attrs: {
      health: 72,
      intelligence: 45,
      creativity: 42,
      charm: 40,
      discipline: 38,
      fitness: 35,
      stability: 45,
    },
    resources: {
      money: 200,
      reputation: 0,
      careerLevel: 0,
      stamina: BASE_STAMINA_MAX,
      happiness: 55,
      morality: 0,
      knowledge: 0,
      inspiration: 0,
      social: 5,
      stress: 20,
    },
    skills: {},
    careerId: "none",
    careerRank: {
      tier: 1,
      step: 1,
    },
    social: {
      sceneId: "family",
      npcId: "father",
      action: null,
      npcs: {},
    },
    inventory: {},
    training: {
      skillId: "KNOWLEDGE.MATH.ROOT.001",
      startedAt: Date.now(),
      duration: 3000,
      completions: 0,
    },
    eventQueue: [],
    majorEventQueue: [],
    eventHistory: [],
    eventCooldowns: {},
    eventTriggerCounts: {},
    completedEvents: {},
    examResults: {},
    achievements: {},
    tags: {},
    skillTrainingAccess: {},
    permanentBonuses: {
      staminaMax: 0,
    },
    logs: [],
    projectProgress: 0,
    lastSkillGains: {},
    lastSettlement: null,
    stats: {
      studyStreak: 0,
      totalStudyDays: 0,
      totalCreated: 0,
      stageTransitions: 0,
      workStreak: 0,
      trainingTicks: 0,
    },
    lastSeen: Date.now(),
  };

  SKILLS.forEach(item => {
    const unlocked = item.starter;
    next.skills[item.id] = { level: unlocked ? 1 : 0, xp: 0, discoveryXp: 0, unlocked };
  });
  SOCIAL_NPCS.forEach(item => {
    next.social.npcs[item.id] = { friendship: 0, interactions: 0 };
  });

  checkUnlocks(next);
  pushLogTo(next, "人生从高一九月开始。");
  return next;
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const fresh = createNewState();
    queueEventsFor(fresh, "stage_enter", 1);
    saveState(fresh);
    return fresh;
  }

  try {
    const loaded = JSON.parse(raw);
    const merged = migrateState(loaded);
    refreshStage(merged, false);
    checkUnlocks(merged);
    queueMajorEventsForMonth(merged);
    return merged;
  } catch (error) {
    console.error(error);
    const fresh = createNewState();
    queueEventsFor(fresh, "stage_enter", 1);
    saveState(fresh);
    return fresh;
  }
}

function migrateState(loaded) {
  const fresh = createNewState();
  const merged = { ...fresh, ...loaded, version: VERSION };
  merged.attrs = { ...fresh.attrs, ...(loaded.attrs || {}) };
  merged.resources = { ...fresh.resources, ...(loaded.resources || {}) };
  if (!loaded.resources?.stamina && loaded.attrs?.energy !== undefined) {
    merged.resources.stamina = clamp(Math.round(loaded.attrs.energy * 10), 0, BASE_STAMINA_MAX);
  }
  if (loaded.resources?.social && !loaded.resources?.reputation) {
    merged.resources.reputation = Math.max(merged.resources.reputation || 0, Math.round(loaded.resources.social));
  }
  delete merged.attrs.energy;
  merged.resources.careerLevel = careerRankValue(merged);
  merged.resources.stamina = clamp(merged.resources.stamina ?? BASE_STAMINA_MAX, 0, getMaxStamina(merged));
  merged.resources.happiness = clamp(merged.resources.happiness ?? 55, 0, 100);
  merged.resources.morality = clamp(merged.resources.morality ?? 0, -100, 100);
  merged.stats = { ...fresh.stats, ...(loaded.stats || {}) };
  merged.skills = { ...fresh.skills, ...(loaded.skills || {}) };
  SKILLS.forEach(item => {
    const record = merged.skills[item.id] || {};
    merged.skills[item.id] = {
      level: record.level || 0,
      xp: record.xp || 0,
      discoveryXp: record.discoveryXp || 0,
      unlocked: Boolean(record.unlocked),
    };
    if (loaded.version !== VERSION && !item.starter && totalSkillXp(merged.skills[item.id]) <= 0) {
      merged.skills[item.id] = { level: 0, xp: 0, discoveryXp: 0, unlocked: false };
    }
  });
  STARTER_SKILL_IDS.forEach(id => unlockSkill(merged, id, { announce: false }));
  merged.social = {
    ...fresh.social,
    ...(loaded.social || {}),
    npcs: { ...fresh.social.npcs, ...((loaded.social && loaded.social.npcs) || {}) },
  };
  SOCIAL_NPCS.forEach(item => {
    if (!merged.social.npcs[item.id]) merged.social.npcs[item.id] = { friendship: 0, interactions: 0 };
  });
  if (!getSocialNpc(merged.social.action?.npcId) || !getSocialAction(merged.social.action?.actionId)) {
    merged.social.action = null;
  }
  merged.inventory = { ...fresh.inventory, ...(loaded.inventory || {}) };
  merged.eventTriggerCounts = { ...fresh.eventTriggerCounts, ...(loaded.eventTriggerCounts || {}) };
  merged.skillTrainingAccess = { ...fresh.skillTrainingAccess, ...(loaded.skillTrainingAccess || {}) };
  merged.permanentBonuses = { ...fresh.permanentBonuses, ...(loaded.permanentBonuses || {}) };
  merged.careerRank = {
    ...fresh.careerRank,
    ...(loaded.careerRank || {}),
  };
  merged.resources.careerLevel = careerRankValue(merged);
  delete merged.schedule;
  merged.training = loaded.training || fresh.training;
  if (!merged.training.skillId || !canTrainSkill(merged, getSkill(merged.training.skillId))) {
    merged.training = { ...fresh.training, startedAt: Date.now() };
  }
  merged.eventQueue = Array.isArray(loaded.eventQueue) ? loaded.eventQueue : [];
  merged.majorEventQueue = Array.isArray(loaded.majorEventQueue) ? loaded.majorEventQueue : [];
  merged.eventHistory = Array.isArray(loaded.eventHistory) ? loaded.eventHistory : [];
  merged.examResults = { ...fresh.examResults, ...(loaded.examResults || {}) };
  merged.logs = Array.isArray(loaded.logs) ? loaded.logs : fresh.logs;
  merged.resources.stamina = clamp(merged.resources.stamina, 0, getMaxStamina(merged));
  return merged;
}

function saveState(target = state) {
  if (!target) return;
  target.lastSeen = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(target));
}

function processOffline() {
  const now = Date.now();
  const elapsedMs = Math.max(0, now - (state.lastSeen || now));
  if (!state.training?.skillId) return;
  const duration = getTrainingDuration(state.training.skillId);
  if (elapsedMs < duration) return;

  const before = snapshotState();
  const fullMs = Math.min(elapsedMs, 8 * 3600000);
  const decayMs = Math.max(0, elapsedMs - 8 * 3600000) * 0.3;
  const effectiveMs = fullMs + decayMs;
  const ticks = Math.min(240, Math.floor(effectiveMs / duration));
  const remainder = effectiveMs % duration;
  if (ticks <= 0) return;

  for (let i = 0; i < ticks; i += 1) {
    completeTrainingTick("离线训练", true);
  }
  state.training.startedAt = now - remainder;
  const summary = diffSnapshot(before, snapshotState(), 0, elapsedMs / 3600000);
  summary.ticks = ticks;
  rememberSettlement("离线训练", summary);
  if (hasOfflineChanges(summary)) {
    saveState();
    openModal("离线结算", renderOfflineSummary(summary));
  } else {
    pushLog(`离线约 ${(elapsedMs / 3600000).toFixed(1)} 小时，时间较短，没有明显结算变化。`);
    saveState();
  }
}

function startRealtimeLoop() {
  if (realtimeFrame) cancelAnimationFrame(realtimeFrame);
  const loop = () => {
    const trainingChanged = processTrainingTicks();
    const socialChanged = processSocialTicks();
    if (trainingChanged || socialChanged) render();
    else {
      updateTrainingProgress();
      updateSocialProgress();
    }
    realtimeFrame = requestAnimationFrame(loop);
  };
  realtimeFrame = requestAnimationFrame(loop);
}

function processTrainingTicks() {
  if (!state.training?.skillId || !isUnlocked(state, state.training.skillId)) return false;
  const now = Date.now();
  const duration = getTrainingDuration(state.training.skillId);
  const elapsed = now - (state.training.startedAt || now);
  const completed = Math.min(12, Math.floor(elapsed / duration));
  if (completed <= 0) return false;

  const before = snapshotState();
  for (let i = 0; i < completed; i += 1) {
    completeTrainingTick("技能训练", true, true);
  }
  state.training.startedAt += completed * duration;
  state.training.duration = duration;
  const summary = diffSnapshot(before, snapshotState(), 0, 0);
  rememberSettlement("技能训练", summary);
  const skillText = formatSkillGainSummary(summary.skillChanges);
  if (skillText) pushLog(skillText);
  checkAchievements();
  checkUnlocks(state);
  saveState();
  return true;
}

function processSocialTicks() {
  const actionState = state.social?.action;
  if (!actionState?.npcId) return false;
  const npcItem = getSocialNpc(actionState.npcId);
  const actionItem = getSocialAction(actionState.actionId);
  if (!npcItem || !actionItem || !isSocialSceneAvailable(getSocialScene(npcItem.sceneId))) {
    state.social.action = null;
    saveState();
    return true;
  }

  const profile = getSocialActionProfile(npcItem, actionItem);
  const now = Date.now();
  const elapsed = now - (actionState.startedAt || now);
  const completed = Math.min(8, Math.floor(elapsed / profile.duration));
  if (completed <= 0) return false;

  let done = 0;
  for (let i = 0; i < completed; i += 1) {
    const acted = socializeWithNpc(npcItem.id, false, actionItem.id, true, false);
    if (!acted) {
      state.social.action = null;
      break;
    }
    done += 1;
  }

  if (state.social.action && done > 0) {
    state.social.action.startedAt = (actionState.startedAt || now) + done * profile.duration;
    state.social.action.duration = profile.duration;
    state.social.action.completions = (state.social.action.completions || 0) + done;
  }

  checkUnlocks(state);
  checkAchievements();
  saveState();
  return true;
}

function completeTrainingTick(source = "技能训练", silent = false, showGainToast = !silent) {
  const skillId = state.training?.skillId;
  const skillItem = getSkill(skillId);
  if (!skillItem || !canTrainSkill(state, skillItem)) return 0;

  const entry = getTrainingEntry(skillId);
  const action = ACTIONS[entry.action] || ACTIONS.study;
  state.sceneId = action.scene || state.sceneId;
  applyTrainingActionSideEffects(action, showGainToast);

  const result = calculateActionXp(entry, state.sceneId);
  addSkillXp(skillId, result.xp, source, result.boostInfo, { toast: showGainToast });
  applyPassiveSkillGrowth(skillId, showGainToast);
  state.training.completions = (state.training.completions || 0) + 1;
  state.stats.trainingTicks = (state.stats.trainingTicks || 0) + 1;
  dispatchEventTrigger({ source: "skill", skillId, actionId: entry.action }, 1);

  if (state.stats.trainingTicks % 16 === 0) {
    updateDailyTrainingStats(entry.action);
    state.day += 1;
    refreshStage(state, true);
    recoverDaily();
    dispatchEventTrigger({
      source: "time",
      month: getCalendarInfo(state.day).month,
      monthIndex: state.day,
      age: state.age,
      stageId: state.stageId,
    }, 1);
    queueEvents("resource_state", 1);
    queueEvents("weekly_check", 1);
    queueEvents("monthly_check", 1);
    queueMajorEventsForMonth(state);
  }

  if (!silent) {
    pushLog(`${skillItem.name} 训练完成：经验 +${result.xp}`);
    checkAchievements();
    checkUnlocks(state);
    saveState();
  }
  return result.xp;
}

function updateDailyTrainingStats(actionId) {
  const studied = actionId === "study";
  const worked = actionId === "work";
  state.stats.studyStreak = studied ? (state.stats.studyStreak || 0) + 1 : 0;
  state.stats.totalStudyDays = (state.stats.totalStudyDays || 0) + (studied ? 1 : 0);
  state.stats.workStreak = worked ? (state.stats.workStreak || 0) + 1 : 0;
  if (state.stats.workStreak >= 5) state.tags.worked_5_days = true;
  if ((state.resources.stress || 0) >= 75 || state.resources.happiness <= 25) state.tags.stress_peak = true;
}

function startTraining(skillId) {
  const item = getSkill(skillId);
  if (!item) return;
  if (!isUnlocked(state, skillId)) {
    pushLog(`${item.name} 尚未解锁：${missingRequirements(item.unlock)}`);
    render();
    return;
  }
  if (!canTrainSkill(state, item)) {
    pushLog(`${item.name} 当前主要通过生活经历提升，暂时不能主动挂机训练。`);
    render();
    return;
  }
  state.training = {
    skillId,
    startedAt: Date.now(),
    duration: getTrainingDuration(skillId),
    completions: state.training?.completions || 0,
  };
  state.sceneId = ACTIONS[getTrainingActionForSkill(item)]?.scene || state.sceneId;
  pushLog(`开始训练：${item.name}`);
  saveState();
  render();
}

function getTrainingEntry(skillId) {
  const item = getSkill(skillId);
  return { action: getTrainingActionForSkill(item), target: skillId };
}

function getTrainingActionForSkill(item) {
  if (!item) return "study";
  if (item.domain === "HEALTH") return "exercise";
  if (item.domain === "CAREER") return "work";
  if (item.domain === "ART") return "practice";
  if (item.domain === "LIFE") {
    if (item.branch === "社交") return "social";
    if (item.branch === "玩耍") return "play";
    if (item.branch === "电玩") return "gaming";
    if (item.branch === "生活") return "practice";
    return "study";
  }
  return "study";
}

function getTrainingDuration(skillId) {
  const item = getSkill(skillId);
  const record = state.skills[skillId] || { level: 1 };
  const base = {
    ROOT: 2600,
    BASIC: 3200,
    BRANCH: 4200,
    APPLICATION: 4700,
    PRO: 5600,
    PASSIVE: 5000,
    HIDDEN: 6800,
  }[item?.type] || 3600;
  const disciplineBonus = clamp((state.attrs.discipline - 40) * 12, -240, 520);
  const levelBonus = Math.min(700, Math.max(0, record.level - 1) * 60);
  return Math.max(1600, Math.round(base - disciplineBonus - levelBonus));
}

function applyTrainingActionSideEffects(action, showGainToast = false) {
  const scale = 0.16;
  Object.entries(action.cost || {}).forEach(([key, value]) => {
    if (key in state.attrs) addAttr(key, Math.round(value * scale));
    else addResource(key, Math.round(value * scale), { toast: showGainToast, source: action.name });
  });
  Object.entries(action.reward || {}).forEach(([key, value]) => {
    if (key in state.attrs) addAttr(key, Math.round(value * scale));
    else addResource(key, Math.round(value * scale), { toast: showGainToast, source: action.name });
  });
}

function getTrainingProgress() {
  if (!state.training?.skillId) return { pct: 0, remaining: 0, elapsed: 0, duration: 1 };
  const duration = getTrainingDuration(state.training.skillId);
  const elapsed = Math.max(0, Date.now() - (state.training.startedAt || Date.now()));
  const pct = clamp((elapsed % duration) / duration * 100, 0, 100);
  return { pct, elapsed: elapsed % duration, remaining: Math.max(0, duration - (elapsed % duration)), duration };
}

function updateTrainingProgress() {
  const progress = getTrainingProgress();
  document.querySelectorAll("[data-training-cd-progress], [data-skill-card-cd-progress]").forEach(node => {
    node.style.transform = `scaleX(${progress.pct / 100})`;
  });
  document.querySelectorAll("[data-training-time], [data-skill-card-cd-time]").forEach(node => {
    node.textContent = `${(progress.remaining / 1000).toFixed(1)} 秒`;
  });
}

function getSocialProgress() {
  const actionState = state.social?.action;
  if (!actionState?.npcId) return { pct: 0, remaining: 0, elapsed: 0, duration: 1 };
  const npcItem = getSocialNpc(actionState.npcId);
  const actionItem = getSocialAction(actionState.actionId);
  if (!npcItem || !actionItem) return { pct: 0, remaining: 0, elapsed: 0, duration: 1 };
  const duration = getSocialActionProfile(npcItem, actionItem).duration;
  const elapsed = Math.max(0, Date.now() - (actionState.startedAt || Date.now()));
  const elapsedInCycle = elapsed % duration;
  const pct = clamp(elapsedInCycle / duration * 100, 0, 100);
  return { pct, elapsed: elapsedInCycle, remaining: Math.max(0, duration - elapsedInCycle), duration };
}

function updateSocialProgress() {
  const progress = getSocialProgress();
  document.querySelectorAll("[data-social-cd-progress]").forEach(node => {
    node.style.transform = `scaleX(${progress.pct / 100})`;
  });
  document.querySelectorAll("[data-social-cd-time]").forEach(node => {
    node.textContent = `${(progress.remaining / 1000).toFixed(1)} 秒`;
  });
}

function recoverDaily() {
  applyMonthlyIncome();
  if (state.resources.happiness < 35) addAttr("stability", -1);
  if (state.day % 12 === 0 && state.resources.reputation > 0) {
    addResource("reputation", -Math.max(1, Math.floor(state.resources.reputation * 0.05)));
  }
  state.resources.stamina = clamp(state.resources.stamina, 0, getMaxStamina(state));
  state.attrs.health = clamp(state.attrs.health, 0, 100);
}

function applyMonthlyIncome() {
  const income = getMonthlyIncome(state);
  if (income <= 0) return;
  addResource("money", income);
  pushLog(state.stageId === "work" ? `工资入账：金钱 +${income}` : `获得零花钱：金钱 +${income}`);
}

function applyResourceBundle(bundle = {}) {
  Object.entries(bundle).forEach(([key, amount]) => {
    if (key in state.attrs) addAttr(key, amount);
    else addResource(key, amount);
  });
}

function applyAttrBundle(bundle = {}) {
  Object.entries(bundle).forEach(([key, amount]) => addAttr(key, amount));
}

function addResource(key, amount, options = {}) {
  if (!state?.resources) return;
  if (key === "careerLevel") {
    changeCareerLevel(amount, options);
    return;
  }

  const hiddenKey = ["knowledge", "inspiration", "social", "stress"].includes(key) ? key : "";
  if (hiddenKey) {
    const beforeHidden = state.resources[hiddenKey] || 0;
    state.resources[hiddenKey] = Math.round(clamp(beforeHidden + amount, hiddenKey === "stress" ? 0 : -9999, hiddenKey === "stress" ? 100 : 999999));
  }

  const normalized = normalizeResourceEffect(key, amount);
  if (!normalized || !(normalized.key in state.resources)) return;
  const before = state.resources[normalized.key];
  state.resources[normalized.key] = Math.round(clamp(before + normalized.amount, resourceMin(normalized.key), resourceMax(normalized.key)));
  const changed = state.resources[normalized.key] - before;
  if (changed !== 0) {
    dispatchEventTrigger({
      source: "resource",
      resourceKey: normalized.key,
      before,
      value: state.resources[normalized.key],
      change: changed,
    }, 1);
  }
  if (options.toast && changed !== 0 && isCoreResource(normalized.key)) {
    const direction = changed > 0 ? "gain" : "cost";
    showToast({
      type: normalized.key === "money" ? "money" : "attr",
      direction,
      key: `resource:${normalized.key}:${direction}`,
      target: resourceName(normalized.key),
      amount: Math.abs(changed),
      unit: normalized.key === "money" ? "" : "点",
      verb: resourceToastVerb(normalized.key, direction),
      detail: options.source || "",
    });
  }
}

function addAttr(key, amount, options = {}) {
  if (key === "energy") {
    addResource("stamina", amount, options);
    return;
  }
  if (!(key in state.attrs)) return;
  const before = state.attrs[key];
  state.attrs[key] = Math.round(clamp(state.attrs[key] + amount, 0, 100));
  const changed = state.attrs[key] - before;
  if (options.toast && changed !== 0) {
    const direction = changed > 0 ? "gain" : "cost";
    showToast({
      type: "attr",
      direction,
      key: `attr:${key}:${direction}`,
      target: attrName(key),
      amount: Math.abs(changed),
      unit: "点",
      verb: direction === "gain" ? "恢复" : "消耗",
      detail: options.source || "",
    });
  }
}

function normalizeResourceEffect(key, amount) {
  switch (key) {
    case "energy":
      return { key: "stamina", amount };
    case "social":
      return { key: "reputation", amount };
    case "stress":
      return { key: "happiness", amount: -amount };
    case "knowledge":
    case "inspiration":
      return null;
    default:
      return { key, amount };
  }
}

function resourceMin(key) {
  if (key === "money") return -9999;
  if (key === "morality") return -100;
  return 0;
}

function resourceMax(key) {
  if (key === "stamina") return getMaxStamina(state);
  if (key === "happiness") return 100;
  if (key === "morality") return 100;
  return 999999;
}

function isCoreResource(key) {
  return RESOURCES.some(item => item.key === key);
}

function getMaxStamina(target = state) {
  const skillBonus = [
    ["LIFE.PLAY.ROOT.001", 5],
    ["LIFE.PLAY.BASIC.002", 15],
    ["LIFE.PLAY.BASIC.003", 15],
    ["HEALTH.SPORT.BASIC.001", 25],
  ].reduce((total, [id, perLevel]) => total + Math.max(0, getLevel(target, id) - 1) * perLevel, 0);
  const strengthBonus = Math.max(0, getLevel(target, "HEALTH.SPORT.BRANCH.001") - 1) * 40;
  return BASE_STAMINA_MAX + skillBonus + strengthBonus + Math.max(0, target.permanentBonuses?.staminaMax || 0);
}

function addPermanentStaminaMax(amount, source = "事件") {
  const gained = Math.max(0, Math.round(amount || 0));
  if (!gained) return;
  if (!state.permanentBonuses) state.permanentBonuses = { staminaMax: 0 };
  state.permanentBonuses.staminaMax = (state.permanentBonuses.staminaMax || 0) + gained;
  state.resources.stamina = clamp(state.resources.stamina + gained, 0, getMaxStamina(state));
  pushLog(`${source}：体力上限 +${gained}`);
}

function resourceToastVerb(key, direction) {
  if (key === "money") return direction === "gain" ? "获得" : "支出";
  if (key === "stamina") return direction === "gain" ? "恢复" : "消耗";
  if (key === "morality") return direction === "gain" ? "提升" : "降低";
  if (key === "happiness") return direction === "gain" ? "提升" : "降低";
  if (key === "reputation") return direction === "gain" ? "获得" : "损失";
  return direction === "gain" ? "获得" : "消耗";
}

function changeCareerLevel(amount, options = {}) {
  if (state.stageId !== "work") return;
  if (!state.careerRank) state.careerRank = { tier: 1, step: 1 };
  const before = careerRankValue(state);
  let points = Math.round(amount);
  while (points > 0) {
    state.careerRank.step += 1;
    if (state.careerRank.step > 3) {
      state.careerRank.step = 1;
      state.careerRank.tier += 1;
    }
    points -= 1;
  }
  while (points < 0) {
    state.careerRank.step -= 1;
    if (state.careerRank.step < 1) {
      state.careerRank.tier = Math.max(1, state.careerRank.tier - 1);
      state.careerRank.step = 3;
    }
    points += 1;
  }
  state.resources.careerLevel = careerRankValue(state);
  const changed = state.resources.careerLevel - before;
  if (options.toast && changed !== 0) {
    const direction = changed > 0 ? "gain" : "cost";
    showToast({
      type: "info",
      direction,
      key: `resource:careerLevel:${direction}`,
      target: "职级",
      amount: Math.abs(amount),
      verb: direction === "gain" ? "晋升" : "降级",
      detail: getCareerLevelLabel(state),
    });
  }
}

function careerRankValue(target = state) {
  const rank = target.careerRank || { tier: 1, step: 1 };
  if (target.stageId !== "work" || target.careerId === "none") return 0;
  return rank.tier * 10 + rank.step;
}

function getCareerLevelLabel(target = state) {
  if (target.stageId !== "work" || target.careerId === "none") return "无";
  const rank = target.careerRank || { tier: 1, step: 1 };
  return `${rank.tier}-${rank.step}`;
}

function getCareerLevelName(target = state) {
  if (target.stageId !== "work" || target.careerId === "none") return "学生";
  const rank = target.careerRank || { tier: 1, step: 1 };
  if (rank.tier >= 4) return "总监";
  if (rank.tier >= 3) return "高级";
  if (rank.tier >= 2) return "中级";
  return "初级";
}

function getMonthlyIncome(target = state, careerItem = getCareer(target.careerId)) {
  if (!careerItem || careerItem.id === "none") {
    return target.stageId === "college" ? 60 : 36;
  }
  if (target.stageId !== "work") return careerItem.income;
  const rank = target.careerRank || { tier: 1, step: 1 };
  const multiplier = 1 + (rank.tier - 1) * 0.35 + (rank.step - 1) * 0.12;
  return Math.round(careerItem.income * multiplier);
}

function addSkillXp(id, amount, source = "成长", boostInfo = null, options = {}) {
  const record = state.skills[id];
  const item = getSkill(id);
  if (!record || !item) return;
  if (!record.unlocked) unlockSkill(state, id, { announce: true });

  if (record.level >= item.max) return;
  const staminaMaxBefore = getMaxStamina(state);
  const gained = Math.max(0, amount);
  record.xp += gained;
  if (options.toast && gained > 0) {
    const boostText = boostInfo?.total > 0 ? `学习加速 +${Math.round(boostInfo.total * 100)}%` : source;
    showToast({
      type: "xp",
      direction: "gain",
      key: `xp:${id}`,
      target: `${item.name}经验`,
      amount: Math.round(gained),
      unit: "点",
      verb: "获得",
      detail: boostText,
    });
  }
  let leveled = false;
  while (record.level < item.max && record.xp >= xpNeed(record.level)) {
    record.xp -= xpNeed(record.level);
    record.level += 1;
    leveled = true;
  }

  if (leveled) {
    const staminaMaxAfter = getMaxStamina(state);
    const staminaMaxGain = Math.max(0, staminaMaxAfter - staminaMaxBefore);
    if (staminaMaxGain > 0) {
      state.resources.stamina = clamp(state.resources.stamina + staminaMaxGain, 0, staminaMaxAfter);
      pushLog(`${item.name} 提升了体力上限 ${staminaMaxGain} 点。`);
      if (options.toast) {
        showToast({
          type: "attr",
          direction: "gain",
          key: "resource:staminaMax:gain",
          target: "体力上限",
          amount: staminaMaxGain,
          unit: "点",
          verb: "提升",
          detail: item.name,
        });
      }
    }
    pushLog(`${item.name} 提升到 ${record.level} 级。`);
    if (boostInfo && boostInfo.total > 0) {
      pushLog(`${item.name} 获得学习加速 +${Math.round(boostInfo.total * 100)}%。`);
    }
    checkUnlocks(state);
  }
}

function addSkillExposure(id, amount, threshold = 50, source = "生活经历", options = {}) {
  const record = state.skills[id];
  const item = getSkill(id);
  if (!record || !item || amount <= 0) return false;
  if (record.unlocked) {
    addSkillXp(id, amount, source, null, options);
    return false;
  }

  record.discoveryXp = Math.max(0, (record.discoveryXp || 0) + amount);
  if (record.discoveryXp < threshold) return false;
  unlockSkill(state, id, { announce: true });
  record.discoveryXp = threshold;
  return true;
}

function unlockSkill(target, id, options = {}) {
  const record = target?.skills?.[id];
  const item = getSkill(id);
  if (!record || !item || record.unlocked) return false;
  record.unlocked = true;
  record.level = Math.max(record.level || 0, 1);
  pushLogTo(target, `解锁技能：${item.name}`);
  if (options.announce !== false && target === state) {
    showToast({
      type: "info",
      direction: "gain",
      key: `skill-unlock:${id}`,
      title: `解锁新技能：${item.name}`,
      detail: item.growthHint || "新的成长路线已经出现。",
    });
  }
  return true;
}

function applyPassiveSkillGrowth(skillId, showGainToast = false) {
  if (skillId === "LIFE.PLAY.BASIC.004") {
    addSkillExposure("TECH.COMPUTER.ROOT.001", 8, 60, "网吧上网", { toast: showGainToast });
  }
}

function xpNeed(level) {
  return Math.round(100 * Math.pow(Math.max(1, level), 1.35));
}

function getAttributeMultiplier(skillItem) {
  if (!skillItem.relatedAttrs.length) return 1;
  const total = skillItem.relatedAttrs.reduce((sum, key) => sum + (state.attrs[key] || 50), 0);
  const avg = total / skillItem.relatedAttrs.length;
  return clamp(1 + (avg - 50) / 190, 0.75, 1.3);
}

function getSceneMultiplier(skillItem, sceneId) {
  const scene = SCENES[sceneId] || SCENES.SCHOOL;
  let multiplier = skillItem.scenes.includes(sceneId) ? 1.12 : 1;
  if (scene.modifiers[skillItem.domain]) multiplier *= scene.modifiers[skillItem.domain];
  return multiplier;
}

function getStatusModifier() {
  let modifier = 1;
  if (state.resources.stamina < 80) modifier *= 0.65;
  else if (state.resources.stamina < 180) modifier *= 0.85;
  if (state.attrs.health < 35) modifier *= 0.8;
  if (state.resources.happiness < 30) modifier *= 0.9;
  if (state.resources.happiness > 70) modifier *= 1.05;
  return modifier;
}

function getBoostInfo(targetId) {
  const parts = [];
  let total = 0;
  BOOSTS.filter(item => item.targetId === targetId).forEach(item => {
    const level = getLevel(state, item.sourceId);
    let bonus = 0;
    item.thresholds.forEach(([threshold, value]) => {
      if (level >= threshold) bonus = value;
    });
    if (bonus > 0) {
      total += bonus;
      parts.push({ ...item, bonus, sourceName: getSkill(item.sourceId).name });
    }
  });
  return { total: Math.min(total, 0.6), parts };
}

function refreshStage(target, shouldQueue) {
  target.age = getAgeForMonth(target.day);
  const oldStage = target.stageId;
  const stage = getStageForAge(target.age);
  target.stageId = stage.id;
  if (target.resources) target.resources.careerLevel = careerRankValue(target);
  if (oldStage !== target.stageId) {
    target.sceneId = stage.defaultScene;
    target.stats.stageTransitions += 1;
    pushLogTo(target, `进入${stage.name}。`);
    if (shouldQueue) queueEventsFor(target, "stage_enter", 1);
  }
}

function getAgeForMonth(monthIndex) {
  return START_AGE + Math.floor((Math.max(1, monthIndex) - 1) / 12);
}

function getStageForAge(age) {
  return STAGES.find(item => age >= item.minAge && age <= item.maxAge) || STAGES[2];
}

function getCalendarInfo(monthIndex = state?.day || 1) {
  const safeMonth = Math.max(1, monthIndex);
  const calendarMonth = ACADEMIC_MONTHS[(safeMonth - 1) % ACADEMIC_MONTHS.length];
  const age = getAgeForMonth(safeMonth);
  const stageId = getStageForAge(age).id;

  if (stageId === "teen") {
    const year = Math.floor((safeMonth - 1) / 12) + 1;
    const grade = ["高一", "高二", "高三"][Math.min(2, year - 1)] || `高中第 ${year} 年`;
    return { stageId, year, month: calendarMonth, label: `${grade} · ${calendarMonth}月` };
  }

  if (stageId === "college") {
    const year = Math.floor((safeMonth - 37) / 12) + 1;
    return { stageId, year, month: calendarMonth, label: `大学第 ${Math.max(1, year)} 年 · ${calendarMonth}月` };
  }

  const year = Math.floor((safeMonth - 97) / 12) + 1;
  return { stageId, year, month: calendarMonth, label: `职场第 ${Math.max(1, year)} 年 · ${calendarMonth}月` };
}

function formatGameDate(monthIndex = state?.day || 1) {
  return getCalendarInfo(monthIndex).label;
}

function checkUnlocks(target) {
  let changed = true;
  while (changed) {
    changed = false;
    SKILLS.forEach(item => {
      const record = target.skills[item.id];
      if (record.unlocked) return;
      const canAutoUnlock = item.starter || (item.unlock.length > 0 && meetsAll(target, item.unlock));
      if (canAutoUnlock) {
        unlockSkill(target, item.id, { announce: target === state });
        changed = true;
      }
    });
  }
}

function checkAchievements() {
  ACHIEVEMENTS.forEach(item => {
    if (state.achievements[item.id]) return;
    if (!item.condition(state)) return;
    state.achievements[item.id] = { day: state.day };
    applyEffects(item.effects, `成就：${item.title}`);
    pushLog(`达成成就：${item.title}`);
    if (item.id === "achievement_streak_001") {
      queueSpecificEvent("achievement_streak_001");
    }
  });
  queueEvents("achievement", 1);
}

function meetsAll(target, requirements = []) {
  return requirements.every(req => meets(target, req));
}

function meets(target, req) {
  if (!req) return true;
  switch (req.type) {
    case "skill":
      return getLevel(target, req.id) >= req.level;
    case "attr":
      return getAttrValue(target, req.key) >= req.value;
    case "attrMax":
      return getAttrValue(target, req.key) <= req.value;
    case "resource":
      return getResourceValue(target, req.key) >= req.value;
    case "resourceMax":
      return getResourceValue(target, req.key) <= req.value;
    case "stage":
      return stageIndex(target.stageId) >= stageIndex(req.id);
    case "event":
      return Boolean(target.completedEvents[req.id]);
    case "achievement":
      return Boolean(target.achievements[req.id]);
    case "career":
      return target.careerId === req.id;
    case "tag":
      return Boolean(target.tags[req.id]);
    case "age":
      return target.age >= req.age;
    case "anyOf":
      return req.items.some(item => meets(target, item));
    case "anySkillAt":
      return Object.values(target.skills).some(record => record.level >= req.level);
    case "nonCareerSkill":
      return SKILLS.some(item => item.domain !== "CAREER" && getLevel(target, item.id) >= req.level);
    default:
      return true;
  }
}

function getAttrValue(target, key) {
  if (key === "energy") return Math.floor((target.resources?.stamina || 0) / 10);
  return target.attrs?.[key] || 0;
}

function getResourceValue(target, key) {
  if (key === "energy") return target.resources?.stamina || 0;
  if (key === "careerLevel") return careerRankValue(target);
  if (key === "social") return Math.max(target.resources?.social || 0, target.resources?.reputation || 0);
  if (key === "stress") return target.resources?.stress ?? Math.max(0, 100 - (target.resources?.happiness || 0));
  return target.resources?.[key] || 0;
}

function queueEvents(trigger, limit = 1) {
  queueEventsFor(state, trigger, limit);
}

function dispatchEventTrigger(context, limit = 1) {
  if (!state || !context?.source) return;
  if (!state.eventTriggerCounts) state.eventTriggerCounts = {};
  const subjectId = context.skillId || context.npcId || context.resourceKey || context.itemId || context.careerId || "global";
  const key = [context.source, subjectId, context.actionId || "any"].join(":");
  state.eventTriggerCounts[key] = (state.eventTriggerCounts[key] || 0) + 1;
  queueEventsFor(state, context.source, limit, { ...context, count: state.eventTriggerCounts[key] });
}

function queueEventsFor(target, trigger, limit = 1, context = {}) {
  const maxQueue = trigger === "stage_enter" ? 5 : 3;
  if (target.eventQueue.length >= maxQueue) return;
  const candidates = EVENTS.filter(item => {
    if (!item.triggers.includes(trigger)) return false;
    if (item.once && target.completedEvents[item.id]) return false;
    if (target.eventQueue.includes(item.id)) return false;
    if (item.stages.length && !item.stages.includes(target.stageId)) return false;
    if ((target.eventCooldowns[item.id] || 0) > target.day) return false;
    if (!matchesEventTrigger(item, trigger, context)) return false;
    return meetsAll(target, item.conditions);
  });

  for (let i = 0; i < limit; i += 1) {
    if (!candidates.length || target.eventQueue.length >= maxQueue) break;
    const picked = weightedPick(candidates, target);
    if (!picked) break;
    target.eventQueue.push(picked.id);
    candidates.splice(candidates.indexOf(picked), 1);
    pushLogTo(target, `触发事件：${picked.title}`);
  }
}

function matchesEventTrigger(item, trigger, context = {}) {
  const spec = item.triggerSpec;
  if (!spec) return true;
  if (spec.source && spec.source !== trigger) return false;
  if (spec.skillId && spec.skillId !== context.skillId) return false;
  if (spec.npcId && spec.npcId !== context.npcId) return false;
  if (spec.actionId && spec.actionId !== context.actionId) return false;
  if (spec.resourceKey && spec.resourceKey !== context.resourceKey) return false;
  if (spec.itemId && spec.itemId !== context.itemId) return false;
  if (spec.careerId && spec.careerId !== context.careerId) return false;
  if (spec.stageId && spec.stageId !== context.stageId) return false;
  if (spec.month && spec.month !== context.month) return false;
  if (spec.minValue !== undefined && (context.value ?? -Infinity) < spec.minValue) return false;
  if (spec.maxValue !== undefined && (context.value ?? Infinity) > spec.maxValue) return false;
  if (spec.minFriendship && (context.friendship || 0) < spec.minFriendship) return false;
  if (spec.interval && ((context.count || 0) === 0 || context.count % spec.interval !== 0)) return false;
  if (spec.chance !== undefined && Math.random() > clamp(spec.chance, 0, 1)) return false;
  return true;
}

function queueSpecificEvent(id) {
  if (state.completedEvents[id] || state.eventQueue.includes(id)) return;
  if (state.eventQueue.length >= 3) return;
  state.eventQueue.push(id);
}

function queueMajorEventsForMonth(target, monthIndex = target.day) {
  if (!target.majorEventQueue) target.majorEventQueue = [];
  MAJOR_EVENTS.forEach(item => {
    if (item.month !== monthIndex) return;
    if (item.once && target.completedEvents[item.id]) return;
    if (target.majorEventQueue.includes(item.id)) return;
    if (item.stages.length && !item.stages.includes(target.stageId)) return;
    if (!meetsAll(target, item.conditions)) return;
    target.majorEventQueue.push(item.id);
    pushLogTo(target, `重大事件出现：${item.title}`);
  });
}

function resolveMajorEventChoice(eventId, choiceIndex) {
  const item = getMajorEvent(eventId);
  if (!item) return;
  const picked = item.choices[choiceIndex];
  if (!picked) return;

  applyEffects(picked.effects, item.title);
  let result = picked.result;
  let resultBody = "";

  if (picked.resolver === "gaokao") {
    const exam = calculateGaokaoScore(state);
    applyGaokaoOutcome(exam);
    result = `${exam.total} 分 · ${exam.tierName}`;
    resultBody = renderGaokaoResult(exam);
  }

  state.completedEvents[item.id] = { day: state.day, choice: picked.text, major: true, result };
  state.majorEventQueue = (state.majorEventQueue || []).filter(id => id !== item.id);
  state.eventHistory.unshift({ id: item.id, title: `重大事件：${item.title}`, choice: picked.text, result, day: state.day, major: true });
  state.eventHistory = state.eventHistory.slice(0, 60);
  pushLog(`重大事件：${item.title}：${result}`);
  checkUnlocks(state);
  checkAchievements();
  saveState();
  render();

  if (resultBody) {
    openModal(`${item.title}结果`, resultBody);
  } else {
    closeModal();
  }
}

function applyGaokaoOutcome(exam) {
  state.examResults.gaokao = exam;
  state.tags.gaokao_done = true;
  state.tags[`gaokao_${exam.tier}`] = true;
  addResource("reputation", exam.reputationReward);
  addResource("happiness", exam.happinessReward);
}

function calculateGaokaoScore(target = state) {
  const track = getSubjectTrack(target);
  const commonSubjects = [
    subjectScore(target, "语文", [
      ["KNOWLEDGE.LANGUAGE.ROOT.001", 0.35],
      ["KNOWLEDGE.LANGUAGE.BASIC.001", 0.3],
      ["LIFE.SOCIAL.BASIC.002", 0.2],
      ["KNOWLEDGE.HUMANITIES.ROOT.001", 0.15],
    ]),
    subjectScore(target, "数学", [
      ["KNOWLEDGE.MATH.ROOT.001", 0.3],
      ["KNOWLEDGE.MATH.BASIC.001", 0.18],
      ["KNOWLEDGE.MATH.BASIC.002", 0.25],
      ["KNOWLEDGE.MATH.BASIC.003", 0.17],
      ["TECH.COMPUTER.ROOT.001", 0.1],
    ]),
    subjectScore(target, "英语", [
      ["KNOWLEDGE.ENGLISH.ROOT.001", 0.45],
      ["KNOWLEDGE.LANGUAGE.ROOT.001", 0.2],
      ["LIFE.SOCIAL.ROOT.001", 0.25],
      ["LIFE.SOCIAL.BASIC.001", 0.1],
    ]),
  ];
  const electiveSubjects = track.id === "science"
    ? [
      subjectScore(target, "物理", [
        ["KNOWLEDGE.SCIENCE.ROOT.001", 0.3],
        ["KNOWLEDGE.SCIENCE.BASIC.001", 0.35],
        ["KNOWLEDGE.MATH.BASIC.002", 0.2],
        ["KNOWLEDGE.MATH.BASIC.003", 0.15],
      ], 0, 100),
      subjectScore(target, "化学", [
        ["KNOWLEDGE.SCIENCE.ROOT.001", 0.35],
        ["KNOWLEDGE.SCIENCE.BASIC.002", 0.4],
        ["KNOWLEDGE.MATH.ROOT.001", 0.15],
        ["HEALTH.BASIC.ROOT.001", 0.1],
      ], 0, 100),
      subjectScore(target, "生物", [
        ["KNOWLEDGE.SCIENCE.ROOT.001", 0.35],
        ["KNOWLEDGE.SCIENCE.BASIC.003", 0.4],
        ["HEALTH.BASIC.ROOT.001", 0.15],
        ["KNOWLEDGE.HUMANITIES.BASIC.003", 0.1],
      ], 0, 100),
    ]
    : [
      subjectScore(target, "政治", [
        ["KNOWLEDGE.HUMANITIES.ROOT.001", 0.35],
        ["KNOWLEDGE.HUMANITIES.BASIC.002", 0.35],
        ["LIFE.SOCIAL.ROOT.001", 0.15],
        ["LIFE.SOCIAL.BASIC.001", 0.15],
      ], clamp((target.resources.morality || 0) / 12, -6, 6), 100),
      subjectScore(target, "历史", [
        ["KNOWLEDGE.HUMANITIES.ROOT.001", 0.3],
        ["KNOWLEDGE.HUMANITIES.BASIC.001", 0.4],
        ["KNOWLEDGE.LANGUAGE.BASIC.001", 0.2],
        ["LIFE.SOCIAL.BASIC.002", 0.1],
      ], 0, 100),
      subjectScore(target, "地理", [
        ["KNOWLEDGE.HUMANITIES.ROOT.001", 0.25],
        ["KNOWLEDGE.HUMANITIES.BASIC.003", 0.4],
        ["KNOWLEDGE.SCIENCE.ROOT.001", 0.2],
        ["KNOWLEDGE.MATH.BASIC.003", 0.15],
      ], 0, 100),
    ];
  const subjects = [...commonSubjects, ...electiveSubjects];
  const total = subjects.reduce((sum, item) => sum + item.score, 0);
  const tier = getGaokaoTier(total);
  return {
    track: track.id,
    trackName: track.name,
    total,
    subjects,
    tier: tier.id,
    tierName: tier.name,
    reputationReward: tier.reputation,
    happinessReward: tier.happiness,
    comment: tier.comment,
    month: target.day,
  };
}

function getSubjectTrack(target = state) {
  if (target.tags.track_liberal_arts) return { id: "arts", name: "文科" };
  if (target.tags.track_science) return { id: "science", name: "理科" };
  const scienceScore = getLevel(target, "KNOWLEDGE.SCIENCE.ROOT.001") + getLevel(target, "KNOWLEDGE.MATH.ROOT.001");
  const artsScore = getLevel(target, "KNOWLEDGE.HUMANITIES.ROOT.001") + getLevel(target, "KNOWLEDGE.LANGUAGE.ROOT.001");
  return scienceScore >= artsScore ? { id: "science", name: "理科" } : { id: "arts", name: "文科" };
}

function subjectScore(target, name, skillWeights, extra = 0, maxScore = 150) {
  const weightedLevel = weightedSkillLevel(target, skillWeights);
  const staminaRatio = clamp((target.resources.stamina || 0) / Math.max(1, getMaxStamina(target)), 0, 1);
  const statusBonus =
    ((target.attrs.intelligence || 45) - 45) * 0.24
    + ((target.attrs.discipline || 40) - 40) * 0.22
    + ((target.resources.happiness || 50) - 50) * 0.08
    + (staminaRatio - 0.5) * 8
    + extra;
  const scale = maxScore / 150;
  const score = Math.round(clamp((52 + weightedLevel * 8.6 + statusBonus) * scale, maxScore * 0.2, maxScore));
  return { name, score, maxScore, level: Number(weightedLevel.toFixed(1)) };
}

function weightedSkillLevel(target, skillWeights) {
  const totalWeight = skillWeights.reduce((sum, [, weight]) => sum + weight, 0) || 1;
  return skillWeights.reduce((sum, [id, weight]) => sum + getLevel(target, id) * weight, 0) / totalWeight;
}

function getGaokaoTier(total) {
  if (total >= 680) return { id: "top", name: "顶尖院校线", reputation: 8, happiness: 10, comment: "你几乎把高中阶段的核心能力打穿了，后续大学路线会有很高起点。" };
  if (total >= 600) return { id: "key", name: "重点本科线", reputation: 6, happiness: 8, comment: "成绩非常扎实，足以支撑你进入更好的大学环境。" };
  if (total >= 500) return { id: "undergraduate", name: "本科线", reputation: 4, happiness: 5, comment: "你拿到了稳定的大学入场券，未来还有很多路线可以补强。" };
  if (total >= 380) return { id: "college", name: "专科/保底线", reputation: 1, happiness: 1, comment: "结果不算理想，但仍然保留了继续成长和换路线的空间。" };
  return { id: "retry", name: "需要调整", reputation: 0, happiness: -6, comment: "这次结算暴露了明显短板，之后需要靠事件或后续阶段重新找回节奏。" };
}

function weightedPick(items, target = state) {
  const total = items.reduce((sum, item) => sum + getEventWeight(item, target), 0);
  let roll = Math.random() * total;
  for (const item of items) {
    roll -= getEventWeight(item, target);
    if (roll <= 0) return item;
  }
  return items[0];
}

function getEventWeight(item, target = state) {
  let weight = item.weight;
  if (target.tags.disciplined && item.id.includes("pressure")) weight -= 6;
  if (target.resources.happiness < 30 && item.triggers.includes("resource_state")) weight += 8;
  if (target.resources.inspiration > 55 && item.id.includes("inspiration")) weight += 10;
  return Math.max(1, weight);
}

function resolveEventChoice(eventId, choiceIndex) {
  const item = EVENTS.find(eventItem => eventItem.id === eventId);
  if (!item) return;
  const picked = item.choices[choiceIndex];
  if (!picked) return;
  applyEffects(picked.effects, item.title);
  state.completedEvents[item.id] = { day: state.day, choice: picked.text };
  state.eventCooldowns[item.id] = state.day + item.cooldown;
  state.eventQueue = state.eventQueue.filter(id => id !== item.id);
  state.eventHistory.unshift({ id: item.id, title: item.title, choice: picked.text, result: picked.result, day: state.day });
  state.eventHistory = state.eventHistory.slice(0, 60);
  pushLog(`${item.title}：${picked.result}`);
  checkUnlocks(state);
  checkAchievements();
  saveState();
  render();
}

function applyEffects(effects = [], source = "") {
  effects.forEach(effect => {
    switch (effect.type) {
      case "resource":
        addResource(effect.key, effect.amount);
        break;
      case "attr":
        addAttr(effect.key, effect.amount);
        break;
      case "skillXp":
        if (!isUnlocked(state, effect.id) && SKILL_DISCOVERY_THRESHOLDS[effect.id]) {
          addSkillExposure(effect.id, effect.amount, SKILL_DISCOVERY_THRESHOLDS[effect.id], source);
        } else {
          addSkillXp(effect.id, effect.amount, source);
        }
        break;
      case "skillExposure":
        addSkillExposure(effect.id, effect.amount, effect.threshold, source);
        break;
      case "unlockSkill":
        unlockSkill(state, effect.id, { announce: true });
        break;
      case "trainingAccess":
        state.skillTrainingAccess[effect.id] = true;
        break;
      case "staminaMax":
        addPermanentStaminaMax(effect.amount, source);
        break;
      case "tag":
        state.tags[effect.id] = true;
        break;
      case "project":
        state.projectProgress = clamp(state.projectProgress + effect.amount, 0, 100);
        break;
      case "item":
        addInventoryItem(effect.id, effect.count || 1);
        break;
      default:
        break;
    }
  });
}

function selectSocialScene(sceneId) {
  const scene = getSocialScene(sceneId);
  if (!scene || !isSocialSceneAvailable(scene)) return;
  state.social.sceneId = scene.id;
  state.social.npcId = scene.npcIds[0] || "";
  saveState();
  render();
}

function selectSocialNpc(npcId) {
  const npcItem = getSocialNpc(npcId);
  if (!npcItem) return;
  state.social.sceneId = npcItem.sceneId;
  state.social.npcId = npcItem.id;
  saveState();
  render();
}

function startSocialAction(npcId, actionId = "talk", shouldRender = true) {
  const npcItem = getSocialNpc(npcId);
  const actionItem = getSocialAction(actionId);
  if (!npcItem || !actionItem) return false;
  if (!isSocialSceneAvailable(getSocialScene(npcItem.sceneId))) return false;

  state.social.sceneId = npcItem.sceneId;
  state.social.npcId = npcItem.id;
  if (!canSocialize(npcItem, actionItem.id)) {
    pushLog(`${npcItem.name}：体力或金钱不足，无法开始${actionItem.name}。`);
    if (shouldRender) render();
    return false;
  }

  const profile = getSocialActionProfile(npcItem, actionItem);
  state.social.action = {
    npcId: npcItem.id,
    actionId: actionItem.id,
    startedAt: Date.now(),
    duration: profile.duration,
    completions: 0,
  };
  pushLog(`开始${actionItem.name}：${npcItem.name}`);
  saveState();
  if (shouldRender) render();
  return true;
}

function socializeWithNpc(npcId, shouldRender = true, actionId = "talk", showGainToast = true, shouldSave = true) {
  const npcItem = getSocialNpc(npcId);
  const actionItem = getSocialAction(actionId);
  if (!npcItem || !actionItem) return false;
  if (!isSocialSceneAvailable(getSocialScene(npcItem.sceneId))) return false;

  const profile = getSocialActionProfile(npcItem, actionItem);
  if (!canSocialize(npcItem, actionItem.id)) {
    pushLog(`${npcItem.name}：体力或金钱不足，${actionItem.name}已停止。`);
    if (shouldSave) saveState();
    if (shouldRender) render();
    return false;
  }

  addResource("stamina", -profile.energyCost, { toast: showGainToast, source: actionItem.name });
  if (profile.moneyCost > 0) addResource("money", -profile.moneyCost, { toast: showGainToast, source: actionItem.name });
  addResource("reputation", 1);
  applySocialSkillEffects(profile.skillXp, `${npcItem.name}：${actionItem.name}`, showGainToast);

  const record = getNpcRecord(npcItem.id);
  const beforeFriendship = record.friendship;
  record.friendship = clamp(record.friendship + profile.friendshipGain, 0, 100);
  record.interactions += 1;

  const itemText = [];
  npcItem.drops.forEach(drop => {
    addInventoryItem(drop.id, drop.qty);
    const itemInfo = getInventoryItem(drop.id);
    itemText.push(`${itemInfo?.name || drop.id} x${drop.qty}`);
  });

  const bonusText = resolveSocialBonuses(npcItem);
  markSocialThresholds(npcItem, beforeFriendship, record.friendship);
  queueEvents("social_relation", 1);
  dispatchEventTrigger({
    source: "social",
    npcId: npcItem.id,
    actionId: actionItem.id,
    friendship: record.friendship,
    interactions: record.interactions,
  }, 1);
  checkUnlocks(state);
  checkAchievements();
  pushLog(`${npcItem.name}${actionItem.name}完成：获得 ${itemText.join("、")}，友好度 +${profile.friendshipGain}${bonusText ? `；${bonusText}` : ""}`);
  if (!bonusText) {
    showToast({
      type: "info",
      direction: "gain",
      key: `friendship:${npcItem.id}`,
      target: `${npcItem.name}友好度`,
      amount: profile.friendshipGain,
      unit: "点",
      verb: "获得",
      detail: itemText.join("、"),
    });
  }
  if (shouldSave) saveState();
  if (shouldRender) render();
  return true;
}

function resolveSocialBonuses(npcItem) {
  const record = getNpcRecord(npcItem.id);
  const triggered = [];
  npcItem.bonuses.forEach(bonus => {
    if (record.friendship < bonus.threshold) return;
    if (Math.random() > bonus.chance) return;
    applySocialBonusEffects(bonus.effects, npcItem.name);
    triggered.push(bonus.text);
  });
  return triggered.join("；");
}

function applySocialBonusEffects(effects = [], source = "") {
  effects.forEach(effect => {
    switch (effect.type) {
      case "resource":
        addResource(effect.key, effect.amount, { toast: effect.key === "money", source });
        break;
      case "attr":
        addAttr(effect.key, effect.amount);
        break;
      case "skillXp":
        addSkillXp(effect.id, effect.amount, `社交：${source}`, null, { toast: true });
        break;
      case "tag":
        state.tags[effect.id] = true;
        break;
      case "project":
        state.projectProgress = clamp(state.projectProgress + effect.amount, 0, 100);
        break;
      default:
        break;
    }
  });
}

function applySocialSkillEffects(effects = [], source = "", showGainToast = true) {
  effects.forEach(effect => {
    if (effect.unlockedOnly && !isUnlocked(state, effect.id)) return;
    if (effect.exposure) {
      addSkillExposure(effect.id, effect.amount, effect.threshold, source, { toast: showGainToast });
    } else {
      addSkillXp(effect.id, effect.amount, source, null, { toast: showGainToast });
    }
  });
}

function markSocialThresholds(npcItem, before, after) {
  const thresholds = Array.from(new Set([20, 40, 60, 80, ...npcItem.bonuses.map(item => item.threshold)]));
  thresholds.forEach(threshold => {
    if (before < threshold && after >= threshold) {
      state.tags[`friendship_${npcItem.id}_${threshold}`] = true;
    }
  });
}

function addInventoryItem(id, count = 1) {
  if (!getInventoryItem(id)) return;
  state.inventory[id] = (state.inventory[id] || 0) + count;
  dispatchEventTrigger({ source: "item", itemId: id, count, total: state.inventory[id] }, 1);
}

function canSocialize(npcItem, actionId = "talk") {
  const actionItem = getSocialAction(actionId);
  if (!npcItem || !actionItem) return false;
  const profile = getSocialActionProfile(npcItem, actionItem);
  return state.resources.stamina >= profile.energyCost
    && state.resources.money >= profile.moneyCost;
}

function ensureSocialSelection() {
  const scenes = getAvailableSocialScenes();
  if (!scenes.length) return;
  if (!scenes.some(scene => scene.id === state.social.sceneId)) {
    state.social.sceneId = scenes[0].id;
    state.social.npcId = scenes[0].npcIds[0] || "";
    return;
  }
  const scene = getSocialScene(state.social.sceneId);
  if (!scene.npcIds.includes(state.social.npcId)) {
    state.social.npcId = scene.npcIds[0] || "";
  }
}

function render() {
  renderNav();
  renderSidebarSkills();
  renderShell();
  renderTopResourceBar();
  renderNotices();
  renderHome();
  renderSkills();
  renderEvents();
  renderSocial();
  renderInventory();
  renderCareers();
  renderAchievements();
  document.querySelectorAll(".view").forEach(view => view.classList.toggle("active", view.id === `view-${activeView}`));
  promptMajorEventIfNeeded();
}

function renderNav() {
  document.querySelectorAll(".nav-button").forEach(button => {
    button.classList.toggle("active", button.dataset.view === activeView);
  });
}

function renderShell() {
  const stage = getStage(state.stageId);
  const calendar = formatGameDate(state.day);
  DOM.stageLabel.textContent = stage.name;
  DOM.metaLine.textContent = `${state.age} 岁 · ${calendar} · ${SCENES[state.sceneId]?.name || "未知场景"} · ${getCareer(state.careerId).name} · 职级 ${getCareerLevelLabel(state)}`;
}

function renderTopResourceBar() {
  const shown = RESOURCES.map(item => item.key);
  DOM.topResourceBar.innerHTML = shown.map(key => {
    const value = getDisplayResourceValue(key);
    const warning = (key === "stamina" && state.resources.stamina < 100) || (key === "happiness" && state.resources.happiness < 30);
    return `
    <div class="top-resource ${warning ? "warning" : ""}">
      <span>${resourceName(key)}</span>
      <strong>${value}</strong>
    </div>
  `;
  }).join("");
}

function renderSidebarSkills() {
  const preferred = [
    "KNOWLEDGE.MATH.ROOT.001",
    "KNOWLEDGE.LANGUAGE.ROOT.001",
    "KNOWLEDGE.ENGLISH.ROOT.001",
    "KNOWLEDGE.SCIENCE.ROOT.001",
    "KNOWLEDGE.SCIENCE.BASIC.001",
    "KNOWLEDGE.SCIENCE.BASIC.002",
    "KNOWLEDGE.HUMANITIES.ROOT.001",
    "TECH.COMPUTER.ROOT.001",
    "TECH.PROGRAMMING.BASIC.001",
    "ART.CREATIVE.ROOT.001",
    "ART.CREATIVE.BRANCH.002",
    "ART.MUSIC.BASIC.001",
    "LIFE.SOCIAL.ROOT.001",
    "LIFE.PLAY.ROOT.001",
    "LIFE.PLAY.BASIC.002",
    "LIFE.PLAY.BASIC.004",
    "LIFE.MIND.PASSIVE.001",
    "HEALTH.BASIC.ROOT.001",
    "HEALTH.SPORT.BASIC.001",
    "CAREER.BASIC.ROOT.001",
    "KNOWLEDGE.MATH.PRO.001",
  ];
  const visible = preferred
    .map(id => getSkill(id))
    .filter(Boolean)
    .filter(item => canTrainSkill(state, item));

  DOM.sidebarSkillList.innerHTML = visible.map(item => {
    const record = state.skills[item.id];
    const need = xpNeed(record.level || 1);
    const pct = clamp((record.xp / need) * 100, 0, 100);
    const gain = state.lastSkillGains?.[item.id] || 0;
    return `
      <button class="sidebar-skill ${state.training?.skillId === item.id ? "active" : ""}" type="button" data-train-skill="${item.id}">
        <span class="skill-dot ${item.domain.toLowerCase()}"></span>
        <span class="sidebar-skill-main">
          <span>${item.name}</span>
          <span class="sidebar-skill-bar"><span style="width:${pct}%"></span></span>
        </span>
        <span class="sidebar-skill-level">Lv.${record.level}</span>
        ${gain ? `<span class="sidebar-skill-gain">+${gain}</span>` : ""}
      </button>
    `;
  }).join("");

}

function renderNotices() {
  const notices = [];
  if (state.lastSettlement?.skillText) notices.push(state.lastSettlement.skillText);
  if (state.majorEventQueue?.length) notices.push(`有 ${state.majorEventQueue.length} 个重大事件等待选择。`);
  if (state.eventQueue.length) notices.push(`有 ${state.eventQueue.length} 个事件等待选择。`);
  if (state.resources.happiness < 30) notices.push("幸福感偏低，收益和事件倾向会变差。");
  if (state.resources.stamina < 100) notices.push("体力偏低，挂机效率会明显下降。");
  if (state.projectProgress >= 100 && !state.achievements.achievement_first_work_001) notices.push("作品已经完成，可以触发作品成就。");
  DOM.noticeRow.innerHTML = notices.slice(0, 3).map(item => `<div class="notice">${item}</div>`).join("");
}

function renderHome() {
  DOM.sceneBadge.textContent = SCENES[state.sceneId]?.name || "场景";
  DOM.vitalsGrid.innerHTML = ATTRS.map(item => meter(item.name, state.attrs[item.key], item.color)).join("");
  DOM.resourceGrid.innerHTML = RESOURCES.map(item => `
    <div class="resource-chip">
      <span>${item.name}</span>
      <strong>${getDisplayResourceValue(item.key)}</strong>
    </div>
  `).join("");

  DOM.trainingPanel.innerHTML = renderTrainingPanel();

  DOM.eventCountBadge.textContent = `${state.eventQueue.length + (state.majorEventQueue?.length || 0)} 个`;
  DOM.homeEventBox.innerHTML = renderEventFocus(true);
  DOM.logList.innerHTML = state.logs.slice(0, 14).map(item => `<div class="log-entry">${item}</div>`).join("") || `<div class="empty-state">暂无记录。</div>`;
}

function renderTrainingPanel() {
  const skillId = state.training?.skillId;
  const target = getSkill(skillId);
  if (!target || !canTrainSkill(state, target)) {
    return `<div class="empty-state">点击左侧或技能页中的已解锁技能，即可开始挂机训练。</div>`;
  }

  const entry = getTrainingEntry(skillId);
  const action = ACTIONS[entry.action];
  const record = state.skills[skillId];
  const result = calculateActionXp(entry, action.scene);
  const need = xpNeed(record.level || 1);
  const xpPct = clamp((record.xp / need) * 100, 0, 100);
  const progress = getTrainingProgress();
  const boost = result.boostInfo.total > 0 ? `学习加速 +${Math.round(result.boostInfo.total * 100)}%` : "暂无学习加速";
  const boostList = result.boostInfo.parts.length
    ? result.boostInfo.parts.map(part => `<span>${part.sourceName} +${Math.round(part.bonus * 100)}%</span>`).join("")
    : `<span>提升关联技能后会出现加速</span>`;
  return `
    <article class="training-card active-training-card">
      <div class="training-head">
        <div>
          <div class="slot-time">${domainName(target.domain)} · ${target.branch} · ${ACTIONS[entry.action].name}</div>
          <h3>${target.name}</h3>
        </div>
        <span class="badge">每次 +${result.xp} XP</span>
      </div>
      <div class="training-readout two-bars">
        <div class="readout-row">
          <div class="readout-label"><span>经验</span><strong>Lv.${record.level} · ${Math.round(record.xp)}/${need} XP</strong></div>
          <div class="training-progress-frame xp-frame">
            <div class="training-progress-fill xp-fill" style="width:${xpPct}%"></div>
          </div>
        </div>
        <div class="readout-row">
          <div class="readout-label"><span>技能 CD</span><strong data-training-time>${(progress.remaining / 1000).toFixed(1)} 秒</strong></div>
          <div class="training-progress-frame cd-frame">
            <div class="training-progress-fill cd-fill" data-training-cd-progress style="transform:scaleX(${progress.pct / 100})"></div>
          </div>
        </div>
      </div>
      <div class="training-boosts">
        <strong>${boost}</strong>
        ${boostList}
      </div>
    </article>
  `;
}

function meter(name, value, color) {
  return `
    <div class="meter-box">
      <div class="meter-label"><span>${name}</span><strong>${Math.round(value)}</strong></div>
      <div class="meter-track"><div class="meter-fill" style="width:${clamp(value, 0, 100)}%;background:${color}"></div></div>
    </div>
  `;
}

function renderSkills() {
  const unlockedSkills = getUnlockedSkills();
  const filters = ["ALL", ...Array.from(new Set(unlockedSkills.map(item => item.domain)))];
  if (!filters.includes(activeSkillFilter)) activeSkillFilter = "ALL";
  const names = { ALL: "全部", KNOWLEDGE: "知识", TECH: "科技", ART: "艺术", LIFE: "生活", HEALTH: "健康", CAREER: "职业" };
  DOM.skillFilters.innerHTML = filters.map(id => `<button type="button" data-filter="${id}" class="${activeSkillFilter === id ? "active" : ""}">${names[id] || id}</button>`).join("");
  DOM.skillFilters.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => {
      activeSkillFilter = button.dataset.filter;
      renderSkills();
    });
  });

  const list = unlockedSkills.filter(item => activeSkillFilter === "ALL" || item.domain === activeSkillFilter);
  DOM.skillGrid.innerHTML = list.map(item => renderSkillCard(item)).join("") || `<div class="empty-state">当前还没有发现这个领域的技能。</div>`;
}

function renderSkillCard(item) {
  const record = state.skills[item.id];
  const trainable = canTrainSkill(state, item);
  const boostInfo = getBoostInfo(item.id);
  const need = xpNeed(record.level || 1);
  const xpPct = clamp((record.xp / need) * 100, 0, 100);
  const reqText = item.desc;
  const boostText = boostInfo.parts.length
    ? `学习加速：${boostInfo.parts.map(part => `${part.sourceName} +${Math.round(part.bonus * 100)}%`).join("、")}`
    : "";
  const lastGain = state.lastSkillGains?.[item.id] || 0;
  const isTraining = trainable && state.training?.skillId === item.id;
  const cdProgress = isTraining ? getTrainingProgress() : { pct: 0, remaining: getTrainingDuration(item.id) };
  const cdFillAttr = isTraining ? "data-skill-card-cd-progress" : "";
  const cdTimeAttr = isTraining ? "data-skill-card-cd-time" : "";
  return `
    <article class="skill-card ${trainable ? "" : "passive-growth"} ${isTraining ? "active" : ""}" ${trainable ? `data-train-skill="${item.id}" role="button" tabindex="0"` : ""}>
      <div class="skill-head">
        <div>
          <div class="skill-name">${item.name}</div>
          <div class="item-meta">${domainName(item.domain)} · ${item.branch} · ${typeName(item.type)}</div>
        </div>
        <span class="badge ${trainable ? "" : "soft"}">${trainable ? `Lv.${record.level}` : "生活成长"}</span>
      </div>
      <div class="skill-card-bars">
        <div class="compact-readout">
          <div class="readout-label"><span>经验</span><strong>${Math.round(record.xp)}/${need}</strong></div>
          <div class="training-progress-frame compact-frame xp-frame">
            <div class="training-progress-fill xp-fill" style="width:${xpPct}%"></div>
          </div>
        </div>
        ${trainable ? `
          <div class="compact-readout">
            <div class="readout-label"><span>技能 CD</span><strong ${cdTimeAttr}>${isTraining ? `${(cdProgress.remaining / 1000).toFixed(1)} 秒` : "点击训练"}</strong></div>
            <div class="training-progress-frame compact-frame cd-frame">
              <div class="training-progress-fill cd-fill" ${cdFillAttr} style="transform:scaleX(${isTraining ? cdProgress.pct / 100 : 0})"></div>
            </div>
          </div>
        ` : ""}
      </div>
      <div class="skill-desc">${reqText}</div>
      <div class="boost-text">${trainable ? (isTraining ? "正在挂机训练" : "点击开始挂机") : (item.growthHint || "当前主要通过生活经历提升。")}</div>
      ${lastGain ? `<div class="boost-text">本次挂机经验 +${lastGain}</div>` : ""}
      ${boostText ? `<div class="boost-text">${boostText}</div>` : ""}
    </article>
  `;
}

function renderEvents() {
  DOM.eventPanel.innerHTML = renderEventFocus(false);
  DOM.eventHistory.innerHTML = state.eventHistory.map(item => `
    <div class="list-item">
      <div class="item-meta">${formatGameDate(item.day)} · ${item.choice}</div>
      <h3>${item.title}</h3>
      <p class="skill-desc">${item.result}</p>
    </div>
  `).join("") || `<div class="empty-state">还没有事件历史。</div>`;
}

function renderEventFocus(compact) {
  const id = state.eventQueue[0];
  const item = EVENTS.find(eventItem => eventItem.id === id);
  if (!item && state.majorEventQueue?.length) {
    const major = getMajorEvent(state.majorEventQueue[0]);
    return `<div class="empty-state">重大事件「${major?.title || "未知事件"}」等待处理，弹窗关闭后会在下次刷新时再次提醒。</div>`;
  }
  if (!item) return `<div class="empty-state">当前没有待处理事件。</div>`;
  return `
    <article class="event-card">
      <div class="event-title">${item.title}</div>
      <p class="event-text">${item.text}</p>
      <div class="choice-list">
        ${item.choices.map((choiceItem, index) => `<button type="button" data-event="${item.id}" data-choice="${index}">${choiceItem.text}</button>`).join("")}
      </div>
    </article>
  `;
}

function promptMajorEventIfNeeded() {
  if (!state?.majorEventQueue?.length || !DOM.modalBackdrop) return;
  if (!DOM.modalBackdrop.hidden && !DOM.modalBackdrop.classList.contains("is-hidden")) return;
  const item = getMajorEvent(state.majorEventQueue[0]);
  if (!item) return;
  openModal(`重大事件：${item.title}`, renderMajorEventModal(item));
}

function renderMajorEventModal(item) {
  const preview = item.id === "major_gaokao_001" ? renderGaokaoPreview() : "";
  return `
    <article class="event-card major-event-card">
      <div class="major-event-kicker">重大事件 · ${formatGameDate(item.month)}</div>
      <div class="event-title">${item.title}</div>
      <p class="event-text">${item.text}</p>
      ${preview}
      <div class="choice-list">
        ${item.choices.map((choiceItem, index) => `<button type="button" data-major-event="${item.id}" data-major-choice="${index}">${choiceItem.text}</button>`).join("")}
      </div>
    </article>
  `;
}

function renderGaokaoPreview() {
  const exam = calculateGaokaoScore(state);
  return `
    <div class="notice">
      当前预估：${exam.trackName} · ${exam.total} 分 · ${exam.tierName}
    </div>
  `;
}

function renderGaokaoResult(exam) {
  return `
    <article class="event-card major-event-card">
      <div class="major-event-kicker">${exam.trackName} · ${formatGameDate(exam.month)}</div>
      <div class="gaokao-total">
        <span>高考总分</span>
        <strong>${exam.total}</strong>
        <em>${exam.tierName}</em>
      </div>
      <p class="event-text">${exam.comment}</p>
      <div class="gaokao-score-grid">
        ${exam.subjects.map(subject => `
          <div class="subject-score">
            <span>${subject.name}</span>
            <strong>${subject.score}</strong>
            <small>能力均值 Lv.${subject.level} / ${subject.maxScore}分</small>
          </div>
        `).join("")}
      </div>
      <div class="resource-grid gaokao-reward-grid">
        <div class="resource-chip"><span>声望</span><strong>${formatSigned(exam.reputationReward)}</strong></div>
        <div class="resource-chip"><span>幸福感</span><strong>${formatSigned(exam.happinessReward)}</strong></div>
      </div>
    </article>
  `;
}

function renderSocial() {
  ensureSocialSelection();
  const stage = getStage(state.stageId);
  const scenes = getAvailableSocialScenes();
  const currentScene = getSocialScene(state.social.sceneId);
  const currentNpc = getSocialNpc(state.social.npcId);
  DOM.socialStageBadge.textContent = stage.name;
  DOM.socialSceneBadge.textContent = currentScene?.name || "未选择";
  DOM.socialNpcBadge.textContent = currentNpc ? getFriendshipRank(getNpcRecord(currentNpc.id).friendship).name : "未选择";

  DOM.socialSceneList.innerHTML = scenes.map(scene => {
    const active = state.social.sceneId === scene.id;
    return `
      <button class="social-scene ${active ? "active" : ""}" type="button" data-social-scene="${scene.id}">
        <span>${scene.name}</span>
        <small>${scene.desc}</small>
      </button>
    `;
  }).join("") || `<div class="empty-state">当前阶段没有可社交场景。</div>`;

  const npcs = currentScene ? currentScene.npcIds.map(getSocialNpc).filter(Boolean) : [];
  DOM.socialNpcGrid.innerHTML = npcs.map(npcItem => renderNpcCard(npcItem)).join("") || `<div class="empty-state">这个场景暂时没有 NPC。</div>`;
  DOM.socialDetail.innerHTML = currentNpc ? renderNpcDetail(currentNpc) : `<div class="empty-state">选择一个 NPC 开始社交。</div>`;
}

function renderNpcCard(npcItem) {
  const record = getNpcRecord(npcItem.id);
  const rank = getFriendshipRank(record.friendship);
  const active = state.social.npcId === npcItem.id;
  const pct = clamp(record.friendship, 0, 100);
  return `
    <article class="npc-card ${active ? "active" : ""}" data-social-npc="${npcItem.id}" role="button" tabindex="0">
      <div class="skill-head">
        <div>
          <div class="skill-name">${npcItem.name}</div>
          <div class="item-meta">${npcItem.role}</div>
        </div>
        <span class="badge ${active ? "" : "soft"}">${rank.name}</span>
      </div>
      <div class="compact-readout">
        <div class="readout-label"><span>友好度</span><strong>${Math.round(record.friendship)}/100</strong></div>
        <div class="training-progress-frame compact-frame social-frame">
          <div class="training-progress-fill social-fill" style="width:${pct}%"></div>
        </div>
      </div>
      <p class="skill-desc">${npcItem.desc}</p>
    </article>
  `;
}

function renderNpcDetail(npcItem) {
  const record = getNpcRecord(npcItem.id);
  const rank = getFriendshipRank(record.friendship);
  const actionItem = getSocialAction("talk");
  const profile = getSocialActionProfile(npcItem, actionItem);
  const isActive = state.social.action?.npcId === npcItem.id && state.social.action?.actionId === actionItem.id;
  const progress = isActive ? getSocialProgress() : { pct: 0, remaining: profile.duration };
  const drops = npcItem.drops.map(drop => {
    const itemInfo = getInventoryItem(drop.id);
    return `<span>${itemInfo?.name || drop.id} x${drop.qty}</span>`;
  }).join("");
  const bonusText = npcItem.bonuses.map(bonus => `<span>友好度 ${bonus.threshold}+：${bonus.text}</span>`).join("");
  const skillXpText = profile.skillXp.map(effect => {
    const skillItem = getSkill(effect.id);
    return `<span>${skillItem?.name || effect.id} +${effect.amount} XP${effect.unlockedOnly ? "（解锁后）" : ""}</span>`;
  }).join("");
  const canAct = canSocialize(npcItem, actionItem.id);
  const costs = [
    `体力 -${profile.energyCost}`,
    profile.moneyCost > 0 ? `金钱 -${profile.moneyCost}` : "",
  ].filter(Boolean).join(" · ");
  const cdFillAttr = isActive ? "data-social-cd-progress" : "";
  const cdTimeAttr = isActive ? "data-social-cd-time" : "";
  return `
    <article class="social-detail-card">
      <div class="training-head">
        <div>
          <div class="slot-time">${getSocialScene(npcItem.sceneId)?.name || "社交"} · ${npcItem.role}</div>
          <h3>${npcItem.name}</h3>
        </div>
        <span class="badge">${rank.name}</span>
      </div>
      <p class="event-text">${npcItem.desc}</p>
      <div class="social-cost-row">
        <div class="resource-chip"><span>消耗</span><strong>${costs}</strong></div>
        <div class="resource-chip"><span>友好度</span><strong>+${profile.friendshipGain}</strong></div>
      </div>
      <div class="compact-readout social-action-readout">
        <div class="readout-label"><span>${actionItem.name} CD</span><strong ${cdTimeAttr}>${(progress.remaining / 1000).toFixed(1)} 秒</strong></div>
        <div class="training-progress-frame compact-frame social-action-frame">
          <div class="training-progress-fill social-action-fill" ${cdFillAttr} style="transform:scaleX(${isActive ? progress.pct / 100 : 0})"></div>
        </div>
      </div>
      <div class="social-reward-list">
        <strong>固定获得</strong>
        ${drops}
      </div>
      <div class="social-reward-list">
        <strong>技能经验</strong>
        ${skillXpText}
      </div>
      <div class="social-reward-list">
        <strong>关系奖励</strong>
        ${bonusText || "<span>提升友好度后解锁。</span>"}
      </div>
      <button class="icon-button primary social-action-button" type="button" data-social-target="${npcItem.id}" data-social-action="${actionItem.id}" ${canAct || isActive ? "" : "disabled"}>
        <svg><use href="#i-social"></use></svg><span>${canAct || isActive ? (isActive ? "交谈中" : actionItem.name) : "资源不足"}</span>
      </button>
    </article>
  `;
}

function renderInventory() {
  const entries = Object.entries(state.inventory || {}).filter(([, count]) => count > 0);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);
  DOM.inventoryBadge.textContent = `${total} 件`;
  DOM.inventoryGrid.innerHTML = entries.map(([id, count]) => {
    const itemInfo = getInventoryItem(id);
    return `
      <article class="inventory-card">
        <div class="skill-head">
          <div>
            <div class="skill-name">${itemInfo?.name || id}</div>
            <div class="item-meta">${itemInfo?.category || "物品"}</div>
          </div>
          <span class="badge">x${count}</span>
        </div>
        <p class="skill-desc">${itemInfo?.desc || "尚未记录说明。"}</p>
      </article>
    `;
  }).join("") || `<div class="empty-state">背包还是空的。去社交场景里和 NPC 互动，可以获得道具。</div>`;
}

function renderCareers() {
  const current = getCareer(state.careerId);
  DOM.currentCareerBadge.textContent = current.name;
  DOM.careerGrid.innerHTML = CAREERS.filter(item => item.id !== "none").map(item => {
    const available = meetsAll(state, item.requirements);
    const active = item.id === state.careerId;
    return `
      <article class="career-card ${available ? "available" : ""}">
        <div class="skill-head">
          <div>
            <div class="skill-name">${item.name}</div>
            <div class="item-meta">月薪 ${getMonthlyIncome(state, item)} · 当前职级 ${getCareerLevelLabel(state)}</div>
          </div>
          <span class="badge ${active ? "" : "soft"}">${active ? "当前" : available ? "可申请" : "未满足"}</span>
        </div>
        <p class="skill-desc">${item.desc}</p>
        <p class="requirement-text">${available ? "条件已满足。" : missingRequirements(item.requirements)}</p>
        <div class="career-actions">
          <button class="small-button" type="button" data-career="${item.id}" ${available && !active ? "" : "disabled"}>申请</button>
        </div>
      </article>
    `;
  }).join("");

  DOM.careerGrid.querySelectorAll("[data-career]").forEach(button => {
    button.addEventListener("click", () => {
      state.careerId = button.dataset.career;
      if (state.stageId === "work" && !state.careerRank) state.careerRank = { tier: 1, step: 1 };
      state.resources.careerLevel = careerRankValue(state);
      pushLog(`职业切换为：${getCareer(state.careerId).name}`);
      dispatchEventTrigger({ source: "career", careerId: state.careerId, actionId: "selected", stageId: state.stageId }, 1);
      saveState();
      render();
    });
  });
}

function renderAchievements() {
  const done = Object.keys(state.achievements).length;
  DOM.achievementBadge.textContent = `${done}/${ACHIEVEMENTS.length}`;
  DOM.achievementGrid.innerHTML = ACHIEVEMENTS.map(item => {
    const achieved = Boolean(state.achievements[item.id]);
    return `
      <article class="achievement-card ${achieved ? "done" : ""}">
        <div class="skill-head">
          <div>
            <div class="skill-name">${item.title}</div>
            <div class="item-meta">${achieved ? `${formatGameDate(state.achievements[item.id].day)}达成` : "未达成"}</div>
          </div>
          <span class="badge ${achieved ? "" : "soft"}">${achieved ? "完成" : "进行中"}</span>
        </div>
        <p class="skill-desc">${item.desc}</p>
      </article>
    `;
  }).join("");
}

document.addEventListener("click", event => {
  const trainTarget = event.target.closest("[data-train-skill]");
  if (trainTarget) {
    startTraining(trainTarget.dataset.trainSkill);
    return;
  }
  const socialScene = event.target.closest("[data-social-scene]");
  if (socialScene) {
    selectSocialScene(socialScene.dataset.socialScene);
    return;
  }
  const socialNpc = event.target.closest("[data-social-npc]");
  if (socialNpc) {
    selectSocialNpc(socialNpc.dataset.socialNpc);
    return;
  }
  const socialAction = event.target.closest("[data-social-action]");
  if (socialAction) {
    startSocialAction(socialAction.dataset.socialTarget, socialAction.dataset.socialAction);
    return;
  }
  const majorChoiceButton = event.target.closest("[data-major-event][data-major-choice]");
  if (majorChoiceButton) {
    resolveMajorEventChoice(majorChoiceButton.dataset.majorEvent, Number(majorChoiceButton.dataset.majorChoice));
    return;
  }
  const choiceButton = event.target.closest("[data-event][data-choice]");
  if (choiceButton) {
    resolveEventChoice(choiceButton.dataset.event, Number(choiceButton.dataset.choice));
  }
});

document.addEventListener("keydown", event => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const trainTarget = event.target.closest?.("[data-train-skill]");
  if (trainTarget) {
    event.preventDefault();
    startTraining(trainTarget.dataset.trainSkill);
    return;
  }
  const socialNpc = event.target.closest?.("[data-social-npc]");
  if (socialNpc) {
    event.preventDefault();
    selectSocialNpc(socialNpc.dataset.socialNpc);
  }
});

function missingRequirements(requirements = []) {
  if (!requirements.length) return "自动解锁。";
  return requirements.map(req => requirementText(req)).join("；");
}

function requirementText(req) {
  if (meets(state, req)) return `已满足：${requirementName(req)}`;
  return `还需：${requirementName(req)}`;
}

function requirementName(req) {
  switch (req.type) {
    case "skill":
      return `${getSkill(req.id)?.name || req.id} Lv.${req.level}`;
    case "attr":
      return `${attrName(req.key)} >= ${req.value}`;
    case "attrMax":
      return `${attrName(req.key)} <= ${req.value}`;
    case "resource":
      return `${resourceName(req.key)} >= ${req.value}`;
    case "resourceMax":
      return `${resourceName(req.key)} <= ${req.value}`;
    case "stage":
      return `${getStage(req.id).name}`;
    case "event":
      return `完成事件 ${eventName(req.id)}`;
    case "achievement":
      return `成就 ${achievementName(req.id)}`;
    case "career":
      return `职业 ${getCareer(req.id).name}`;
    case "tag":
      return `标签 ${req.id}`;
    case "age":
      return `年龄 >= ${req.age}`;
    case "anyOf":
      return `任一：${req.items.map(requirementName).join(" / ")}`;
    case "anySkillAt":
      return `任意技能 Lv.${req.level}`;
    case "nonCareerSkill":
      return `任意非职业技能 Lv.${req.level}`;
    default:
      return "特殊条件";
  }
}

function canAlmostUnlock(item) {
  if (state.skills[item.id]?.unlocked) return true;
  if (!item.unlock.length) return true;
  const total = item.unlock.length;
  const met = item.unlock.filter(req => meets(state, req)).length;
  return met > 0 && met >= Math.max(1, total - 1);
}

function getSkill(id) {
  return SKILLS.find(item => item.id === id);
}

function getCareer(id) {
  return CAREERS.find(item => item.id === id) || CAREERS[0];
}

function getStage(id) {
  return STAGES.find(item => item.id === id) || STAGES[0];
}

function getInventoryItem(id) {
  return INVENTORY_ITEMS.find(item => item.id === id);
}

function getSocialScene(id) {
  return SOCIAL_SCENES.find(item => item.id === id);
}

function getSocialNpc(id) {
  return SOCIAL_NPCS.find(item => item.id === id);
}

function getSocialAction(id) {
  return SOCIAL_ACTIONS.find(item => item.id === id) || SOCIAL_ACTIONS[0];
}

function getMajorEvent(id) {
  return MAJOR_EVENTS.find(item => item.id === id);
}

function getSocialActionProfile(npcItem, actionItem = getSocialAction("talk")) {
  const rawEnergyCost = Math.max(0, (npcItem.energyCost || 0) + (actionItem.energyCost || 0));
  return {
    duration: Math.max(800, actionItem.duration || 3000),
    energyCost: rawEnergyCost ? Math.max(1, Math.round(rawEnergyCost / 4)) : 0,
    moneyCost: Math.max(0, (npcItem.moneyCost || 0) + (actionItem.moneyCost || 0)),
    friendshipGain: Math.max(0, (npcItem.friendshipGain || 0) + (actionItem.friendshipGain || 0)),
    skillXp: [...(actionItem.skillXp || []), ...(SOCIAL_NPC_SKILL_EXPOSURE[npcItem.id] || [])],
  };
}

function getAvailableSocialScenes() {
  return SOCIAL_SCENES.filter(item => isSocialSceneAvailable(item));
}

function isSocialSceneAvailable(scene) {
  return Boolean(scene && scene.stages.includes(state.stageId));
}

function getNpcRecord(id) {
  if (!state.social.npcs[id]) state.social.npcs[id] = { friendship: 0, interactions: 0 };
  return state.social.npcs[id];
}

function getFriendshipRank(value) {
  if (value >= 80) return { name: "信赖", next: 100 };
  if (value >= 60) return { name: "亲近", next: 80 };
  if (value >= 40) return { name: "熟悉", next: 60 };
  if (value >= 20) return { name: "认识", next: 40 };
  return { name: "陌生", next: 20 };
}

function getUnlockedSkills() {
  return SKILLS.filter(item => isUnlocked(state, item.id));
}

function isUnlocked(target, id) {
  return Boolean(target.skills[id]?.unlocked);
}

function canTrainSkill(target, item) {
  if (!target || !item || !isUnlocked(target, item.id)) return false;
  if (target.skillTrainingAccess?.[item.id]) return true;
  if (!item.trainableStages?.length) return true;
  return item.trainableStages.includes(target.stageId);
}

function getLevel(target, id) {
  return target.skills[id]?.level || 0;
}

function skillIdsByBranch(branch) {
  return SKILLS.filter(item => item.branch === branch).map(item => item.id);
}

function domainCountAt(target, level) {
  const domains = new Set();
  SKILLS.forEach(item => {
    if (getLevel(target, item.id) >= level) domains.add(item.domain);
  });
  return domains.size;
}

function stageIndex(id) {
  return STAGES.findIndex(item => item.id === id);
}

function domainName(id) {
  return { KNOWLEDGE: "知识", TECH: "科技", ART: "艺术", LIFE: "生活", HEALTH: "健康", CAREER: "职业" }[id] || id;
}

function typeName(id) {
  return { ROOT: "根", BASIC: "基础", BRANCH: "分支", PRO: "专业", APPLICATION: "应用", PASSIVE: "被动", HIDDEN: "隐藏" }[id] || id;
}

function attrName(key) {
  if (key === "energy") return "体力";
  return ATTRS.find(item => item.key === key)?.name || key;
}

function resourceName(key) {
  const names = { energy: "体力", stamina: "体力", health: "健康", money: "金钱", knowledge: "知识点", inspiration: "灵感", social: "社交资本", stress: "压力", happiness: "幸福感", reputation: "声望", careerLevel: "职级", morality: "道德" };
  return names[key] || key;
}

function getDisplayResourceValue(key, target = state) {
  if (key === "careerLevel") return getCareerLevelLabel(target);
  if (key === "stamina") return `${Math.round(getResourceValue(target, key))}/${getMaxStamina(target)}`;
  const value = getResourceValue(target, key);
  return Number.isFinite(value) ? Math.round(value) : value;
}

function eventName(id) {
  return EVENTS.find(item => item.id === id)?.title || getMajorEvent(id)?.title || id;
}

function achievementName(id) {
  return ACHIEVEMENTS.find(item => item.id === id)?.title || id;
}

function formatSigned(value) {
  return `${value >= 0 ? "+" : ""}${value}`;
}

function showToast({ type = "info", direction = "gain", key = "", title = "", detail = "", target = "", amount = null, unit = "", verb = "" }) {
  if (!DOM.toastStack || !document.createElement) return;
  const hasAmount = amount !== null && amount !== undefined && Number.isFinite(Number(amount));
  const toastKey = key || `${type}:${direction}:${title}:${detail}`;
  const cached = activeToasts.get(toastKey);
  const total = hasAmount ? (cached?.amount || 0) + Math.abs(Number(amount)) : 0;
  let node = cached?.node;

  if (!node || !node.isConnected) {
    node = document.createElement("div");
    node.dataset.toastId = String(++toastSerial);
    node.dataset.toastKey = toastKey;
    DOM.toastStack.appendChild(node);
  }

  const displayTitle = hasAmount
    ? `${verb || defaultToastVerb(type, direction)}${target || title}${formatToastAmount(total)}${unit}`
    : title;
  node.className = `toast toast-${type} toast-${direction}`;
  node.innerHTML = `
    <div class="toast-icon">${escapeHtml(toastIcon(type, direction))}</div>
    <div class="toast-copy">
      <strong>${escapeHtml(displayTitle)}</strong>
      ${detail ? `<span>${escapeHtml(detail)}</span>` : ""}
    </div>
  `;

  if (cached?.timer) clearTimeout(cached.timer);
  const timer = setTimeout(() => {
    activeToasts.delete(toastKey);
    node.remove();
  }, TOAST_TTL_MS);
  activeToasts.set(toastKey, { node, amount: total, timer });
  trimToastStack();
}

function defaultToastVerb(type, direction) {
  if (direction === "cost") return type === "money" ? "支出" : "消耗";
  if (type === "attr") return "恢复";
  return "获得";
}

function toastIcon(type, direction) {
  if (type === "xp") return "XP";
  if (type === "money") return direction === "cost" ? "-" : "¥";
  return direction === "cost" ? "-" : "+";
}

function formatToastAmount(value) {
  return String(Math.round(value));
}

function trimToastStack() {
  const nodes = Array.from(DOM.toastStack.querySelectorAll(".toast"));
  while (nodes.length > MAX_VISIBLE_TOASTS) {
    const removed = nodes.shift();
    if (!removed) break;
    const toastKey = removed.dataset.toastKey;
    if (toastKey && activeToasts.has(toastKey)) {
      clearTimeout(activeToasts.get(toastKey).timer);
      activeToasts.delete(toastKey);
    }
    removed.remove();
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function pushLog(text) {
  pushLogTo(state, text);
}

function pushLogTo(target, text) {
  target.logs.unshift(`${formatGameDate(target.day)}：${text}`);
  target.logs = target.logs.slice(0, 80);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function snapshotState() {
  return JSON.parse(JSON.stringify({
    day: state.day,
    attrs: state.attrs,
    resources: state.resources,
    skills: state.skills,
    eventQueue: state.eventQueue,
    majorEventQueue: state.majorEventQueue || [],
  }));
}

function diffSnapshot(before, after, days, hours) {
  const resources = {};
  Object.keys(after.resources).forEach(key => {
    if (!isCoreResource(key)) return;
    const diff = after.resources[key] - before.resources[key];
    if (diff) resources[key] = diff;
  });
  const attrs = {};
  Object.keys(after.attrs).forEach(key => {
    const diff = after.attrs[key] - before.attrs[key];
    if (diff) attrs[key] = diff;
  });
  const skillChanges = [];
  Object.keys(after.skills).forEach(id => {
    const oldSkill = before.skills[id] || { level: 0, xp: 0, unlocked: false };
    const newSkill = after.skills[id];
    const xpDiff = Math.round(totalSkillXp(newSkill) - totalSkillXp(oldSkill));
    const levelDiff = newSkill.level - oldSkill.level;
    const unlocked = !oldSkill.unlocked && newSkill.unlocked;
    if (xpDiff > 0 || levelDiff > 0 || unlocked) {
      skillChanges.push({
        id,
        name: getSkill(id)?.name || id,
        xp: Math.max(0, xpDiff),
        level: newSkill.level,
        levelDiff,
        unlocked,
      });
    }
  });
  const beforeEventCount = (before.eventQueue?.length || 0) + (before.majorEventQueue?.length || 0);
  const afterEventCount = (after.eventQueue?.length || 0) + (after.majorEventQueue?.length || 0);
  return { days, hours, resources, attrs, skillChanges, events: afterEventCount - beforeEventCount };
}

function renderOfflineSummary(summary) {
  const resources = Object.entries(summary.resources).map(([key, value]) => `<div class="resource-chip"><span>${resourceName(key)}</span><strong>${formatSigned(value)}</strong></div>`).join("");
  const attrs = Object.entries(summary.attrs).map(([key, value]) => `<div class="resource-chip"><span>${attrName(key)}</span><strong>${formatSigned(value)}</strong></div>`).join("");
  const skills = summary.skillChanges.map(item => `<div class="log-entry">${formatSkillChange(item)}</div>`).join("");
  const offlineLine = summary.ticks
    ? `离线约 ${summary.hours.toFixed(1)} 小时，完成 ${summary.ticks} 次技能训练。`
    : `离线约 ${summary.hours.toFixed(1)} 小时，未完成技能训练。`;
  return `
    <div class="notice">${offlineLine}</div>
    <h3>资源变化</h3>
    <div class="resource-grid">${resources || `<div class="empty-state">资源没有明显变化。</div>`}</div>
    <h3 style="margin-top:14px">属性变化</h3>
    <div class="resource-grid">${attrs || `<div class="empty-state">属性没有明显变化。</div>`}</div>
    <h3 style="margin-top:14px">技能升级</h3>
    <div class="log-list">${skills || `<div class="empty-state">没有新的技能升级。</div>`}</div>
  `;
}

function hasOfflineChanges(summary) {
  return Object.keys(summary.resources).length > 0
    || Object.keys(summary.attrs).length > 0
    || summary.skillChanges.length > 0
    || summary.events > 0;
}

function calculateActionXp(entry, sceneId) {
  const action = ACTIONS[entry.action] || ACTIONS.rest;
  const skillItem = getSkill(entry.target);
  if (!skillItem || action.xp <= 0 || !isUnlocked(state, skillItem.id)) {
    return { xp: 0, boostInfo: { total: 0, parts: [] } };
  }
  const domainMultiplier = action.domains.includes(skillItem.domain) ? 1 : 0.68;
  const attrMultiplier = getAttributeMultiplier(skillItem);
  const sceneMultiplier = getSceneMultiplier(skillItem, sceneId || action.scene || state.sceneId);
  const status = getStatusModifier();
  const boostInfo = getBoostInfo(skillItem.id);
  const xp = Math.max(1, Math.round(action.xp * domainMultiplier * attrMultiplier * sceneMultiplier * status * (1 + boostInfo.total)));
  return { xp, boostInfo };
}

function totalSkillXp(record = { level: 0, xp: 0 }) {
  let total = 0;
  for (let level = 1; level < (record.level || 0); level += 1) {
    total += xpNeed(level);
  }
  return total + (record.xp || 0);
}

function rememberSettlement(reason, summary) {
  const gains = {};
  summary.skillChanges.forEach(item => {
    if (item.xp > 0) gains[item.id] = item.xp;
  });
  state.lastSkillGains = gains;
  state.lastSettlement = {
    day: state.day,
    reason,
    skillText: formatSkillGainSummary(summary.skillChanges),
  };
}

function formatSkillGainSummary(changes = []) {
  const xpChanges = changes.filter(item => item.xp > 0);
  if (!xpChanges.length) return "";
  const shown = xpChanges
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 3)
    .map(formatSkillChange)
    .join("，");
  const extra = xpChanges.length > 3 ? ` 等 ${xpChanges.length} 项技能` : "";
  return `本次挂机：${shown}${extra}`;
}

function formatSkillChange(item) {
  const parts = [];
  if (item.unlocked) parts.push("解锁");
  if (item.xp > 0) parts.push(`经验 +${item.xp}`);
  if (item.levelDiff > 0) parts.push(`升至 Lv.${item.level}`);
  return `${item.name} ${parts.join("，")}`;
}

function openModal(title, body) {
  const titleNode = document.getElementById("modalTitle");
  if (!titleNode || !DOM.modalBody || !DOM.modalBackdrop) return;
  titleNode.textContent = title;
  DOM.modalBody.innerHTML = body;
  DOM.modalBackdrop.hidden = false;
  DOM.modalBackdrop.classList.remove("is-hidden");
}

function closeModal() {
  if (!DOM.modalBackdrop || !DOM.modalBody) return;
  DOM.modalBackdrop.hidden = true;
  DOM.modalBackdrop.classList.add("is-hidden");
  DOM.modalBody.innerHTML = "";
}
