[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$SolutionName,

    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$WebPartName,

    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$SiteUrl,

    [Parameter(Mandatory = $false)]
    [string]$ProjectRoot
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$script:CurrentStage = "Inicialización"
$script:LastCommand = ""
$script:InitialState = $null
$script:ProjectRoot = ""
$script:LocationPushed = $false
$script:Warnings = [System.Collections.Generic.List[string]]::new()
$script:ValidationCommands = [System.Collections.Generic.List[string]]::new()
$script:Utf8NoBom = [System.Text.UTF8Encoding]::new($false)

function Get-FullPath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    return [System.IO.Path]::GetFullPath($Path)
}

function Resolve-ProjectRoot {
    param(
        [Parameter(Mandatory = $false)]
        [string]$RequestedRoot
    )

    if (-not [string]::IsNullOrWhiteSpace($RequestedRoot)) {
        return Get-FullPath -Path $RequestedRoot
    }

    return Get-FullPath -Path (Join-Path $PSScriptRoot "..\..\..\..")
}

function Get-RelativeProjectPath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    $root = $script:ProjectRoot.TrimEnd(
        [System.IO.Path]::DirectorySeparatorChar,
        [System.IO.Path]::AltDirectorySeparatorChar
    )
    $fullPath = (Get-FullPath -Path $Path)

    if ($fullPath.Equals($root, [System.StringComparison]::OrdinalIgnoreCase)) {
        return "."
    }

    $rootWithSeparator = $root + [System.IO.Path]::DirectorySeparatorChar
    if (-not $fullPath.StartsWith(
        $rootWithSeparator,
        [System.StringComparison]::OrdinalIgnoreCase
    )) {
        return $fullPath.Replace("\", "/")
    }

    return $fullPath.Substring($rootWithSeparator.Length).Replace("\", "/")
}

function Assert-FileExists {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [Parameter(Mandatory = $true)]
        [string]$Description
    )

    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        throw "Falta $Description en '$Path'."
    }
}

function Read-TextFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    return [System.IO.File]::ReadAllText($Path)
}

function Write-TextFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [Parameter(Mandatory = $true)]
        [AllowEmptyString()]
        [string]$Content
    )

    $directory = Split-Path -Parent $Path
    if (-not (Test-Path -LiteralPath $directory -PathType Container)) {
        New-Item -ItemType Directory -Path $directory -Force | Out-Null
    }

    if (Test-Path -LiteralPath $Path -PathType Leaf) {
        $currentContent = Read-TextFile -Path $Path
        if ($currentContent -ceq $Content) {
            return
        }
    }

    [System.IO.File]::WriteAllText($Path, $Content, $script:Utf8NoBom)
}

function Read-JsonFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    try {
        return (Read-TextFile -Path $Path) | ConvertFrom-Json
    }
    catch {
        throw "No se pudo interpretar el JSON '$Path': $($_.Exception.Message)"
    }
}

function Write-JsonFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [Parameter(Mandatory = $true)]
        [object]$Value
    )

    $content = ($Value | ConvertTo-Json -Depth 100) + [Environment]::NewLine
    Write-TextFile -Path $Path -Content $content
}

function Get-RequiredProperty {
    param(
        [Parameter(Mandatory = $true)]
        [object]$Object,

        [Parameter(Mandatory = $true)]
        [string]$PropertyName,

        [Parameter(Mandatory = $true)]
        [string]$Context
    )

    $property = $Object.PSObject.Properties[$PropertyName]
    if ($null -eq $property -or $null -eq $property.Value) {
        throw "Falta la propiedad '$PropertyName' en $Context."
    }

    return $property.Value
}

function Set-ObjectProperty {
    param(
        [Parameter(Mandatory = $true)]
        [object]$Object,

        [Parameter(Mandatory = $true)]
        [string]$PropertyName,

        [Parameter(Mandatory = $true)]
        [AllowNull()]
        [object]$Value
    )

    $property = $Object.PSObject.Properties[$PropertyName]
    if ($null -eq $property) {
        $Object | Add-Member -MemberType NoteProperty -Name $PropertyName -Value $Value
        return
    }

    $property.Value = $Value
}

function Format-CommandArgument {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Value
    )

    if ($Value -match '[\s"]') {
        return '"' + $Value.Replace('"', '\"') + '"'
    }

    return $Value
}

function Invoke-ExternalCommand {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Command,

        [Parameter(Mandatory = $false)]
        [string[]]$Arguments = @()
    )

    $displayArguments = @($Arguments | ForEach-Object {
        Format-CommandArgument -Value $_
    })
    $script:LastCommand = (($Command) + " " + ($displayArguments -join " ")).Trim()

    Write-Host "`n> $($script:LastCommand)" -ForegroundColor Cyan
    $previousPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        & $Command @Arguments 2>&1 | ForEach-Object {
            Write-Host $_
        }
        $exitCode = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $previousPreference
    }

    if ($exitCode -ne 0) {
        throw "El comando finalizó con código $exitCode."
    }
}

function Invoke-ExternalCommandCapture {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Command,

        [Parameter(Mandatory = $false)]
        [string[]]$Arguments = @()
    )

    $displayArguments = @($Arguments | ForEach-Object {
        Format-CommandArgument -Value $_
    })
    $script:LastCommand = (($Command) + " " + ($displayArguments -join " ")).Trim()

    $previousPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        $output = (& $Command @Arguments 2>&1 | Out-String)
        $exitCode = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $previousPreference
    }

    if ($exitCode -ne 0) {
        throw "El comando '$($script:LastCommand)' finalizó con código $exitCode. $($output.Trim())"
    }

    return $output.Trim()
}

function Test-CommandAvailable {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Command
    )

    return $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

function Get-ProjectFileState {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Root
    )

    $excludedDirectories = @(
        ".git",
        "node_modules",
        ".heft",
        "lib",
        "dist",
        "temp",
        "release",
        "sharepoint"
    )

    $state = [System.Collections.Generic.Dictionary[string,string]]::new(
        [System.StringComparer]::OrdinalIgnoreCase
    )
    $files = Get-ChildItem -LiteralPath $Root -Recurse -Force -File

    foreach ($file in $files) {
        $relativePath = Get-RelativeProjectPath -Path $file.FullName
        $segments = $relativePath -split "/"
        $isExcluded = $false

        foreach ($segment in $segments) {
            if ($excludedDirectories -contains $segment) {
                $isExcluded = $true
                break
            }
        }

        if ($isExcluded) {
            continue
        }

        $state[$relativePath] = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash
    }

    return $state
}

function Compare-ProjectFileState {
    param(
        [Parameter(Mandatory = $true)]
        [System.Collections.Generic.Dictionary[string,string]]$Before,

        [Parameter(Mandatory = $true)]
        [System.Collections.Generic.Dictionary[string,string]]$After
    )

    $created = [System.Collections.Generic.List[string]]::new()
    $modified = [System.Collections.Generic.List[string]]::new()
    $deleted = [System.Collections.Generic.List[string]]::new()

    foreach ($path in $After.Keys) {
        if (-not $Before.ContainsKey($path)) {
            $created.Add($path)
            continue
        }

        if ($Before[$path] -cne $After[$path]) {
            $modified.Add($path)
        }
    }

    foreach ($path in $Before.Keys) {
        if (-not $After.ContainsKey($path)) {
            $deleted.Add($path)
        }
    }

    return [PSCustomObject]@{
        Created = @($created | Sort-Object)
        Modified = @($modified | Sort-Object)
        Deleted = @($deleted | Sort-Object)
    }
}

function Write-ChangedFiles {
    param(
        [Parameter(Mandatory = $true)]
        [object]$Changes
    )

    Write-Host "Archivos creados: $($Changes.Created.Count)"
    foreach ($path in $Changes.Created) {
        Write-Host "  + $path"
    }

    Write-Host "Archivos modificados: $($Changes.Modified.Count)"
    foreach ($path in $Changes.Modified) {
        Write-Host "  ~ $path"
    }

    Write-Host "Archivos eliminados: $($Changes.Deleted.Count)"
    foreach ($path in $Changes.Deleted) {
        Write-Host "  - $path"
    }
}

function Convert-ToSafeSolutionName {
    param(
        [Parameter(Mandatory = $true)]
        [string]$RawName
    )

    $normalized = $RawName.Trim()
    $normalized = [regex]::Replace($normalized, '[\s_]+', '-')
    $normalized = [regex]::Replace($normalized, '-+', '-')
    $normalized = $normalized.Trim('-')

    if ([string]::IsNullOrWhiteSpace($normalized)) {
        throw "El nombre solicitado queda vacío después de normalizarlo."
    }

    if ($normalized -cnotmatch '^[A-Za-z0-9-]+$') {
        throw "El nombre normalizado '$normalized' contiene caracteres no permitidos. Use letras sin acentos, números y '-'."
    }

    return $normalized
}

function Convert-ToPascalWebPartName {
    param(
        [Parameter(Mandatory = $true)]
        [string]$RawName
    )

    $value = $RawName.Trim()
    $value = [regex]::Replace($value, '(?i)WebPart$', '')
    $value = $value.Trim(' ', '-', '_')

    if ([string]::IsNullOrWhiteSpace($value)) {
        throw "El nombre de la webpart queda vacío después de quitar el sufijo WebPart."
    }

    if ($value -cnotmatch '^[A-Za-z0-9 _-]+$') {
        throw "El nombre de webpart '$RawName' contiene caracteres no permitidos."
    }

    $parts = @([regex]::Split($value, '[\s_-]+') | Where-Object {
        -not [string]::IsNullOrWhiteSpace($_)
    })

    $pascalParts = [System.Collections.Generic.List[string]]::new()
    foreach ($part in $parts) {
        if ($part -cmatch '^[A-Z0-9]+$') {
            $pascalParts.Add($part)
            continue
        }

        $pascalParts.Add($part.Substring(0, 1).ToUpperInvariant() + $part.Substring(1))
    }

    $pascalName = $pascalParts -join ""
    if ($pascalName -cnotmatch '^[A-Z][A-Za-z0-9]*$') {
        throw "No fue posible obtener un nombre PascalCase válido desde '$RawName'."
    }

    return $pascalName
}

function Resolve-SiteUrlInfo {
    param(
        [Parameter(Mandatory = $true)]
        [string]$RawSiteUrl
    )

    $value = $RawSiteUrl.Trim()
    $baseUrl = $value.TrimEnd('/')

    # El patrón acota los caracteres admitidos: la URL se escribe literalmente
    # dentro de una cadena JSON de .vscode/launch.json.
    if ($baseUrl -cnotmatch '^https://[A-Za-z0-9.-]+(?::\d+)?(?:/[A-Za-z0-9._~%-]+)+$') {
        throw "La URL del sitio '$RawSiteUrl' no es una URL https absoluta con la ruta del sitio y sin query string."
    }

    $environmentName = $baseUrl.Substring($baseUrl.LastIndexOf('/') + 1)
    if ([string]::IsNullOrWhiteSpace($environmentName)) {
        throw "No fue posible obtener el nombre del ambiente desde '$RawSiteUrl'."
    }

    return [PSCustomObject]@{
        BaseUrl = $baseUrl
        EnvironmentName = $environmentName
        LaunchConfigurationName = "Manifests $environmentName"
    }
}

function Get-DebugManifestsUrl {
    param(
        [Parameter(Mandatory = $true)]
        [string]$BaseUrl
    )

    $servePath = Join-Path $script:ProjectRoot "config\serve.json"
    Assert-FileExists -Path $servePath -Description "la configuración config/serve.json"

    $serve = Read-JsonFile -Path $servePath
    $port = [int](Get-RequiredProperty `
        -Object $serve `
        -PropertyName "port" `
        -Context $servePath)

    $scheme = "https"
    $httpsProperty = $serve.PSObject.Properties["https"]
    if ($null -ne $httpsProperty -and -not [bool]$httpsProperty.Value) {
        $scheme = "http"
    }

    $manifestsUrl = "${scheme}://localhost:$port/temp/build/manifests.js"
    $encodedManifestsUrl = [uri]::EscapeDataString($manifestsUrl)

    return "$BaseUrl`?debugManifestsFile=$encodedManifestsUrl&debug=true&noredir=true"
}

function Convert-PascalToCamelName {
    param(
        [Parameter(Mandatory = $true)]
        [string]$PascalName
    )

    if ($PascalName -cmatch '^([A-Z]+)([A-Z][a-z].*)$') {
        return $Matches[1].ToLowerInvariant() + $Matches[2]
    }

    if ($PascalName -cmatch '^[A-Z0-9]+$') {
        return $PascalName.ToLowerInvariant()
    }

    return $PascalName.Substring(0, 1).ToLowerInvariant() + $PascalName.Substring(1)
}

function Test-IsTextFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    $fileName = [System.IO.Path]::GetFileName($Path)
    $extension = [System.IO.Path]::GetExtension($Path).ToLowerInvariant()
    $textExtensions = @(
        "",
        ".json",
        ".md",
        ".txt",
        ".ts",
        ".tsx",
        ".js",
        ".jsx",
        ".mjs",
        ".cjs",
        ".scss",
        ".css",
        ".xml",
        ".html",
        ".htm",
        ".yml",
        ".yaml",
        ".ps1"
    )

    return ($textExtensions -contains $extension) -or $fileName.StartsWith(".")
}

