#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/www/usedcar-bbs"
BRANCH="main"

cd "$APP_DIR"

if [ ! -f ".env" ]; then
  echo "缺少 .env，请先在服务器项目目录创建 .env"
  exit 1
fi

mkdir -p public/uploads

echo "检查 GitHub 更新..."
git fetch origin "$BRANCH"

LOCAL_COMMIT="$(git rev-parse HEAD)"
REMOTE_COMMIT="$(git rev-parse "origin/$BRANCH")"

if [ "$LOCAL_COMMIT" = "$REMOTE_COMMIT" ] && [ "${1:-}" != "--force" ]; then
  echo "已经是最新版本，无需更新"
  exit 0
fi

echo "发现新版本，开始拉取..."
git pull --ff-only origin "$BRANCH"

echo "安装依赖..."
npm ci

echo "准备数据库..."
npx prisma generate
npx prisma db push

echo "构建生产版本..."
npm run build

echo "更新完成。现在去宝塔 Node 项目管理器里重启 yifang-used-car。"
