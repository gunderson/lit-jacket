#! /bin/ash

export GIT_SSL_NO_VERIFY=1

# setup users

cat ./etc/passwd >> /etc/passwd

# install apt packages

apt-get update
apt-get upgrade
apt-get install $(cat apt-packages) -y

# setup wifi

cat ./etc/wpa_supplicant.conf >> /etc/wpa_supplicant.conf

# setup hostname and zeroconf

cp -f ./etc/hostname /etc/hostname
cp -f ./etc/avahi/avahi-daemon.conf /etc/avahi/avahi-daemon.conf

# alias nodejs to node

cd /usr/bin
ln -s node nodejs

# install app
mkdir /app
cd /app
git clone --depth 1 https://94a5f15648a4d8a2cff4bc3fb534a84b6ab9f1a5@github.com/gunderson/lit-jacket.git .
npm i -g pm2 gulp-cli node-sass babel-cli
npm i