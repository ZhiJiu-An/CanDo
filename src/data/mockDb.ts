import type { Dish, DishInput, DishPatch, CategoryInfo, Ingredient, Step } from '@/types/dish'
import { SYSTEM_CATEGORY, DEFAULT_CATEGORIES } from '@/constants/category'
import { filterDishes } from '@/utils/search'

// 生成 mock id
function genId(prefix = 'd'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

// 初始 mock 菜品数据（美食类 picsum 图）
const INITIAL_DISHES: Dish[] = [
  {
    _id: 'd1',
    name: '番茄炒蛋',
    coverImage: 'https://picsum.photos/id/292/600/400',
    category: '家常菜',
    intro: '快手家常菜，酸甜下饭，零失败入门菜。',
    ingredients: [
      { name: '番茄', amount: '2个' },
      { name: '鸡蛋', amount: '3个' },
      { name: '白糖', amount: '1勺' },
      { name: '盐', amount: '适量' }
    ],
    steps: [
      { order: 1, text: '番茄洗净切块，鸡蛋打散加少许盐搅匀。' },
      { order: 2, text: '热锅冷油，倒入蛋液炒散盛出。' },
      { order: 3, text: '底油下番茄翻炒出汁，加糖、盐调味。' },
      { order: 4, text: '倒回鸡蛋翻炒均匀，出锅装盘。' }
    ],
    favorited: true,
    pinned: true,
    tags: ['下饭', '快手', '入门'],
    createdAt: 1695000000000,
    updatedAt: 1695000000000
  },
  {
    _id: 'd2',
    name: '红烧排骨',
    coverImage: 'https://picsum.photos/id/312/600/400',
    category: '家常菜',
    intro: '色泽红亮，肉质软烂，咸甜适口。',
    ingredients: [
      { name: '排骨', amount: '500g' },
      { name: '生抽', amount: '2勺' },
      { name: '老抽', amount: '1勺' },
      { name: '冰糖', amount: '20g' },
      { name: '姜', amount: '3片' }
    ],
    steps: [
      { order: 1, text: '排骨冷水下锅，焯水去血沫后捞出。' },
      { order: 2, text: '锅中下冰糖炒糖色，放入排骨翻炒上色。' },
      { order: 3, text: '加生抽、老抽、姜片，倒入热水没过排骨。' },
      { order: 4, text: '大火烧开转小火炖 40 分钟，收汁装盘。' }
    ],
    favorited: true,
    pinned: false,
    tags: ['宴客', '硬菜'],
    createdAt: 1695100000000,
    updatedAt: 1695100000000
  },
  {
    _id: 'd3',
    name: '清蒸鲈鱼',
    coverImage: 'https://picsum.photos/id/326/600/400',
    category: '家常菜',
    intro: '原汁原味，鱼肉鲜嫩，淋上热油激香。',
    ingredients: [
      { name: '鲈鱼', amount: '1条' },
      { name: '葱', amount: '2根' },
      { name: '姜', amount: '1块' },
      { name: '蒸鱼豉油', amount: '2勺' }
    ],
    steps: [
      { order: 1, text: '鲈鱼处理干净，鱼身划刀，铺姜丝。' },
      { order: 2, text: '水开后上锅大火蒸 8 分钟。' },
      { order: 3, text: '倒掉蒸出的腥水，铺上葱丝。' },
      { order: 4, text: '淋蒸鱼豉油，浇一勺热油激香即可。' }
    ],
    favorited: false,
    pinned: false,
    tags: ['宴客', '清淡'],
    createdAt: 1695200000000,
    updatedAt: 1695200000000
  },
  {
    _id: 'd4',
    name: '紫菜蛋花汤',
    coverImage: 'https://picsum.photos/id/431/600/400',
    category: '汤品',
    intro: '清淡鲜美，三分钟上桌的快手汤。',
    ingredients: [
      { name: '紫菜', amount: '一小把' },
      { name: '鸡蛋', amount: '2个' },
      { name: '香油', amount: '几滴' },
      { name: '盐', amount: '适量' }
    ],
    steps: [
      { order: 1, text: '紫菜撕碎洗净，鸡蛋打散。' },
      { order: 2, text: '锅加水烧开，放入紫菜煮 1 分钟。' },
      { order: 3, text: '淋蛋液划散，加盐和香油调味出锅。' }
    ],
    favorited: false,
    pinned: false,
    tags: ['快手', '清淡'],
    createdAt: 1695300000000,
    updatedAt: 1695300000000
  },
  {
    _id: 'd5',
    name: '冬瓜排骨汤',
    coverImage: 'https://picsum.photos/id/570/600/400',
    category: '汤品',
    intro: '汤清味鲜，清热解腻。',
    ingredients: [
      { name: '排骨', amount: '300g' },
      { name: '冬瓜', amount: '400g' },
      { name: '姜', amount: '2片' },
      { name: '盐', amount: '适量' }
    ],
    steps: [
      { order: 1, text: '排骨焯水去血沫，冬瓜去皮切块。' },
      { order: 2, text: '排骨加姜片入锅，加水大火烧开转小火炖 30 分钟。' },
      { order: 3, text: '下冬瓜继续炖 15 分钟，加盐调味即可。' }
    ],
    favorited: false,
    pinned: false,
    tags: ['清淡', '炖菜'],
    createdAt: 1695400000000,
    updatedAt: 1695400000000
  },
  {
    _id: 'd6',
    name: '蛋炒饭',
    coverImage: 'https://picsum.photos/id/580/600/400',
    category: '主食',
    intro: '粒粒分明，金黄喷香，最快清冰箱。',
    ingredients: [
      { name: '隔夜饭', amount: '1碗' },
      { name: '鸡蛋', amount: '2个' },
      { name: '葱花', amount: '适量' },
      { name: '盐', amount: '适量' }
    ],
    steps: [
      { order: 1, text: '鸡蛋打散，米饭抓散。' },
      { order: 2, text: '热锅下油，倒蛋液炒散盛出。' },
      { order: 3, text: '下米饭翻炒至松散，倒回鸡蛋。' },
      { order: 4, text: '加盐调味，撒葱花炒匀出锅。' }
    ],
    favorited: true,
    pinned: true,
    tags: ['快手', '一人食'],
    createdAt: 1695500000000,
    updatedAt: 1695500000000
  },
  {
    _id: 'd7',
    name: '葱油拌面',
    coverImage: 'https://picsum.photos/id/625/600/400',
    category: '主食',
    intro: '葱香浓郁，简易又满足。',
    ingredients: [
      { name: '面条', amount: '1把' },
      { name: '小葱', amount: '4根' },
      { name: '生抽', amount: '2勺' },
      { name: '白糖', amount: '半勺' }
    ],
    steps: [
      { order: 1, text: '小葱切段，葱白葱叶分开。' },
      { order: 2, text: '锅中宽油炸葱白至微黄，再下葱叶炸至焦脆，滤出葱油。' },
      { order: 3, text: '生抽加糖煮开成酱汁。' },
      { order: 4, text: '面条煮熟捞出，淋酱汁和葱油拌匀。' }
    ],
    favorited: false,
    pinned: false,
    tags: ['一人食'],
    createdAt: 1695600000000,
    updatedAt: 1695600000000
  },
  {
    _id: 'd8',
    name: '锅贴煎饺',
    coverImage: 'https://picsum.photos/id/835/600/400',
    category: '小吃',
    intro: '底脆馅香，金黄诱人。',
    ingredients: [
      { name: '饺子', amount: '10个' },
      { name: '面粉', amount: '1勺' },
      { name: '醋', amount: '适量' },
      { name: '油', amount: '适量' }
    ],
    steps: [
      { order: 1, text: '平底锅抹油，排入饺子。' },
      { order: 2, text: '面粉加水调成稀面水，倒入锅中。' },
      { order: 3, text: '盖盖中火煎至水干底金黄，蘸醋食用。' }
    ],
    favorited: false,
    pinned: false,
    tags: ['早餐'],
    createdAt: 1695700000000,
    updatedAt: 1695700000000
  },
  {
    _id: 'd9',
    name: '葱油饼',
    coverImage: 'https://picsum.photos/id/1080/600/400',
    category: '小吃',
    intro: '层层酥脆，葱香满口。',
    ingredients: [
      { name: '中筋面粉', amount: '300g' },
      { name: '小葱', amount: '5根' },
      { name: '盐', amount: '适量' },
      { name: '油', amount: '适量' }
    ],
    steps: [
      { order: 1, text: '面粉加热水揉成团，醒 20 分钟。' },
      { order: 2, text: '擀开抹油撒葱花盐，卷起再按扁擀圆。' },
      { order: 3, text: '平底锅小火煎至两面金黄即可。' }
    ],
    favorited: false,
    pinned: false,
    tags: ['早餐'],
    createdAt: 1695800000000,
    updatedAt: 1695800000000
  },
  {
    _id: 'd10',
    name: '凉拌黄瓜',
    coverImage: 'https://picsum.photos/id/401/600/400',
    category: '其他',
    intro: '爽脆开胃，五分钟小凉菜。',
    ingredients: [
      { name: '黄瓜', amount: '2根' },
      { name: '蒜', amount: '2瓣' },
      { name: '醋', amount: '2勺' },
      { name: '辣椒油', amount: '1勺' }
    ],
    steps: [
      { order: 1, text: '黄瓜拍碎切段，蒜切末。' },
      { order: 2, text: '加盐腌 5 分钟，倒掉多余水分。' },
      { order: 3, text: '加蒜末、醋、辣椒油拌匀即可。' }
    ],
    favorited: false,
    pinned: false,
    tags: ['开胃', '凉菜'],
    createdAt: 1695900000000,
    updatedAt: 1695900000000
  }
]

// 内存级数据（H5 预览下持久化本次会话的增删改）
let _dishes: Dish[] = INITIAL_DISHES.map((d) => ({ ...d, tags: [...d.tags] }))
// 运行时分类名表（初始为默认分类副本，增删改均操作此表；「其他」为系统分类）
let _categories: string[] = [...DEFAULT_CATEGORIES]

// 排序：置顶优先，其次更新时间倒序
function sortDishes(list: Dish[]): Dish[] {
  return [...list].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    return b.updatedAt - a.updatedAt
  })
}

