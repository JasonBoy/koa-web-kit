#!/usr/bin/env bash
#Create by Jason <jasonlikenfs@gmail.com>
#This is meant for production
# > ./deploy.sh skipInstall skipBuild skipServer

##Using node >= 8
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

##Remove the freaking package-lock.json
#rm -f package-lock.json

##Installing npm modules
if [[ $1 != "1" ]]; then
  ##=====Uncomment script below if you are in China=====
  #TaobaoRegistry="http://registry.npm.taobao.org/"
  #NpmRegistry=$(npm config get registry)
  #if [ "$TaobaoRegistry" != "$NpmRegistry" ]; then
  #  echo changing npm registry to taobao registry: "$TaobaoRegistry"
  #  npm config set registry "$TaobaoRegistry"
  #fi
  ##Change SASS binary site to taobao
  #export SASS_BINARY_SITE=https://npm.taobao.org/mirrors/node-sass/

  echo installing npm modules...
  ##Don't install based on the package-lock.json by default, instead, only refer to package.json
  ##Change at your own risk
  npm install --no-shrinkwrap
#  yarn install --production=false
fi

if [[ $2 != "1" ]]; then
##webpack is bundling modules
echo webpack is bundling modules...
npm run build
npm run ssr
echo =====Build Finished=====
#yarn run build
fi

##Start server with pm2
if [[ $3 != "1" ]]; then
  export NODE_ENV=production

  PM2Version=$(pm2 -v)
  if [[ $? != 0 ]]; then
    echo ERROR: pls install pm2 to continue...
    exit
  fi

  echo NODE_ENV: ${NODE_ENV}
  echo "Using pm2: [$(which pm2)]"

  pm2 reload pm2.config.js --update-env --env production
fi
