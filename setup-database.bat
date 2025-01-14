@echo off
echo Configurando o banco de dados...

set MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 9.1\bin\mysql.exe"

if not exist %MYSQL_PATH% (
    echo Erro: MySQL91 não encontrado em %MYSQL_PATH%
    echo Por favor, verifique se o MySQL91 está instalado corretamente.
    exit /b 1
)

echo MySQL encontrado em: %MYSQL_PATH%
echo Executando script SQL...

%MYSQL_PATH% -h localhost -P 3306 -u root -p"Thierry8585!" --default-character-set=utf8mb4 < src/server/database/setup.sql

if errorlevel 1 (
    echo Erro ao executar o script SQL.
    echo Verifique se:
    echo 1. O MySQL está rodando
    echo 2. A senha do root está correta
    echo 3. Você tem permissões de administrador
    exit /b 1
)

echo Banco de dados configurado com sucesso! 