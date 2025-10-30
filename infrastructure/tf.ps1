# tf.ps1
param (
    [Parameter(Position = 0, Mandatory = $true)]
    [string]$Command,

    [Parameter(Position = 1)]
    [string[]]$Args
)

# Wczytaj zmienne środowiskowe z pliku .env
Get-Content .env | ForEach-Object {
    if ($_ -match '^\s*#' -or $_ -match '^\s*$') { return } # pomiń komentarze i puste linie
    $parts = $_ -split '=', 2
    if ($parts.Count -eq 2) {
        $key = $parts[0].Trim()
        $value = $parts[1].Trim()
        Set-Item -Path "Env:$key" -Value $value
    }
}

Write-Host "Using credentials from .env - terraform $Command $Args"
terraform $Command @Args
