#!/bin/bash

branch=mesh_dfu

git fetch -q origin $branch:$branch
git checkout -q $branch

case "$(uname -s)" in
  Darwin) platform=osx ;;
  Linux) platform=linux ;;
  *) echo 'Not able to detect platform, quitting.'
    exit -1 ;;
esac

# Where we want to put the executable
bin_dir="bin"
bin_name=pc-nrfutil-$platform
python_main=nordicsemi/__main__.py

if !hash pip 2>/dev/null; then
  echo "You need to have 'pip' installed."
  exit 1
fi

if hash virtualenv 2>/dev/null; then
  # Set up virtualenv, unless it is already set up.
  if [[ ! -a venv ]]; then
    virtualenv --python=python2 venv >/dev/null
  fi
  source venv/bin/activate
else
  # Prompt the user for installing all dependencies globally.
  read -p "Did not find 'virtualenv'. Install dependencies globaly? [y/n]" yn
  case ${yn:0:1} in
    y|Y ) ;;
    *) exit 1;;
  esac
fi

pip install -r requirements.txt >/dev/null
pip install pyinstaller >/dev/null

if [[ ! -a $bin_dir ]]; then
  mkdir $bin_dir
fi

# Overwrite file, or should we check and prompt?
pyinstaller -F $python_main --name $bin_name --log-level ERROR
mv dist/$bin_name bin/
