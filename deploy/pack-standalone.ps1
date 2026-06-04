$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$runtime = Join-Path $PSScriptRoot "runtime"
$zip = Join-Path $PSScriptRoot "yifang-runtime.zip"

Set-Location $root

Write-Host "Generating Prisma client..."
npx.cmd prisma generate

Write-Host "Building standalone Next.js app..."
npm.cmd run build

if (Test-Path $runtime) {
  Remove-Item -LiteralPath $runtime -Recurse -Force
}
if (Test-Path $zip) {
  Remove-Item -LiteralPath $zip -Force
}

New-Item -ItemType Directory -Force -Path $runtime | Out-Null

Write-Host "Copying standalone server..."
Copy-Item -Path ".next\standalone\*" -Destination $runtime -Recurse -Force

Write-Host "Copying static assets..."
New-Item -ItemType Directory -Force -Path (Join-Path $runtime ".next") | Out-Null
Copy-Item -Path ".next\static" -Destination (Join-Path $runtime ".next\static") -Recurse -Force
Copy-Item -Path "public" -Destination (Join-Path $runtime "public") -Recurse -Force

Write-Host "Copying Prisma schema and local SQLite database..."
New-Item -ItemType Directory -Force -Path (Join-Path $runtime "prisma") | Out-Null
Copy-Item -Path "prisma\schema.prisma" -Destination (Join-Path $runtime "prisma\schema.prisma") -Force
if (Test-Path "prisma\dev.db") {
  Copy-Item -Path "prisma\dev.db" -Destination (Join-Path $runtime "prod.db") -Force
}

@'
DATABASE_URL="file:/www/usedcar-bbs-runtime/prod.db"
JWT_SECRET="change-this-to-a-long-random-secret"
SITE_NAME="一方二手车论坛"
SMTP_HOST="smtp.qq.com"
SMTP_PORT="465"
SMTP_USER="your-email@qq.com"
SMTP_PASS="your-smtp-auth-code"
SMTP_FROM="一方二手车论坛 <your-email@qq.com>"
PORT=3000
HOSTNAME=0.0.0.0
NODE_ENV=production
'@ | Set-Content -Path (Join-Path $runtime ".env.example") -Encoding UTF8

Write-Host "Creating zip package..."
Compress-Archive -Path (Join-Path $runtime "*") -DestinationPath $zip -Force

Write-Host "Done:"
Write-Host $zip
