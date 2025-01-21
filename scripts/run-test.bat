@echo off
REM 请求管理员权限
powershell -Command "Start-Process cmd -Verb RunAs -ArgumentList '/c cd /d %~dp0\.. && scripts\build-test.bat'" 