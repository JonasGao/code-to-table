<#
.SYNOPSIS
    Deploy script for code-to-table application
.DESCRIPTION
    This script packages the build directory, uploads it to a remote server via SCP,
    and extracts it to the specified deployment path.
.PARAMETER Server
    The SSH server address (e.g., "example.com" or "192.168.1.100")
.PARAMETER Port
    The SSH port (default: 22)
.PARAMETER Username
    The SSH username (optional)
.PARAMETER DeploymentPath
    The remote deployment path (e.g., "/var/www/html")
.PARAMETER BuildDir
    The build directory to package (default: "build")
.PARAMETER TempDir
    Temporary directory for packaging (default: ".deploy_temp")
.EXAMPLE
    .\deploy.ps1 -Server "example.com" -Username "deploy" -DeploymentPath "/var/www/html"
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$Server,
    
    [int]$Port = 22,
    
    [Parameter(Mandatory=$false)]
    [string]$Username,
    
    [Parameter(Mandatory=$true)]
    [string]$DeploymentPath,
    
    [string]$BuildDir = "out",
    
    [string]$TempDir = ".deploy_temp"
)

# Check if required tools are available
$requiredTools = @("scp", "ssh")
foreach ($tool in $requiredTools) {
    if (!(Get-Command $tool -ErrorAction SilentlyContinue)) {
        Write-Error "Required tool '$tool' not found. Please ensure it's installed and in PATH."
        exit 1
    }
}

# Validate build directory exists
if (-not (Test-Path $BuildDir)) {
    Write-Error "Build directory '$BuildDir' not found."
    exit 1
}

# Create temporary directory
if (-not (Test-Path $TempDir)) {
    New-Item -ItemType Directory -Path $TempDir -Force
}

try {
    # Create tar.gz archive of build directory
    $timestamp = Get-Date -Format "yyyyMMddHHmmss"
    $archiveName = "build_$timestamp.tar.gz"
    $archivePath = Join-Path $TempDir $archiveName
    
    Write-Host "Creating archive: $archiveName" -ForegroundColor Green
    
    # Using tar to create compressed archive
    $tarProcess = Start-Process -FilePath "tar" -ArgumentList @("-czf", $archivePath, "-C", $BuildDir, ".") -PassThru -Wait
    if ($tarProcess.ExitCode -ne 0) {
        Write-Error "Failed to create archive: $($tarProcess.StandardError.ReadToEnd())"
        exit 1
    }
    
    Write-Host "Archive created successfully: $archivePath" -ForegroundColor Green
    
    # Upload archive via SCP
    Write-Host "Uploading to server..." -ForegroundColor Green
    
    # Build SCP command based on whether username is provided
    if ([string]::IsNullOrWhiteSpace($Username)) {
        $scpArgs = @("-P", $Port, $archivePath, "$($Server):$($archiveName)")
        Write-Host "Using SCP without username" -ForegroundColor Yellow
    } else {
        $scpArgs = @("-P", $Port, $archivePath, "$($Username)@$($Server):$($archiveName)")
    }
    
    $scpProcess = Start-Process -FilePath "scp" -ArgumentList $scpArgs -PassThru -Wait
    if ($scpProcess.ExitCode -ne 0) {
        Write-Error "Failed to upload file: $($scpProcess.StandardError.ReadToEnd())"
        exit 1
    }
    
    Write-Host "Upload completed successfully" -ForegroundColor Green
    
    # SSH to server and extract archive
    Write-Host "Extracting archive on remote server..." -ForegroundColor Green
    
    # Build SSH command based on whether username is provided
    if ([string]::IsNullOrWhiteSpace($Username)) {
        $sshCmd = "mkdir -p `"$DeploymentPath`" && tar -xzf `"$archiveName`" -C `"$DeploymentPath`" && rm `"$archiveName`""
        $sshArgs = @("-p", $Port, "$($Server)", $sshCmd)
        Write-Host "Using SSH without username" -ForegroundColor Yellow
    } else {
        $sshCmd = "mkdir -p `"$DeploymentPath`" && tar -xzf `"$archiveName`" -C `"$DeploymentPath`" && rm `"$archiveName`""
        $sshArgs = @("-p", $Port, "$($Username)@$($Server)", $sshCmd)
    }
    
    $sshProcess = Start-Process -FilePath "ssh" -ArgumentList $sshArgs -PassThru -Wait
    if ($sshProcess.ExitCode -ne 0) {
        Write-Error "Failed to extract archive on remote server: $($sshProcess.StandardError.ReadToEnd())"
        exit 1
    }
    
    Write-Host "Deployment completed successfully!" -ForegroundColor Green
    Write-Host "Files deployed to: $DeploymentPath" -ForegroundColor Green
    
}
catch {
    Write-Error "Deployment failed: $_"
    exit 1
}
finally {
    # Cleanup temporary files
    if (Test-Path $archivePath) {
        Remove-Item $archivePath -Force
        Write-Host "Cleaned up temporary archive: $archivePath" -ForegroundColor Yellow
    }
    
    # Remove temp directory if empty
    if (Test-Path $TempDir) {
        $items = Get-ChildItem $TempDir -Force
        if ($null -eq $items) {
            Remove-Item $TempDir -Force
            Write-Host "Removed temporary directory: $TempDir" -ForegroundColor Yellow
        }
    }
}