function Get-RepositoryFiles {
    if ((Test-Path -LiteralPath (Join-Path $script:ProjectRoot ".git") -PathType Container) -and
        (Test-CommandAvailable -Command "git")) {
        $previousPreference = $ErrorActionPreference
        $ErrorActionPreference = "Continue"
        try {
            $gitFiles = @(& git -C $script:ProjectRoot -c core.quotepath=false ls-files --cached --others --exclude-standard 2>$null)
            $gitExitCode = $LASTEXITCODE
        }
        finally {
            $ErrorActionPreference = $previousPreference
        }

        if ($gitExitCode -eq 0) {
            return @($gitFiles | ForEach-Object {
                Join-Path $script:ProjectRoot $_
            } | Where-Object {
                Test-Path -LiteralPath $_ -PathType Leaf
            })
        }
    }

    $excludedDirectories = @(
        ".git",
        "node_modules",
        ".heft",
        "lib",
        "dist",
        "temp",
        "release",
        "sharepoint"
    )

    return @(Get-ChildItem -LiteralPath $script:ProjectRoot -Recurse -Force -File | Where-Object {
        $relativePath = Get-RelativeProjectPath -Path $_.FullName
        $segments = $relativePath -split "/"
        $include = $true

        foreach ($segment in $segments) {
            if ($excludedDirectories -contains $segment) {
                $include = $false
                break
            }
        }

        $include
    } | ForEach-Object {
        $_.FullName
    })
}

function Get-FilesContainingValue {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Value,

        [Parameter(Mandatory = $false)]
        [switch]$IgnoreCase
    )

    $options = [System.Text.RegularExpressions.RegexOptions]::None
    if ($IgnoreCase) {
        $options = $options -bor [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
    }

    $pattern = [regex]::Escape($Value)
    $results = [System.Collections.Generic.List[string]]::new()

    foreach ($file in (Get-RepositoryFiles)) {
        if (-not (Test-IsTextFile -Path $file)) {
            continue
        }

        try {
            $content = Read-TextFile -Path $file
        }
        catch {
            continue
        }

        if ([regex]::IsMatch($content, $pattern, $options)) {
            $results.Add((Get-RelativeProjectPath -Path $file))
        }
    }

    return @($results | Sort-Object -Unique)
}

function Assert-NoUnexpectedOccurrences {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Value,

        [Parameter(Mandatory = $true)]
        [string[]]$AllowedRelativePaths,

        [Parameter(Mandatory = $true)]
        [string]$Label
    )

    $allowed = [System.Collections.Generic.HashSet[string]]::new(
        [System.StringComparer]::OrdinalIgnoreCase
    )
    foreach ($path in $AllowedRelativePaths) {
        [void]$allowed.Add($path.Replace("\", "/"))
    }

    $unexpected = @((Get-FilesContainingValue -Value $Value -IgnoreCase) | Where-Object {
        -not $allowed.Contains($_)
    })

    if ($unexpected.Count -gt 0) {
        throw "$Label aparece fuera de los archivos autorizados: $($unexpected -join ', ')."
    }
}

function Replace-CaseAwareName {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [Parameter(Mandatory = $true)]
        [string]$OldName,

        [Parameter(Mandatory = $true)]
        [string]$NewLowerName,

        [Parameter(Mandatory = $true)]
        [string]$NewUpperName
    )

    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        return 0
    }

    $content = Read-TextFile -Path $Path
    $oldLower = $OldName.ToLowerInvariant()
    $oldUpper = $OldName.ToUpperInvariant()
    $allMatches = [regex]::Matches(
        $content,
        [regex]::Escape($OldName),
        [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
    )

    foreach ($match in $allMatches) {
        if (($match.Value -cne $oldLower) -and ($match.Value -cne $oldUpper)) {
            throw "Se encontró el nombre anterior con casing mixto no definido en '$(Get-RelativeProjectPath -Path $Path)': '$($match.Value)'."
        }
    }

    $lowerCount = [regex]::Matches($content, [regex]::Escape($oldLower)).Count
    $upperCount = if ($oldUpper -ceq $oldLower) {
        0
    }
    else {
        [regex]::Matches($content, [regex]::Escape($oldUpper)).Count
    }
    $updated = $content.Replace($oldLower, $NewLowerName).Replace($oldUpper, $NewUpperName)

    if ($updated -cne $content) {
        Write-TextFile -Path $Path -Content $updated
    }

    return $lowerCount + $upperCount
}

function Replace-GuidValue {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [Parameter(Mandatory = $true)]
        [string]$OldGuid,

        [Parameter(Mandatory = $true)]
        [string]$NewGuid
    )

    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        return 0
    }

    $content = Read-TextFile -Path $Path
    $pattern = [regex]::Escape($OldGuid)
    $count = [regex]::Matches(
        $content,
        $pattern,
        [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
    ).Count

    if ($count -eq 0) {
        return 0
    }

    $updated = [regex]::Replace(
        $content,
        $pattern,
        $NewGuid,
        [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
    )
    Write-TextFile -Path $Path -Content $updated
    return $count
}

function Assert-RenamedProjectMetadata {
    param(
        [Parameter(Mandatory = $true)]
        [string]$PackageJsonPath,

        [Parameter(Mandatory = $true)]
        [string]$PackageLockPath,

        [Parameter(Mandatory = $true)]
        [string]$PackageSolutionPath,

        [Parameter(Mandatory = $true)]
        [string]$YoRcPath,

        [Parameter(Mandatory = $true)]
        [string]$DeployStoragePath,

        [Parameter(Mandatory = $true)]
        [string]$ExpectedLowerName,

        [Parameter(Mandatory = $true)]
        [string]$SolutionSuffix,

        [Parameter(Mandatory = $true)]
        [string]$ExpectedGuid
    )

    $packageJson = Read-JsonFile -Path $PackageJsonPath
    $packageName = [string](Get-RequiredProperty `
        -Object $packageJson `
        -PropertyName "name" `
        -Context $PackageJsonPath)
    if ($packageName -cne $ExpectedLowerName) {
        throw "package.json.name no quedó en '$ExpectedLowerName'."
    }

    # package-lock.json no se deserializa: contiene la entrada obligatoria
    # packages[""] y ConvertFrom-Json no admite propiedades de nombre vacío.
    # Solo se verifican las dos propiedades 'name' alcanzadas por el rename.
    $packageLockText = Read-TextFile -Path $PackageLockPath
    $lockNameMatch = [regex]::Match(
        $packageLockText,
        '^\s*\{(?:\s*"[^"]*"\s*:\s*(?:"[^"]*"|-?\d+(?:\.\d+)?|true|false|null)\s*,)*\s*"name"\s*:\s*"(?<name>[^"]*)"'
    )
    if (-not $lockNameMatch.Success) {
        throw "Falta la propiedad 'name' en $PackageLockPath."
    }
    if ($lockNameMatch.Groups["name"].Value -cne $ExpectedLowerName) {
        throw "package-lock.json.name no quedó en '$ExpectedLowerName'."
    }

    $rootPackageNameMatch = [regex]::Match(
        $packageLockText,
        '"packages"\s*:\s*\{\s*""\s*:\s*\{\s*"name"\s*:\s*"(?<name>[^"]*)"'
    )
    if ($rootPackageNameMatch.Success -and
        ($rootPackageNameMatch.Groups["name"].Value -cne $ExpectedLowerName)) {
        throw "package-lock.json -> packages[''].name no quedó en '$ExpectedLowerName'."
    }

    $packageSolution = Read-JsonFile -Path $PackageSolutionPath
    $solution = Get-RequiredProperty `
        -Object $packageSolution `
        -PropertyName "solution" `
        -Context $PackageSolutionPath
    $fullName = [string](Get-RequiredProperty `
        -Object $solution `
        -PropertyName "name" `
        -Context "$PackageSolutionPath -> solution")
    $solutionGuid = [string](Get-RequiredProperty `
        -Object $solution `
        -PropertyName "id" `
        -Context "$PackageSolutionPath -> solution")

    if ($fullName -cne "$ExpectedLowerName$SolutionSuffix") {
        throw "solution.name no preservó correctamente '$SolutionSuffix'."
    }
    if ($solutionGuid -cne $ExpectedGuid) {
        throw "solution.id no contiene el nuevo GUID en minúsculas."
    }

    if (Test-Path -LiteralPath $YoRcPath -PathType Leaf) {
        $yoRc = Read-JsonFile -Path $YoRcPath
        $generatorConfig = Get-RequiredProperty `
            -Object $yoRc `
            -PropertyName "@microsoft/generator-sharepoint" `
            -Context $YoRcPath
        $libraryId = [string](Get-RequiredProperty `
            -Object $generatorConfig `
            -PropertyName "libraryId" `
            -Context "$YoRcPath -> @microsoft/generator-sharepoint")
        if ($libraryId -cne $ExpectedGuid) {
            throw ".yo-rc.json.libraryId no contiene el nuevo GUID en minúsculas."
        }

        foreach ($propertyName in @("libraryName", "solutionName")) {
            $property = $generatorConfig.PSObject.Properties[$propertyName]
            if ($null -ne $property -and
                ([string]$property.Value -cne $ExpectedLowerName)) {
                throw ".yo-rc.json.$propertyName no quedó en '$ExpectedLowerName'."
            }
        }
    }

    if (Test-Path -LiteralPath $DeployStoragePath -PathType Leaf) {
        $deployStorage = Read-JsonFile -Path $DeployStoragePath
        $container = [string](Get-RequiredProperty `
            -Object $deployStorage `
            -PropertyName "container" `
            -Context $DeployStoragePath)
        if ($container -cne $ExpectedLowerName) {
            throw "config/deploy-azure-storage.json.container no quedó en '$ExpectedLowerName'."
        }
    }
}

function Add-ValidationCommand {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Command
    )

    if (-not $script:ValidationCommands.Contains($Command)) {
        $script:ValidationCommands.Add($Command)
    }
}

function Invoke-ProjectValidation {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Label
    )

    Write-Host "`nValidación: $Label" -ForegroundColor Yellow
    $packageJsonPath = Join-Path $script:ProjectRoot "package.json"
    $packageJson = Read-JsonFile -Path $packageJsonPath
    $scriptsProperty = $packageJson.PSObject.Properties["scripts"]

    if ($null -eq $scriptsProperty -or $null -eq $scriptsProperty.Value) {
        throw "package.json no define scripts de validación."
    }

    $scripts = $scriptsProperty.Value
    if ($null -ne $scripts.PSObject.Properties["lint"]) {
        Invoke-ExternalCommand -Command "npm" -Arguments @("run", "lint")
        Add-ValidationCommand -Command "npm run lint"
    }

    if ($null -eq $scripts.PSObject.Properties["build"]) {
        throw "package.json no define el script obligatorio 'build'."
    }

    Invoke-ExternalCommand -Command "npm" -Arguments @("run", "build")
    Add-ValidationCommand -Command "npm run build"
}

function Get-VersionFromSpecification {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Specification,

        [Parameter(Mandatory = $true)]
        [string]$DependencyName
    )

    $match = [regex]::Match($Specification, '\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?')
    if (-not $match.Success) {
        throw "No se pudo determinar una versión concreta para $DependencyName desde '$Specification'."
    }

    return $match.Value
}

function Get-MajorVersionFromSpecification {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Specification,

        [Parameter(Mandatory = $true)]
        [string]$DependencyName
    )

    $match = [regex]::Match($Specification, '(?<!\d)(\d+)(?:\.\d+){0,2}')
    if (-not $match.Success) {
        throw "No se pudo determinar la versión mayor de $DependencyName desde '$Specification'."
    }

    return [int]$match.Groups[1].Value
}

function Get-DependencySpecification {
    param(
        [Parameter(Mandatory = $true)]
        [object]$PackageJson,

        [Parameter(Mandatory = $true)]
        [string]$DependencyName
    )

    foreach ($sectionName in @("dependencies", "devDependencies")) {
        $section = $PackageJson.PSObject.Properties[$sectionName]
        if ($null -eq $section -or $null -eq $section.Value) {
            continue
        }

        $dependency = $section.Value.PSObject.Properties[$DependencyName]
        if ($null -ne $dependency) {
            return [string]$dependency.Value
        }
    }

    return $null
}

function Get-GeneratorVersion {
    $packageJson = Read-JsonFile -Path (Join-Path $script:ProjectRoot "package.json")
    $spCoreSpecification = Get-DependencySpecification `
        -PackageJson $packageJson `
        -DependencyName "@microsoft/sp-core-library"

    if ([string]::IsNullOrWhiteSpace($spCoreSpecification)) {
        throw "package.json no declara @microsoft/sp-core-library; no se puede determinar la versión SPFx."
    }

    $spFxVersion = Get-VersionFromSpecification `
        -Specification $spCoreSpecification `
        -DependencyName "@microsoft/sp-core-library"

    $yoRcPath = Join-Path $script:ProjectRoot ".yo-rc.json"
    if (-not (Test-Path -LiteralPath $yoRcPath -PathType Leaf)) {
        return $spFxVersion
    }

    $yoRc = Read-JsonFile -Path $yoRcPath
    $generatorProperty = $yoRc.PSObject.Properties["@microsoft/generator-sharepoint"]
    if ($null -eq $generatorProperty -or $null -eq $generatorProperty.Value) {
        return $spFxVersion
    }

    $versionProperty = $generatorProperty.Value.PSObject.Properties["version"]
    if ($null -eq $versionProperty -or [string]::IsNullOrWhiteSpace([string]$versionProperty.Value)) {
        return $spFxVersion
    }

    $yoVersion = Get-VersionFromSpecification `
        -Specification ([string]$versionProperty.Value) `
        -DependencyName "@microsoft/generator-sharepoint"

    if ($yoVersion -cne $spFxVersion) {
        throw "La versión del generador en .yo-rc.json ($yoVersion) no coincide con @microsoft/sp-core-library ($spFxVersion)."
    }

    return $spFxVersion
}

function Get-InstalledGeneratorVersion {
    $localPackage = Join-Path $script:ProjectRoot "node_modules\@microsoft\generator-sharepoint\package.json"
    if (Test-Path -LiteralPath $localPackage -PathType Leaf) {
        $localJson = Read-JsonFile -Path $localPackage
        return [string](Get-RequiredProperty -Object $localJson -PropertyName "version" -Context $localPackage)
    }

    try {
        $globalRootOutput = Invoke-ExternalCommandCapture `
            -Command "npm" `
            -Arguments @("root", "--global")
        $globalRootCandidates = @($globalRootOutput -split "`r?`n" | ForEach-Object {
            $_.Trim()
        } | Where-Object {
            -not [string]::IsNullOrWhiteSpace($_) -and
            (Test-Path -LiteralPath $_ -PathType Container)
        })
        if ($globalRootCandidates.Count -eq 0) {
            throw "npm root --global no devolvió una ruta existente."
        }

        $globalRoot = $globalRootCandidates[$globalRootCandidates.Count - 1]
        $globalPackage = Join-Path $globalRoot "@microsoft\generator-sharepoint\package.json"
        if (Test-Path -LiteralPath $globalPackage -PathType Leaf) {
            $globalJson = Read-JsonFile -Path $globalPackage
            return [string](Get-RequiredProperty -Object $globalJson -PropertyName "version" -Context $globalPackage)
        }
    }
    catch {
        $script:Warnings.Add("No se pudo inspeccionar el generador global: $($_.Exception.Message)")
    }

    return $null
}

function Get-GeneratorInvocation {
    param(
        [Parameter(Mandatory = $true)]
        [string]$RequiredVersion
    )

    $installedVersion = Get-InstalledGeneratorVersion
    if ((Test-CommandAvailable -Command "yo") -and
        -not [string]::IsNullOrWhiteSpace($installedVersion) -and
        ($installedVersion -ceq $RequiredVersion)) {
        return [PSCustomObject]@{
            Command = "yo"
            PrefixArguments = @("@microsoft/sharepoint")
            Source = "instalación existente"
        }
    }

    if (-not (Test-CommandAvailable -Command "npx")) {
        throw "No existe un generador compatible instalado y tampoco está disponible npx."
    }

    if (-not [string]::IsNullOrWhiteSpace($installedVersion)) {
        $script:Warnings.Add(
            "El generador instalado ($installedVersion) no coincide con el proyecto ($RequiredVersion); se utilizará npx temporalmente."
        )
    }
    else {
        $script:Warnings.Add(
            "No se encontró el generador instalado; se utilizará npx temporalmente con la versión $RequiredVersion."
        )
    }

    return [PSCustomObject]@{
        Command = "npx"
        PrefixArguments = @(
            "--yes",
            "--package=yo@5",
            "--package=@microsoft/generator-sharepoint@$RequiredVersion",
            "yo",
            "@microsoft/sharepoint"
        )
        Source = "npx temporal"
    }
}

function Get-GeneratorOption {
    param(
        [Parameter(Mandatory = $true)]
        [string]$HelpText,

        [Parameter(Mandatory = $true)]
        [string[]]$Candidates,

        [Parameter(Mandatory = $true)]
        [string]$Description,

        [Parameter(Mandatory = $false)]
        [switch]$Optional
    )

    foreach ($candidate in $Candidates) {
        if ($HelpText.Contains($candidate)) {
            return $candidate
        }
    }

    if ($Optional) {
        return $null
    }

    throw "El generador no expone una opción no interactiva para $Description."
}

function Invoke-MicrosoftWebPartGenerator {
    param(
        [Parameter(Mandatory = $true)]
        [string]$GeneratorVersion,

        [Parameter(Mandatory = $true)]
        [string]$NormalizedSolutionName,

        [Parameter(Mandatory = $true)]
        [string]$PascalWebPartName
    )

    # El generador agrega la webpart a la solución existente solo cuando toma
    # 'libraryName' del .yo-rc.json de la carpeta actual. No se pasa
    # --solution-name: esa opción cambia el destino a una subcarpeta nueva y
    # dispara el prompt interactivo
    # 'You are not running under solution folder. Continue?'.
    $yoRcPath = Join-Path $script:ProjectRoot ".yo-rc.json"
    if (-not (Test-Path -LiteralPath $yoRcPath -PathType Leaf)) {
        throw "Falta '.yo-rc.json': el generador no puede agregar la webpart a la solución existente sin interacción."
    }

    $generatorConfig = Get-RequiredProperty `
        -Object (Read-JsonFile -Path $yoRcPath) `
        -PropertyName "@microsoft/generator-sharepoint" `
        -Context $yoRcPath
    $libraryName = [string](Get-RequiredProperty `
        -Object $generatorConfig `
        -PropertyName "libraryName" `
        -Context "$yoRcPath -> @microsoft/generator-sharepoint")
    if (-not $libraryName.Equals(
        $NormalizedSolutionName,
        [System.StringComparison]::OrdinalIgnoreCase
    )) {
        throw "'.yo-rc.json' declara la solución '$libraryName' en lugar de '$NormalizedSolutionName'."
    }

    $invocation = Get-GeneratorInvocation -RequiredVersion $GeneratorVersion
    Write-Host "Generador: $($invocation.Source), versión $GeneratorVersion"

    $helpArguments = @($invocation.PrefixArguments) + @("--help")
    $helpText = Invoke-ExternalCommandCapture `
        -Command $invocation.Command `
        -Arguments $helpArguments

    $componentTypeOption = Get-GeneratorOption `
        -HelpText $helpText `
        -Candidates @("--component-type", "--componentType") `
        -Description "el tipo de componente"
    $componentNameOption = Get-GeneratorOption `
        -HelpText $helpText `
        -Candidates @("--component-name", "--componentName") `
        -Description "el nombre de la webpart"
    $componentDescriptionOption = Get-GeneratorOption `
        -HelpText $helpText `
        -Candidates @("--component-description", "--componentDescription") `
        -Description "la descripción de la webpart"
    $skipInstallOption = Get-GeneratorOption `
        -HelpText $helpText `
        -Candidates @("--skip-install", "--skipInstall") `
        -Description "evitar una instalación redundante"
    $frameworkOption = Get-GeneratorOption `
        -HelpText $helpText `
        -Candidates @("--framework") `
        -Description "React" `
        -Optional
    $templateOption = Get-GeneratorOption `
        -HelpText $helpText `
        -Candidates @("--template") `
        -Description "el template React" `
        -Optional
    $environmentOption = Get-GeneratorOption `
        -HelpText $helpText `
        -Candidates @("--environment") `
        -Description "SharePoint Online" `
        -Optional
    $packageManagerOption = Get-GeneratorOption `
        -HelpText $helpText `
        -Candidates @("--package-manager", "--packageManager") `
        -Description "npm" `
        -Optional

    if ([string]::IsNullOrWhiteSpace($frameworkOption) -and
        [string]::IsNullOrWhiteSpace($templateOption)) {
        throw "El generador no permite seleccionar React de forma no interactiva."
    }

    $arguments = @($invocation.PrefixArguments) + @(
        $skipInstallOption,
        $componentTypeOption,
        "webpart",
        $componentNameOption,
        $PascalWebPartName,
        $componentDescriptionOption,
        "Sitio $PascalWebPartName"
    )

    if (-not [string]::IsNullOrWhiteSpace($frameworkOption)) {
        $arguments += @($frameworkOption, "react")
    }
    else {
        $arguments += @($templateOption, "react")
    }

    if (-not [string]::IsNullOrWhiteSpace($environmentOption)) {
        $arguments += @($environmentOption, "spo")
    }

    if (-not [string]::IsNullOrWhiteSpace($packageManagerOption)) {
        $arguments += @($packageManagerOption, "npm")
    }

    # El generador reescribe .eslintrc.js con su propia plantilla al agregar un
    # componente. Se conserva la configuración de lint del proyecto.
    $eslintPath = Join-Path $script:ProjectRoot ".eslintrc.js"
    $eslintContent = $null
    if (Test-Path -LiteralPath $eslintPath -PathType Leaf) {
        $eslintContent = Read-TextFile -Path $eslintPath
    }

    $previousCi = $env:CI
    $env:CI = "true"
    try {
        Invoke-ExternalCommand -Command $invocation.Command -Arguments $arguments
    }
    finally {
        if ($null -eq $previousCi) {
            Remove-Item Env:CI -ErrorAction SilentlyContinue
        }
        else {
            $env:CI = $previousCi
        }

        if ($null -ne $eslintContent) {
            Write-TextFile -Path $eslintPath -Content $eslintContent
        }
    }
}

