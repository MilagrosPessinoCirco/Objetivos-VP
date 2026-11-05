@echo off
cd /d "%~dp0"
echo Iniciando prototipo Gestion de Objetivos VP RRII en http://localhost:8765 ...
start "" http://localhost:8765/index.html
where py >nul 2>nul && (py -m http.server 8765 & goto :eof)
where python >nul 2>nul && (python -m http.server 8765 & goto :eof)
npx --yes serve -l 8765 .
