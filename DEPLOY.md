# 一方二手车论坛部署说明

## 先说结论

如果服务器是 1 核 1G / 1 核 2G 的轻量云，不推荐在服务器上自动执行：

```bash
npm ci
npm run build
```

这两个命令会吃内存和磁盘 IO，低配机器很容易卡死。这个项目正式运行仍然必须用生产模式：

```bash
npm run build
npm run start
```

但构建动作要谨慎，最好在空闲时手动执行，或者以后迁移到 Vercel / GitHub Actions / 更高配置服务器构建。

## 推荐上线方式

- 面板：宝塔
- 运行：宝塔 Node 项目管理器
- Node 版本：20 LTS
- 启动命令：`npm run start`
- 端口：`3000`
- 更新：先 `git pull`，确认服务器资源充足后再手动构建

正式上线不要使用 `npm run dev`。

## 服务器首次部署

```bash
cd /www
git clone https://github.com/yifang03/usedcar-bbs.git
cd /www/usedcar-bbs
```

创建 `.env`：

```env
DATABASE_URL="file:./prod.db"
JWT_SECRET="请换成一串足够长的随机密钥"
```

首次安装和构建建议在服务器空闲时执行：

```bash
npm install --no-audit --no-fund
npx prisma generate
npx prisma db push
NODE_OPTIONS="--max-old-space-size=1024" npm run build
```

然后在宝塔 Node 项目管理器添加项目：

```text
项目名称：yifang-used-car
项目目录：/www/usedcar-bbs
启动命令：npm run start
端口：3000
```

启动后测试：

```bash
curl http://127.0.0.1:3000
```

返回 HTML 就说明 Node 项目正常。

## 宝塔网站反向代理

宝塔网站设置反向代理：

```text
目标 URL：http://127.0.0.1:3000
```

上传图片建议把请求体大小调到 `20m`。

## 后续更新

本地改完代码：

```powershell
git add .
git commit -m "更新"
git push
```

服务器只拉代码：

```bash
bash /www/usedcar-bbs/deploy/update.sh
```

脚本默认只做版本判断和 `git pull`，不会自动安装依赖或构建，避免低配服务器被打满。

如果确认服务器资源足够，并且需要构建：

```bash
bash /www/usedcar-bbs/deploy/update.sh --build
```

构建完成后，在宝塔 Node 项目管理器重启 `yifang-used-car`。

## 自动检测更新

低配服务器不建议自动构建。可以让宝塔计划任务每 5 分钟只检测并拉代码：

```bash
bash /www/usedcar-bbs/deploy/update.sh
```

需要上线新版本时，再手动选择空闲时间执行构建和重启。
