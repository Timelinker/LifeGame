"use strict";

globalThis.LIFE_EVENT_PACKS = [
  {
    id: "high-school-starter-pack",
    name: "高中生活示例事件包",
    events: [
      {
        id: "skill_math_classmate_question_001",
        type: "random",
        title: "同桌的数学题",
        text: "同桌把练习册推过来，想听听你是怎么理解这道题的。",
        trigger: {
          source: "skill",
          skillId: "KNOWLEDGE.MATH.ROOT.001",
          interval: 8,
          chance: 0.35,
        },
        stages: ["teen"],
        conditions: [
          { type: "skill", id: "KNOWLEDGE.MATH.ROOT.001", level: 2 },
        ],
        repeat: { once: false, cooldown: 2, weight: 30 },
        choices: [
          {
            text: "认真讲解",
            effects: [
              { type: "skillXp", id: "KNOWLEDGE.MATH.ROOT.001", amount: 30 },
              { type: "skillExposure", id: "LIFE.SOCIAL.ROOT.001", amount: 12, threshold: 60 },
              { type: "resource", key: "stamina", amount: -3 },
            ],
            result: "你在讲解时，也重新整理了自己的思路。",
          },
          {
            text: "一起问老师",
            effects: [
              { type: "skillXp", id: "KNOWLEDGE.MATH.ROOT.001", amount: 20 },
              { type: "skillExposure", id: "LIFE.SOCIAL.BASIC.001", amount: 8, threshold: 45 },
            ],
            result: "你们一起把模糊的地方问清楚了。",
          },
        ],
      },
      {
        id: "social_teacher_restate_001",
        type: "random",
        title: "老师让你复述",
        text: "老师没有直接给答案，而是请你先把自己的理解完整说一遍。",
        trigger: {
          source: "social",
          npcId: "teacher",
          actionId: "talk",
          minFriendship: 20,
          interval: 4,
          chance: 0.45,
        },
        stages: ["teen"],
        conditions: [],
        repeat: { once: false, cooldown: 3, weight: 28 },
        choices: [
          {
            text: "慢慢说明白",
            effects: [
              { type: "skillExposure", id: "LIFE.SOCIAL.ROOT.001", amount: 18, threshold: 60 },
              { type: "skillExposure", id: "LIFE.SOCIAL.BASIC.001", amount: 10, threshold: 45 },
              { type: "resource", key: "reputation", amount: 1 },
            ],
            result: "你发现把话说清楚，本身也是一种能力。",
          },
          {
            text: "先听老师梳理",
            effects: [
              { type: "skillExposure", id: "LIFE.SOCIAL.BASIC.001", amount: 18, threshold: 45 },
              { type: "skillXp", id: "KNOWLEDGE.LANGUAGE.ROOT.001", amount: 20 },
            ],
            result: "你记住了对方组织信息的方式。",
          },
        ],
      },
    ],
  },
];
