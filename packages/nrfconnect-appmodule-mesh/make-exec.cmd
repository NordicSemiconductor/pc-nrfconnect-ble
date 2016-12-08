:: Name:     make-exec.cmd
:: Purpose:  nRF Connect Mesh relies on pre-built exes. This script downloads the source of these exes,
::           builds the source into an exe, and moves each .exe into bin\.
::
:: Note:     See make-exec.sh for Linux/OS X.
::           Most repos include their own make-exec script to build 'themselves'. However, see scripts\ for repos that don't.
::           This script assumes a Windows machine with git, 32-bit Python 2.7, 3.4 or 3.5, and pip installed.

@echo off
setlocal

set this_dir=%CD%
set bin_dir=bin
set temp_build_dir=tmp_build

set repo_script=make-exec.cmd

set REPOS=https://github.com/martinhath/rtt-logger.git https://github.com/NordicSemiconductor/nRF5-multi-prog.git https://github.com/nordicsemiconductor/pc-nrfutil.git

if EXIST %bin_dir% rm -rf %bin_dir%
mkdir %bin_dir%

if EXIST %temp_build_dir% rm -rf %temp_build_dir%
mkdir %temp_build_dir%

rem Loop over each repo, clone it, and run its build script. If it doesn't have a built script, copy in the correct one from scripts\.
for %%a in (%REPOS%) do (
    echo Cloning: %%a

    rem Clone the git repo into temp_build_dir\<repo-name>\
    git clone -q %%a %temp_build_dir%\%%~na

    rem If there is no build script in the repo we just cloned, and we have a script in scripts\, copy it over.
    if exist %this_dir%\%temp_build_dir%\%%~na\%repo_script% (
        echo file exists
    ) else (
        echo %repo_script% doesn't exist so copying from scripts\ to %temp_build_dir%\%%~na\%repo_script%...
        cp %this_dir%\scripts\%%~na.cmd %this_dir%\%temp_build_dir%\%%~na\%repo_script%
    )

    echo Executing %temp_build_dir%\%%~na\%repo_script%
    cd %temp_build_dir%\%%~na
    call %repo_script%
    cd %this_dir%

    rem Move the .exe from the repo we cloned into bin\ where it will be used by the rest of nRF Connect Mesh.
    mv %this_dir%\%temp_build_dir%\%%~na\bin\%%~na.exe %bin_dir%
)

rm -rf %temp_build_dir%
