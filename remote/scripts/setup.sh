#! /bin/ash

export GIT_SSL_NO_VERIFY=1

# setup wifi

# grab node version

curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -

# install apt packages

opkg update
opkg upgrade
opkg install $(cat apt-packages) -y

# install node packages

npm install -g pm2

# change to application root

cd ../

# install node

#cd /tmp
#wget https://nodejs.org/dist/v7.4.0/node-v7.4.0-linux-armv7l.tar.gz
#tar -xvzf node-v7.4.0-linux-armv7l.tar.gz 
#cp -R ./node-v7.4.0-linux-armv7l/* /usr/local/

# curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
# sudo apt-get install -y nodejs

# install app
mkdir ~/app
cd ~/app
git clone https://git:94a5f15648a4d8a2cff4bc3fb534a84b6ab9f1a5@github.com/gunderson/lit-jacket.git .

npm install