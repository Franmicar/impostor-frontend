param(
    [Parameter(Mandatory=$true)]
    [string]$Domain
)

$Domain = $Domain.Trim()
if ($Domain -notmatch "\.[a-zA-Z]{2,}$") {
    $Domain = "$Domain.com"
}

try {
    # Resolver DNS del dominio. Si tiene registros A, está registrado.
    $dns = Resolve-DnsName -Name $Domain -ErrorAction Stop -Type A
    $status = "Registrado"
    $details = "Encontrados registros DNS A activos para el dominio."
} catch {
    # Si falla la resolución, puede estar disponible
    $status = "Posiblemente Disponible"
    $details = "No se encontraron registros DNS activos. Puede estar libre o sin zona DNS configurada."
}

$output = @{
    domain = $Domain
    status = $status
    details = $details
    timestamp = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
}

Write-Output ($output | ConvertTo-Json)
