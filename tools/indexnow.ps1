# ═══════════════════════════════════════════════════════════════
#  IndexNow — notifier Bing / Yandex / Ecosia d'une publication
#  Metal Pliage — cree le 28/09/2026
# ═══════════════════════════════════════════════════════════════
#
#  A LANCER APRES CHAQUE PUBLICATION OU MODIFICATION DE PAGE.
#  Sans ca, il faut attendre que le crawler passe de lui-meme.
#
#  Toutes les pages du sitemap :
#      .\tools\indexnow.ps1
#
#  Seulement les pages modifiees (plus poli, et suffisant) :
#      .\tools\indexnow.ps1 -Urls "https://metal-pliage.fr/guides.html"
#
#  Pourquoi Bing : l'audit du 28/09/2026 a mesure 60 visites/mois venant de
#  l'ecosysteme Bing (Ecosia 30 + Yahoo 20 + Copilot 10), soit 11 % du trafic,
#  sans qu'aucun travail n'y ait jamais ete fait.
#
#  La cle 74134642affe7118c6bd0136ae15858d.txt doit rester a la racine du site
#  et contenir exactement son propre nom. Si elle disparait, l'API refuse tout.

param(
    [string[]] $Urls
)

$ErrorActionPreference = 'Stop'

$Key     = '74134642affe7118c6bd0136ae15858d'
$Host_   = 'metal-pliage.fr'
$KeyUrl  = "https://$Host_/$Key.txt"
$Racine  = Split-Path -Parent $PSScriptRoot

# ── Verifier que la cle est bien servie : sans elle, l'API rejette tout ──
try {
    $servi = (Invoke-WebRequest -Uri $KeyUrl -UseBasicParsing).Content.Trim()
} catch {
    Write-Host "ECHEC : la cle n'est pas accessible sur $KeyUrl" -ForegroundColor Red
    Write-Host "Verifier que $Key.txt est bien a la racine du site et deploye."
    exit 1
}
if ($servi -ne $Key) {
    Write-Host "ECHEC : $KeyUrl ne contient pas la cle attendue." -ForegroundColor Red
    Write-Host "Attendu : $Key"
    Write-Host "Servi   : $servi"
    exit 1
}

# ── Liste des URLs : celles passees en parametre, sinon tout le sitemap ──
if (-not $Urls) {
    $sitemap = Join-Path $Racine 'sitemap.xml'
    if (-not (Test-Path $sitemap)) {
        Write-Host "ECHEC : sitemap.xml introuvable dans $Racine" -ForegroundColor Red
        exit 1
    }
    $Urls = ([xml](Get-Content $sitemap -Raw)).urlset.url.loc
}

$corps = @{
    host        = $Host_
    key         = $Key
    keyLocation = $KeyUrl
    urlList     = @($Urls)
} | ConvertTo-Json -Depth 3

Write-Host "Soumission de $($Urls.Count) URL(s) a IndexNow..." -ForegroundColor Cyan

# api.indexnow.org relaie a tous les moteurs participants ; bing.com/indexnow
# est double en secours, les deux sont idempotents.
foreach ($ep in @('https://api.indexnow.org/indexnow', 'https://www.bing.com/indexnow')) {
    try {
        $r = Invoke-WebRequest -Uri $ep -Method POST -Body $corps `
                 -ContentType 'application/json; charset=utf-8' -UseBasicParsing
        # 200 = accepte ; 202 = accepte, validation de la cle en cours
        Write-Host "  $ep -> HTTP $($r.StatusCode)" -ForegroundColor Green
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        Write-Host "  $ep -> HTTP $code" -ForegroundColor Yellow
        Write-Host "     422 = URL hors du domaine declare · 403 = cle invalide · 429 = trop de requetes"
    }
}

Write-Host ""
Write-Host "Fait. Les moteurs passent generalement sous quelques heures a quelques jours." -ForegroundColor Cyan
