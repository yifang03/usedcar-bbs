# 低配服务器快速上线方案

这套方案适合 1 核 1G / 1 核 2G 服务器：

- 本机负责构建
- 服务器只负责运行
- 服务器不执行 `npm ci`
- 服务器不执行 `npm run build`

## 本机打包

先构建：

```powershell
npm.cmd run build
```

然后把下面内容打包上传到服务器：

```text
.next/standalone/*
.next/static
public
prisma/schema.prisma
```

上传后服务器目录建议是：

```text
/www/usedcar-bbs-runtime
```

## 服务器目录结构

最终应该大概是：

```text
/www/usedcar-bbs-runtime/server.js
/www/usedcar-bbs-runtime/.next/static
/www/usedcar-bbs-runtime/public
/www/usedcar-bbs-runtime/prisma/schema.prisma
/www/usedcar-bbs-runtime/.env
```

## 服务器 .env

```env
DATABASE_URL="file:./prod.db"
JWT_SECRET="换成一串很长的随机密钥"
PORT=3000
HOSTNAME=0.0.0.0
NODE_ENV=production
```

## 服务器启动

在宝塔 Node 项目管理器里添加项目：

```text
项目目录：/www/usedcar-bbs-runtime
启动文件：server.js
启动命令：node server.js
端口：3000
```

也可以在终端测试：

```bash
cd /www/usedcar-bbs-runtime
node server.js
```

正常后访问：

```bash
curl http://127.0.0.1:3000
```

## 数据库初始化

如果服务器不能跑 Prisma CLI，就不要在服务器上执行 `npx prisma db push`。

最省事做法：

1. 本机准备好 SQLite 数据库。
2. 上传 `prod.db` 到服务器运行目录。
3. `.env` 保持 `DATABASE_URL="file:./prod.db"`。

后续如果要正式运营，建议换 PostgreSQL / MySQL。
