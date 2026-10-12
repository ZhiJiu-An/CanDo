// 菜品相关类型定义

// 食材项
export interface Ingredient {
  name: string;
  amount: string;
}

// 制作步骤项（纯文字）
export interface Step {
  order: number;
  text: string;
}

// 菜品
export interface Dish {
  _id: string;
  _openid?: string;
  name: string;
  coverImage: string;
  category: string;
  intro?: string;
  ingredients: Ingredient[];
  steps: Step[];
  // 收藏 / 置顶 / 标签
  favorited: boolean;
  pinned: boolean;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

// 新增/编辑菜品入参（不含 _id / 时间；收藏置顶标签不在表单中管理）
export interface DishInput {
  name: string;
  coverImage: string;
  category: string;
  intro?: string;
  ingredients: Ingredient[];
  steps: Step[];
}

// 可局部更新的字段（收藏/置顶/标签）
export type DishPatch = Partial<Pick<Dish, 'favorited' | 'pinned' | 'tags'>>;

// 分类信息（含菜品数量与系统标记）
export interface CategoryInfo {
  name: string;
  count: number;
  system: boolean;
}

// 云函数统一返回格式
export interface CloudResult<T = any> {
  code: number;
  message: string;
  data: T;
}
