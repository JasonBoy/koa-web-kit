#!/usr/bin/env bash
#Create by Jason <jasonlikenfs@gmail.com>
#This is meant for production
# > ./deploy.sh skipInstall skipBuild skipServer

#using node >= 7.6
#nvm use 8
#source $HOME/.nvm/nvm.sh; nvm use 8

echo $(which node)
echo $(which pm2)

#Simple script to run app quickly
NodeVersion=$(node -v)
if [[ $? != 0 ]]; then
	#nodejs not installed yet
	echo ERROR: nodejs is not installed currently, pls install nodejs to continue
	exit
else
  echo node/${NodeVersion}, npm/$(npm -v)
#  echo yarn/$(yarn -v)
fi

#remove the freaking package-lock.json
#rm -f package-lock.json

#uncoment this if you are in China...
#TaobaoRegistry="http://registry.npm.taobao.org/"
#NpmRegistry=$(npm config get registry)
#npm config set registry ${TaobaoRegistry}
#if [ "$TaobaoRegistry" != "$NpmRegistry" ]; then
#  echo changing npm registry to taobao registry "$TaobaoRegistry"
#  npm config set registry "$TaobaoRegistry"
#fi

#export SASS_BINARY_SITE=https://npm.taobao.org/mirrors/node-sass/

#installing npm modules
if [[ $1 != "1" ]]; then
  echo installing npm modules...
  npm install --no-shrinkwrap
#  yarn install --production=false
fi

if [[ $2 != "1" ]]; then
#webpack is bundling modules
echo webpack is bundling modules...
npm run prod
echo ===build finished===
#yarn run prod
fi

#if skipBuild is false
if [[ $3 != "1" ]]; then
  export NODE_ENV=production

  PMVersion=$(pm2 -v)
  if [[ $? != 0 ]]; then
    echo ERROR: pls install pm2 to continue...
    exit
  #  echo installing pm2...
  #  npm install -g pm2
  fi

  ClientScript="app.js"
  #For just make it to ClientScript
  RunScript=${ClientScript}
  ClusterNumber=0
  if [[ $2 != "" ]]; then
    ClusterNumber=$2
  fi

  echo NODE_ENV: ${NODE_ENV}
  echo Using ${RunScript}

  echo "Using pm2 [$(which pm2)]"

  pm2 reload ecosystem.config.js --update-env --env production

fi
