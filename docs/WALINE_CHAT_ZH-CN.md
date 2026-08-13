# Astro 博客的 Waline Chat 页面

这个仓库已经接入 Waline，并新增了 `/chat/` 页面和导航栏入口。访问者必须先输入房间 Token；相同 Token 会进入同一个独立聊天室，不同 Token 的留言彼此分开。当前连接的是：

- Vercel 控制台：`https://vercel.com/zmr2010s-projects/waline`
- Waline 公网服务：`https://waline-zmr2010s-projects.vercel.app`
- 留言管理后台：`https://waline-zmr2010s-projects.vercel.app/ui`

注意：Vercel 控制台地址不能作为 `serverURL`。前端只能填写访客可以直接打开的 Waline 公网服务地址。

## 1. 直接连接现有 Waline 项目

本仓库已经把上面的公网服务设为默认值，因此无需额外配置即可运行：

```bash
pnpm install
pnpm dev
```

然后访问 `http://localhost:4321/chat/`。

页面会先显示 Token 输入框。Token 可以是任意非空长度，但只允许 ASCII 数字 `0–9`；首尾空格会被忽略，前导零会保留，因此 `00123` 和 `123` 是两个不同房间。浏览器会给 Token 加固定命名空间后计算 SHA-256，只将摘要用于 Waline 的评论 `path`；原始 Token 不会写入 URL、Local Storage、Session Storage，也不会直接发给 Waline。页面上的短指纹可用来确认两个人是否进入了同一个房间。

代码不会限制数字 Token 的长度，但过短或有规律的数字非常容易被猜中。建议使用至少 39 位的随机数字，以获得约 128-bit 的随机空间，并通过可信渠道分享给房间成员。可用 Node.js 生成：

```bash
node -e "const { randomInt } = require('node:crypto'); console.log(Array.from({ length: 39 }, () => randomInt(10)).join(''))"
```

点击“切换房间”会销毁当前 Waline 实例并清空输入状态。组件不会保存 Token，刷新页面或离开后返回都需要重新输入。

如果曾使用旧版界面创建含字母、短横线或下划线的 Token 房间，新界面将无法再输入这些 Token；原本就是纯数字的 Token 不受影响，因为哈希命名空间没有改变。

> 安全边界：这是浏览器端的“分房间/轻量门禁”，不是服务端鉴权。Waline 评论 API 仍是公开服务；知道或猜到摘要路径的人可以直接读取对应留言，站点级 Recent Comments、RSS 等公开接口也可能暴露已审核留言或房间路径。组件的 `noRss` 只隐藏页面中的 RSS 入口，并不会关闭这些后端接口。若聊天内容需要严格保密，必须在服务端验证 Token、签发短期会话，并由服务端代理或控制消息读写，不能只依赖静态 Astro 页面和公开 Waline API。

若 Vercel 分配的域名发生变化，或以后绑定了自定义域名，请在项目根目录新建 `.env`：

```dotenv
PUBLIC_WALINE_SERVER_URL=https://你的-waline-公网域名
```

可复制 `.env.example` 后修改。`PUBLIC_WALINE_SERVER_URL` 是浏览器本来就要访问的公开 API 地址，不是密码；不要把数据库密码、SMTP 密码、Turnstile Secret 等写进博客的 `PUBLIC_` 环境变量。

修改 `.env` 后重启开发服务器；线上部署时，也可在博客部署平台设置同名环境变量后重新部署。

## 2. 配置现有 Vercel Waline 服务

打开 Waline 的 Vercel 项目，进入 **Settings → Environment Variables**。建议至少检查下面几项：

```text
SITE_NAME=XianRui's Blog
SITE_URL=https://blog.517group.cn
SERVER_URL=https://waline-zmr2010s-projects.vercel.app
SECURE_DOMAINS=blog.517group.cn,waline-zmr2010s-projects.vercel.app
```

`SECURE_DOMAINS` 只写域名，不带 `https://`。如果以后使用 `waline.517group.cn`，请同时更新 `SERVER_URL`、`SECURE_DOMAINS` 和博客的 `PUBLIC_WALINE_SERVER_URL`。

环境变量保存后，进入 **Deployments**，对最新部署执行 **Redeploy**；Waline 的服务端变量只有重新部署后才会生效。

可选的安全和隐私设置：

```text
COMMENT_AUDIT=true
DISABLE_USERAGENT=true
DISABLE_REGION=true
```

- `COMMENT_AUDIT=true`：新留言需要管理员审核后才公开。
- `DISABLE_USERAGENT=true`：不展示访客浏览器信息。
- `DISABLE_REGION=true`：不展示访客地区。
- `IPQPS` 默认限制同一 IP 的留言频率；不建议设为 `0`。

