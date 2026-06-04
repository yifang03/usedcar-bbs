# 一方二手车论坛部署说明

## 推荐方案

使用宝塔面板部署：

- 运行方式：宝塔 Node 项目管理器
- Node 版本：20 LTS 或 22 LTS
- 启动命令：`npm run start`
- 项目端口：`3000`
- 更新方式：执行 `deploy/update.sh` 后，在宝塔里重启 Node 项目

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

安装、初始化数据库、构建：

```bash
npm ci
npx prisma generate
npx prisma db push
npm run build
```

然后在宝塔 Node 项目管理器添加项目：

```text
项目名称：yifang-used-car
项目目录：/www/usedcar-bbs
启动命令：npm run start
端口：3000
```

启动后访问：

```bash
curl http://127.0.0.1:3000
```

能返回 HTML 就说明 Node 项目正常。

## 宝塔网站反向代理

在宝塔网站里创建站点，然后设置反向代理：

```text
目标 URL：http://127.0.0.1:3000
```

如果上传图片，需要把请求体大小调大，比如 `20m`。

## 后续更新

本地改完代码：

```powershell
git add .
git commit -m "更新"
git push
```

服务器执行：

```bash
bash /www/usedcar-bbs/deploy/update.sh
```

然后去宝塔 Node 项目管理器重启 `yifang-used-car`。

## 自动检测更新

宝塔计划任务可以每 5 分钟执行：

```bash
bash /www/usedcar-bbs/deploy/update.sh
```

脚本会先判断 GitHub 有没有新提交；没有新版本就直接退出，不会重复构建。
