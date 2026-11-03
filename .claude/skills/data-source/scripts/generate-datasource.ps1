[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$SpecPath,

    [Parameter(Mandatory = $false)]
    [string]$ProjectRoot
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$script:CurrentStage = "Inicialización"
$script:LastCommand = ""
$script:ProjectRoot = ""
$script:LocationPushed = $false
$script:Warnings = [System.Collections.Generic.List[string]]::new()
$script:SkippedFields = [System.Collections.Generic.List[string]]::new()
$script:CreatedFiles = [System.Collections.Generic.List[string]]::new()
$script:ModifiedFiles = [System.Collections.Generic.List[string]]::new()
$script:Utf8NoBom = [System.Text.UTF8Encoding]::new($false)

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logName = "generate-datasource-$timestamp-$PID.log"
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

    [System.IO.File]::AppendAllText($script:LogPath, $Message + [Environment]::NewLine, $script:Utf8NoBom)
}

function Get-FullPath {
    param([Parameter(Mandatory = $true)][string]$Path)
    return [System.IO.Path]::GetFullPath($Path)
}

function Resolve-ProjectRoot {
    param([Parameter(Mandatory = $false)][string]$RequestedRoot)

    if (-not [string]::IsNullOrWhiteSpace($RequestedRoot)) {
        return Get-FullPath -Path $RequestedRoot
    }

    return Get-FullPath -Path (Join-Path $PSScriptRoot "..\..\..\..")
}

function Get-RelativeProjectPath {
    param([Parameter(Mandatory = $true)][string]$Path)

    $root = $script:ProjectRoot.TrimEnd([System.IO.Path]::DirectorySeparatorChar, [System.IO.Path]::AltDirectorySeparatorChar)
    $fullPath = Get-FullPath -Path $Path
    $prefix = $root + [System.IO.Path]::DirectorySeparatorChar

    if ($fullPath.StartsWith($prefix, [System.StringComparison]::OrdinalIgnoreCase)) {
        return $fullPath.Substring($prefix.Length).Replace("\", "/")
    }

    return $fullPath.Replace("\", "/")
}

function Read-TextFile {
    param([Parameter(Mandatory = $true)][string]$Path)
    return [System.IO.File]::ReadAllText($Path)
}

function Write-TextFile {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Content
    )

    $directory = Split-Path -Parent $Path
    if (-not (Test-Path -LiteralPath $directory -PathType Container)) {
        New-Item -ItemType Directory -Path $directory -Force | Out-Null
    }

    $existed = Test-Path -LiteralPath $Path -PathType Leaf
    if ($existed) {
        $current = Read-TextFile -Path $Path
        if ($current -ceq $Content) {
            return
        }
    }

    [System.IO.File]::WriteAllText($Path, $Content, $script:Utf8NoBom)
    $relative = Get-RelativeProjectPath -Path $Path

    if ($existed) {
        if (-not $script:ModifiedFiles.Contains($relative)) {
            $script:ModifiedFiles.Add($relative)
        }
    }
    else {
        if (-not $script:CreatedFiles.Contains($relative)) {
            $script:CreatedFiles.Add($relative)
        }
    }
}

function Read-JsonFile {
    param([Parameter(Mandatory = $true)][string]$Path)

    try {
        return (Read-TextFile -Path $Path) | ConvertFrom-Json
    }
    catch {
        throw "No se pudo interpretar el JSON '$Path': $($_.Exception.Message)"
    }
}

function Get-RequiredProperty {
    param(
        [Parameter(Mandatory = $true)][object]$Object,
        [Parameter(Mandatory = $true)][string]$PropertyName,
        [Parameter(Mandatory = $true)][string]$Context
    )

    $property = $Object.PSObject.Properties[$PropertyName]
    if ($null -eq $property -or $null -eq $property.Value) {
        throw "Falta la propiedad '$PropertyName' en $Context."
    }

    return $property.Value
}

function Assert-FileExists {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Description
    )

    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        throw "Falta $Description en '$Path'."
    }
}