公开留言页容易收到垃圾内容。需要更强保护时，可以按 Waline 官方文档同时配置 Cloudflare Turnstile 的客户端 Site Key 与服务端 Secret；Secret 只能保存在 Waline 服务端。

## 3. 注册管理员并管理留言

第一次使用时访问：

```text
https://waline-zmr2010s-projects.vercel.app/ui/register
```

Waline 的第一个注册用户会成为管理员，请尽快由站长完成注册。之后从 `/ui` 登录，可以审核、编辑、置顶或删除留言。

如果管理员已经注册过，直接访问 `/ui` 登录，不要再次走首次注册流程。

## 4. 从零新建 Waline（仅在现有项目不可用时）

当前服务已经通过 API 与数据库读取测试，不需要重建。只有希望创建另一套独立 Waline 时，才执行这一节：

1. 按 Waline 官方快速上手，在 Vercel 部署 Waline 模板。
2. 在 Vercel 项目的 **Storage** 中创建并连接 Neon PostgreSQL。
3. 打开 Neon 的 **SQL Editor**，执行 Waline 官方 `waline.pgsql` 建表脚本。
4. 回到 Vercel 对 Waline 项目执行 **Redeploy**。
5. 部署状态变为 **Ready** 后点击 **Visit**，复制打开后的公网根地址作为 `serverURL`。
6. 按第 2 节配置站点地址、安全域名等环境变量，再次 Redeploy。
7. 按第 3 节立即注册管理员。
8. 将新地址填入博客的 `PUBLIC_WALINE_SERVER_URL`，重新构建博客。

不要在已经正常使用的数据库里重复执行建表脚本，否则会遇到数据表或序列已存在的错误。

## 5. 本仓库中的实现位置

- `src/pages/chat.astro`：Chat 页面布局。
- `src/components/WalineChat.astro`：Waline 初始化、主题样式和 Swup 生命周期。
- `src/config.ts`：导航栏的 Chat 入口。
- `.env.example`：可覆盖的服务地址示例。

留言线程使用 `path: "/chat/rooms/<token-sha256>"`。相同 Token 会稳定映射到相同路径，因此域名变化或页面路径尾部的 `/` 差异不会拆分房间；不同 Token 会得到不同路径。

Token 哈希所用的 `xianrui-waline-chat:v1:` 命名空间也是房间地址的一部分。已有留言后不要修改它，否则原 Token 会映射到新的空房间。房间界面已隐藏 Waline 的 RSS 按钮，以减少摘要路径被复制或分享的机会，但这不会把公开 Waline API 变成私有服务。

该组件还处理了当前博客的 Swup 无刷新跳转：离开 Chat 时销毁 Waline，重新进入时再初始化，避免留言框消失或重复挂载。暗色模式跟随本站的 `html.dark` 类。

目前关闭了 Waline 的 Base64 图片上传，以免访客直接把图片内容写入评论数据库。若以后接入可靠图床，可在 `WalineChat.astro` 中将 `imageUploader` 换成自定义上传函数。

## 6. 上线前验收

```bash
pnpm astro check
pnpm build
```

然后逐项测试：

1. 直接打开 `/chat/`，确认未输入 Token 时没有加载 Waline 评论列表。
2. 分别输入一位数字和较长数字，确认都能进入；输入字母、中文或标点，确认页面拒绝进入。
3. 分别输入 `00123` 和 `123`，确认短指纹和 Waline 房间路径不同；再次输入第一个 Token，确认回到原房间。
4. 点击“切换房间”，确认当前留言框被销毁且 Token 输入框被清空。
5. 从首页进入 Chat，再进入 About，最后返回 Chat，确认需要重新输入 Token，且不会出现重复留言框。
6. 切换亮色和暗色主题。
7. 用手机宽度打开导航菜单、Token 表单和留言框。
8. 打开 Emoji 面板，确认没有被卡片裁剪。
9. 发布一条测试留言，进入 `/ui` 确认可以看到并删除它。

常见故障：

- `403`：检查 `SECURE_DOMAINS`，其中应同时有博客域名和 Waline 服务域名。
- `500` 或数据库错误：检查 Vercel Functions 日志、Neon 连接变量和数据表是否初始化。
- 页面没有留言框：检查浏览器 Network/Console，并确认 `PUBLIC_WALINE_SERVER_URL` 是公网根地址，不是 Vercel 控制台地址，也不要在末尾加 `/ui`。

## 官方资料

- [Waline 快速上手](https://waline.js.org/guide/get-started/)
- [Waline 客户端 API](https://waline.js.org/reference/client/api.html)
- [Waline 客户端参数](https://waline.js.org/reference/client/props.html)
- [Waline 服务端环境变量](https://waline.js.org/reference/server/env.html)
- [Waline PostgreSQL 建表脚本](https://github.com/walinejs/waline/blob/main/assets/waline.pgsql)
