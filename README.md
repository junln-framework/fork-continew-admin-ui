# Junln Admin UI (Frok ContiNew Admin UI)

# 1.克隆本项目
git clone https://github.com/junln-framework/junln-admin-ui.git

# 2.在 IDE（Visual Studio Code/WebStorm）中打开前端项目

# 3.安装 pnpm
npm install -g pnpm

# 4.安装依赖
pnpm i

# 5.启动程序
# 5.1 启动成功：访问 http://localhost:5173/
pnpm dev
```

## 项目结构

```
continew-admin-ui
├─ config              # Vite 插件配置
├─ public              # 公共静态资源（favicon.ico、logo.svg）
├─ src
│  ├─ apis             # 请求接口
│  │  ├─ auth            # 认证模块
│  │  ├─ code            # 代码生成模块
│  │  ├─ common          # 公共模块
│  │  ├─ monitor         # 系统监控模块
│  │  ├─ open            # 能力开放模块
│  │  ├─ tenant          # 租户模块
│  │  ├─ schedule        # 任务调度模块
│  │  └─ system          # 系统管理模块
│  ├─ assets           # 静态资源
│  │  ├─ icons           # 图标资源
│  │  ├─ images          # 图片资源
│  │  └─ fonts           # 字体资源
│  ├─ components       # 通用业务组件
│  ├─ config           # 全局配置（包含 echarts 主题）
│  │  └─ settings.json   # 配置文件
│  ├─ directives       # 指令集（如需，可自行补充）
│  ├─ hooks            # 全局 hooks
│  ├─ layout           # 布局
│  ├─ mock             # 模拟数据
│  ├─ router           # 路由配置
│  ├─ stores           # 状态管理中心
│  ├─ types            # TypeScript 类型
│  ├─ utils            # 工具库（mock 全局开启/关闭）
│  ├─ views            # 页面
│  │  ├─ code            # 代码生成
│  │  │  └─ generator      # 代码生成
│  │  ├─ dashboard       # 仪表盘
│  │  │  ├─ analysis       # 分析页
│  │  │  └─ workplace      # 工作台
│  │  ├─ default         # 默认页面
│  │  ├─ login           # 登录模块
│  │  ├─ setting         # 设置
│  │  │  ├─ profile        # 个人中心
│  │  │  └─ message        # 消息中心
│  │  ├─ monitor         # 系统监控
│  │  │  ├─ log            # 系统日志
│  │  │  │  ├─ login         # 登录日志
│  │  │  │  └─ operation     # 操作日志
│  │  │  └─ online           # 在线用户
│  │  ├─ open            # 能力开放
│  │  │ └─ user            # 应用管理
│  │  ├─ tenant          # 租户管理
│  │  │ ├─ management      # 租户管理
│  │  │ └─ package         # 套餐管理
│  │  ├─ schedule        # 任务调度
│  │  │ ├─ job             # 任务管理
│  │  │ └─ log             # 任务日志
│  │  └─ system          # 系统管理
│  │    ├─ config          # 系统配置
│  │    ├─ dept            # 部门管理
│  │    ├─ dict            # 字典管理
│  │    ├─ file            # 文件管理
│  │    ├─ menu            # 菜单管理
│  │    ├─ notice          # 通知公告
│  │    ├─ role            # 角色管理
│  │    ├─ storage         # 存储管理
│  │    └─ user            # 用户管理
│  ├─ App.vue
│  └─ main.ts
├─ .env.development    # 开发环境配置
├─ .env.production     # 生产环境配置
├─ .env.test           # 测试环境配置
├─ eslint.config.js    # ESLint 配置
├─ index.html
├─ package.json
├─ package-lock.json
├─ pnpm-lock.yaml
├─ tsconfig.json
├─ vite.config.ts
├─ .gitignore（Git 忽略文件相关配置文件）
├─ .github（GitHub 相关配置目录，实际开发时直接删除）
├─ .image（截图目录，实际开发时直接删除）
├─ .vscode（VSCode 配置目录）
├─ LICENSE（开源协议文件）
├─ CHANGELOG.md（更新日志文件，实际开发时直接删除）
└─ README.md（项目 README 文件，实际开发时替换为真实内容）
```

## 项目介绍

项目原址: https://continew.top

| 分支  | 说明                                                         |
| ----- | ------------------------------------------------------------ |
| dev   | 开发分支，用于下个大版本的 SNAPSHOT 开发，接受新功能或功能优化 PR |
| x.x.x | 维护分支，用于特定版本（如 vx.x.x）的 bug 修复，仅接受已有功能的修复 PR，不接受新功能 |

### 流程步骤

若您希望提交新功能或优化现有代码，请遵循以下步骤：

1. 在开源平台上将项目 fork 到您的个人仓库
2. 将 fork 的项目克隆到本地开发环境
3. 基于当前维护的分支（如 dev）创建新分支（如 feat/newFeature），请勿直接修改源分支（源分支仅做同步 ContiNew 最新代码用）
4. 在新分支上进行代码修改，完成后提交并 push 到您的远程仓库
5. 在开源平台上创建 pull request (PR)，选择正确的源分支和目标分支，按模板填写说明信息（参考 [已合并的 PR](https://github.com/continew-org/continew-admin/pulls?q=is%3Apr+is%3Amerged) 可提高合并率）
6. 提交 PR 后，系统会提示签署 CLA（贡献者协议）。请确保 commit 使用的邮箱与平台绑定邮箱一致（如果不一致，可以在本地通过 `git reset --soft HEAD~1` 回退，然后使用正确邮箱重新提交，最后 `git push -f` 即可，不需要重新创建 PR），然后使用该邮箱签署即可
7. 耐心等待维护者审核并合并您的 PR（建议通过交流群进行快捷沟通）
8. PR 合并后，下次贡献前请先同步最新代码，再重复步骤 3 开始

> [!IMPORTANT]
> 为了确保项目质量和协作效率，请注意以下事项：
>
> 1. 代码和配置文件请参考已有风格，遵循清晰的结构与命名规范，提供完善的注释
> 2. 提交时，请按照 [Angular 提交规范] 编写 commit message（参考已有风格）

