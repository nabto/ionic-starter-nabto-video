fastlane documentation
================
# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```
xcode-select --install
```

Install _fastlane_ using
```
[sudo] gem install fastlane -NV
```
or alternatively using `brew cask install fastlane`

# Available Actions
## iOS
### ios install
```
fastlane ios install
```
Build debug version and install on connected device
### ios beta
```
fastlane ios beta
```
Build release version and upload to testflight
### ios build_release
```
fastlane ios build_release
```

### ios update_generated_project
```
fastlane ios update_generated_project
```


----

## Android
### android beta
```
fastlane android beta
```

### android build_sign
```
fastlane android build_sign
```


----

This README.md is auto-generated and will be re-generated every time [fastlane](https://fastlane.tools) is run.
More information about fastlane can be found on [fastlane.tools](https://fastlane.tools).
The documentation of fastlane can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
