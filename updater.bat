@echo off
echo Waiting for application to close
timeout 5


echo Connecting to update server





echo Installing Updates
npm install


echo Relaunching Application
npm run start
exit

