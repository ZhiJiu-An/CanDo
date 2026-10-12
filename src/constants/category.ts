// 菜品分类常量

// 系统兜底分类：不可重命名、不可删除；删除其他分类时菜品迁移至此
export const SYSTEM_CATEGORY = '其他';

// 首次使用时的默认分类（系统分类始终存在）
export const DEFAULT_CATEGORIES = ['家常菜', '汤品', '主食', '小吃', '其他'];

// 首页筛选项固定包含「全部」，其余从云端动态读取
export const ALL_FILTER = { label: '全部', value: 'all' };
