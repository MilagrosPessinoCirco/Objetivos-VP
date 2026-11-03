[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [string]$ProjectRoot
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$script:CurrentStage = "Inicialización"
$script:LastCommand = ""
$script:ProjectRoot = ""
$script:SppkgPath = ""
$script:LocationPushed = $false
$script:Utf8NoBom = [System.Text.UTF8Encoding]::new($false)

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logName = "generate-sppkg-$timestamp-$PID.log"
$script:LogPath = Join-Path ([System.IO.Path]::GetTempPath()) $logName

[System.IO.File]::WriteAllText(
    $script:LogPath,
    "Inicio: $([DateTime]::Now.ToString("O"))$([Environment]::NewLine)",
    $script:Utf8NoBom
)

function Write-Log {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyString()]
        [string]$Message
    )

    [System.IO.File]::AppendAllText(
        $script:LogPath,
        $Message + [Environment]::NewLine,
        $script:Utf8NoBom
    )
}

function Resolve-ProjectRoot {
    param(
        [Parameter(Mandatory = $false)]
        [string]$RequestedRoot
    )

    if (-not [string]::IsNullOrWhiteSpace($RequestedRoot)) {
        return [System.IO.Path]::GetFullPath($RequestedRoot)
    }

    return [System.IO.Path]::GetFullPath(
        (Join-Path $PSScriptRoot "..\..\..\..")
    )
}

function Get-ProjectRelativePath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    $root = $script:ProjectRoot.TrimEnd(
        [System.IO.Path]::DirectorySeparatorChar,
        [System.IO.Path]::AltDirectorySeparatorChar
    )

    $fullPath = [System.IO.Path]::GetFullPath($Path)
    $prefix = $root + [System.IO.Path]::DirectorySeparatorChar

    if ($fullPath.StartsWith(
        $prefix,
        [System.StringComparison]::OrdinalIgnoreCase
    )) {
        $relativePath = $fullPath.Substring($prefix.Length)

        return $relativePath.Replace("\", "/")
    }

    return $fullPath.Replace("\", "/")
}

function Confirm-RequiredFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        throw "No se encontró el archivo obligatorio '$Path'."
    }
}

function Read-JsonFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    try {
        return Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json
    }
    catch {
        throw "No se pudo interpretar '$Path' como JSON: $($_.Exception.Message)"
    }
}

function Get-Dependency {
    param(
        [Parameter(Mandatory = $true)]
        [object]$PackageJson,

        [Parameter(Mandatory = $true)]
        [string]$Name
    )

    foreach ($sectionName in @("dependencies", "devDependencies")) {
        $section = $PackageJson.PSObject.Properties[$sectionName]

        if ($null -eq $section -or $null -eq $section.Value) {
            continue
        }

        $dependency = $section.Value.PSObject.Properties[$Name]

        if ($null -ne $dependency) {
            return [string]$dependency.Value
        }
    }

    return $null
}