// ==================== 菜品 ====================

export function listDishes(category?: string): Dish[] {
  if (!category || category === 'all') {
    return sortDishes(_dishes)
  }
  return sortDishes(_dishes.filter((d) => d.category === category))
}

export function getDishById(id: string): Dish | null {
  return _dishes.find((d) => d._id === id) || null
}

export function addDish(input: DishInput): string {
  const now = Date.now()
  const id = genId()
  const dish: Dish = {
    _id: id,
    name: input.name,
    coverImage: input.coverImage,
    category: input.category,
    intro: input.intro || '',
    ingredients: input.ingredients.map((it) => ({ ...it })),
    steps: input.steps.map((s) => ({ ...s })),
    favorited: false,
    pinned: false,
    tags: [],
    createdAt: now,
    updatedAt: now
  }
  _dishes.unshift(dish)
  return id
}

export function updateDishById(id: string, input: DishInput): boolean {
  const idx = _dishes.findIndex((d) => d._id === id)
  if (idx < 0) return false
  const now = Date.now()
  _dishes[idx] = {
    ..._dishes[idx],
    name: input.name,
    coverImage: input.coverImage,
    category: input.category,
    intro: input.intro || '',
    ingredients: input.ingredients.map((it: Ingredient) => ({ ...it })),
    steps: input.steps.map((s: Step) => ({ ...s })),
    updatedAt: now
  }
  return true
}

