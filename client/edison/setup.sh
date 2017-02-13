#! /bin/bash
# https://github.com/catmaker/chippy/wiki/Ubilinux-Post-Installation

# Update aptitude
apt-get update
apt-get upgrade

# install node
curl -sL https://deb.nodesource.com/setup_6.x | bash -
apt-get install -y nodejs

# install globals
npm i -g gulp pm2

#install app
mkdir /app
cd /app
git clone https://github.com/gunderson/lit-jacket.git .
cd client
npm i

# setup wifi