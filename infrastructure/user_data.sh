#!/bin/bash
set -e

# Update system packages
apt-get update
apt-get upgrade -y

# Install essential packages
apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    unzip \
    jq

# Install Docker (for containerized deployments)
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo \
  "deb [arch=arm64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Start and enable Docker
systemctl start docker
systemctl enable docker

# Add ubuntu user to docker group
usermod -aG docker ubuntu

# Install Node.js 20.x (LTS) for ARM64
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Create application directory
mkdir -p /opt/grand-archive-api
chown -R ubuntu:ubuntu /opt/grand-archive-api

# Configure firewall (UFW)
ufw --force enable
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow ${api_port}/tcp

# Create systemd service placeholder
cat > /etc/systemd/system/grand-archive-api.service <<EOF
[Unit]
Description=Grand Archive API Server
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/grand-archive-api
Environment=NODE_ENV=production
Environment=PORT=${api_port}
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable the service (will fail to start until application is deployed)
systemctl daemon-reload

# Install CloudWatch agent for enhanced monitoring
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/arm64/latest/amazon-cloudwatch-agent.deb
dpkg -i -E ./amazon-cloudwatch-agent.deb
rm amazon-cloudwatch-agent.deb

# Set up automatic security updates
apt-get install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades

# Create deployment helper script
cat > /usr/local/bin/deploy-api.sh <<'DEPLOY_SCRIPT'
#!/bin/bash
# Helper script for deploying the API application
set -e

REPO_URL="${1:-}"
APP_DIR="/opt/grand-archive-api"

if [ -z "$REPO_URL" ]; then
    echo "Usage: $0 <repository-url>"
    exit 1
fi

cd "$APP_DIR"

# Clone or update repository
if [ -d ".git" ]; then
    git pull
else
    cd /opt
    rm -rf grand-archive-api
    git clone "$REPO_URL" grand-archive-api
    cd grand-archive-api
fi

# Install dependencies
npm ci --production

# Restart service
systemctl restart grand-archive-api

echo "Deployment complete!"
DEPLOY_SCRIPT

chmod +x /usr/local/bin/deploy-api.sh

# Log completion
echo "User data script completed at $(date)" > /var/log/user-data-completion.log
