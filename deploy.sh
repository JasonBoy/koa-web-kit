#!/usr/bin/env bash
#Create by Jason <jasonlikenfs@gmail.com>
#This is meant for production
# > ./deploy.sh moduleName clusterNumber skipInstall skipBuild skipServer
ModuleName="app"
AppName=${ModuleName}
#Get/Set module name from argv
if [[ $# != 0 && $1 != "" ]]; then
  AppName=$1
fi

#using node >= 7.6
#nvm use 8
#source $HOME/.nvm/nvm.sh; nvm use 8

echo $(which node)
echo $(which pm2)

#echo ${AppName} $#
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
TaobaoRegistry="http://registry.npm.taobao.org/"
NpmRegistry=$(npm config get registry)
npm config set registry ${TaobaoRegistry}
if [ "$TaobaoRegistry" != "$NpmRegistry" ]; then
  echo changing npm registry to taobao registry "$TaobaoRegistry"
  npm config set registry "$TaobaoRegistry"
fi

#export SASS_BINARY_SITE=https://npm.taobao.org/mirrors/node-sass/

#installing npm modules
if [[ $3 != "1" ]]; then
  echo installing npm modules...
  npm install --no-shrinkwrap
#  yarn install --production=false
fi

if [[ $4 != "1" ]]; then
#webpack is bundling modules
echo webpack is bundling modules...
npm run prod
echo ===build finished===
#yarn run prod
fi

#if skipBuild is false
if [[ $5 != "1" ]]; then
  export NODE_ENV=production

  PMVersion=$(pm2 -v)
  if [[ $? != 0 ]]; then
    echo ERROR: pls install pm2 to continue.[sudo npm install -g pm2]
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

  #check if app is running
  AppStatus=$(pm2 show "$AppName" | grep -o "$AppName")
  echo NODE_ENV: ${NODE_ENV}
  echo using ${RunScript}

  if [[ ${AppStatus} != "" ]]; then
    echo ${AppName} is running, reloading ${AppName}
    pm2 reload ${AppName}
  else
    echo ${AppName} is not running, starting ${AppName}
    pm2 start ${RunScript} --no-vizion --name ${AppName} -i ${ClusterNumber}
  fi
fi
