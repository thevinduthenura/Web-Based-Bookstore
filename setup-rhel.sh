#!/usr/bin/env bash
# ==============================================================================
# Sarasavi Pages Bookstore - Automated Red Hat (RHEL/CentOS/Rocky/Alma) Setup
# ==============================================================================
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}   Sarasavi Pages - Automated RHEL Setup Script      ${NC}"
echo -e "${BLUE}======================================================${NC}"

# Check for root / sudo
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}[!] Please run this script with sudo or as root:${NC}"
  echo "    sudo bash $0"
  exit 1
fi

TARGET_USER="${SUDO_USER:-$USER}"

echo -e "\n${YELLOW}[1/6] Updating system packages...${NC}"
dnf update -y --refresh

echo -e "\n${YELLOW}[2/6] Installing essential utilities (git, curl, wget, tar, unzip)...${NC}"
dnf install -y git curl wget tar unzip

echo -e "\n${YELLOW}[3/6] Installing OpenJDK 17 (Java Development Kit)...${NC}"
dnf install -y java-17-openjdk-devel

echo -e "\n${YELLOW}[4/6] Installing Node.js 20 (LTS) & npm...${NC}"
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
dnf install -y nodejs

echo -e "\n${YELLOW}[5/6] Installing Docker CE and Docker Compose Plugin...${NC}"
# Remove old or conflicting packages if any
dnf remove -y docker docker-client docker-client-latest docker-common docker-latest docker-latest-logrotate docker-logrotate docker-engine || true

# Add official Docker CE repo
dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo || true

# Install Docker CE & Compose
dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin --nobest --allowerasing

# Start and enable Docker
systemctl enable --now docker

# Add non-root user to docker group
if [ -n "$TARGET_USER" ] && [ "$TARGET_USER" != "root" ]; then
    usermod -aG docker "$TARGET_USER"
    echo -e "${GREEN}[✓] Added user '$TARGET_USER' to docker group.${NC}"
fi

echo -e "\n${YELLOW}[6/6] Configuring Firewall (ports 3000, 8080, 5432)...${NC}"
if systemctl is-active --quiet firewalld; then
    firewall-cmd --permanent --add-port=3000/tcp
    firewall-cmd --permanent --add-port=8080/tcp
    firewall-cmd --permanent --add-port=5432/tcp
    firewall-cmd --reload
    echo -e "${GREEN}[✓] Firewall ports 3000, 8080, and 5432 opened.${NC}"
else
    echo -e "${YELLOW}[i] firewalld is not active, skipping port rules.${NC}"
fi

echo -e "\n${GREEN}======================================================${NC}"
echo -e "${GREEN}   Installation Completed Successfully!              ${NC}"
echo -e "${GREEN}======================================================${NC}"
echo -e "Installed Versions:"
echo -n "  Java:    "; java -version 2>&1 | head -n 1
echo -n "  Node:    "; node -v
echo -n "  npm:     "; npm -v
echo -n "  Docker:  "; docker --version
echo -n "  Compose: "; docker compose version
echo -e "${GREEN}======================================================${NC}"
echo -e "${YELLOW}NOTE: If you ran this as a non-root user via sudo, please log out and log back in (or run 'newgrp docker') for Docker permissions to take effect.${NC}\n"