function Resolve-GeneratedWebPartDirectory {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ExpectedDirectory,

        [Parameter(Mandatory = $true)]
        [string]$ExpectedAlias
    )

    if (Test-Path -LiteralPath $ExpectedDirectory -PathType Container) {
        return $ExpectedDirectory
    }

    $webpartsRoot = Join-Path $script:ProjectRoot "src\webparts"
    $candidates = [System.Collections.Generic.List[string]]::new()

    foreach ($manifestFile in (Get-ChildItem -LiteralPath $webpartsRoot -Recurse -Filter "*WebPart.manifest.json" -File)) {
        try {
            $manifest = Read-JsonFile -Path $manifestFile.FullName
            $alias = [string](Get-RequiredProperty -Object $manifest -PropertyName "alias" -Context $manifestFile.FullName)
            if ($alias -ceq $ExpectedAlias) {
                $candidates.Add($manifestFile.Directory.FullName)
            }
        }
        catch {
            continue
        }
    }

    if ($candidates.Count -ne 1) {
        throw "El generador no creó de forma inequívoca la webpart '$ExpectedAlias'."
    }

    Move-Item -LiteralPath $candidates[0] -Destination $ExpectedDirectory
    return $ExpectedDirectory
}

function Repair-GeneratedWebPartCasing {
    param(
        [Parameter(Mandatory = $true)]
        [string]$WebPartDirectory,

        [Parameter(Mandatory = $true)]
        [string]$PascalWebPartName
    )

    # El generador normaliza el nombre del componente y pierde las siglas
    # ('TMSArenas' -> 'TmsArenas'). Windows resuelve rutas sin distinguir
    # mayúsculas, así que escribir sobre los archivos no corrige su nombre real.
    $webPartClassName = "${PascalWebPartName}WebPart"
    $renamedFiles = [System.Collections.Generic.List[string]]::new()

    foreach ($extension in @(".ts", ".manifest.json")) {
        $expectedName = "$webPartClassName$extension"
        $existing = @(Get-ChildItem -LiteralPath $WebPartDirectory -Filter $expectedName -File)
        if ($existing.Count -ne 1) {
            throw "El generador no creó '$expectedName' en '$WebPartDirectory'."
        }

        $currentName = $existing[0].Name
        if ($currentName -ceq $expectedName) {
            continue
        }

        $temporaryName = "$expectedName.casing"
        Rename-Item -LiteralPath $existing[0].FullName -NewName $temporaryName
        Rename-Item -LiteralPath (Join-Path $WebPartDirectory $temporaryName) -NewName $expectedName
        $renamedFiles.Add($currentName)
    }

    if ($renamedFiles.Count -eq 0) {
        return
    }

    $configPath = Join-Path $script:ProjectRoot "config\config.json"
    Assert-FileExists -Path $configPath -Description "la configuración config/config.json"

    $folderName = Split-Path -Leaf $WebPartDirectory
    $pattern = "(?i)(webparts[\\/]$([regex]::Escape($folderName))[\\/])[A-Za-z0-9]+WebPart\."
    $configContent = Read-TextFile -Path $configPath
    Write-TextFile `
        -Path $configPath `
        -Content ([regex]::Replace($configContent, $pattern, "`${1}$webPartClassName."))

    $script:Warnings.Add(
        "El generador normalizó el nombre de la webpart; se corrigió el casing de: $($renamedFiles -join ', ')."
    )
}

function Remove-SampleBundleReferences {
    $configPath = Join-Path $script:ProjectRoot "config\config.json"
    if (-not (Test-Path -LiteralPath $configPath -PathType Leaf)) {
        return
    }

    $samplePattern = '(?i)webparts[\\/](helloWorld|template)[\\/]'
    $config = Read-JsonFile -Path $configPath
    $removed = [System.Collections.Generic.List[string]]::new()

    # 'localizedResources' también debe limpiarse: el build falla si un patrón
    # apunta a una carpeta 'loc' que ya no existe.
    foreach ($sectionName in @("bundles", "localizedResources")) {
        $sectionProperty = $config.PSObject.Properties[$sectionName]
        if ($null -eq $sectionProperty -or $null -eq $sectionProperty.Value) {
            continue
        }

        foreach ($entry in @($sectionProperty.Value.PSObject.Properties)) {
            $serialized = $entry.Value | ConvertTo-Json -Depth 100
            if ($serialized -match $samplePattern) {
                $sectionProperty.Value.PSObject.Properties.Remove($entry.Name)
                $removed.Add("$sectionName -> $($entry.Name)")
            }
        }
    }

    if ($removed.Count -gt 0) {
        Write-JsonFile -Path $configPath -Value $config
        $script:Warnings.Add(
            "Se eliminaron de config/config.json las referencias de ejemplo: $($removed -join ', ')."
        )
    }
}

