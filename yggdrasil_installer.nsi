; example2.nsi
;
; This script is based on example1.nsi, but it remember the directory,
; has uninstall support and (optionally) installs start menu shortcuts.
;
; It will install example2.nsi into a directory that the user selects,

;--------------------------------

; The name of the installer
Name "Yggdrasil"

; The file to write
OutFile "yggdrasil_installer.exe"

; The default installation directory
InstallDir "$PROGRAMFILES\Nordic Semiconductor\Yggdrasil"

; Request application privileges for Windows Vista
RequestExecutionLevel admin

SetCompress off
SetCompressor /SOLID BZIP2

;--------------------------------

; Pages

; Page components
Page directory
Page instfiles

UninstPage uninstConfirm
UninstPage instfiles

;--------------------------------

; The stuff to install
Section "Yggdrasil (required)"

  SectionIn RO

  ; Set output path to the installation directory.
  SetOutPath $INSTDIR

  ; Put file there
  File /r yggdrasil-win32-ia32\*.*

  ; Write the installation path into the registry
  ; WriteRegStr HKLM SOFTWARE\NSIS_Example2 "Install_Dir" "$INSTDIR"

  ; Write the uninstall keys for Windows
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Yggdrasil" "Yggdrasil" "Yggdrasil"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Yggdrasil" "UninstallString" '"$INSTDIR\uninstall.exe"'
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Yggdrasil" "NoModify" 1
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Yggdrasil" "NoRepair" 1
  WriteUninstaller "uninstall.exe"

SectionEnd

; Optional section (can be disabled by the user)
Section "Start Menu Shortcuts"

  CreateDirectory "$SMPROGRAMS\Nordic Semiconductor"
  CreateDirectory "$SMPROGRAMS\Nordic Semiconductor\Yggdrasil"
  CreateShortcut "$SMPROGRAMS\Nordic Semiconductor\Yggdrasil\Uninstall.lnk" "$INSTDIR\uninstall.exe" "" "$INSTDIR\uninstall.exe" 0
  CreateShortcut "$SMPROGRAMS\Nordic Semiconductor\Yggdrasil\Yggdrasil.lnk" "$INSTDIR\yggdrasil.exe"

SectionEnd

;--------------------------------

; Uninstaller

Section "Uninstall"

  ; Remove registry keys
  ; DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Example2"
  ; DeleteRegKey HKLM SOFTWARE\NSIS_Example2

  ; Remove files and uninstaller
  RMDir /r $INSTDIR
  ; Delete $INSTDIR\uninstall.exe

  ; Remove shortcuts, if any
  RMDir /r "$SMPROGRAMS\Nordic Semiconductor\Yggdrasil"

  ; Remove directories used
  RMDir "$SMPROGRAMS\Nordic Semiconductor"
  RMDir "$INSTDIR"

SectionEnd
