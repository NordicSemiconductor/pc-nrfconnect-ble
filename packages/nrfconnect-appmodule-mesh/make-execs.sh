#!/bin/bash
# Write errors to stderr
errcho() { printf "%s\n" "$*" >&2; }
# Generate dir name based on time to avoid name collisions
tmp_dir=".tmp-"$(date | shasum | head -c16)
# Name of install scripts in other repos
repo_script="make-exec.sh"
# Match the name in a repo url
repo_regex='/([^/]+)(\.git)$'

REPOS=(
    https://github.com/martinhath/rtt-logger.git
    https://github.com/NordicSemiconductor/nRF5-multi-prog.git
    https://github.com/nordicsemiconductor/pc-nrfutil.git
)

# Create .tmp directory
if [[ -a $tmp_dir ]]; then
    # We should 'never' come here
    errcho "The directory '$tmp_dir' already exists!"
    exit 1
fi
mkdir $tmp_dir

# Create output directory
if [[ ! -a "bin" ]]; then
    mkdir "bin/"
fi

# Loop over each repo, clone it, and run its build script, if
# it exists. If it doesn't exist, something is probably wrong.
for repo in ${REPOS[@]}; do
    echo "Installing $repo"
    if [[ ! $repo =~  $repo_regex ]]; then
        errcho "Could not extract the name out of repository."
        errcho "Skipping $repo"
        continue
    fi

    dir_name=${BASH_REMATCH[1]}
    git clone -q $repo $tmp_dir/$dir_name >/dev/null
    if [[ $? -ne 0 ]]; then
        errcho "Failed to clone $repo ."
        continue
    fi

    # If we have a script, and there is no script in the repo,
    # copy it over.
    if [[ -x "scripts/$dir_name.sh" &&\
        ! -x "$tmp_dir/$dir_name/$repo_script" ]]; then
        cp "scripts/$dir_name.sh" $tmp_dir/$dir_name/$repo_script
    fi

    # Check if there is a runable install.sh script
    if [[ -x "$tmp_dir/$dir_name/$repo_script" ]]; then
        # Couldn't get the script to run correctly (it kept putting
        # files in pc-yggdrasil/), so we'll use `cd` for now.
        cd $tmp_dir/$dir_name/
        ./$repo_script
        cd ../..
        cp -r $tmp_dir/$dir_name/bin .
    else
        errcho "Did not find an install script"
        errcho "Expected an executable file '$repo_script' in $dir_name/"
        errcho "or a file 'scripts/$dir_name.sh'"
    fi

    # Clean up
    rm -rf "$tmp_dir/$dir_name"
done

# The directory should be empty by now.
rmdir $tmp_dir