function Get-Toolchain {
    param(
        [Parameter(Mandatory = $true)]
        [object]$PackageJson,

        [Parameter(Mandatory = $true)]
        [string]$PackageLockPath
    )

    $scriptValues = @()
    $scriptsProperty = $PackageJson.PSObject.Properties["scripts"]

    if ($null -ne $scriptsProperty -and $null -ne $scriptsProperty.Value) {
        foreach ($property in $scriptsProperty.Value.PSObject.Properties) {
            $scriptValues += [string]$property.Value
        }
    }

    $scriptsText = $scriptValues -join [Environment]::NewLine
    $packageLockContent = Get-Content -LiteralPath $PackageLockPath -Raw

    $hasHeft =
        -not [string]::IsNullOrWhiteSpace(
            (Get-Dependency -PackageJson $PackageJson -Name "@rushstack/heft")
        ) -or
        -not [string]::IsNullOrWhiteSpace(
            (Get-Dependency `
                -PackageJson $PackageJson `
                -Name "@microsoft/spfx-heft-plugins")
        ) -or
        $scriptsText -match "(?i)\bheft\b" -or
        $packageLockContent -match '"node_modules/@rushstack/heft"' -or
        $packageLockContent -match '"node_modules/@microsoft/spfx-heft-plugins"'

    $hasGulp =
        (Test-Path `
            -LiteralPath (Join-Path $script:ProjectRoot "gulpfile.js") `
            -PathType Leaf) -or
        -not [string]::IsNullOrWhiteSpace(
            (Get-Dependency `
                -PackageJson $PackageJson `
                -Name "@microsoft/sp-build-web")
        ) -or
        $scriptsText -match "(?i)\bgulp\b" -or
        $packageLockContent -match '"node_modules/@microsoft/sp-build-web"'

    if ($hasHeft -and $hasGulp) {
        throw "El proyecto contiene señales simultáneas de Heft y Gulp."
    }

    if ($hasHeft) {
        return "Heft"
    }

    if ($hasGulp) {
        return "Gulp"
    }

    throw "No se pudo determinar si el proyecto utiliza Heft o Gulp."
}

function Get-SppkgPath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$PackageSolutionPath
    )

    $packageSolution = Read-JsonFile -Path $PackageSolutionPath
    $pathsProperty = $packageSolution.PSObject.Properties["paths"]

    if ($null -eq $pathsProperty -or $null -eq $pathsProperty.Value) {
        throw "package-solution.json no contiene la propiedad paths."
    }

    $zippedPackageProperty =
        $pathsProperty.Value.PSObject.Properties["zippedPackage"]

    if (
        $null -eq $zippedPackageProperty -or
        [string]::IsNullOrWhiteSpace(
            [string]$zippedPackageProperty.Value
        )
    ) {
        throw "package-solution.json no define paths.zippedPackage."
    }

    $configuredPath = ([string]$zippedPackageProperty.Value).Trim()
    $configuredPath = $configuredPath.Replace("\", "/")

    if ([System.IO.Path]::IsPathRooted($configuredPath)) {
        throw "paths.zippedPackage debe contener una ruta relativa."
    }

    if ($configuredPath.StartsWith(
        "sharepoint/",
        [System.StringComparison]::OrdinalIgnoreCase
    )) {
        $candidate = Join-Path $script:ProjectRoot $configuredPath
    }
    else {
        $candidate = Join-Path `
            (Join-Path $script:ProjectRoot "sharepoint") `
            $configuredPath
    }

    $fullPath = [System.IO.Path]::GetFullPath($candidate)
    $sharePointRoot = [System.IO.Path]::GetFullPath(
        (Join-Path $script:ProjectRoot "sharepoint")
    )

    $sharePointPrefix = $sharePointRoot.TrimEnd(
        [System.IO.Path]::DirectorySeparatorChar,
        [System.IO.Path]::AltDirectorySeparatorChar
    ) + [System.IO.Path]::DirectorySeparatorChar

    if (-not $fullPath.StartsWith(
        $sharePointPrefix,
        [System.StringComparison]::OrdinalIgnoreCase
    )) {
        throw "La ruta configurada del paquete sale del directorio sharepoint."
    }

    if (
        [System.IO.Path]::GetExtension($fullPath) -cne ".sppkg"
    ) {
        throw "paths.zippedPackage no apunta a un archivo .sppkg."
    }

    return $fullPath
}

function Format-Command {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Command,

        [Parameter(Mandatory = $false)]
        [string[]]$Arguments = @()
    )

    $formattedArguments = @(
        $Arguments | ForEach-Object {
            if ($_ -match "\s") {
                '"' + $_ + '"'
            }
            else {
                $_
            }
        }
    )

    return (($Command + " " + ($formattedArguments -join " "))).Trim()
}