function Format-CommandArgument {
    param([Parameter(Mandatory = $true)][string]$Value)
    if ($Value -match '[\s"]') {
        return '"' + $Value.Replace('"', '\"') + '"'
    }
    return $Value
}

function Invoke-LoggedCommand {
    param(
        [Parameter(Mandatory = $true)][string]$Command,
        [Parameter(Mandatory = $false)][string[]]$Arguments = @(),
        [Parameter(Mandatory = $true)][string]$Label
    )

    $displayArguments = @($Arguments | ForEach-Object { Format-CommandArgument -Value $_ })
    $script:LastCommand = (($Command) + " " + ($displayArguments -join " ")).Trim()

    Write-Host "`n[...] $Label" -ForegroundColor Cyan
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
        Write-Host $line
    }
    Write-Log -Message "Exit code: $exitCode"

    if ($exitCode -ne 0) {
        throw "El comando '$($script:LastCommand)' finalizó con código $exitCode."
    }

    Write-Host "[OK] $Label" -ForegroundColor Green
}

# --- Validación del spec de campos -----------------------------------------

# Tabla de mapeo cerrada: tipo de SharePoint (tal como lo escribe el usuario en el input
# estandarizado) -> tipo TS, según la tabla del documento de requisitos. Lo que no está acá
# no se genera: se informa y se deja fuera de la entidad.
$script:TypeMap = @{
    "Una línea de texto"    = "string"
    "Varias líneas"         = "string"
    "Número"                = "number"
    "Sí/No"                 = "boolean"
    "Fecha y hora"          = "date"
    "Elección"               = "choice"
    "Elección múltiple"      = "choiceMultiple"
    "Búsqueda"                = "lookup"
    "Búsqueda múltiple"       = "lookupMultiple"
    "Persona o grupo"        = "person"
    "Persona o grupo múltiple" = "personMultiple"
    "Hipervínculo"           = "url"
    "Calculado"              = "calculated"
}

function Test-PascalCase {
    param([Parameter(Mandatory = $true)][string]$Name)
    return $Name -cmatch '^[A-Z][A-Za-z0-9]*$'
}

