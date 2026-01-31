@echo off
echo Installing server dependencies...
npm install --prefix . express cors jsonwebtoken

echo.
echo Starting backend server...
node server.js
