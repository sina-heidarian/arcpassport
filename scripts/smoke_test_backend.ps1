$ErrorActionPreference = "Stop"

$BaseUrl = "http://localhost:8000"
$SampleWallet = "0x4f982AbB319Afb4b5E7c164E7A97A45968a90681"

function Invoke-SmokeRequest {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name,

        [Parameter(Mandatory = $true)]
        [string]$Method,

        [Parameter(Mandatory = $true)]
        [string]$Url,

        [object]$Body = $null
    )

    try {
        $params = @{
            Method = $Method
            Uri = $Url
        }

        if ($null -ne $Body) {
            $params.ContentType = "application/json"
            $params.Body = ($Body | ConvertTo-Json -Depth 6)
        }

        $response = Invoke-RestMethod @params
        Write-Host "PASS $Name" -ForegroundColor Green
        return $response
    }
    catch {
        Write-Host "FAIL $Name" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red

        if ($_.ErrorDetails.Message) {
            Write-Host $_.ErrorDetails.Message -ForegroundColor Red
        }

        exit 1
    }
}

Invoke-SmokeRequest `
    -Name "Root" `
    -Method "GET" `
    -Url "$BaseUrl/"

Invoke-SmokeRequest `
    -Name "Health" `
    -Method "GET" `
    -Url "$BaseUrl/health"

Invoke-SmokeRequest `
    -Name "Passport" `
    -Method "GET" `
    -Url "$BaseUrl/passport/$SampleWallet"

Invoke-SmokeRequest `
    -Name "Leaderboard" `
    -Method "GET" `
    -Url "$BaseUrl/leaderboard"

Invoke-SmokeRequest `
    -Name "Stats" `
    -Method "GET" `
    -Url "$BaseUrl/stats"

Invoke-SmokeRequest `
    -Name "Deployments" `
    -Method "GET" `
    -Url "$BaseUrl/deployments/$SampleWallet"

Invoke-SmokeRequest `
    -Name "Circle Status" `
    -Method "GET" `
    -Url "$BaseUrl/circle/status"

Invoke-SmokeRequest `
    -Name "Circle Wallets Status" `
    -Method "GET" `
    -Url "$BaseUrl/circle/wallets/status"

Invoke-SmokeRequest `
    -Name "Circle Paymaster Status" `
    -Method "GET" `
    -Url "$BaseUrl/circle/paymaster/status"

Invoke-SmokeRequest `
    -Name "Passport NFT Status" `
    -Method "GET" `
    -Url "$BaseUrl/api/v1/passport-nft/status"

Invoke-SmokeRequest `
    -Name "Passport NFT Contract Info" `
    -Method "GET" `
    -Url "$BaseUrl/api/v1/passport-nft/contract-info"

Invoke-SmokeRequest `
    -Name "Passport NFT Ownership" `
    -Method "GET" `
    -Url "$BaseUrl/api/v1/passport-nft/$SampleWallet/ownership"

Invoke-SmokeRequest `
    -Name "Passport NFT Token URI" `
    -Method "GET" `
    -Url "$BaseUrl/api/v1/passport/$SampleWallet/token-uri"

# These Circle endpoints are mock blueprint checks only. They do not call
# mutating Circle APIs, deploy real contracts, mint NFTs, or send transactions.
Invoke-SmokeRequest `
    -Name "Mock Circle Contract Deploy" `
    -Method "POST" `
    -Url "$BaseUrl/circle/contracts/deploy" `
    -Body @{
        wallet = $SampleWallet
        contract_type = "counter"
        name = "Counter"
        description = "Smoke test deploy"
    }

Invoke-SmokeRequest `
    -Name "Mock Circle Wallet Create" `
    -Method "POST" `
    -Url "$BaseUrl/circle/wallets/create" `
    -Body @{
        owner_wallet = $SampleWallet
        wallet_type = "developer"
    }

Invoke-SmokeRequest `
    -Name "Mock Paymaster Estimate" `
    -Method "POST" `
    -Url "$BaseUrl/circle/paymaster/estimate" `
    -Body @{
        wallet = $SampleWallet
        action = "deploy_contract"
    }

Write-Host "Backend smoke test completed successfully." -ForegroundColor Green
