@REM Maven Wrapper for Windows CMD
@echo off
setlocal
set "DIR=%~dp0"
set "MAVEN_PROJECTBASEDIR=%DIR:~0,-1%"
java "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" -cp "%DIR%.mvn\wrapper\maven-wrapper.jar" org.apache.maven.wrapper.MavenWrapperMain %*
