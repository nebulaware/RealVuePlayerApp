#!/bin/bash
#PAUSE TO ALLOW TIME FOR APP TO CLOSE
echo "Waiting for Application to close"
sleep 5s

echo "Connecting to update server"
#UPDATING GIT FILES

git fetch
git reset --hard HEAD
git merge '@{u}'

echo "Installing Updates"
npm install

echo "Relaunching Application"
npm run start

exit