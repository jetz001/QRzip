#!/bin/bash
echo "Installing QRzip CLI globally..."
npm install -g .
echo "Installation complete! You can now use the 'qrzip' command."
echo "Examples:"
echo '  qrzip gen "Hello World" -m raw'
echo '  qrzip gen "Hello World" -m compress'
echo '  qrzip gen "Hello World" -o mycode.png'
