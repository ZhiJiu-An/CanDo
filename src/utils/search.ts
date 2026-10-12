import type { Dish } from '@/types/dish'

/**
 * 菜品模糊匹配纯函数
 * 命中范围：菜名 / 简介 / 食材名 / 标签（均为不区分大小写的包含匹配）
 */
export function matchDish(dish: Dish, keyword: string): boolean {
  const kw = keyword.trim().toLowerCase()
  if (!kw) return false
  if (dish.name.toLowerCase().includes(kw)) return true
  if (dish.intro && dish.intro.toLowerCase().includes(kw)) return true
  if (dish.tags.some((t) => t.toLowerCase().includes(kw))) return true
  if (dish.ingredients.some((it) => it.name.toLowerCase().includes(kw))) {
    return true
  }
  return false
}

/** 从菜品列表中按关键词过滤 */
export function filterDishes(dishes: Dish[], keyword: string): Dish[] {
  const kw = keyword.trim()
  if (!kw) return []
  return dishes.filter((d) => matchDish(d, kw))
}
