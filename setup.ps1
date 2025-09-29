Param(
  [string]$DbHost = "localhost",
  [string]$DbUser = "root",
  [string]$DbPassword = "",
  [string]$DbName = "task_manager",
  [switch]$SkipDb,
  [switch]$ForceEnv,
  [switch]$NoStart
)

Write-Host "Initialisation du projet Task-Manager..." -ForegroundColor Cyan

# Paramètres par défaut: localhost/root/(vide)/task_manager
if ($null -eq $DbPassword) { $DbPassword = "" }

function Invoke-Step {
  Param(
    [string]$Message,
    [ScriptBlock]$Action
  )
  Write-Host "`n==> $Message" -ForegroundColor Yellow
  try {
    & $Action
    Write-Host "OK" -ForegroundColor Green
  } catch {
    Write-Error $_
    exit 1
  }
}

function Ensure-EnvFile {
  Param(
    [string]$Path,
    [hashtable]$Defaults
  )
  if ((Test-Path $Path) -and -not $ForceEnv) {
    Write-Host "Fichier $Path déjà présent (utiliser -ForceEnv pour régénérer)."
    return
  }
  $lines = @()
  foreach ($k in $Defaults.Keys) { $lines += "$k=$($Defaults[$k])" }
  Set-Content -Path $Path -Value $lines -Encoding UTF8
  Write-Host "Fichier $Path généré."
}

function Invoke-MySqlScript {
  Param(
    [string]$ScriptPath
  )
  if (-not (Test-Path $ScriptPath)) { return }
  Write-Host "Applique: $ScriptPath"
  $mysql = Get-Command mysql -ErrorAction SilentlyContinue
  if ($mysql) {
    $pwdArg = if ($DbPassword -ne "") { "-p$DbPassword" } else { "" }
    Get-Content -Raw $ScriptPath | & $mysql.Path -h $DbHost -u $DbUser $pwdArg $DbName
    return
  }
  $mysqlsh = Get-Command mysqlsh -ErrorAction SilentlyContinue
  if ($mysqlsh) {
    $scriptSql = Get-Content -Raw $ScriptPath
    $pwdArg = if ($DbPassword -ne "") { "-p$DbPassword" } else { "" }
    & $mysqlsh.Path --sql -h $DbHost -u $DbUser $pwdArg -e $scriptSql $DbName
    return
  }
  throw "Aucun client MySQL trouvé ('mysql' ou 'mysqlsh'). Ajoutez-le au PATH ou utilisez -SkipDb."
}

# 1) Vérifications Node/npm
Invoke-Step "Vérification Node/npm" {
  $nodeV = node -v
  $npmV = npm -v
  Write-Host "Node: $nodeV, npm: $npmV"
}

# 2) Installation dépendances serveur
Invoke-Step "Installation des dépendances (server)" {
  Push-Location server
  npm install --no-audit --no-fund
  Pop-Location
}

# 3) Installation dépendances client
Invoke-Step "Installation des dépendances (client)" {
  Push-Location client
  npm install --no-audit --no-fund
  Pop-Location
}

# 4) Génération des fichiers .env (serveur)
Invoke-Step "Génération du fichier server/.env" {
  $serverEnv = Join-Path server ".env"
  Ensure-EnvFile -Path $serverEnv -Defaults @{
    "PORT" = "3000"
    "DB_HOST" = $DbHost
    "DB_USER" = $DbUser
    "DB_PASSWORD" = $DbPassword
    "DB_NAME" = $DbName
    "JWT_SECRET" = "change_me"
    "ORIGIN" = "http://localhost:8081"
  }
}

# 5) Génération des fichiers .env (client)
Invoke-Step "Génération du fichier client/.env" {
  $clientEnv = Join-Path client ".env"
  Ensure-EnvFile -Path $clientEnv -Defaults @{
    "PORT" = "8081"
    "REACT_APP_API_URL" = "http://localhost:3000/api"
  }
}

# 6) Base de données (optionnel)
if (-not $SkipDb) {
  Invoke-Step "Création de la base '$DbName' si nécessaire" {
    $pwdArg = if ($DbPassword -ne "") { "-p$DbPassword" } else { "" }
    $createSql = "CREATE DATABASE IF NOT EXISTS $DbName DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    $mysql = Get-Command mysql -ErrorAction SilentlyContinue
    if ($mysql) {
      $createSql | & $mysql.Path -h $DbHost -u $DbUser $pwdArg
      return
    }
    $mysqlsh = Get-Command mysqlsh -ErrorAction SilentlyContinue
    if ($mysqlsh) {
      & $mysqlsh.Path --sql -h $DbHost -u $DbUser $pwdArg -e $createSql
      return
    }
    throw "Aucun client MySQL trouvé ('mysql' ou 'mysqlsh'). Installez-le ou lancez le script avec -SkipDb."
  }

  Invoke-Step "Application des scripts SQL db_init" {
    $scripts = @(
      "db_init/1_schema.sql",
      "db_init/2_update.sql",
      "db_init/3_notifications.sql",
      "db_init/4_invitations.sql"
    )
    foreach ($s in $scripts) { Invoke-MySqlScript -ScriptPath $s }
  }
} else {
  Write-Host "Etape DB ignorée (--SkipDb)."
}

Write-Host "`nSetup terminé." -ForegroundColor Cyan

# 7) Démarrage automatique (sauf --NoStart)
if (-not $NoStart) {
  Invoke-Step "Démarrage du backend (server)" {
    $serverDir = "$PSScriptRoot\server"
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c","cd /d `"$serverDir`" && set NODE_ENV=development && npm run dev" -WorkingDirectory $serverDir
  }
  Invoke-Step "Démarrage du frontend (client)" {
    $clientDir = "$PSScriptRoot\client"
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c","cd /d `"$clientDir`" && set PORT=8081 && npm start" -WorkingDirectory $clientDir
  }
  Write-Host "Services lancés dans deux fenêtres PowerShell. Frontend: http://localhost:8081" -ForegroundColor Green
} else {
  Write-Host "Démarrage automatique désactivé (--NoStart)." -ForegroundColor Yellow
  Write-Host "Lancez manuellement:" -ForegroundColor Yellow
  Write-Host "- Backend: cd server; npm run dev" -ForegroundColor Yellow
  Write-Host "- Frontend: cd client; npm start" -ForegroundColor Yellow
}


