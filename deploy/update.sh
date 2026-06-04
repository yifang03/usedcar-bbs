#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/www/usedcar-bbs"
BRANCH="main"
MODE="${1:-pull-only}"
MIN_MEM_MB=1800

cd "$APP_DIR"

echo "检查 GitHub 更新..."
git fetch origin "$BRANCH"

LOCAL_COMMIT="$(git rev-parse HEAD)"
REMOTE_COMMIT="$(git rev-parse "origin/$BRANCH")"

if [ "$LOCAL_COMMIT" = "$REMOTE_COMMIT" ]; then
  echo "已经是最新版本，无需更新"
  exit 0
fi

echo "发现新版本：$LOCAL_COMMIT -> $REMOTE_COMMIT"
echo "开始拉取代码..."
git pull --ff-only origin "$BRANCH"

if [ "$MODE" = "pull-only" ]; then
  echo "已完成代码拉取。"
  echo "低配服务器安全模式：不会自动安装依赖或构建，避免打满内存。"
  echo "如果这次只是文案/CSS/源码更新，仍需在空闲时手动构建并重启。"
  exit 0
fi

if [ "$MODE" != "--build" ]; then
  echo "未知参数：$MODE"
  echo "用法：bash deploy/update.sh          # 只拉代码"
  echo "用法：bash deploy/update.sh --build  # 拉代码后尝试构建"
  exit 1
fi

AVAILABLE_MEM_MB="$(awk '/MemAvailable/ { printf "%d", $2 / 1024 }' /proc/meminfo)"
if [ "$AVAILABLE_MEM_MB" -lt "$MIN_MEM_MB" ]; then
  echo "可用内存仅 ${AVAILABLE_MEM_MB}MB，低于安全阈值 ${MIN_MEM_MB}MB。"
  echo "已停止构建，避免服务器卡死。建议用 GitHub Actions/Vercel/更高配置机器构建。"
  exit 1
fi

if [ ! -f ".env" ]; then
  echo "缺少 .env，请先在服务器项目目录创建 .env"
  exit 1
fi

mkdir -p public/uploads

echo "开始低优先级安装依赖..."
nice -n 10 npm install --no-audit --no-fund

echo "准备数据库..."
npx prisma generate
npx prisma db push

echo "开始低优先级构建..."
NODE_OPTIONS="--max-old-space-size=1024" nice -n 10 npm run build

echo "构建完成。现在去宝塔 Node 项目管理器里重启 yifang-used-car。"
