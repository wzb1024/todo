@echo off
REM 请求管理员权限运行清理
powershell -Command "Start-Process cmd -Verb RunAs -ArgumentList '/c cd /d %~dp0\.. && scripts\build-test.bat --clean'"

REM 等待清理完成
timeout /t 5

REM 运行常规测试
scripts\build-test.bat 