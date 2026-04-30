🧠 Cursor 生成规则 + 项目框架（Taro + Monorepo）

1. 项目目标

构建一个包含以下部分的系统：

Taro 小程序（用户端）
Admin 后台（管理端）
API 服务（统一后端）
共享业务逻辑层（services）2. 技术栈约束（必须遵守）
前端（小程序）
使用 Taro + React + TypeScript
使用函数式组件 + Hooks
所有 API 请求必须走 services/request.ts
后台
使用 Next.js（App Router）
使用 TypeScript
UI 使用简洁组件（无需复杂设计）
后端
使用 NestJS
模块化结构（module/controller/service）
不允许把业务逻辑写在 controller
数据库
使用 Prisma
schema 放在 /packages/db 3. Monorepo 结构（必须遵守）
包管理使用 pnpm：工作区由根目录 pnpm-workspace.yaml 声明；安装依赖在仓库根执行 pnpm install；脚本用 pnpm <script> 或 pnpm --filter <pkg> <script>。
/apps
/mini # Taro 小程序
/admin # 后台
/server # NestJS API

/packages
/db # Prisma schema
/services # 业务逻辑（可复用）
/types # 类型定义
/utils # 工具函数 4. API 设计规范
所有接口统一前缀：/api
返回结构必须为：
{
code: number,
data: any,
message: string
} 5. 小程序开发规范
页面路径：/pages/xxx/index.tsx
每个页面必须包含：
.tsx
.config.ts
.scss
API 调用示例：
import { request } from '@/services/request'

request({
url: '/api/user',
method: 'GET'
}) 6. Service 层规范（非常重要）
所有业务逻辑写在 /packages/services
后端 controller 只负责调用 service
admin / mini 不直接访问数据库

示例：

// packages/services/user.service.ts
export const getUser = async (id: string) => {} 7. 代码生成指令规则（给 Cursor）

当我提出需求时，你必须：

优先判断属于哪个模块（mini / admin / server / services）
严格按照目录结构创建文件
自动补全 import 路径（基于 monorepo）
保持类型安全（TypeScript）
不要省略关键代码（必须可运行）8. 示例任务（你必须按这种方式生成）
示例1：创建用户接口

需求：
创建获取用户信息接口

你必须生成：

server: controller + service
services: user.service.ts 方法
返回统一格式
示例2：创建小程序页面

需求：
创建用户中心页面

你必须生成：

/apps/mini/src/pages/profile/index.tsx
使用 hooks
调用 /api/user 9. 禁止事项（非常关键）

❌ 不允许随意创建新目录
❌ 不允许跳过 service 层
❌ 不允许写无类型代码
❌ 不允许把所有逻辑写在一个文件

10. 输出要求
    所有代码必须完整
    必须标明文件路径
    必须可直接运行（不允许伪代码）

默认账号（未改环境变量时）
项 值
邮箱
admin@itzy.local
密码
Admin123456
在管理端 /login 用上述邮箱、密码登录即可。