function Assert-ValidSpec {
    param([Parameter(Mandatory = $true)][object]$Spec)

    $listaName = [string](Get-RequiredProperty -Object $Spec -PropertyName "lista" -Context "el spec")
    if ($listaName.Length -gt 30) {
        throw "El nombre de la lista '$listaName' supera el límite de 30 caracteres."
    }
    if ($listaName -match '\s') {
        throw "El nombre de la lista '$listaName' contiene espacios; el display name debe ser igual al internal name, sin espacios."
    }
    if (-not (Test-PascalCase -Name $listaName)) {
        throw "El nombre de la lista '$listaName' no está en PascalCase."
    }

    $camposProperty = $Spec.PSObject.Properties["campos"]
    if ($null -eq $camposProperty -or $null -eq $camposProperty.Value) {
        throw "El spec no declara ningún campo en 'campos'."
    }

    $fields = [System.Collections.Generic.List[object]]::new()
    foreach ($campo in $camposProperty.Value) {
        $internalName = [string](Get-RequiredProperty -Object $campo -PropertyName "internalName" -Context "un campo del spec")
        $tipo = [string](Get-RequiredProperty -Object $campo -PropertyName "tipo" -Context "el campo '$internalName'")

        if ($internalName.Length -gt 30) {
            throw "El internal name '$internalName' supera el límite de 30 caracteres."
        }
        if ($internalName -match '\s') {
            throw "El internal name '$internalName' contiene espacios; el display name debe ser igual al internal name, sin espacios."
        }
        if (-not (Test-PascalCase -Name $internalName)) {
            throw "El internal name '$internalName' no está en PascalCase."
        }
        if ($internalName -in @("Id", "Title", "Created", "Modified", "Author", "Editor")) {
            $script:Warnings.Add("El campo '$internalName' coincide con un campo estándar o de sistema; se omite del spec porque ya lo cubre BaseEntity o los campos por defecto.")
            continue
        }

        if (-not $script:TypeMap.ContainsKey($tipo)) {
            $script:SkippedFields.Add("$internalName ($tipo)")
            $script:Warnings.Add("El tipo '$tipo' del campo '$internalName' no está en la tabla de mapeo soportada; se omite, no se inventa.")
            continue
        }

        $fields.Add([PSCustomObject]@{
            InternalName = $internalName
            Tipo = $tipo
            TsKind = $script:TypeMap[$tipo]
            ChoiceOptions = if ($null -ne $campo.PSObject.Properties["opciones"]) { @($campo.opciones) } else { @() }
            EnumName = if ($null -ne $campo.PSObject.Properties["enum"] -and -not [string]::IsNullOrWhiteSpace([string]$campo.enum)) { [string]$campo.enum } else { $internalName }
        })
    }

    if ($fields.Count -eq 0 -and $script:SkippedFields.Count -eq 0) {
        throw "El spec no dejó ningún campo válido para generar."
    }

    return [PSCustomObject]@{
        Lista = $listaName
        TituloLista = if ($null -ne $Spec.PSObject.Properties["tituloLista"] -and -not [string]::IsNullOrWhiteSpace([string]$Spec.tituloLista)) { ([string]$Spec.tituloLista).Replace("\", "\\").Replace([string][char]34, "\" + [char]34) } else { $listaName }
        Campos = $fields
    }
}

# --- Generación de artefacto compartido Mappers.ts --------------------------

function Ensure-Mappers {
    $mappersPath = Join-Path $script:ProjectRoot "src\core\utils\Mappers.ts"
    if (Test-Path -LiteralPath $mappersPath -PathType Leaf) {
        $script:Warnings.Add("src/core/utils/Mappers.ts ya existe; no se sobrescribe.")
        return
    }

    $templatePath = Join-Path $PSScriptRoot "..\assets\Mappers.ts.template"
    Assert-FileExists -Path $templatePath -Description "la plantilla de Mappers.ts"
    $content = Read-TextFile -Path $templatePath
    Write-TextFile -Path $mappersPath -Content $content
}

# --- Generación de tipos TS por campo ---------------------------------------

function Get-TsTypeForField {
    param([Parameter(Mandatory = $true)][object]$Field)

    switch ($Field.TsKind) {
        "string" { return "string | undefined" }
        "number" { return "number | undefined" }
        "boolean" { return "boolean | undefined" }
        "date" { return "Date | null | undefined" }
        "person" { return "IPersonValue | undefined" }
        "personMultiple" { return "IPersonValue[] | undefined" }
        "lookup" { return "ILookupValue | undefined" }
        "lookupMultiple" { return "ILookupValue[] | undefined" }
        "url" { return "IUrlValue | undefined" }
        "calculated" { return "string | undefined" }
        "choice" { return "$($Field.EnumName) | undefined" }
        "choiceMultiple" { return "$($Field.EnumName)[] | undefined" }
        default { throw "Tipo TS no resuelto para el campo '$($Field.InternalName)'." }
    }
}

function Get-MapItemLineForField {
    param([Parameter(Mandatory = $true)][object]$Field)

    $name = $Field.InternalName
    switch ($Field.TsKind) {
        "string" { return "`t`tthis.$name = item.$name ?? undefined;" }
        "number" { return "`t`tthis.$name = item.$name ?? undefined;" }
        "boolean" { return "`t`tthis.$name = item.$name ?? undefined;" }
        "date" { return "`t`tthis.$name = toDateValue(item.$name);" }
        "person" { return "`t`tthis.$name = toPersonValue(item.$name);" }
        "personMultiple" { return "`t`tthis.$name = toPersonValueArray(item.$name);" }
        "lookup" { return "`t`tthis.$name = toLookupValue(item.$name);" }
        "lookupMultiple" { return "`t`tthis.$name = toLookupValueArray(item.$name);" }
        "url" { return "`t`tthis.$name = toUrlValue(item.$name);" }
        "calculated" { return "`t`tthis.$name = item.$name ?? undefined;" }
        "choice" { return "`t`tthis.$name = toChoiceValue($($Field.EnumName), item.$name, '$name');" }
        "choiceMultiple" { return "`t`tthis.$name = toChoiceValueArray($($Field.EnumName), item.$name, '$name');" }
        default { throw "Lectura no resuelta para el campo '$name'." }
    }
}

function Get-ToListItemLineForField {
    param([Parameter(Mandatory = $true)][object]$Field)

    $name = $Field.InternalName
    switch ($Field.TsKind) {
        "calculated" { return $null }
        "lookup" { return "`t`t`t${name}Id: this.${name}?.Id," }
        "lookupMultiple" { return "`t`t`t${name}Id: this.${name}?.map(v => v.Id)," }
        "person" { return "`t`t`t${name}Id: this.${name}?.Id," }
        "personMultiple" { return "`t`t`t${name}Id: toPersonIds(this.$name)," }
        "url" { return "`t`t`t${name}: this.$name," }
        "choice" { return "`t`t`t${name}: assertChoiceValue($($Field.EnumName), this.$name, '$name')," }
        "choiceMultiple" { return "`t`t`t${name}: this.${name}?.map(v => assertChoiceValue($($Field.EnumName), v, '$name'))," }
        default { return "`t`t`t${name}: this.$name," }
    }
}

function New-EntityFile {
    param(
        [Parameter(Mandatory = $true)][string]$Lista,
        [Parameter(Mandatory = $true)][System.Collections.Generic.List[object]]$Fields
    )

    $templatePath = Join-Path $PSScriptRoot "..\assets\Entidad.ts.template"
    Assert-FileExists -Path $templatePath -Description "la plantilla de entidad"
    $template = Read-TextFile -Path $templatePath

    $choiceFields = @($Fields | Where-Object { $_.TsKind -in @("choice", "choiceMultiple") })
    $mapperImports = [System.Collections.Generic.List[string]]::new()
    if (@($Fields | Where-Object { $_.TsKind -in @("lookup", "lookupMultiple") }).Count -gt 0) {
        $mapperImports.Add("ILookupValue, toLookupValue, toLookupValueArray")
    }
    if (@($Fields | Where-Object { $_.TsKind -eq "personMultiple" }).Count -gt 0) {
        $mapperImports.Add("toPersonValueArray, toPersonIds")
    }
    if (@($Fields | Where-Object { $_.TsKind -eq "url" }).Count -gt 0) {
        $mapperImports.Add("IUrlValue, toUrlValue")
    }
    if ($choiceFields.Count -gt 0) {
        $mapperImports.Add("toChoiceValue, toChoiceValueArray, assertChoiceValue")
    }

    $campoImportsLines = [System.Collections.Generic.List[string]]::new()
    if ($mapperImports.Count -gt 0) {
        $campoImportsLines.Add("import { $($mapperImports -join ', ') } from '../utils/Mappers';")
    }
    $choiceImportNames = [System.Collections.Generic.List[string]]::new()
    foreach ($choiceField in $choiceFields) {
        if (Test-ConstantsEnumExists -Name $choiceField.EnumName) {
            if (-not $choiceImportNames.Contains($choiceField.EnumName)) {
                $choiceImportNames.Add($choiceField.EnumName)
            }
        }
        else {
            $script:Warnings.Add("El campo de elección '$($choiceField.InternalName)' no declaró 'opciones' en el spec y el enum '$($choiceField.EnumName)' no existe en src/core/utils/Constants.ts; agregarlo manualmente con las opciones reales de la lista e importarlo en la entidad antes de compilar.")
        }
    }
    if ($choiceImportNames.Count -gt 0) {
        $campoImportsLines.Add("import { $($choiceImportNames -join ', ') } from '../utils/Constants';")
    }

    $mapItemLines = @($Fields | ForEach-Object { Get-MapItemLineForField -Field $_ })
    $toListItemLines = @($Fields | ForEach-Object { Get-ToListItemLineForField -Field $_ } | Where-Object { $_ -ne $null })
    $propertyLines = @($Fields | ForEach-Object { "`tpublic $($_.InternalName)?: $(Get-TsTypeForField -Field $_);" })

    $content = $template
    $content = $content.Replace("__LISTA__", $Lista)
    $content = $content.Replace("__CAMPO_IMPORTS__", ($campoImportsLines -join [Environment]::NewLine))
    $content = $content.Replace("__CAMPO_MAP_ITEM__", ($mapItemLines -join [Environment]::NewLine))
    $content = $content.Replace("__CAMPO_TO_LIST_ITEM__", ($toListItemLines -join [Environment]::NewLine))
    $content = $content.Replace("__CAMPO_PROPERTIES__", (($propertyLines -join [Environment]::NewLine) + [Environment]::NewLine))

    $entityPath = Join-Path $script:ProjectRoot "src\core\entities\$Lista.ts"
    Write-TextFile -Path $entityPath -Content $content
}

function Update-EntitiesBarrel {
    param([Parameter(Mandatory = $true)][string]$Lista)

    $barrelPath = Join-Path $script:ProjectRoot "src\core\entities\index.ts"
    Assert-FileExists -Path $barrelPath -Description "el barrel de entidades"
    $content = Read-TextFile -Path $barrelPath

    $exportLine = "export { default as $Lista } from './$Lista';"
    if ($content -match [regex]::Escape($exportLine)) {
        return
    }

    if (-not $content.EndsWith([Environment]::NewLine)) {
        $content += [Environment]::NewLine
    }
    $content += "$exportLine$([Environment]::NewLine)"
    Write-TextFile -Path $barrelPath -Content $content
}

function New-DataSourceFiles {
    param(
        [Parameter(Mandatory = $true)][string]$Lista,
        [Parameter(Mandatory = $true)][System.Collections.Generic.List[object]]$Fields
    )

    $folder = Join-Path $script:ProjectRoot "src\core\api\$Lista"

    $selectLines = [System.Collections.Generic.List[string]]::new()
    $expandExtras = [System.Collections.Generic.List[string]]::new()
    foreach ($field in $Fields) {
        switch ($field.TsKind) {
            "lookup" {
                $selectLines.Add("`t`t'$($field.InternalName)/Id', '$($field.InternalName)/Title',")
                $expandExtras.Add("'$($field.InternalName)'")
            }
            "lookupMultiple" {
                $selectLines.Add("`t`t'$($field.InternalName)/Id', '$($field.InternalName)/Title',")
                $expandExtras.Add("'$($field.InternalName)'")
            }
            "person" {
                $selectLines.Add("`t`t'$($field.InternalName)/Id', '$($field.InternalName)/Title', '$($field.InternalName)/EMail',")
                $expandExtras.Add("'$($field.InternalName)'")
            }
            "personMultiple" {
                $selectLines.Add("`t`t'$($field.InternalName)/Id', '$($field.InternalName)/Title', '$($field.InternalName)/EMail',")
                $expandExtras.Add("'$($field.InternalName)'")
            }
            default {
                $selectLines.Add("`t`t'$($field.InternalName)',")
            }
        }
    }

    $interfaceTemplatePath = Join-Path $PSScriptRoot "..\assets\IDataSource.ts.template"
    $dataSourceTemplatePath = Join-Path $PSScriptRoot "..\assets\DataSource.ts.template"
    $useTemplatePath = Join-Path $PSScriptRoot "..\assets\useDataSource.ts.template"
    $useItemTemplatePath = Join-Path $PSScriptRoot "..\assets\useItemDataSource.ts.template"

    foreach ($path in @($interfaceTemplatePath, $dataSourceTemplatePath, $useTemplatePath, $useItemTemplatePath)) {
        Assert-FileExists -Path $path -Description "la plantilla '$path'"
    }

    $interfaceContent = (Read-TextFile -Path $interfaceTemplatePath).Replace("__LISTA__", $Lista).Replace("__METODOS_OPCIONALES_FIRMA__", "")
    Write-TextFile -Path (Join-Path $folder "I${Lista}DataSource.ts") -Content $interfaceContent

    $dataSourceContent = Read-TextFile -Path $dataSourceTemplatePath
    $dataSourceContent = $dataSourceContent.Replace("__LISTA__", $Lista)
    $dataSourceContent = $dataSourceContent.Replace("__CAMPO_SELECT__", ($selectLines -join [Environment]::NewLine))
    $expandExtrasText = if ($expandExtras.Count -gt 0) { ", " + ($expandExtras -join ", ") } else { "" }
    $dataSourceContent = $dataSourceContent.Replace("__CAMPO_EXPAND__", $expandExtrasText)
    $dataSourceContent = $dataSourceContent.Replace("__METODOS_OPCIONALES_IMPL__", "")
    Write-TextFile -Path (Join-Path $folder "${Lista}DataSource.ts") -Content $dataSourceContent

    $useContent = (Read-TextFile -Path $useTemplatePath).Replace("__LISTA__", $Lista)
    Write-TextFile -Path (Join-Path $folder "use${Lista}DataSource.ts") -Content $useContent

    $useItemContent = (Read-TextFile -Path $useItemTemplatePath).Replace("__LISTA__", $Lista)
    Write-TextFile -Path (Join-Path $folder "useItem${Lista}DataSource.ts") -Content $useItemContent
}

# --- Enums de elección en Constants.ts -----------------------------------------

function Get-ConstantsPath {
    return Join-Path $script:ProjectRoot "src\core\utils\Constants.ts"
}

function Test-ConstantsEnumExists {
    param([Parameter(Mandatory = $true)][string]$Name)

    $constantsPath = Get-ConstantsPath
    if (-not (Test-Path -LiteralPath $constantsPath -PathType Leaf)) {
        return $false
    }

    $content = Read-TextFile -Path $constantsPath
    return [regex]::IsMatch($content, "(?m)^\s*export\s+enum\s+$([regex]::Escape($Name))\b")
}

function ConvertTo-EnumKey {
    param([Parameter(Mandatory = $true)][string]$Option)

    $decomposed = $Option.Normalize([System.Text.NormalizationForm]::FormD)
    $builder = [System.Text.StringBuilder]::new()
    foreach ($char in $decomposed.ToCharArray()) {
        if ([System.Globalization.CharUnicodeInfo]::GetUnicodeCategory($char) -ne [System.Globalization.UnicodeCategory]::NonSpacingMark) {
            [void]$builder.Append($char)
        }
    }

    $words = @([regex]::Split($builder.ToString(), '[^A-Za-z0-9]+') | Where-Object { $_.Length -gt 0 })
    if ($words.Count -eq 0) {
        throw "La opción de elección '$Option' no permite derivar un identificador válido."
    }

    $key = ($words | ForEach-Object { $_.Substring(0, 1).ToUpperInvariant() + $_.Substring(1) }) -join ""
    if ($key -match '^[0-9]') {
        $key = "_$key"
    }
    return $key
}

function Update-ChoiceEnums {
    param([Parameter(Mandatory = $true)][System.Collections.Generic.List[object]]$Fields)

    $constantsPath = Get-ConstantsPath
    $content = if (Test-Path -LiteralPath $constantsPath -PathType Leaf) { Read-TextFile -Path $constantsPath } else { "" }
    $original = $content

    foreach ($field in @($Fields | Where-Object { $_.TsKind -in @("choice", "choiceMultiple") })) {
        $enumName = $field.EnumName
        if (@($field.ChoiceOptions).Count -eq 0) {
            continue
        }

        if ([regex]::IsMatch($content, "(?m)^\s*export\s+enum\s+$([regex]::Escape($enumName))\b")) {
            $script:Warnings.Add("El enum '$enumName' ya existe en src/core/utils/Constants.ts; se respeta sin modificarlo. Verificar que sus opciones coincidan con las de la lista.")
            continue
        }

        $entries = [System.Collections.Generic.List[string]]::new()
        $usedKeys = [System.Collections.Generic.HashSet[string]]::new()
        foreach ($option in @($field.ChoiceOptions)) {
            $optionText = [string]$option
            $key = ConvertTo-EnumKey -Option $optionText
            if (-not $usedKeys.Add($key)) {
                throw "Las opciones del campo '$enumName' generan el identificador duplicado '$key'."
            }
            $escaped = $optionText.Replace("\", "\\").Replace('"', '\"')
            $entries.Add("`t$key = `"$escaped`"")
        }

        if (-not [string]::IsNullOrWhiteSpace($content) -and -not $content.EndsWith([Environment]::NewLine)) {
            $content += [Environment]::NewLine
        }
        $content += "$([Environment]::NewLine)export enum $enumName {$([Environment]::NewLine)$($entries -join ",$([Environment]::NewLine)")$([Environment]::NewLine)}$([Environment]::NewLine)"
    }

    if ($content -cne $original) {
        Write-TextFile -Path $constantsPath -Content $content
    }
}
# --- Enum Lista en Constants.ts ---------------------------------------------

function Update-ListaEnum {
    param(
        [Parameter(Mandatory = $true)][string]$Lista,
        [Parameter(Mandatory = $false)][string]$Titulo = $Lista
    )

    $constantsPath = Join-Path $script:ProjectRoot "src\core\utils\Constants.ts"
    $content = if (Test-Path -LiteralPath $constantsPath -PathType Leaf) { Read-TextFile -Path $constantsPath } else { "" }

    $enumMatch = [regex]::Match($content, '(?s)export\s+enum\s+Lista\s*\{(.*?)\}')

    if (-not $enumMatch.Success) {
        if (-not [string]::IsNullOrWhiteSpace($content) -and -not $content.EndsWith([Environment]::NewLine)) {
            $content += [Environment]::NewLine
        }
        $content += "$([Environment]::NewLine)export enum Lista {$([Environment]::NewLine)`t$Lista = `"$Titulo`"$([Environment]::NewLine)}$([Environment]::NewLine)"
        Write-TextFile -Path $constantsPath -Content $content
        return
    }

    $enumBody = $enumMatch.Groups[1].Value
    $entryPattern = "(?m)^\s*${Lista}\s*=\s*[`"']([^`"']*)[`"']\s*,?\s*$"
    $entryMatch = [regex]::Match($enumBody, $entryPattern)

    if ($entryMatch.Success) {
        $script:Warnings.Add("El enum Lista ya tenía una entrada para '$Lista'; se corrige el formato sin tocar las demás entradas.")
        $correctedBody = [regex]::Replace($enumBody, $entryPattern, "`t$Lista = `"$Titulo`",")
        $newContent = $content.Substring(0, $enumMatch.Groups[1].Index) + $correctedBody + $content.Substring($enumMatch.Groups[1].Index + $enumMatch.Groups[1].Length)
        Write-TextFile -Path $constantsPath -Content $newContent
        return
    }

    $trimmedBody = $enumBody.TrimEnd()
    if (-not $trimmedBody.EndsWith(",") -and $trimmedBody.Trim().Length -gt 0) {
        $trimmedBody += ","
    }
    $newBody = "$trimmedBody$([Environment]::NewLine)`t$Lista = `"$Titulo`"$([Environment]::NewLine)"
    $newContent = $content.Substring(0, $enumMatch.Groups[1].Index) + $newBody + $content.Substring($enumMatch.Groups[1].Index + $enumMatch.Groups[1].Length)
    Write-TextFile -Path $constantsPath -Content $newContent
}

# --- Programa principal ------------------------------------------------------

try {
    $script:CurrentStage = "Preflight"
    $script:ProjectRoot = Resolve-ProjectRoot -RequestedRoot $ProjectRoot

    if (-not (Test-Path -LiteralPath $script:ProjectRoot -PathType Container)) {
        throw "La raíz del proyecto no existe: '$($script:ProjectRoot)'."
    }

    Push-Location $script:ProjectRoot
    $script:LocationPushed = $true

    Assert-FileExists -Path $SpecPath -Description "el archivo de especificación datasource-spec.json"
    Assert-FileExists -Path (Join-Path $script:ProjectRoot "src\core\entities\BaseEntity.ts") -Description "BaseEntity.ts"
    Assert-FileExists -Path (Join-Path $script:ProjectRoot "src\core\api\IDatasource.ts") -Description "IDatasource.ts genérico"
    Assert-FileExists -Path (Join-Path $script:ProjectRoot "src\core\api\useDatasource.ts") -Description "useDatasource.ts genérico"

    $script:CurrentStage = "Validación del spec"
    $rawSpec = Read-JsonFile -Path $SpecPath
    $spec = Assert-ValidSpec -Spec $rawSpec

    $script:CurrentStage = "Artefactos compartidos"
    Ensure-Mappers

    $script:CurrentStage = "Enums de elección"
    Update-ChoiceEnums -Fields $spec.Campos
    $script:CurrentStage = "Generación de la entidad"
    New-EntityFile -Lista $spec.Lista -Fields $spec.Campos
    Update-EntitiesBarrel -Lista $spec.Lista

    $script:CurrentStage = "Generación del datasource"
    New-DataSourceFiles -Lista $spec.Lista -Fields $spec.Campos

    $script:CurrentStage = "Registro en el enum Lista"
    Update-ListaEnum -Lista $spec.Lista -Titulo $spec.TituloLista

    $script:CurrentStage = "Validación con lint"
    Invoke-LoggedCommand -Command "npm" -Arguments @("run", "lint") -Label "npm run lint"

    $script:CurrentStage = "Validación con build"
    Invoke-LoggedCommand -Command "npx" -Arguments @("heft", "build", "--clean") -Label "heft build --clean"

    Write-Host ""
    Write-Host "Datasource generado sin errores." -ForegroundColor Green
    Write-Host "Lista: $($spec.Lista)"
    Write-Host ""
    Write-Host "Archivos creados: $($script:CreatedFiles.Count)"
    foreach ($path in $script:CreatedFiles) { Write-Host "  + $path" }
    Write-Host "Archivos modificados: $($script:ModifiedFiles.Count)"
    foreach ($path in $script:ModifiedFiles) { Write-Host "  ~ $path" }

    if ($script:SkippedFields.Count -gt 0) {
        Write-Host ""
        Write-Host "Campos omitidos (tipo fuera de la tabla de mapeo soportada):" -ForegroundColor Yellow
        foreach ($field in $script:SkippedFields) { Write-Host "  - $field" }
    }

    if ($script:Warnings.Count -gt 0) {
        Write-Host ""
        Write-Host "Avisos:" -ForegroundColor Yellow
        foreach ($warning in $script:Warnings) { Write-Host "  - $warning" }
    }

    Write-Host ""
    Write-Host "Log: $($script:LogPath)"
}
catch {
    Write-Host ""
    Write-Host "No se pudo generar el datasource." -ForegroundColor Red
    Write-Host "Etapa: $($script:CurrentStage)"

    if (-not [string]::IsNullOrWhiteSpace($script:LastCommand)) {
        Write-Host "Último comando: $($script:LastCommand)"
    }

    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Log: $($script:LogPath)"
    Write-Host "No se realizó rollback ni commit. El programador puede restaurar los cambios mediante Git."
    exit 1
}
finally {
    if ($script:LocationPushed) {
        Pop-Location -ErrorAction SilentlyContinue
    }
}