function Ensure-ReactRouter {
    $packageJsonPath = Join-Path $script:ProjectRoot "package.json"
    $packageJson = Read-JsonFile -Path $packageJsonPath
    $specification = Get-DependencySpecification `
        -PackageJson $packageJson `
        -DependencyName "react-router-dom"

    if ([string]::IsNullOrWhiteSpace($specification)) {
        Invoke-ExternalCommand -Command "npm" -Arguments @(
            "install",
            "--save",
            "react-router-dom@6"
        )
        $packageJson = Read-JsonFile -Path $packageJsonPath
        $specification = Get-DependencySpecification `
            -PackageJson $packageJson `
            -DependencyName "react-router-dom"
    }

    if ([string]::IsNullOrWhiteSpace($specification)) {
        throw "npm no agregó react-router-dom a package.json."
    }

    $majorVersion = Get-MajorVersionFromSpecification `
        -Specification $specification `
        -DependencyName "react-router-dom"

    if ($majorVersion -ne 6) {
        throw "La versión declarada de react-router-dom ('$specification') no es compatible con el scaffolding acordado basado en Routes y Navigate de v6."
    }

    $installedPackagePath = Join-Path $script:ProjectRoot "node_modules\react-router-dom\package.json"
    if (-not (Test-Path -LiteralPath $installedPackagePath -PathType Leaf)) {
        Invoke-ExternalCommand -Command "npm" -Arguments @("install")
    }

    $installedPackage = Read-JsonFile -Path $installedPackagePath
    $installedVersion = [string](Get-RequiredProperty `
        -Object $installedPackage `
        -PropertyName "version" `
        -Context $installedPackagePath)

    if ([int]($installedVersion.Split('.')[0]) -ne 6) {
        throw "La versión instalada de react-router-dom ($installedVersion) no coincide con la versión 6 requerida."
    }

    return $installedVersion
}

function Ensure-RolesConstants {
    $constantsPath = Join-Path $script:ProjectRoot "src\core\utils\Constants.ts"
    $rolesWereCreated = $false

    if (Test-Path -LiteralPath $constantsPath -PathType Leaf) {
        $content = Read-TextFile -Path $constantsPath
    }
    else {
        $content = ""
    }

    $hasRoles = [regex]::IsMatch($content, '(?s)\bexport\s+enum\s+Roles\s*\{.*?\}')
    $hasPriority = [regex]::IsMatch($content, '(?m)\bexport\s+const\s+ROLE_PRIORITY\b')

    if (-not $hasRoles -and $hasPriority) {
        throw "Constants.ts define ROLE_PRIORITY pero no exporta el enum Roles."
    }

    if (-not $hasRoles) {
        if (-not [string]::IsNullOrWhiteSpace($content) -and
            -not $content.EndsWith([Environment]::NewLine)) {
            $content += [Environment]::NewLine
        }

        $content += @'

export enum Roles {
    Visitante = "Visitante"
}
'@
        $rolesWereCreated = $true
    }

    if (-not $hasPriority) {
        if (-not $content.EndsWith([Environment]::NewLine)) {
            $content += [Environment]::NewLine
        }

        if ($rolesWereCreated) {
            $content += @'

export const ROLE_PRIORITY: readonly Roles[] = [
    Roles.Visitante
];
'@
        }
        else {
            $content += @'

export const ROLE_PRIORITY: readonly Roles[] = [];
'@
        }
    }

    if (-not $content.EndsWith([Environment]::NewLine)) {
        $content += [Environment]::NewLine
    }

    Write-TextFile -Path $constantsPath -Content $content
}

function Ensure-UserEntity {
    $userPath = Join-Path $script:ProjectRoot "src\core\entities\User.ts"
    Assert-FileExists -Path $userPath -Description "la entidad base de usuario"
    $content = Read-TextFile -Path $userPath

    $titleProperty = [regex]::Match(
        $content,
        '(?m)\b(?:public\s+)?Title\s*(?:\?|!)?\s*:\s*([^;]+);'
    )

    if ($titleProperty.Success) {
        $titleType = $titleProperty.Groups[1].Value.Trim()
        if ($titleType -notmatch '^string(?:\s*\|\s*(?:undefined|null))*$') {
            throw "User.Title existe con un tipo incompatible: '$titleType'."
        }

        return
    }

    $closingBrace = $content.LastIndexOf('}')
    if ($closingBrace -lt 0) {
        throw "No se pudo localizar el cierre de la clase User."
    }

    $lineBreak = if ($content.Contains("`r`n")) { "`r`n" } else { "`n" }
    $addition = "    public Title: string | undefined;$lineBreak"
    $updated = $content.Insert($closingBrace, $addition)
    Write-TextFile -Path $userPath -Content $updated
}

function Ensure-StringInterfaceProperty {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Content,

        [Parameter(Mandatory = $true)]
        [string]$PropertyName
    )

    $pattern = "(?m)^\s*${PropertyName}\s*(\?)?\s*:\s*([^;]+);"
    $propertyMatch = [regex]::Match($Content, $pattern)

    if ($propertyMatch.Success) {
        $type = $propertyMatch.Groups[2].Value.Trim()
        if ($type -cne "string") {
            throw "ISendEmailConfig.$PropertyName existe con el tipo incompatible '$type'."
        }

        if ($propertyMatch.Groups[1].Success) {
            $propertyRegex = [regex]::new($pattern)
            return $propertyRegex.Replace(
                $Content,
                "    ${PropertyName}: string;",
                1
            )
        }

        return $Content
    }

    $closingBrace = $Content.LastIndexOf('}')
    if ($closingBrace -lt 0) {
        throw "No se pudo localizar el cierre de ISendEmailConfig."
    }

    $lineBreak = if ($Content.Contains("`r`n")) { "`r`n" } else { "`n" }
    return $Content.Insert(
        $closingBrace,
        "    ${PropertyName}: string;$lineBreak"
    )
}

function Ensure-SendEmailConfig {
    $configPath = Join-Path $script:ProjectRoot "src\core\api\Email\ISendEmailConfig.ts"

    if (Test-Path -LiteralPath $configPath -PathType Leaf) {
        $content = Read-TextFile -Path $configPath
    }
    else {
        $content = @'
export interface ISendEmailConfig {
    url: string;
    key: string;
}
'@
    }

    $content = Ensure-StringInterfaceProperty -Content $content -PropertyName "url"
    $content = Ensure-StringInterfaceProperty -Content $content -PropertyName "key"

    if (-not $content.EndsWith([Environment]::NewLine)) {
        $content += [Environment]::NewLine
    }

    Write-TextFile -Path $configPath -Content $content
}

function Get-UserDataSourceTemplate {
    return @'
import type { SPFI } from "@pnp/sp";

import "@pnp/sp/site-users/web";

import User from "../../entities/User";
import { getSP } from "../../pnp/sp/pnpjs-presets";
import { Roles } from "../../utils/Constants";

interface ISharePointGroup {
    Title?: string;
}

export interface ICurrentUserData {
    currentUser: User;
    roles: Roles[];
}

export default class UserDataSource {
    private readonly _sp: SPFI;

    public constructor() {
        this._sp = getSP();
    }

    public async getCurrentUserData(): Promise<ICurrentUserData> {
        try {
            const [currentUserInfo, currentUserGroups] = await Promise.all([
                this._sp.web.currentUser(),
                this._sp.web.currentUser.groups()
            ]);

            const currentUser = new User();
            currentUser.ID = currentUserInfo.Id ?? 0;
            currentUser.Email = currentUserInfo.Email ?? "";
            currentUser.Title = currentUserInfo.Title ?? "";

            const availableRoles = Object.values(Roles) as Roles[];
            const groupNames = new Set<string>(
                (currentUserGroups as ISharePointGroup[]).map(
                    (group: ISharePointGroup): string =>
                        (group.Title ?? "").trim().toLowerCase()
                )
            );

            const roles = availableRoles.filter(
                (availableRole: Roles): boolean =>
                    groupNames.has(availableRole.trim().toLowerCase())
            );

            return {
                currentUser,
                roles
            };
        }
        catch (error: unknown) {
            console.error(
                "Error al obtener el usuario actual y sus roles:",
                error
            );
            throw error;
        }
    }
}
'@
}

function Get-UserContextTemplate {
    return @'
import * as React from "react";

import UserDataSource from "../api/User/UserDataSource";
import User from "../entities/User";
import { ROLE_PRIORITY, Roles } from "../utils/Constants";

export interface IUserContextValue {
    currentUser?: User;
    role?: Roles;
    roles: Roles[];
    loading: boolean;
    error: string;
    hasRole: (requiredRole: Roles) => boolean;
}

interface IUserProviderProps {
    children: React.ReactNode;
}

export const UserContext = React.createContext<IUserContextValue | undefined>(
    undefined
);

const getPrimaryRole = (roles: Roles[]): Roles | undefined =>
    ROLE_PRIORITY.find((configuredRole: Roles): boolean =>
        roles.includes(configuredRole)
    );

export const UserProvider: React.FC<IUserProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = React.useState<User>();
    const [roles, setRoles] = React.useState<Roles[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [error, setError] = React.useState<string>("");

    const userDataSource = React.useMemo(
        (): UserDataSource => new UserDataSource(),
        []
    );

    React.useEffect((): void => {
        void (async (): Promise<void> => {
            try {
                setLoading(true);
                setError("");

                const userData = await userDataSource.getCurrentUserData();
                setCurrentUser(userData.currentUser);
                setRoles(userData.roles);
            }
            catch (loadError: unknown) {
                console.error(
                    "Error al cargar el usuario y sus roles:",
                    loadError
                );
                setCurrentUser(undefined);
                setRoles([]);
                setError(
                    "No se pudo obtener el usuario actual y sus roles."
                );
            }
            finally {
                setLoading(false);
            }
        })();
    }, [userDataSource]);

    const role = React.useMemo(
        (): Roles | undefined => getPrimaryRole(roles),
        [roles]
    );

    const hasRole = React.useCallback(
        (requiredRole: Roles): boolean => roles.includes(requiredRole),
        [roles]
    );

    const value = React.useMemo(
        (): IUserContextValue => ({
            currentUser,
            role,
            roles,
            loading,
            error,
            hasRole
        }),
        [currentUser, role, roles, loading, error, hasRole]
    );

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

export const useUserContext = (): IUserContextValue => {
    const context = React.useContext(UserContext);

    if (!context) {
        throw new Error(
            "useUserContext debe utilizarse dentro de UserProvider"
        );
    }

    return context;
};
'@
}

function Ensure-UserInfrastructure {
    $dataSourcePath = Join-Path $script:ProjectRoot "src\core\api\User\UserDataSource.ts"
    $contextPath = Join-Path $script:ProjectRoot "src\core\context\UserContext.tsx"

    $writeDataSource = -not (Test-Path -LiteralPath $dataSourcePath -PathType Leaf)
    if (-not $writeDataSource) {
        $dataSourceContent = Read-TextFile -Path $dataSourcePath
        $writeDataSource =
            -not $dataSourceContent.Contains("getCurrentUserData") -or
            [regex]::IsMatch($dataSourceContent, '\bRoles\.[A-Za-z_]')

        if ($writeDataSource) {
            $script:Warnings.Add(
                "UserDataSource.ts era incompatible con roles configurables y fue reemplazado por la implementación estándar."
            )
        }
    }

    if ($writeDataSource) {
        Write-TextFile `
            -Path $dataSourcePath `
            -Content ((Get-UserDataSourceTemplate) + [Environment]::NewLine)
    }

    $writeContext = -not (Test-Path -LiteralPath $contextPath -PathType Leaf)
    if (-not $writeContext) {
        $contextContent = Read-TextFile -Path $contextPath
        $writeContext =
            -not $contextContent.Contains("export const UserProvider") -or
            -not $contextContent.Contains("export const useUserContext") -or
            -not $contextContent.Contains("ROLE_PRIORITY")

        if ($writeContext) {
            $script:Warnings.Add(
                "UserContext.tsx no exponía el contrato requerido y fue reemplazado por la implementación estándar."
            )
        }
    }

    if ($writeContext) {
        Write-TextFile `
            -Path $contextPath `
            -Content ((Get-UserContextTemplate) + [Environment]::NewLine)
    }
}

function Get-HomeComponentTemplate {
    return @'
import * as React from "react";

import "./Home.module.scss";

const Home: React.FC = () => {
    return (
        <div>
            Hello World!
        </div>
    );
};

export default Home;
'@
}

function Get-MainPropsTemplate {
    param(
        [Parameter(Mandatory = $true)]
        [string]$PascalWebPartName
    )

    $template = @'
import type { WebPartContext } from "@microsoft/sp-webpart-base";

import type { ISendEmailConfig } from "../../../core/api/Email/ISendEmailConfig";

export interface I{{WEBPART_NAME}}Props {
    context: WebPartContext;
    sendEmailObj: ISendEmailConfig;
}
'@

    return $template.Replace("{{WEBPART_NAME}}", $PascalWebPartName)
}

function Get-MainComponentTemplate {
    param(
        [Parameter(Mandatory = $true)]
        [string]$PascalWebPartName
    )

    $template = @'
import * as React from "react";
import {
    HashRouter as Router,
    Navigate,
    Route,
    Routes
} from "react-router-dom";

import Home from "./Home/Home";
import type { I{{WEBPART_NAME}}Props } from "./I{{WEBPART_NAME}}Props";
import "./{{WEBPART_NAME}}.module.scss";

const {{WEBPART_NAME}}: React.FC<I{{WEBPART_NAME}}Props> = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
};

export default {{WEBPART_NAME}};
'@

    return $template.Replace("{{WEBPART_NAME}}", $PascalWebPartName)
}

