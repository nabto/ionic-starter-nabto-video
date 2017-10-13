# Ionic Starter for Nabto IoT / AppMyProduct Video Apps

This [Ionic](http://ionicframework.com) Starter demonstrates how to use [AppMyProduct](https://www.appmyproduct.com) for building a video player app. It contains everything to build a production ready IoT app to remote control your own product:

* Device management through local discovery and bookmarks for later access
* RSA fingerprint based pairing of local devices with app for secure remote access
* On-device access control and user management (self-contained, no need for any central configuration)
* Example page for a video player 
* Takes full benefit of the Nabto framework to ensure secure, high performance remote access

Note that the player in this first version is extremely simple and is only capable of showing MJPG
streams, suitable for a simple webcam like described in [this
tutorial](http://www.instructables.com/id/Raspberry-Pi-remote-webcam/).

You can try a pre-built version of the app for iOS and Android, search for "AppMyProduct Video".

<p align="center">
<img border="1" src="images/overview.png">
<img border="1" src="images/player.png">
<img border="1" src="images/acl.png">
</p>

The product specific customization takes place through `./src/pages/mjpg-player` (in the near future a more advanced player component will be added). The app uses the [Nabto Cordova Plugin](https://github.com/nabto/cordova-plugin-nabto) and adds a simpler to use TypeScript and Promise based wrapper (`./src/app/nabto.service.ts`).

To try the app, a video source is need - for instance, follow [this tutorial](http://www.instructables.com/id/Raspberry-Pi-remote-webcam/) to setup a webcam on an RPI. Next, install a uNabto Tunnel on the device - this is outlined in [TEN030 Nabto Tunnels](https://www.nabto.com/downloads/docs/TEN030%20Nabto%20Tunnels.pdf). A more easily accessible blog post describing all necessary steps will soon be published on our blog.

# Ionic note

Please upgrade to at least Ionic 2.2.2 to use the current version of this starter (or you will see a Ionic Storage related failure).

# iOS

## Quick start

On a typical developer workstation, an app can be built with the following steps from this directory:

```console

git clone https://github.com/nabto/ionic-starter-nabto-video.git

sudo ./scripts/ios-install.sh
./scripts/ios-build.sh
./scripts/ios-emulate.sh
```

See more detailed outline below.


## Install

1. Node and NPM must be installed (either through your package manager or from [nodejs.org](https://nodejs.org/en/download/)).
2. Xcode must be installed
3. install cordova: `sudo npm install cordova -g`
4. install ionic: `sudo npm install ionic -g`
5. to enable running on device: `sudo npm install -g ios-deploy --unsafe-perm=true`
6. to enable running on simulator: `sudo npm install -g ios-sim`
7. add the iOS Cordova platform: `ionic cordova platform add ios`

Odd problems during deploy / run can sometimes apparently be remedied by uninstalling `ios-deploy` and `ios-sim` and re-installing. Specifically as of June 2017, a problem is often seen with a Cordova javascript error when launching the simulator. [The problem can be remedied](https://stackoverflow.com/questions/42350505/error-cannot-read-property-replace-of-undefined-when-building-ios-cordova) by running `npm install ios-sim` in `platforms/ios/cordova` (odd why this makes a difference, but it seems to work).


## Build

Only necessary first time and when changing native plugin configuration:

```console
ionic cordova prepare ios

# fix linker problem when using Nabto lib
echo 'OTHER_LDFLAGS = -force_load $(BUILT_PRODUCTS_DIR)/libCordova.a -lstdc++' >> \
  platforms/ios/cordova/build.xcconfig

ionic cordova build ios
```


## Run

The following requires the device to be connected with USB and screen must be unlocked:

```console
ionic cordova run ios --livereload -c -s --debug --device
```

or run on in the simulator:

```console
ionic cordova emulate ios --livereload -c -s --debug
```

Live reload is enabled, allowing you to instantly observe changes in HTML app source files (`*.ts, *.html. *.scss`). While very handy during development, this also means the app will not work on a device that is disconnected from the workstation or if the ionic server is stopped. So if you have problems with the app hanging after start, remove the `--livereload` parameter.

The first time the app is attempted to be run, an error is observed about developer/provisining profile - open the project in xcode and select a profile (also see the troubleshooting section):

```console
./scripts/ios-open-xcode.sh
```

Subsequently, the run command above can be used.

# Android

## Quick start

On a typical developer workstation, an app can be built with the following steps from this directory:

```console
sudo ./scripts/android-install.sh
./scripts/android-build.sh
./scripts/android-emulate.sh
```

Note that for the last step, an Android emulator image must have been configured with adb.

## Install

1. Node and NPM must be installed (either through your package manager or from [nodejs.org](https://nodejs.org/en/download/)).
2. Android Studio must be installed and an emulator device configured 
3. install cordova: `sudo npm install cordova -g`
4. install ionic: `sudo npm install ionic -g`
5. add the Android Cordova platform : `ionic platform add android@latest`

Note that at least version 6.1.1 of cordova-android is necessary as indicated if using Android 7 or newer (otherwise you will see an app signing error).

## Build

Only necessary first time and when changing native plugin configuration:

```console
ionic cordova prepare android
ionic cordova build android
```

## Run

The following requires the device to be connected with USB:

```console
ionic run android --livereload -c -s --debug --device
```

or run using an already configured emulator (note: the emulator is not very useful as it only supports GSM, meaning that bootstrapping through local device discovery does not work):

```console
ionic emulate android --livereload -c -s --debug
```

Live reload is enabled, allowing you to instantly observe changes in HTML app source files (`*.ts, *.html. *.scss`). While very handy during development, this also means the app will not work on a device that is disconnected from the workstation or if the ionic server is stopped. So if you have problems with the app hanging after start, remove the `--livereload` parameter.

# Troubleshooting

## General

### Blank screen stuck at app startup

This has been observed if using an app deployed with the
`--livereload` parameter without being able to reach the live reload
server. So the solution is to either run the app without
`--livereload` or start the server again (see section "Running" above).

It can also be caused by some critical errors in the app at startup -
with modern Ionic tools, this should no longer be an issue though,
such errors would be expclitly reported. If you still observe the
problem, it might yield useful information to attach the Safari web
debugger and view the console.

### Blank screen for 5-10 seconds at app startup

This problem is often observed when using developer builds - the
longer initial startup time is a good tradeof for shorter subsequent
build cycles where AOT optimizations are not performed.

With a production build (`ionic run --prod`), the startup time is
optimized greatly, reducing the initial delay to an insignificant short
time.

### Problems generating icons

When using the [Ionic resources
tool](http://ionicframework.com/docs/cli/icon-splashscreen.html)
(`ionic resource --splash` and `ionic resource --icon`), sometimes
really odd errors about a server upload are seen: The tool uploads
icon and splash base images to a server to slice and dice to match the
individual platform requirements. When the server chokes on input, it
just says "upload error".

So check your input .png files if this error is observed: Compression
should be enabled, interlacing must be disabled.

### Building problems
make sure you have the latest versions of npm and nodejs:
```
apt-get update && apt-get install npm
npm install npm -g
curl -sL https://deb.nodesource.com/setup_6.x | bash -
apt-get install nodejs
```
You may need a symbolic link from nodejs to node:
```
RUN ln -s /usr/bin/nodejs /usr/bin/node
```

## iOS

### Linker error

A linker error like the following means you missed a step in the installation procedure:

```
ld: symbol(s) not found for architecture arm64
clang: error: linker command failed with exit code 1 (use -v to see invocation)
Showing first 200 notices only
Showing first 200 errors only


** ARCHIVE FAILED **


The following build commands failed:

	Ld /Users/nabto/Library/Developer/Xcode/DerivedData/AMP_Heat-befzuqlqcagkojfbuvacxskkiqvh/Build/Intermediates/ArchiveIntermediates/AMP\ Heat/IntermediateBuildFilesPath/AMP\ Heat.build/Debug-iphoneos/AMP\ Heat.build/Objects-normal/arm64/AMP\ Heat normal arm64
```

You need to update the linker settings to force load the Cordova library:

```bash
echo 'OTHER_LDFLAGS = -force_load $(BUILT_PRODUCTS_DIR)/libCordova.a -lstdc++' >> \
  platforms/ios/cordova/build.xcconfig
```

### Signing error

The first time you attempt to run the app, you will see the following error:

```
Error: Error code 65 for command: xcodebuild with args: ..." ... " Signing for "AMP Heat" requires a development team. Select a development team in the project editor" 
```

Before the app can be run, a team must be selected for the project in XCode. If you are new to iOS app development, please see section "iOS Devices" in the [Ionic deployment docs](https://ionicframework.com/docs/v2/setup/deploying) for further instructions.

To fix, open the XCode project:

```console
./scripts/ios-open-xcode.sh
```

Click the project name in the left pane ("AMP Heat" per default) and the corresponding target that appears. On the "General" tab in the "Signing" section, pick a team and a profile.


## Android

### Signing error on Android 7+

Use at least Android 6.1.1 when deploying for Android 7+:

```console
ionic platform add android@6.1.1
```
### Android license not accepted
If you have Android Studio installed, open the sdk manager from Tools->Android->SDK manager and accept licenses as needed. If you only have the Android command line sdk installed, update the SDK manually with:
```
android update sdk --no-ui --all --filter build-tools-25.0.1,android-25,extra-android-m2repository
```
and accept license agreement when prompted.

### ANDROID_HOME not found
set the android environment variables manually:
```
export ANDROID_HOME=/path/to/android-sdk
export PATH=${PATH}:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

### Hints for misc errors observed

HAXM install errors on macOS when preparing emulator: Upgrade bash (even if using brew's bash).

“HAX is not working and emulator runs in emulation mode”: Re-create
emulator image and be careful to always specify the same amount of
memory to use when prompted and specifying on commandline.

Android SDK license errors: Make sure you have accepted the license
for the specific version of the SDK that Ionic uses if multiple
versions are installed (problems observed as Ionic did not support the
newest SDK which was the one that had the license accepted).
