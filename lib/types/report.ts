export interface Report {
  scriptId: string;
  interventionPointId: string;
  heroType: HeroType;
  dimensions: {
    boundary: number;
    strategy: number;
    empathy: number;
  };
  keyMoment: {
    quote: string;
    comment: string;
  };
  aiThoughts: {
    characterName: string;
    thought: string;
  }[];
  knowledge: {
    title: string;
    content: string;
  };
  createdAt: number;
}

export interface HeroType {
  id: string;
  name: string;
  description: string;
  badge: string;
}

export const HERO_TYPES: Record<string, HeroType> = {
  PEACEFUL_DOVE: {
    id: 'peaceful-dove',
    name: '和平主义小白鸽',
    description: '你总是试图让所有人都满意，但有时候，过度的和平反而让矛盾更加复杂。',
    badge: '/images/badges/peaceful-dove.svg',
  },
  BOUNDARY_GUARDIAN: {
    id: 'boundary-guardian',
    name: '硬核边界守卫者',
    description: '你很清楚自己的底线，并且坚定地守护它。但有时候，过于强硬可能会伤害关系。',
    badge: '/images/badges/boundary-guardian.svg',
  },
  LOGIC_MASTER: {
    id: 'logic-master',
    name: '逻辑流吐槽怪',
    description: '你善于分析问题，找到解决方案。但有时候，过于理性可能会忽略情感的重要性。',
    badge: '/images/badges/logic-master.svg',
  },
  DIPLOMAT: {
    id: 'diplomat',
    name: '外交官',
    description: '你既能理解他人，又能坚持原则。你是天生的调解者。',
    badge: '/images/badges/diplomat.svg',
  },
  IDEALIST_WARRIOR: {
    id: 'idealist-warrior',
    name: '理想主义战士',
    description: '你既有同情心，又有原则，还有策略。你是最理想的沟通者。',
    badge: '/images/badges/idealist-warrior.svg',
  },
  ZEN_OBSERVER: {
    id: 'zen-observer',
    name: '佛系观察者',
    description: '你倾向于观察而非介入。有时候，适当的参与可能会带来更好的结果。',
    badge: '/images/badges/zen-observer.svg',
  },
  EMOTIONAL_FIGHTER: {
    id: 'emotional-fighter',
    name: '情绪化战士',
    description: '你有强烈的同情心和原则，但有时候情绪会影响你的判断。',
    badge: '/images/badges/emotional-fighter.svg',
  },
  CALM_ANALYST: {
    id: 'calm-analyst',
    name: '冷静分析师',
    description: '你善于分析问题，保持冷静。但有时候，适当的情感表达也很重要。',
    badge: '/images/badges/calm-analyst.svg',
  },
};