function Get-LegacyWebPartTemplate {
    param(
        [Parameter(Mandatory = $true)]
        [string]$PascalWebPartName
    )

    $template = @'
import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import { PropertyPaneTextField } from "@microsoft/sp-property-pane";
import type { IPropertyPaneConfiguration } from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";

import * as strings from "{{WEBPART_NAME}}WebPartStrings";
import {{WEBPART_NAME}} from "./components/{{WEBPART_NAME}}";
import type { I{{WEBPART_NAME}}Props } from "./components/I{{WEBPART_NAME}}Props";
import type { ISendEmailConfig } from "../../core/api/Email/ISendEmailConfig";
import { getSP } from "../../core/pnp/sp/pnpjs-presets";
import { UserProvider } from "../../core/context/UserContext";
import "../../core/ui/scss/global.module.scss";

require("../../core/ui/css/fix.css");
require("../../core/ui/css/formatWorkbench.css");

export interface I{{WEBPART_NAME}}WebPartProps {
    sendEmailObj: ISendEmailConfig;
}

export default class {{WEBPART_NAME}}WebPart extends BaseClientSideWebPart<I{{WEBPART_NAME}}WebPartProps> {
    protected async onInit(): Promise<void> {
        await super.onInit();

        getSP(this.context);

        if (!this.properties.sendEmailObj) {
            this.properties.sendEmailObj = {
                url: "",
                key: ""
            };
        }

    }

    public render(): void {
        const application: React.ReactElement<I{{WEBPART_NAME}}Props> = React.createElement(
            {{WEBPART_NAME}},
            {
                context: this.context,
                sendEmailObj: this.properties.sendEmailObj
            }
        );
        const element: React.ReactElement = React.createElement(
            UserProvider,
            null,
            application
        );

        ReactDom.render(element, this.domElement);
    }

    protected onDispose(): void {
        ReactDom.unmountComponentAtNode(this.domElement);
    }

    protected get dataVersion(): Version {
        return Version.parse("1.0");
    }

    protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
        return {
            pages: [
                {
                    header: {
                        description: strings.PropertyPaneDescription
                    },
                    groups: [
                        {
                            groupName: strings.BasicGroupName,
                            groupFields: [
                                PropertyPaneTextField("sendEmailObj.url", {
                                    label: strings.SendEmailURL
                                }),
                                PropertyPaneTextField("sendEmailObj.key", {
                                    label: strings.SendEmailKey
                                })
                            ]
                        }
                    ]
                }
            ]
        };
    }
}
'@

    return $template.Replace("{{WEBPART_NAME}}", $PascalWebPartName)
}

function Get-ModernWebPartTemplate {
    param(
        [Parameter(Mandatory = $true)]
        [string]$PascalWebPartName
    )

    $template = @'
import * as React from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { Version } from "@microsoft/sp-core-library";
import { PropertyPaneTextField } from "@microsoft/sp-property-pane";
import type { IPropertyPaneConfiguration } from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";

import * as strings from "{{WEBPART_NAME}}WebPartStrings";
import {{WEBPART_NAME}} from "./components/{{WEBPART_NAME}}";
import type { I{{WEBPART_NAME}}Props } from "./components/I{{WEBPART_NAME}}Props";
import type { ISendEmailConfig } from "../../core/api/Email/ISendEmailConfig";
import { getSP } from "../../core/pnp/sp/pnpjs-presets";
import { UserProvider } from "../../core/context/UserContext";
import "../../core/ui/scss/global.module.scss";

require("../../core/ui/css/fix.css");
require("../../core/ui/css/formatWorkbench.css");

export interface I{{WEBPART_NAME}}WebPartProps {
    sendEmailObj: ISendEmailConfig;
}

export default class {{WEBPART_NAME}}WebPart extends BaseClientSideWebPart<I{{WEBPART_NAME}}WebPartProps> {
    private _root?: Root;

    protected async onInit(): Promise<void> {
        await super.onInit();

        getSP(this.context);

        if (!this.properties.sendEmailObj) {
            this.properties.sendEmailObj = {
                url: "",
                key: ""
            };
        }

    }

    public render(): void {
        const application: React.ReactElement<I{{WEBPART_NAME}}Props> = React.createElement(
            {{WEBPART_NAME}},
            {
                context: this.context,
                sendEmailObj: this.properties.sendEmailObj
            }
        );
        const element: React.ReactElement = React.createElement(
            UserProvider,
            null,
            application
        );

        if (!this._root) {
            this._root = createRoot(this.domElement);
        }

        this._root.render(element);
    }

    protected onDispose(): void {
        this._root?.unmount();
        this._root = undefined;
    }

    protected get dataVersion(): Version {
        return Version.parse("1.0");
    }

    protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
        return {
            pages: [
                {
                    header: {
                        description: strings.PropertyPaneDescription
                    },
                    groups: [
                        {
                            groupName: strings.BasicGroupName,
                            groupFields: [
                                PropertyPaneTextField("sendEmailObj.url", {
                                    label: strings.SendEmailURL
                                }),
                                PropertyPaneTextField("sendEmailObj.key", {
                                    label: strings.SendEmailKey
                                })
                            ]
                        }
                    ]
                }
            ]
        };
    }
}
'@

    return $template.Replace("{{WEBPART_NAME}}", $PascalWebPartName)
}

function Get-LocalizationTypesTemplate {
    param(
        [Parameter(Mandatory = $true)]
        [string]$PascalWebPartName
    )

    $template = @'
declare interface I{{WEBPART_NAME}}WebPartStrings {
    PropertyPaneDescription: string;
    BasicGroupName: string;
    SendEmailURL: string;
    SendEmailKey: string;
}

declare module "{{WEBPART_NAME}}WebPartStrings" {
    const strings: I{{WEBPART_NAME}}WebPartStrings;
    export = strings;
}
'@

    return $template.Replace("{{WEBPART_NAME}}", $PascalWebPartName)
}

function Get-LocalizationValuesTemplate {
    param(
        [Parameter(Mandatory = $true)]
        [string]$PascalWebPartName
    )

    $template = @'
define([], function() {
    return {
        "PropertyPaneDescription": "Sitio {{WEBPART_NAME}}",
        "BasicGroupName": "Configuración",
        "SendEmailURL": "URL sendEmail",
        "SendEmailKey": "API KEY sendEmail"
    };
});
'@

    return $template.Replace("{{WEBPART_NAME}}", $PascalWebPartName)
}

function Update-WebPartManifest {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ManifestPath,

        [Parameter(Mandatory = $true)]
        [string]$PascalWebPartName,

        [Parameter(Mandatory = $true)]
        [string]$SolutionGuid
    )

    $manifest = Read-JsonFile -Path $ManifestPath
    $webPartGuidText = [string](Get-RequiredProperty `
        -Object $manifest `
        -PropertyName "id" `
        -Context $ManifestPath)

    $parsedGuid = [guid]::Empty
    if (-not [guid]::TryParse($webPartGuidText, [ref]$parsedGuid)) {
        throw "El generador creó un GUID de webpart inválido: '$webPartGuidText'."
    }

    $webPartGuid = $parsedGuid.ToString("D").ToLowerInvariant()
    if ($webPartGuid -ceq $SolutionGuid) {
        throw "El GUID de la webpart coincide con el GUID de la solución. Deben ser diferentes."
    }

    Set-ObjectProperty -Object $manifest -PropertyName "id" -Value $webPartGuid
    Set-ObjectProperty `
        -Object $manifest `
        -PropertyName "alias" `
        -Value "${PascalWebPartName}WebPart"

    $entries = @((Get-RequiredProperty `
        -Object $manifest `
        -PropertyName "preconfiguredEntries" `
        -Context $ManifestPath))

    if ($entries.Count -ne 1) {
        throw "El manifiesto debe contener exactamente una entrada preconfigurada."
    }

    $entry = $entries[0]
    $title = Get-RequiredProperty -Object $entry -PropertyName "title" -Context $ManifestPath
    $description = Get-RequiredProperty -Object $entry -PropertyName "description" -Context $ManifestPath
    Set-ObjectProperty -Object $title -PropertyName "default" -Value $PascalWebPartName
    Set-ObjectProperty `
        -Object $description `
        -PropertyName "default" `
        -Value "Sitio $PascalWebPartName"
    Set-ObjectProperty -Object $entry -PropertyName "properties" -Value ([PSCustomObject]@{
        sendEmailObj = [PSCustomObject]@{
            url = ""
            key = ""
        }
    })

    Write-JsonFile -Path $ManifestPath -Value $manifest
    return $webPartGuid
}

function Update-LocalizedResourceKey {
    param(
        [Parameter(Mandatory = $true)]
        [string]$WebPartFolderName,

        [Parameter(Mandatory = $true)]
        [string]$ExpectedKey
    )

    $configPath = Join-Path $script:ProjectRoot "config\config.json"
    Assert-FileExists -Path $configPath -Description "la configuración config/config.json"

    $config = Read-JsonFile -Path $configPath
    $section = Get-RequiredProperty `
        -Object $config `
        -PropertyName "localizedResources" `
        -Context $configPath

    $pattern = "(?i)^lib[\\/]webparts[\\/]$([regex]::Escape($WebPartFolderName))[\\/]loc[\\/]"
    $entries = @($section.PSObject.Properties | Where-Object {
        [string]$_.Value -match $pattern
    })

    if ($entries.Count -ne 1) {
        throw "config/config.json no declara de forma inequívoca los strings de 'src/webparts/$WebPartFolderName'."
    }

    $entry = $entries[0]
    if ($entry.Name -ceq $ExpectedKey) {
        return
    }

    $value = $entry.Value
    $section.PSObject.Properties.Remove($entry.Name)
    Set-ObjectProperty -Object $section -PropertyName $ExpectedKey -Value $value
    Write-JsonFile -Path $configPath -Value $config
}

function Apply-StandardScaffolding {
    param(
        [Parameter(Mandatory = $true)]
        [string]$WebPartDirectory,

        [Parameter(Mandatory = $true)]
        [string]$PascalWebPartName,

        [Parameter(Mandatory = $true)]
        [string]$SolutionGuid
    )

    $webPartClassName = "${PascalWebPartName}WebPart"
    $webPartFile = Join-Path $WebPartDirectory "${webPartClassName}.ts"
    $manifestPath = Join-Path $WebPartDirectory "${webPartClassName}.manifest.json"
    Assert-FileExists -Path $webPartFile -Description "el archivo principal generado de la webpart"
    Assert-FileExists -Path $manifestPath -Description "el manifiesto generado de la webpart"

    $generatedWebPartContent = Read-TextFile -Path $webPartFile
    $usesModernReactDom =
        $generatedWebPartContent.Contains("react-dom/client") -or
        $generatedWebPartContent.Contains("createRoot")

    $componentsDirectory = Join-Path $WebPartDirectory "components"
    if (Test-Path -LiteralPath $componentsDirectory -PathType Container) {
        Remove-Item -LiteralPath $componentsDirectory -Recurse -Force
    }
    New-Item -ItemType Directory -Path $componentsDirectory -Force | Out-Null

    $homeDirectory = Join-Path $componentsDirectory "Home"
    New-Item -ItemType Directory -Path $homeDirectory -Force | Out-Null

    Write-TextFile `
        -Path (Join-Path $homeDirectory "Home.tsx") `
        -Content ((Get-HomeComponentTemplate) + [Environment]::NewLine)
    Write-TextFile `
        -Path (Join-Path $homeDirectory "Home.module.scss") `
        -Content ""
    Write-TextFile `
        -Path (Join-Path $componentsDirectory "I${PascalWebPartName}Props.ts") `
        -Content ((Get-MainPropsTemplate -PascalWebPartName $PascalWebPartName) + [Environment]::NewLine)
    Write-TextFile `
        -Path (Join-Path $componentsDirectory "${PascalWebPartName}.tsx") `
        -Content ((Get-MainComponentTemplate -PascalWebPartName $PascalWebPartName) + [Environment]::NewLine)
    Write-TextFile `
        -Path (Join-Path $componentsDirectory "${PascalWebPartName}.module.scss") `
        -Content ""

    if ($usesModernReactDom) {
        $webPartContent = Get-ModernWebPartTemplate -PascalWebPartName $PascalWebPartName
    }
    else {
        $webPartContent = Get-LegacyWebPartTemplate -PascalWebPartName $PascalWebPartName
    }
    Write-TextFile `
        -Path $webPartFile `
        -Content ($webPartContent + [Environment]::NewLine)

    $locDirectory = Join-Path $WebPartDirectory "loc"
    if (-not (Test-Path -LiteralPath $locDirectory -PathType Container)) {
        New-Item -ItemType Directory -Path $locDirectory -Force | Out-Null
    }

    Write-TextFile `
        -Path (Join-Path $locDirectory "mystrings.d.ts") `
        -Content ((Get-LocalizationTypesTemplate -PascalWebPartName $PascalWebPartName) + [Environment]::NewLine)

    $languageFiles = @(Get-ChildItem -LiteralPath $locDirectory -Filter "*.js" -File)
    if ($languageFiles.Count -eq 0) {
        $languageFiles = @([PSCustomObject]@{
            FullName = Join-Path $locDirectory "en-us.js"
        })
    }

    $localizationContent =
        (Get-LocalizationValuesTemplate -PascalWebPartName $PascalWebPartName) +
        [Environment]::NewLine
    foreach ($languageFile in $languageFiles) {
        Write-TextFile -Path $languageFile.FullName -Content $localizationContent
    }

    # El generador registra el módulo de strings con su propio casing. El
    # scaffolding declara e importa '${webPartClassName}Strings', así que la
    # clave de localizedResources debe alinearse o webpack no lo resuelve.
    Update-LocalizedResourceKey `
        -WebPartFolderName (Split-Path -Leaf $WebPartDirectory) `
        -ExpectedKey "${webPartClassName}Strings"

    return Update-WebPartManifest `
        -ManifestPath $manifestPath `
        -PascalWebPartName $PascalWebPartName `
        -SolutionGuid $SolutionGuid
}

function Copy-ManagedStyles {
    $skillRoot = Get-FullPath -Path (Join-Path $PSScriptRoot "..")
    $managedFiles = @(
        [PSCustomObject]@{
            Source = Join-Path $skillRoot "assets\css\fix.css"
            Target = Join-Path $script:ProjectRoot "src\core\ui\css\fix.css"
        },
        [PSCustomObject]@{
            Source = Join-Path $skillRoot "assets\css\formatWorkbench.css"
            Target = Join-Path $script:ProjectRoot "src\core\ui\css\formatWorkbench.css"
        },
        [PSCustomObject]@{
            Source = Join-Path $skillRoot "assets\scss\global.module.scss"
            Target = Join-Path $script:ProjectRoot "src\core\ui\scss\global.module.scss"
        }
    )

    foreach ($managedFile in $managedFiles) {
        Assert-FileExists -Path $managedFile.Source -Description "el asset administrado"
        Write-TextFile `
            -Path $managedFile.Target `
            -Content (Read-TextFile -Path $managedFile.Source)
    }
}

function New-ManifestsLaunchConfigurationText {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ConfigurationName,

        [Parameter(Mandatory = $true)]
        [string]$DebugUrl
    )

    return @"
    {
      "name": "$ConfigurationName",
      "type": "msedge",
      "request": "launch",
      "url": "$DebugUrl",
      "webRoot": "`${workspaceRoot}",
      "sourceMaps": true,
      "sourceMapPathOverrides": {
        "webpack:///.././src/*": "`${webRoot}/src/*",
        "webpack:///../../../src/*": "`${webRoot}/src/*",
        "webpack:///../../../../src/*": "`${webRoot}/src/*",
        "webpack:///../../../../../src/*": "`${webRoot}/src/*"
      },
      "runtimeArgs": [
        "--remote-debugging-port=9222"
      ],
      "preLaunchTask": "start-server"
    }
"@
}

function Get-LaunchConfigurationByName {
    param(
        [Parameter(Mandatory = $true)]
        [object]$Launch,

        [Parameter(Mandatory = $true)]
        [string]$ConfigurationName
    )

    $configurationsProperty = $Launch.PSObject.Properties["configurations"]
    if ($null -eq $configurationsProperty -or $null -eq $configurationsProperty.Value) {
        throw ".vscode/launch.json no declara 'configurations'."
    }

    return @(@($configurationsProperty.Value) | Where-Object {
        $nameProperty = $_.PSObject.Properties["name"]
        ($null -ne $nameProperty) -and ([string]$nameProperty.Value -ceq $ConfigurationName)
    })
}

function Add-ManifestsLaunchConfiguration {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ConfigurationName,

        [Parameter(Mandatory = $true)]
        [string]$DebugUrl
    )

    $launchPath = Join-Path $script:ProjectRoot ".vscode\launch.json"
    Assert-FileExists -Path $launchPath -Description "la configuración de depuración .vscode/launch.json"

    $launch = Read-JsonFile -Path $launchPath
    $existing = @(Get-LaunchConfigurationByName `
        -Launch $launch `
        -ConfigurationName $ConfigurationName)
    if ($existing.Count -gt 0) {
        throw ".vscode/launch.json ya declara una configuración llamada '$ConfigurationName'."
    }

    # Se inserta el bloque como texto para no reescribir ni reformatear las
    # configuraciones existentes del archivo.
    $content = Read-TextFile -Path $launchPath
    $arrayMatch = [regex]::Match($content, '"configurations"\s*:\s*\[')
    if (-not $arrayMatch.Success) {
        throw "No fue posible localizar el arreglo 'configurations' en .vscode/launch.json."
    }

    $lineBreak = if ($content.Contains("`r`n")) { "`r`n" } else { "`n" }
    $block = (New-ManifestsLaunchConfigurationText `
        -ConfigurationName $ConfigurationName `
        -DebugUrl $DebugUrl).Replace("`r`n", "`n").Replace("`n", $lineBreak)

    $hasConfigurations = @($launch.configurations).Count -gt 0
    $separator = if ($hasConfigurations) { "," } else { "" }
    $insertIndex = $arrayMatch.Index + $arrayMatch.Length
    $updated = $content.Insert($insertIndex, $lineBreak + $block + $separator)

    Write-TextFile -Path $launchPath -Content $updated
}