function Invoke-LoggedCommand {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Command,

        [Parameter(Mandatory = $false)]
        [string[]]$Arguments = @(),

        [Parameter(Mandatory = $true)]
        [string]$Label,

        [Parameter(Mandatory = $false)]
        [switch]$Capture,

        [Parameter(Mandatory = $false)]
        [switch]$IgnoreExitCode
    )

    $script:LastCommand = Format-Command `
        -Command $Command `
        -Arguments $Arguments

    Write-Host "[...] $Label"
    Write-Log -Message ""
    Write-Log -Message "> $($script:LastCommand)"

    $previousPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"

    try {
        $output = @(& $Command @Arguments 2>&1)
        $exitCode = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $previousPreference
    }

    foreach ($line in $output) {
        Write-Log -Message ([string]$line)
    }

    Write-Log -Message "Exit code: $exitCode"

    if ($exitCode -ne 0 -and -not $IgnoreExitCode) {
        throw "El comando '$($script:LastCommand)' finalizó con código $exitCode."
    }

    Write-Host "[OK] $Label" -ForegroundColor Green

    if ($Capture) {
        return ($output | Out-String)
    }
}

function Test-HeftClean {
    $help = Invoke-LoggedCommand `
        -Command "npx" `
        -Arguments @("heft", "--help") `
        -Label "Inspección de comandos Heft" `
        -Capture `
        -IgnoreExitCode

    return [regex]::IsMatch(
        $help,
        "(?im)(?:^|\s)clean(?:\s|$)"
    )
}

function Confirm-Sppkg {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        throw "El proceso terminó sin crear el archivo .sppkg esperado."
    }

    $file = Get-Item -LiteralPath $Path

    if ($file.Length -le 0) {
        throw "El archivo .sppkg generado está vacío."
    }

    try {
        Add-Type `
            -AssemblyName "System.IO.Compression.FileSystem" `
            -ErrorAction SilentlyContinue

        $archive = [System.IO.Compression.ZipFile]::OpenRead($Path)

        try {
            $hasAppManifest = $false

            foreach ($entry in $archive.Entries) {
                $entryPath = $entry.FullName.Replace("\", "/")

                if (
                    $entryPath -ceq "AppManifest.xml" -or
                    $entryPath.EndsWith(
                        "/AppManifest.xml",
                        [System.StringComparison]::OrdinalIgnoreCase
                    )
                ) {
                    $hasAppManifest = $true
                    break
                }
            }

            if (-not $hasAppManifest) {
                throw "El paquete no contiene AppManifest.xml."
            }
        }
        finally {
            $archive.Dispose()
        }
    }
    catch {
        throw "El archivo generado no es un .sppkg válido: $($_.Exception.Message)"
    }

    return $file
}

try {
    $script:CurrentStage = "Preflight"

    $script:ProjectRoot = Resolve-ProjectRoot `
        -RequestedRoot $ProjectRoot

    if (
        -not (
            Test-Path `
                -LiteralPath $script:ProjectRoot `
                -PathType Container
        )
    ) {
        throw "La raíz del proyecto no existe: '$($script:ProjectRoot)'."
    }

    Push-Location $script:ProjectRoot
    $script:LocationPushed = $true

    $packageJsonPath = Join-Path $script:ProjectRoot "package.json"
    $packageLockPath = Join-Path $script:ProjectRoot "package-lock.json"
    $packageSolutionPath = Join-Path `
        (Join-Path $script:ProjectRoot "config") `
        "package-solution.json"

    foreach ($requiredPath in @(
        $packageJsonPath,
        $packageLockPath,
        $packageSolutionPath
    )) {
        Confirm-RequiredFile -Path $requiredPath
    }

    if ($null -eq (Get-Command "npm" -ErrorAction SilentlyContinue)) {
        throw "npm no está disponible en el PATH."
    }

    $packageJson = Read-JsonFile -Path $packageJsonPath
    $toolchain = Get-Toolchain `
        -PackageJson $packageJson `
        -PackageLockPath $packageLockPath

    $script:SppkgPath = Get-SppkgPath `
        -PackageSolutionPath $packageSolutionPath

    Write-Host "[OK] Toolchain detectado: $toolchain" `
        -ForegroundColor Green

    if (Test-Path -LiteralPath $script:SppkgPath -PathType Leaf) {
        Remove-Item -LiteralPath $script:SppkgPath -Force
        Write-Host "[OK] Paquete anterior eliminado"
    }

    if (
        -not (
            Test-Path `
                -LiteralPath (Join-Path $script:ProjectRoot "node_modules") `
                -PathType Container
        )
    ) {
        $script:CurrentStage = "Instalación de dependencias"

        Invoke-LoggedCommand `
            -Command "npm" `
            -Arguments @("ci") `
            -Label "Instalación de dependencias"
    }

    $script:CurrentStage = "Empaquetado de producción"

    if ($toolchain -ceq "Gulp") {
        if (
            $null -eq (
                Get-Command "gulp" -ErrorAction SilentlyContinue
            )
        ) {
            throw "El proyecto utiliza Gulp, pero el comando gulp no está disponible."
        }

        Invoke-LoggedCommand `
            -Command "gulp" `
            -Arguments @("clean") `
            -Label "Limpieza con Gulp"

        Invoke-LoggedCommand `
            -Command "gulp" `
            -Arguments @("bundle", "--ship") `
            -Label "Bundle de producción con Gulp"

        Invoke-LoggedCommand `
            -Command "gulp" `
            -Arguments @("package-solution", "--ship") `
            -Label "Generación del paquete con Gulp"
    }
    else {
        if (
            $null -eq (
                Get-Command "npx" -ErrorAction SilentlyContinue
            )
        ) {
            throw "El proyecto utiliza Heft, pero npx no está disponible."
        }

        if (Test-HeftClean) {
            Invoke-LoggedCommand `
                -Command "npx" `
                -Arguments @("heft", "clean") `
                -Label "Limpieza con Heft"
        }
        else {
            Write-Host "[AVISO] El proyecto no expone heft clean."
            Write-Log -Message "El proyecto no expone heft clean."
        }

        Invoke-LoggedCommand `
            -Command "npx" `
            -Arguments @("heft", "build", "--production") `
            -Label "Build de producción con Heft"

        Invoke-LoggedCommand `
            -Command "npx" `
            -Arguments @(
                "heft",
                "package-solution",
                "--production"
            ) `
            -Label "Generación del paquete con Heft"
    }

    $script:CurrentStage = "Validación del paquete"

    $sppkg = Confirm-Sppkg -Path $script:SppkgPath
    $relativePath = Get-ProjectRelativePath -Path $sppkg.FullName

    Write-Host ""
    Write-Host "SPPKG generado sin errores." -ForegroundColor Green
    Write-Host "Ruta: $relativePath"
    Write-Host "Tamaño: $($sppkg.Length) bytes"
    Write-Host "Log: $($script:LogPath)"
}
catch {
    if (
        -not [string]::IsNullOrWhiteSpace($script:SppkgPath) -and
        (Test-Path -LiteralPath $script:SppkgPath -PathType Leaf)
    ) {
        Remove-Item -LiteralPath $script:SppkgPath -Force
    }

    Write-Host ""
    Write-Host "No se pudo generar el SPPKG." -ForegroundColor Red
    Write-Host "Etapa: $($script:CurrentStage)"

    if (-not [string]::IsNullOrWhiteSpace($script:LastCommand)) {
        Write-Host "Último comando: $($script:LastCommand)"
    }

    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Log: $($script:LogPath)"

    if (Test-Path -LiteralPath $script:LogPath -PathType Leaf) {
        Write-Host ""
        Write-Host "Últimas líneas del log:"

        Get-Content `
            -LiteralPath $script:LogPath `
            -Tail 25 |
            ForEach-Object {
                Write-Host $_
            }
    }

    exit 1
}
finally {
    if ($script:LocationPushed) {
        Pop-Location -ErrorAction SilentlyContinue
    }
}
