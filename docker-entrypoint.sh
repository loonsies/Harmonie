#!/bin/sh

# Function to copy default files
copy_defaults() {
    local src="/app/defaults/$1"
    local dest="/app/public/$1"
    
    echo "Copying default $1 files..."
    sudo cp -rf "$src"/* "$dest"/
    sudo chown -R nextjs:nodejs "$dest"
}

# Copy defaults for each directory
copy_defaults "avatar"
copy_defaults "icons"
copy_defaults "soundfonts"

# Execute the main container command
exec "$@"