function Assert-WebPartDoesNotExist {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ExpectedDirectory,

        [Parameter(Mandatory = $true)]
        [string]$ExpectedAlias
    )

    if (Test-Path -LiteralPath $ExpectedDirectory) {
        throw "Ya existe la ruta de webpart '$ExpectedDirectory'."
    }

    $webpartsRoot = Join-Path $script:ProjectRoot "src\webparts"
    if (-not (Test-Path -LiteralPath $webpartsRoot -PathType Container)) {
        return
    }

    foreach ($manifestPath in (Get-ChildItem -LiteralPath $webpartsRoot -Recurse -Filter "*WebPart.manifest.json" -File)) {
        try {
            $manifest = Read-JsonFile -Path $manifestPath.FullName
            $aliasProperty = $manifest.PSObject.Properties["alias"]
            if ($null -ne $aliasProperty -and
                ([string]$aliasProperty.Value).Equals(
                    $ExpectedAlias,
                    [System.StringComparison]::OrdinalIgnoreCase
                )) {
                throw "Ya existe una webpart con alias '$ExpectedAlias' en '$($manifestPath.FullName)'."
            }
        }
        catch {
            if ($_.Exception.Message.StartsWith("Ya existe una webpart")) {
                throw
            }
        }
    }
}

function Assert-OccurrenceCount {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Content,

        [Parameter(Mandatory = $true)]
        [string]$Value,

        [Parameter(Mandatory = $true)]
        [int]$ExpectedCount,

        [Parameter(Mandatory = $true)]
        [string]$Context
    )

    $count = [regex]::Matches($Content, [regex]::Escape($Value)).Count
    if ($count -ne $ExpectedCount) {
        throw "Se esperaban $ExpectedCount apariciones de '$Value' en $Context y se encontraron $count."
    }
}