// 局部更新（收藏 / 置顶 / 标签）
export function patchDishById(id: string, patch: DishPatch): Dish | null {
  const idx = _dishes.findIndex((d) => d._id === id)
  if (idx < 0) return null
  _dishes[idx] = {
    ..._dishes[idx],
    ...patch,
    tags: patch.tags ? [...patch.tags] : _dishes[idx].tags,
    updatedAt: Date.now()
  }
  return _dishes[idx]
}

export function removeDish(id: string): boolean {
  const idx = _dishes.findIndex((d) => d._id === id)
  if (idx < 0) return false
  _dishes.splice(idx, 1)
  return true
}

// 模糊搜索：菜名 / 简介 / 食材名 / 标签
export function searchDishesByKeyword(keyword: string): Dish[] {
  return sortDishes(filterDishes(_dishes, keyword))
}

// ==================== 分类 ====================

// 分类列表，带每类菜品数量与系统标记
export function listCategories(): CategoryInfo[] {
  const names = [..._categories]
  // 兜底：菜品引用了不在分类表中的名字时也显示，避免数据丢失
  _dishes.forEach((d) => {
    if (!names.includes(d.category)) names.push(d.category)
  })
  return names.map((name) => ({
    name,
    count: _dishes.filter((d) => d.category === name).length,
    system: name === SYSTEM_CATEGORY
  }))
}

export function addCategoryByName(name: string): CategoryInfo {
  const trimmed = name.trim()
  if (listCategories().some((c) => c.name === trimmed)) {
    throw new Error('分类已存在')
  }
  _categories.push(trimmed)
  return { name: trimmed, count: 0, system: false }
}

export function renameCategoryByName(oldName: string, newName: string): boolean {
  const trimmed = newName.trim()
  if (oldName === SYSTEM_CATEGORY) throw new Error('系统分类不可重命名')
  if (listCategories().some((c) => c.name === trimmed)) throw new Error('分类已存在')
  const idx = _categories.indexOf(oldName)
  if (idx < 0) return false
  _categories[idx] = trimmed
  // 同步迁移该分类下菜品
  _dishes.forEach((d) => {
    if (d.category === oldName) d.category = trimmed
  })
  return true
}

export function deleteCategoryByName(name: string): boolean {
  if (name === SYSTEM_CATEGORY) throw new Error('系统分类不可删除')
  const idx = _categories.indexOf(name)
  if (idx < 0) return false
  _categories.splice(idx, 1)
  // 菜品迁移至系统兜底分类
  _dishes.forEach((d) => {
    if (d.category === name) d.category = SYSTEM_CATEGORY
  })
  return true
}
