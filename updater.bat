@echo off
echo Waiting for application to close
timeout 5


echo Connecting to update server
timeout 5




echo Installing Updates
timeout 5


echo Relaunching Application
npm run start
exit

