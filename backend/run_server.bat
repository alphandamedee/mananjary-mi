@echo off
cd /d "%~dp0"
"C:/Users/ALPHAND/Documents/Antambahoaka Connect/mananjary-mi/.venv/Scripts/uvicorn.exe" main:app --host 0.0.0.0 --port 8000
pause
