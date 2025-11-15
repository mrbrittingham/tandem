<#
Tandem bootstrap script (Windows PowerShell)

Purpose:
- Check for required CLIs (git, node, npm, gh, vercel, supabase)
- Help create local env files (`packages/api/.env`, `apps/*/.env.local`) from user-provided keys
- Print exact next commands for deploying to Vercel / creating Supabase if CLIs are missing

Run:
1) Open PowerShell as your user (not Admin is fine).
2) From repo root: `cd C:\Users\mcsf6\tandem`
3) Allow the script to run once and execute:
   `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`
   `.\scripts\bootstrap.ps1`

Security:
- This script writes secret keys to local files only under `packages/api/.env` and `apps/*/.env.local`.
- It will not upload secrets anywhere.

#>

function Check-Command($name) {
    try {
        $null = Get-Command $name -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

Write-Host "Running Tandem bootstrap checks..." -ForegroundColor Cyan

$checks = @{
    git = (Check-Command git)
    node = (Check-Command node)
    npm = (Check-Command npm)
    gh = (Check-Command gh)
    vercel = (Check-Command vercel)
    supabase = (Check-Command supabase)
}

Write-Host "Detected tools:" -ForegroundColor Green
foreach ($k in $checks.Keys) {
    $v = $checks[$k]
    if ($v) {
        Write-Host ("- {0} : present" -f $k)
    } else {
        Write-Host ("- {0} : missing" -f $k)
    }
}

if (-not $checks.node -or -not $checks.npm) {
    Write-Host "\nNode.js and npm are required. Download and install from https://nodejs.org/" -ForegroundColor Yellow
}

Write-Host "\nThis script will help you create local env files. It will NOT publish secrets." -ForegroundColor Cyan
$proceed = Read-Host "Create local env files now? (Y/n)"
if ($proceed -eq 'n' -or $proceed -eq 'N') {
    Write-Host "Skipping env creation. You can run the script again later." -ForegroundColor Yellow
    exit 0
}

function Prompt-Secret($prompt) {
    $value = Read-Host $prompt
    return $value
}

Write-Host "\nEnter Supabase and OpenAI keys (paste values or leave blank to use placeholders)." -ForegroundColor Cyan
$supabase_url = Prompt-Secret 'SUPABASE_URL'
$supabase_anon = Prompt-Secret 'SUPABASE_ANON_KEY'
$supabase_service = Prompt-Secret 'SUPABASE_SERVICE_ROLE_KEY'
$openai_key = Prompt-Secret 'OPENAI_API_KEY'
$widget_origin = Read-Host 'NEXT_PUBLIC_WIDGET_ORIGIN (e.g. http://localhost:3000)'

if ([string]::IsNullOrWhiteSpace($supabase_url)) { $supabase_url = 'https://your-project.supabase.co' }
if ([string]::IsNullOrWhiteSpace($supabase_anon)) { $supabase_anon = 'anon_public_key_xxx' }
if ([string]::IsNullOrWhiteSpace($supabase_service)) { $supabase_service = 'service_role_xxx' }
if ([string]::IsNullOrWhiteSpace($openai_key)) { $openai_key = 'sk-xxxx' }
if ([string]::IsNullOrWhiteSpace($widget_origin)) { $widget_origin = 'http://localhost:3000' }

function Write-File-Safe($path, $content) {
    $dir = Split-Path $path -Parent
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    Set-Content -Path $path -Value $content -Encoding UTF8
    Write-Host "Wrote: $path" -ForegroundColor Green
}

# Write server .env
$apiEnv = @"
SUPABASE_URL=$supabase_url
SUPABASE_SERVICE_ROLE_KEY=$supabase_service
OPENAI_API_KEY=$openai_key
PORT=4000
"@
Write-File-Safe -path (Join-Path $PSScriptRoot '..\packages\api\.env') -content $apiEnv

# Write admin frontend .env.local
$adminEnv = @"
NEXT_PUBLIC_SUPABASE_URL=$supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabase_anon
NEXT_PUBLIC_OPENAI_API_KEY=
"@
Write-File-Safe -path (Join-Path $PSScriptRoot '..\apps\admin\.env.local') -content $adminEnv

# Write client frontend .env.local
$clientEnv = @"
NEXT_PUBLIC_SUPABASE_URL=$supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabase_anon
NEXT_PUBLIC_OPENAI_API_KEY=
NEXT_PUBLIC_WIDGET_ORIGIN=$widget_origin
"@
Write-File-Safe -path (Join-Path $PSScriptRoot '..\apps\client\.env.local') -content $clientEnv

Write-Host "\nLocal env files created with the values you provided (placeholders used where left blank)." -ForegroundColor Cyan

Write-Host "\nNext local commands to run (copy/paste):" -ForegroundColor White
Write-Host "1) Start API server:" -ForegroundColor Green
Write-Host "   cd C:\\Users\\mcsf6\\tandem\\packages\\api" -ForegroundColor Yellow
Write-Host "   node index.js" -ForegroundColor Yellow

Write-Host "2) Start Admin frontend:" -ForegroundColor Green
Write-Host "   cd C:\\Users\\mcsf6\\tandem\\apps\\admin" -ForegroundColor Yellow
Write-Host "   npm install" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor Yellow

Write-Host "\nIf you want me to set the same environment variables on Vercel (deploy), install the Vercel CLI and run those commands manually per project. I can print the exact `vercel env add` commands for you if you want." -ForegroundColor Cyan

Write-Host "Bootstrap complete." -ForegroundColor Green