function Assert-FinalInvariants {
    param(
        [Parameter(Mandatory = $true)]
        [string]$OldSolutionName,

        [Parameter(Mandatory = $true)]
        [string]$OldSolutionGuid,

        [Parameter(Mandatory = $true)]
        [string]$WebPartDirectory,

        [Parameter(Mandatory = $true)]
        [string]$PascalWebPartName,

        [Parameter(Mandatory = $true)]
        [string]$NewSolutionGuid,

        [Parameter(Mandatory = $true)]
        [string]$LaunchConfigurationName,

        [Parameter(Mandatory = $true)]
        [string]$DebugUrl
    )

    $remainingOldNames = @(Get-FilesContainingValue -Value $OldSolutionName -IgnoreCase)
    if ($remainingOldNames.Count -gt 0) {
        throw "El nombre anterior aún aparece en: $($remainingOldNames -join ', ')."
    }

    $remainingOldGuids = @(Get-FilesContainingValue -Value $OldSolutionGuid -IgnoreCase)
    if ($remainingOldGuids.Count -gt 0) {
        throw "El GUID anterior aún aparece en: $($remainingOldGuids -join ', ')."
    }

    foreach ($sampleName in @("helloWorld", "template")) {
        $samplePath = Join-Path $script:ProjectRoot "src\webparts\$sampleName"
        if (Test-Path -LiteralPath $samplePath) {
            throw "La webpart de ejemplo '$samplePath' no fue eliminada."
        }
    }

    $webPartFile = Join-Path $WebPartDirectory "${PascalWebPartName}WebPart.ts"
    $mainComponentFile = Join-Path $WebPartDirectory "components\${PascalWebPartName}.tsx"
    $mainPropsFile = Join-Path $WebPartDirectory "components\I${PascalWebPartName}Props.ts"
    $mainStyleFile = Join-Path $WebPartDirectory "components\${PascalWebPartName}.module.scss"
    $homeFile = Join-Path $WebPartDirectory "components\Home\Home.tsx"
    $homeStyleFile = Join-Path $WebPartDirectory "components\Home\Home.module.scss"
    $manifestFile = Join-Path $WebPartDirectory "${PascalWebPartName}WebPart.manifest.json"
    $localizationTypesFile = Join-Path $WebPartDirectory "loc\mystrings.d.ts"

    foreach ($requiredFile in @(
        $webPartFile,
        $mainComponentFile,
        $mainPropsFile,
        $mainStyleFile,
        $homeFile,
        $homeStyleFile,
        $manifestFile,
        $localizationTypesFile
    )) {
        Assert-FileExists -Path $requiredFile -Description "un archivo final requerido"
    }

    if ((Read-TextFile -Path $mainStyleFile).Length -ne 0 -or
        (Read-TextFile -Path $homeStyleFile).Length -ne 0) {
        throw "Los estilos iniciales de la webpart y Home deben quedar vacíos."
    }

    $webPartContent = Read-TextFile -Path $webPartFile
    Assert-OccurrenceCount `
        -Content $webPartContent `
        -Value 'require("../../core/ui/css/fix.css");' `
        -ExpectedCount 1 `
        -Context $webPartFile
    Assert-OccurrenceCount `
        -Content $webPartContent `
        -Value 'require("../../core/ui/css/formatWorkbench.css");' `
        -ExpectedCount 1 `
        -Context $webPartFile
    Assert-OccurrenceCount `
        -Content $webPartContent `
        -Value 'import "../../core/ui/scss/global.module.scss";' `
        -ExpectedCount 1 `
        -Context $webPartFile

    foreach ($requiredWebPartFragment in @(
        "getSP(this.context);",
        "UserProvider",
        "context: this.context",
        "sendEmailObj: this.properties.sendEmailObj",
        'PropertyPaneTextField("sendEmailObj.url"',
        'PropertyPaneTextField("sendEmailObj.key"'
    )) {
        if (-not $webPartContent.Contains($requiredWebPartFragment)) {
            throw "Falta '$requiredWebPartFragment' en el archivo principal de la webpart."
        }
    }

    $mainContent = Read-TextFile -Path $mainComponentFile
    if (-not $mainContent.Contains('path="/"') -or
        -not $mainContent.Contains('path="*"') -or
        -not $mainContent.Contains('<Navigate to="/" replace />')) {
        throw "El componente principal no contiene la navegación base acordada."
    }
    if ($mainContent.Contains("ProtectedRoute")) {
        throw "El setup inicial no debe incorporar ProtectedRoute."
    }

    $mainPropsContent = Read-TextFile -Path $mainPropsFile
    if (-not $mainPropsContent.Contains("context: WebPartContext;") -or
        -not $mainPropsContent.Contains("sendEmailObj: ISendEmailConfig;")) {
        throw "La interfaz del componente principal no contiene context y sendEmailObj."
    }

    $homeContent = Read-TextFile -Path $homeFile
    if (-not $homeContent.Contains('import "./Home.module.scss";') -or
        -not $homeContent.Contains("Hello World!")) {
        throw "Home.tsx no contiene el import de estilos y el contenido inicial acordado."
    }
    if ($homeContent.Contains("WebPartContext") -or
        $homeContent.Contains("sendEmailObj")) {
        throw "Home.tsx no debe recibir context ni sendEmailObj."
    }

    $manifest = Read-JsonFile -Path $manifestFile
    $manifestGuid = [string](Get-RequiredProperty -Object $manifest -PropertyName "id" -Context $manifestFile)
    if ($manifestGuid -ceq $NewSolutionGuid) {
        throw "El GUID final de la webpart coincide con el GUID de solución."
    }
    if ($manifestGuid -cnotmatch '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') {
        throw "El GUID final de la webpart no está normalizado en minúsculas."
    }

    $manifestAlias = [string](Get-RequiredProperty -Object $manifest -PropertyName "alias" -Context $manifestFile)
    if ($manifestAlias -cne "${PascalWebPartName}WebPart") {
        throw "El alias final de la webpart no coincide con '${PascalWebPartName}WebPart'."
    }

    $entries = @((Get-RequiredProperty `
        -Object $manifest `
        -PropertyName "preconfiguredEntries" `
        -Context $manifestFile))
    if ($entries.Count -ne 1) {
        throw "El manifiesto final debe contener una única entrada preconfigurada."
    }

    $entry = $entries[0]
    $title = Get-RequiredProperty -Object $entry -PropertyName "title" -Context $manifestFile
    $description = Get-RequiredProperty -Object $entry -PropertyName "description" -Context $manifestFile
    if ([string](Get-RequiredProperty -Object $title -PropertyName "default" -Context $manifestFile) -cne $PascalWebPartName) {
        throw "El título predeterminado del manifiesto no coincide con '$PascalWebPartName'."
    }
    if ([string](Get-RequiredProperty -Object $description -PropertyName "default" -Context $manifestFile) -cne "Sitio $PascalWebPartName") {
        throw "La descripción predeterminada del manifiesto no coincide con 'Sitio $PascalWebPartName'."
    }

    $properties = Get-RequiredProperty -Object $entry -PropertyName "properties" -Context $manifestFile
    $sendEmailObj = Get-RequiredProperty -Object $properties -PropertyName "sendEmailObj" -Context $manifestFile
    if ([string](Get-RequiredProperty -Object $sendEmailObj -PropertyName "url" -Context $manifestFile) -cne "" -or
        [string](Get-RequiredProperty -Object $sendEmailObj -PropertyName "key" -Context $manifestFile) -cne "") {
        throw "Las propiedades iniciales de sendEmailObj deben quedar vacías."
    }

    $localizationTypes = Read-TextFile -Path $localizationTypesFile
    foreach ($localizationKey in @(
        "PropertyPaneDescription",
        "BasicGroupName",
        "SendEmailURL",
        "SendEmailKey"
    )) {
        if (-not $localizationTypes.Contains("${localizationKey}: string;")) {
            throw "Falta la clave '$localizationKey' en mystrings.d.ts."
        }
    }

    foreach ($languageFile in (Get-ChildItem -LiteralPath (Join-Path $WebPartDirectory "loc") -Filter "*.js" -File)) {
        $languageContent = Read-TextFile -Path $languageFile.FullName
        foreach ($expectedText in @(
            "Sitio $PascalWebPartName",
            "Configuración",
            "URL sendEmail",
            "API KEY sendEmail"
        )) {
            if (-not $languageContent.Contains($expectedText)) {
                throw "Falta '$expectedText' en '$($languageFile.FullName)'."
            }
        }
    }

    $constantsPath = Join-Path $script:ProjectRoot "src\core\utils\Constants.ts"
    $sendEmailConfigPath = Join-Path $script:ProjectRoot "src\core\api\Email\ISendEmailConfig.ts"
    $userDataSourcePath = Join-Path $script:ProjectRoot "src\core\api\User\UserDataSource.ts"
    $userContextPath = Join-Path $script:ProjectRoot "src\core\context\UserContext.tsx"
    foreach ($coreFile in @(
        $constantsPath,
        $sendEmailConfigPath,
        $userDataSourcePath,
        $userContextPath
    )) {
        Assert-FileExists -Path $coreFile -Description "un archivo core requerido"
    }

    $constantsContent = Read-TextFile -Path $constantsPath
    if (-not [regex]::IsMatch($constantsContent, '(?s)\bexport\s+enum\s+Roles\s*\{.*?\}') -or
        -not $constantsContent.Contains("export const ROLE_PRIORITY")) {
        throw "Constants.ts debe exportar Roles y ROLE_PRIORITY."
    }

    $sendEmailConfigContent = Read-TextFile -Path $sendEmailConfigPath
    foreach ($sendEmailProperty in @("url", "key")) {
        if (-not [regex]::IsMatch(
            $sendEmailConfigContent,
            "(?m)^\s*${sendEmailProperty}\s*:\s*string\s*;"
        )) {
            throw "ISendEmailConfig no contiene la propiedad obligatoria '${sendEmailProperty}: string'."
        }
    }

    $skillRoot = Get-FullPath -Path (Join-Path $PSScriptRoot "..")
    $managedStylePairs = @(
        [PSCustomObject]@{
            Source = Join-Path $skillRoot "assets\css\fix.css"
            Target = Join-Path $script:ProjectRoot "src\core\ui\css\fix.css"
        },
        [PSCustomObject]@{
            Source = Join-Path $skillRoot "assets\css\formatWorkbench.css"
            Target = Join-Path $script:ProjectRoot "src\core\ui\css\formatWorkbench.css"
        },
        [PSCustomObject]@{
            Source = Join-Path $skillRoot "assets\scss\global.module.scss"
            Target = Join-Path $script:ProjectRoot "src\core\ui\scss\global.module.scss"
        }
    )
    foreach ($stylePair in $managedStylePairs) {
        Assert-FileExists -Path $stylePair.Target -Description "un estilo administrado"
        if ((Read-TextFile -Path $stylePair.Source) -cne
            (Read-TextFile -Path $stylePair.Target)) {
            throw "El estilo administrado '$(Get-RelativeProjectPath -Path $stylePair.Target)' no coincide con el asset de la skill."
        }
    }

    $launchPath = Join-Path $script:ProjectRoot ".vscode\launch.json"
    Assert-FileExists -Path $launchPath -Description "la configuración de depuración .vscode/launch.json"
    $launchConfigurations = @(Get-LaunchConfigurationByName `
        -Launch (Read-JsonFile -Path $launchPath) `
        -ConfigurationName $LaunchConfigurationName)

    if ($launchConfigurations.Count -ne 1) {
        throw ".vscode/launch.json debe declarar exactamente una configuración '$LaunchConfigurationName'."
    }

    $launchConfiguration = $launchConfigurations[0]
    foreach ($expectedValue in @(
        [PSCustomObject]@{ Property = "type"; Value = "msedge" },
        [PSCustomObject]@{ Property = "request"; Value = "launch" },
        [PSCustomObject]@{ Property = "url"; Value = $DebugUrl },
        [PSCustomObject]@{ Property = "webRoot"; Value = '${workspaceRoot}' },
        [PSCustomObject]@{ Property = "preLaunchTask"; Value = "start-server" }
    )) {
        $actualValue = [string](Get-RequiredProperty `
            -Object $launchConfiguration `
            -PropertyName $expectedValue.Property `
            -Context "$launchPath -> $LaunchConfigurationName")
        if ($actualValue -cne $expectedValue.Value) {
            throw "La configuración '$LaunchConfigurationName' no quedó con $($expectedValue.Property) = '$($expectedValue.Value)'."
        }
    }

    if (-not [bool](Get-RequiredProperty `
        -Object $launchConfiguration `
        -PropertyName "sourceMaps" `
        -Context "$launchPath -> $LaunchConfigurationName")) {
        throw "La configuración '$LaunchConfigurationName' debe habilitar sourceMaps."
    }

    $runtimeArguments = @(Get-RequiredProperty `
        -Object $launchConfiguration `
        -PropertyName "runtimeArgs" `
        -Context "$launchPath -> $LaunchConfigurationName")
    if (-not ($runtimeArguments -ccontains "--remote-debugging-port=9222")) {
        throw "La configuración '$LaunchConfigurationName' no declara el puerto de depuración remoto."
    }

    $sourceMapOverrides = Get-RequiredProperty `
        -Object $launchConfiguration `
        -PropertyName "sourceMapPathOverrides" `
        -Context "$launchPath -> $LaunchConfigurationName"
    foreach ($overrideKey in @(
        "webpack:///.././src/*",
        "webpack:///../../../src/*",
        "webpack:///../../../../src/*",
        "webpack:///../../../../../src/*"
    )) {
        $overrideProperty = $sourceMapOverrides.PSObject.Properties[$overrideKey]
        if ($null -eq $overrideProperty -or
            ([string]$overrideProperty.Value -cne '${webRoot}/src/*')) {
            throw "Falta el mapeo de sourceMapPathOverrides '$overrideKey' en '$LaunchConfigurationName'."
        }
    }
}

function Write-SuccessReport {
    param(
        [Parameter(Mandatory = $true)]
        [string]$OldSolutionName,

        [Parameter(Mandatory = $true)]
        [string]$RequestedSolutionName,

        [Parameter(Mandatory = $true)]
        [string]$NormalizedSolutionName,

        [Parameter(Mandatory = $true)]
        [string]$NewLowerName,

        [Parameter(Mandatory = $true)]
        [string]$NewUpperName,

        [Parameter(Mandatory = $true)]
        [string]$RequestedWebPartName,

        [Parameter(Mandatory = $true)]
        [string]$PascalWebPartName,

        [Parameter(Mandatory = $true)]
        [string]$WebPartFolderName,

        [Parameter(Mandatory = $true)]
        [string]$OldSolutionGuid,

        [Parameter(Mandatory = $true)]
        [string]$NewSolutionGuid,

        [Parameter(Mandatory = $true)]
        [string]$WebPartGuid,

        [Parameter(Mandatory = $true)]
        [int]$NameReplacementCount,

        [Parameter(Mandatory = $true)]
        [int]$GuidReplacementCount,

        [Parameter(Mandatory = $true)]
        [string]$RouterVersion,

        [Parameter(Mandatory = $true)]
        [string]$RequestedSiteUrl,

        [Parameter(Mandatory = $true)]
        [string]$SiteBaseUrl,

        [Parameter(Mandatory = $true)]
        [string]$SiteEnvironmentName,

        [Parameter(Mandatory = $true)]
        [string]$LaunchConfigurationName,

        [Parameter(Mandatory = $true)]
        [string]$DebugUrl,

        [Parameter(Mandatory = $true)]
        [object]$Changes
    )

    Write-Host "`nSetup del template finalizado sin errores." -ForegroundColor Green
    Write-Host ""
    Write-Host "Nombre anterior: $OldSolutionName"
    Write-Host "Nombre solicitado: $RequestedSolutionName"
    Write-Host "Nombre normalizado: $NormalizedSolutionName"
    Write-Host "Nombre aplicado en minúsculas: $NewLowerName"
    Write-Host "Nombre aplicado en mayúsculas: $NewUpperName"
    Write-Host ""
    Write-Host "Webpart solicitada: $RequestedWebPartName"
    Write-Host "Nombre base de webpart aplicado: $PascalWebPartName"
    Write-Host "Clase de webpart: ${PascalWebPartName}WebPart"
    Write-Host "Carpeta de webpart: $WebPartFolderName"
    Write-Host "Ruta de webpart: src/webparts/$WebPartFolderName"
    Write-Host ""
    Write-Host "GUID anterior de solución: $OldSolutionGuid"
    Write-Host "GUID nuevo de solución: $NewSolutionGuid"
    Write-Host "GUID nuevo de webpart: $WebPartGuid"
    Write-Host ""
    Write-Host "URL de sitio solicitada: $RequestedSiteUrl"
    Write-Host "URL de sitio aplicada: $SiteBaseUrl"
    Write-Host "Ambiente detectado: $SiteEnvironmentName"
    Write-Host "Configuración de depuración: $LaunchConfigurationName"
    Write-Host "URL de depuración: $DebugUrl"
    Write-Host ""
    Write-ChangedFiles -Changes $Changes
    Write-Host "Reemplazos de nombre: $NameReplacementCount"
    Write-Host "Reemplazos de GUID: $GuidReplacementCount"
    Write-Host "react-router-dom: $RouterVersion"
    Write-Host "Validaciones ejecutadas: $($script:ValidationCommands -join ', ')"
    Write-Host "Resultado: correcto"

    if ($script:Warnings.Count -gt 0) {
        Write-Host "`nAdvertencias informativas:" -ForegroundColor Yellow
        foreach ($warning in $script:Warnings) {
            Write-Host "- $warning"
        }
    }

    Write-Host "`nCONFIGURACIÓN FUNCIONAL PENDIENTE" -ForegroundColor Yellow
    Write-Host "- Configure Roles en src/core/utils/Constants.ts. Cada valor debe coincidir, ignorando casing y espacios exteriores, con el nombre de un grupo de SharePoint del sitio."
    Write-Host "- Roles define qué grupos de SharePoint son reconocidos como roles de la aplicación. Visitante es solamente un valor inicial; no es un fallback automático."
    Write-Host "- Configure ROLE_PRIORITY en el mismo archivo, de mayor a menor prioridad. Determina el rol principal cuando un usuario pertenece a varios grupos."
    Write-Host "- Configure URL sendEmail y API KEY sendEmail desde el panel de propiedades de la webpart. No hardcodee ni registre la API key."
}

$nameReplacementCount = 0
$guidReplacementCount = 0
$oldSolutionName = ""
$oldSolutionGuid = ""
$newSolutionGuid = ""
$normalizedSolutionName = ""
$newLowerName = ""
$newUpperName = ""
$pascalWebPartName = ""
$webPartFolderName = ""
$webPartGuid = ""
$routerVersion = ""
$siteBaseUrl = ""
$siteEnvironmentName = ""
$launchConfigurationName = ""
$debugUrl = ""

try {
    $script:CurrentStage = "Resolución y preflight del proyecto"
    $script:ProjectRoot = Resolve-ProjectRoot -RequestedRoot $ProjectRoot

    if (-not (Test-Path -LiteralPath $script:ProjectRoot -PathType Container)) {
        throw "La raíz de proyecto '$($script:ProjectRoot)' no existe."
    }

    Push-Location $script:ProjectRoot
    $script:LocationPushed = $true
    $script:InitialState = Get-ProjectFileState -Root $script:ProjectRoot

    foreach ($requiredRelativePath in @(
        "package.json",
        "package-lock.json",
        "config\package-solution.json"
    )) {
        Assert-FileExists `
            -Path (Join-Path $script:ProjectRoot $requiredRelativePath) `
            -Description "el archivo obligatorio $requiredRelativePath"
    }

    if (-not (Test-CommandAvailable -Command "node")) {
        throw "Node.js no está disponible en el PATH."
    }
    if (-not (Test-CommandAvailable -Command "npm")) {
        throw "npm no está disponible en el PATH."
    }

    $normalizedSolutionName = Convert-ToSafeSolutionName -RawName $SolutionName
    $newLowerName = $normalizedSolutionName.ToLowerInvariant()
    $newUpperName = $normalizedSolutionName.ToUpperInvariant()
    $pascalWebPartName = Convert-ToPascalWebPartName -RawName $WebPartName
    $webPartFolderName = Convert-PascalToCamelName -PascalName $pascalWebPartName
    $webPartAlias = "${pascalWebPartName}WebPart"
    $webPartDirectory = Join-Path $script:ProjectRoot "src\webparts\$webPartFolderName"

    $siteUrlInfo = Resolve-SiteUrlInfo -RawSiteUrl $SiteUrl
    $siteBaseUrl = $siteUrlInfo.BaseUrl
    $siteEnvironmentName = $siteUrlInfo.EnvironmentName
    $launchConfigurationName = $siteUrlInfo.LaunchConfigurationName
    $debugUrl = Get-DebugManifestsUrl -BaseUrl $siteBaseUrl

    $launchPath = Join-Path $script:ProjectRoot ".vscode\launch.json"
    Assert-FileExists -Path $launchPath -Description "la configuración de depuración .vscode/launch.json"
    if (@(Get-LaunchConfigurationByName `
        -Launch (Read-JsonFile -Path $launchPath) `
        -ConfigurationName $launchConfigurationName).Count -gt 0) {
        throw ".vscode/launch.json ya declara una configuración llamada '$launchConfigurationName'."
    }

    Assert-WebPartDoesNotExist `
        -ExpectedDirectory $webPartDirectory `
        -ExpectedAlias $webPartAlias

    $packageJsonPath = Join-Path $script:ProjectRoot "package.json"
    $packageLockPath = Join-Path $script:ProjectRoot "package-lock.json"
    $packageSolutionPath = Join-Path $script:ProjectRoot "config\package-solution.json"
    $yoRcPath = Join-Path $script:ProjectRoot ".yo-rc.json"
    $readmePath = Join-Path $script:ProjectRoot "README.md"
    $deployStoragePath = Join-Path $script:ProjectRoot "config\deploy-azure-storage.json"

    $packageJson = Read-JsonFile -Path $packageJsonPath
    $packageSolution = Read-JsonFile -Path $packageSolutionPath
    $packageName = [string](Get-RequiredProperty `
        -Object $packageJson `
        -PropertyName "name" `
        -Context $packageJsonPath)
    $solution = Get-RequiredProperty `
        -Object $packageSolution `
        -PropertyName "solution" `
        -Context $packageSolutionPath
    $fullSolutionName = [string](Get-RequiredProperty `
        -Object $solution `
        -PropertyName "name" `
        -Context "$packageSolutionPath -> solution")
    $solutionSuffix = "-client-side-solution"

    if (-not $fullSolutionName.EndsWith(
        $solutionSuffix,
        [System.StringComparison]::OrdinalIgnoreCase
    )) {
        throw "config/package-solution.json -> solution.name no termina en '$solutionSuffix'."
    }

    $oldSolutionName = $fullSolutionName.Substring(
        0,
        $fullSolutionName.Length - $solutionSuffix.Length
    )

    if (-not $packageName.Equals(
        $oldSolutionName,
        [System.StringComparison]::OrdinalIgnoreCase
    )) {
        throw "package.json.name ('$packageName') no coincide con el nombre base de package-solution.json ('$oldSolutionName')."
    }

    if ($oldSolutionName.Equals(
        $newLowerName,
        [System.StringComparison]::OrdinalIgnoreCase
    )) {
        throw "El nombre nuevo normalizado coincide con el nombre actual."
    }

    $oldSolutionGuidText = [string](Get-RequiredProperty `
        -Object $solution `
        -PropertyName "id" `
        -Context "$packageSolutionPath -> solution")
    $parsedOldGuid = [guid]::Empty
    if (-not [guid]::TryParse($oldSolutionGuidText, [ref]$parsedOldGuid)) {
        throw "El GUID de solución actual '$oldSolutionGuidText' no es válido."
    }
    $oldSolutionGuid = $parsedOldGuid.ToString("D").ToLowerInvariant()

    $allowedNamePaths = @(
        "package.json",
        "package-lock.json",
        "config/package-solution.json",
        ".yo-rc.json",
        "README.md",
        "config/deploy-azure-storage.json"
    )
    $allowedGuidPaths = @(
        "config/package-solution.json",
        ".yo-rc.json"
    )

    Assert-NoUnexpectedOccurrences `
        -Value $oldSolutionName `
        -AllowedRelativePaths $allowedNamePaths `
        -Label "El nombre anterior"
    Assert-NoUnexpectedOccurrences `
        -Value $oldSolutionGuid `
        -AllowedRelativePaths $allowedGuidPaths `
        -Label "El GUID anterior"

    if (Test-Path -LiteralPath $deployStoragePath -PathType Leaf) {
        if ($newLowerName.Length -lt 3 -or $newLowerName.Length -gt 63) {
            throw "El nombre '$newLowerName' no cumple la longitud de 3 a 63 caracteres requerida por el contenedor de Azure Storage."
        }

        if ($newLowerName -cnotmatch '^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$') {
            throw "El nombre '$newLowerName' no es válido para un contenedor de Azure Storage."
        }
    }

    if (Test-Path -LiteralPath $yoRcPath -PathType Leaf) {
        $yoRc = Read-JsonFile -Path $yoRcPath
        $generatorConfig = Get-RequiredProperty `
            -Object $yoRc `
            -PropertyName "@microsoft/generator-sharepoint" `
            -Context $yoRcPath
        $libraryId = [string](Get-RequiredProperty `
            -Object $generatorConfig `
            -PropertyName "libraryId" `
            -Context "$yoRcPath -> @microsoft/generator-sharepoint")

        if (-not $libraryId.Equals(
            $oldSolutionGuid,
            [System.StringComparison]::OrdinalIgnoreCase
        )) {
            throw ".yo-rc.json.libraryId ('$libraryId') no coincide con solution.id ('$oldSolutionGuid')."
        }
    }

    $script:CurrentStage = "Preparación de dependencias"
    if (-not (Test-Path -LiteralPath (Join-Path $script:ProjectRoot "node_modules") -PathType Container)) {
        Invoke-ExternalCommand -Command "npm" -Arguments @("ci")
    }

    $script:CurrentStage = "Validación inicial"
    Invoke-ProjectValidation -Label "estado anterior al setup"

    $script:CurrentStage = "Actualización de nombre y GUID de solución"
    $guidScript = Join-Path $PSScriptRoot "generate-guid.ps1"
    Assert-FileExists -Path $guidScript -Description "el generador de GUID"
    $newGuidOutput = @(& $guidScript)
    if ($newGuidOutput.Count -ne 1) {
        throw "generate-guid.ps1 debe devolver exactamente un GUID."
    }

    $parsedNewGuid = [guid]::Empty
    if (-not [guid]::TryParse([string]$newGuidOutput[0], [ref]$parsedNewGuid)) {
        throw "generate-guid.ps1 devolvió un valor inválido: '$($newGuidOutput[0])'."
    }
    $newSolutionGuid = $parsedNewGuid.ToString("D").ToLowerInvariant()
    if ($newSolutionGuid -ceq $oldSolutionGuid) {
        throw "generate-guid.ps1 devolvió el mismo GUID que ya utiliza la solución."
    }

    foreach ($relativePath in $allowedNamePaths) {
        $nameReplacementCount += Replace-CaseAwareName `
            -Path (Join-Path $script:ProjectRoot $relativePath) `
            -OldName $oldSolutionName `
            -NewLowerName $newLowerName `
            -NewUpperName $newUpperName
    }

    foreach ($relativePath in $allowedGuidPaths) {
        $guidReplacementCount += Replace-GuidValue `
            -Path (Join-Path $script:ProjectRoot $relativePath) `
            -OldGuid $oldSolutionGuid `
            -NewGuid $newSolutionGuid
    }

    if ($nameReplacementCount -eq 0) {
        throw "No se realizó ningún reemplazo de nombre."
    }
    if ($guidReplacementCount -eq 0) {
        throw "No se realizó ningún reemplazo de GUID."
    }

    Assert-RenamedProjectMetadata `
        -PackageJsonPath $packageJsonPath `
        -PackageLockPath $packageLockPath `
        -PackageSolutionPath $packageSolutionPath `
        -YoRcPath $yoRcPath `
        -DeployStoragePath $deployStoragePath `
        -ExpectedLowerName $newLowerName `
        -SolutionSuffix $solutionSuffix `
        -ExpectedGuid $newSolutionGuid

    $script:CurrentStage = "Validación posterior al reemplazo"
    Invoke-ProjectValidation -Label "nombre y GUID actualizados"

    $script:CurrentStage = "Generación oficial de la webpart"
    $generatorVersion = Get-GeneratorVersion
    Invoke-MicrosoftWebPartGenerator `
        -GeneratorVersion $generatorVersion `
        -NormalizedSolutionName $newLowerName `
        -PascalWebPartName $pascalWebPartName
    $webPartDirectory = Resolve-GeneratedWebPartDirectory `
        -ExpectedDirectory $webPartDirectory `
        -ExpectedAlias $webPartAlias
    Repair-GeneratedWebPartCasing `
        -WebPartDirectory $webPartDirectory `
        -PascalWebPartName $pascalWebPartName

    $script:CurrentStage = "Validación posterior al generador"
    Invoke-ProjectValidation -Label "webpart creada por Microsoft"

    $script:CurrentStage = "Eliminación de webparts de ejemplo"
    Remove-SampleBundleReferences
    foreach ($sampleName in @("helloWorld", "template")) {
        $samplePath = Join-Path $script:ProjectRoot "src\webparts\$sampleName"
        if (Test-Path -LiteralPath $samplePath -PathType Container) {
            Remove-Item -LiteralPath $samplePath -Recurse -Force
        }
        else {
            $script:Warnings.Add("La carpeta opcional '$samplePath' no existía; no fue necesario eliminarla.")
        }
    }

    $script:CurrentStage = "Validación posterior a la limpieza"
    Invoke-ProjectValidation -Label "webparts de ejemplo eliminadas"

    $script:CurrentStage = "Instalación y validación del router"
    $routerVersion = Ensure-ReactRouter

    $script:CurrentStage = "Aplicación del scaffolding estándar"
    Ensure-RolesConstants
    Ensure-UserEntity
    Ensure-SendEmailConfig
    Ensure-UserInfrastructure
    Copy-ManagedStyles
    $webPartGuid = Apply-StandardScaffolding `
        -WebPartDirectory $webPartDirectory `
        -PascalWebPartName $pascalWebPartName `
        -SolutionGuid $newSolutionGuid

    $script:CurrentStage = "Configuración de depuración del sitio"
    Add-ManifestsLaunchConfiguration `
        -ConfigurationName $launchConfigurationName `
        -DebugUrl $debugUrl

    $script:CurrentStage = "Validación de invariantes finales"
    Assert-RenamedProjectMetadata `
        -PackageJsonPath $packageJsonPath `
        -PackageLockPath $packageLockPath `
        -PackageSolutionPath $packageSolutionPath `
        -YoRcPath $yoRcPath `
        -DeployStoragePath $deployStoragePath `
        -ExpectedLowerName $newLowerName `
        -SolutionSuffix $solutionSuffix `
        -ExpectedGuid $newSolutionGuid
    Assert-FinalInvariants `
        -OldSolutionName $oldSolutionName `
        -OldSolutionGuid $oldSolutionGuid `
        -WebPartDirectory $webPartDirectory `
        -PascalWebPartName $pascalWebPartName `
        -NewSolutionGuid $newSolutionGuid `
        -LaunchConfigurationName $launchConfigurationName `
        -DebugUrl $debugUrl

    $script:CurrentStage = "Validación final"
    Invoke-ProjectValidation -Label "scaffolding completo"

    $finalState = Get-ProjectFileState -Root $script:ProjectRoot
    $changes = Compare-ProjectFileState -Before $script:InitialState -After $finalState

    Write-SuccessReport `
        -OldSolutionName $oldSolutionName `
        -RequestedSolutionName $SolutionName `
        -NormalizedSolutionName $normalizedSolutionName `
        -NewLowerName $newLowerName `
        -NewUpperName $newUpperName `
        -RequestedWebPartName $WebPartName `
        -PascalWebPartName $pascalWebPartName `
        -WebPartFolderName $webPartFolderName `
        -OldSolutionGuid $oldSolutionGuid `
        -NewSolutionGuid $newSolutionGuid `
        -WebPartGuid $webPartGuid `
        -NameReplacementCount $nameReplacementCount `
        -GuidReplacementCount $guidReplacementCount `
        -RouterVersion $routerVersion `
        -RequestedSiteUrl $SiteUrl `
        -SiteBaseUrl $siteBaseUrl `
        -SiteEnvironmentName $siteEnvironmentName `
        -LaunchConfigurationName $launchConfigurationName `
        -DebugUrl $debugUrl `
        -Changes $changes
}
catch {
    Write-Host "`nSetup del template finalizado con errores." -ForegroundColor Red
    Write-Host "Etapa: $($script:CurrentStage)"

    if (-not [string]::IsNullOrWhiteSpace($script:LastCommand)) {
        Write-Host "Último comando: $($script:LastCommand)"
    }

    Write-Host "Error: $($_.Exception.Message)"

    if ($null -ne $script:InitialState -and
        -not [string]::IsNullOrWhiteSpace($script:ProjectRoot) -and
        (Test-Path -LiteralPath $script:ProjectRoot -PathType Container)) {
        try {
            $errorState = Get-ProjectFileState -Root $script:ProjectRoot
            $errorChanges = Compare-ProjectFileState `
                -Before $script:InitialState `
                -After $errorState
            Write-Host ""
            Write-ChangedFiles -Changes $errorChanges
        }
        catch {
            Write-Host "No fue posible calcular el detalle final de archivos modificados."
        }
    }

    Write-Host "No se realizó rollback ni commit. El programador puede restaurar los cambios mediante Git."
    exit 1
}
finally {
    if ($script:LocationPushed) {
        try {
            Pop-Location -ErrorAction SilentlyContinue
        }
        catch {
            # No se oculta el error principal si la ubicación no llegó a cambiarse.
        }
    }
}
