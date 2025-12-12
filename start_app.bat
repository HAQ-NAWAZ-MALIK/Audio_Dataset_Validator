@echo off
echo Starting TTS Dataset Collector...
docker-compose up -d
echo.
echo Application started!
echo Opening browser...
timeout /t 5
start http://localhost:3000
pause
