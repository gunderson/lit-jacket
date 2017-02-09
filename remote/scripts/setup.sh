#! /bin/ash

export GIT_SSL_NO_VERIFY=1

# setup wifi

# setup firewall

# grab node version

curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -

# install apt packages

sudo apt-get update
sudo apt-get install $(cat apt-packages) -y

# install app
mkdir ~/app
cd ~/app
git clone https://git:94a5f15648a4d8a2cff4bc3fb534a84b6ab9f1a5@github.com/gunderson/lit-jacket.git .

# install node packages
npm install
npm install -g pm2 gulp