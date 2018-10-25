#!/bin/bash

sudo fastlane add_plugin versioning

# show help
fastlane init

echo ""
echo "To store cert repo credentials locally (prompted first time you run fastlane), "
echo "you may need to unlock your keychain: "
echo "  security -v unlock-keychain -p <password> /Users/`whoami`/Library/Keychains/login.keychain"
echo ""


