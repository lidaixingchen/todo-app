# 技术设计

## 技术栈

- Vue3 + TypeScript + Vite
- Tailwind CSS
- Pinia（状态管理）
- Vue Router（如果需要多页面）
- Vue Chart（如果需要统计图表）
- date-fns（日期处理库）

## 项目结构

## 数据管理

- 任务数据存储在本地存储（localStorage）
- 任务分类数据存储在本地存储（localStorage）
- 任务优先级数据存储在本地存储（localStorage）
- 任务排序数据存储在本地存储（localStorage）
- 任务批量出数据存储在本地存储（localStorage）
- 任务导出数据存储在本地存储（localStorage）
- 任务统计数据存储在本地存储（localStorage）

待办事项包含以下字段：id（唯一标识）、title（标题）​、description（描述）、category（分类）、priority（优先级：低、中、高）、dueDate（截止日期）、⁡completed（是否完成）、createdAt（创建时间）。
