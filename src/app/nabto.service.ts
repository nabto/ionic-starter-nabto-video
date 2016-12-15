import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { NabtoDevice } from './device.class';
import { Storage } from '@ionic/storage';
import { Http, Response } from '@angular/http';
import { BookmarksService } from '../app/bookmarks.service';

declare var nabto;
declare var NabtoError;

//let FP_ACL_PERMISSION_NONE                  = 0x00000000;
//let FP_ACL_PERMISSION_ALL                   = 0xffffffff;
//let FP_ACL_PERMISSION_LOCAL_ACCESS          = 0x80000000;
let FP_ACL_PERMISSION_REMOTE_ACCESS         = 0x40000000;
let FP_ACL_PERMISSION_ADMIN                 = 0x20000000;
//let FP_ACL_SYSTEM_PERMISSION_NONE           = 0x00000000;
//let FP_ACL_SYSTEM_PERMISSION_ALL            = 0xffffffff;
//let FP_ACL_SYSTEM_PERMISSION_LOCAL_ACCESS   = 0x80000000;
let FP_ACL_SYSTEM_PERMISSION_REMOTE_ACCESS  = 0x40000000;
let FP_ACL_SYSTEM_PERMISSION_PAIRING        = 0x20000000;

@Injectable()
export class NabtoService {

  private pkPassword: string = "empty"; // see comment on createKeyPair() below
  private lastUser: string;
  private initialized: boolean;
  
  constructor (private storage: Storage,
               private http: Http,
               private bookmarksService: BookmarksService,
               private platform: Platform) {
    this.initialized = false;
    document.addEventListener('pause', () => {
      this.onPause();
    });
    document.addEventListener('resume', () => {
      this.onResume();
    });
    document.addEventListener('resign', () => {
      this.onResign();
    });
  }

  onResume() {
        console.log("resumed, invoking nabto.startup");
    this.startupAndOpenProfile();
  }

  onResign() {
    if (this.platform.is('ios')) {
      // this event is also fired when notification center is shown
      // etc. - and there is no opposite event, meaning that we cannot
      // start again, hence the reason for introducing the initalized
      // flag
      console.log("Resigning, invoking nabto.shutdown");
      this.shutdown();
    } else {
      console.log("odd, only iOS should get this event");
    }
  }

  onPause() {
    if (!this.platform.is('ios')) {
      // native plugins cannot be invoked in ios pause event (hence resign above)
      console.log("Pausing, invoking nabto.shutdown");
      this.shutdown();
    }
  }

  
  //
  // NOTE: Keypair is stored directly on the filesystem with dummy
  // encryption (common password) - if necessary, encrypt with either
  // user provided password (more complex user experience) or protect
  // with a random password (e.g. through window.crypto.getRandomValues)
  // which is then stored in the platform's keystore.
  //
  // A Cordova plugin for accessing the native platform's secure
  // storage to store and retrieve such generated random password is
  // available at https://github.com/Crypho/cordova-plugin-secure-storage.
  //
  // However, please note that this approach only works well on iOS -
  // on Android, the keystore is completely nuked when the user
  // changes security settings as outlined here:
  // https://doridori.github.io/android-security-the-forgetful-keystore/
  //
  // The consequences must be carefully explained to the user - hence
  // per default, we have not enabled this.
  //
  public createKeyPair(username: string): Promise<string> {
    return new Promise((resolve, reject) => {
      nabto.createKeyPair(username, this.pkPassword, (error) => {
        if (!error) {
          console.log("nabto.createKeyPair succeeded");
          this.storage.set('username', username);    
          resolve(username)
        } else {
          console.log(`nabto.createKeyPair failed: ${error} (code=${error.code}, inner=${error.inner})`);
          reject(error);
        }
      });
    });
  }
  public startup(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      nabto.startup((err) => {
        if (!err) {
          console.log("Nabto started (without profile)");
          resolve();
        } else {
          console.log(`Could not start Nabto: ${err.message}`);
          reject(new Error(err.message));
        }
      });
    });
  }
  
  public startupAndOpenProfile(certificate?: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (certificate) {
        this.lastUser = certificate; // save for later suspend/resume cycle
      } else {
        if (this.lastUser) {
          certificate = this.lastUser;
        } else {
          reject(new Error("Startup never invoked with a certificate"));
          return;
        }
      }
      nabto.startupAndOpenProfile(certificate, this.pkPassword, (err) => {
        if (!err) {
          this.initialized = true; 
          this.injectInterfaceDefinition().then(resolve).catch(reject);
        } else {
          if (err == 'API_OPEN_CERT_OR_PK_FAILED') {
            reject(new Error('BAD_PROFILE'));
          } else {
            console.log(`Could not start Nabto and open profile "${certificate}": ${err.message}`);
            reject(new Error(err.message));
          } 
        }
      });
    });
  }
  
  private injectInterfaceDefinition(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.http.get("nabto/unabto_queries.xml")
        .toPromise()
        .then((res: Response) => {
          nabto.rpcSetDefaultInterface(res.text(), (err: any) => {
            if (!err) {
              console.log("nabto started and interface set ok!")
              resolve();
            } else {
              console.log(JSON.stringify(err));
              reject(new Error("Could not inject device interface definition: " + err.message));
            }
          })
        })
        .catch((err) => {
          console.log(err);
          reject(new Error("Could not load device interface definition: " + err));
        });
    });
  }

  public shutdown(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      nabto.shutdown((err) => {
        if (!err) {
          console.log("nabto.shutdown ok");
          this.initialized = false;
          resolve();
        } else {
          console.log("nabto.shutdown failed");
          reject(new Error(err.message));
        }
      });
    });
  }
  
  public discover(): Promise<NabtoDevice[]> {
    return new Promise((resolve, reject) => {
      nabto.getLocalDevices((error: any, deviceIds: any) => {
        if (error) {
          console.log("getLocalDevices() failed: " + error);
          reject(new Error("Discover failed: " + error.message));
          return;
        }
//	this.prepareInvoke(deviceIds).then(() => {
	  let devices = [];
	  for(let i = 0; i < deviceIds.length; i++) {
	    devices.push(this.getPublicDetails(deviceIds[i]));
	  }
	  Promise.all(devices).then((res: NabtoDevice[]) => {
	    for(let i = 0; i < res.length; i++) {
	      console.log(`got devices ${i}: ${res[i].id}, ${res[i].iconUrl}, ${res[i].product}, ${res[i].name}`);
	    }
	    resolve(res);
	  });
//	});
      });
    });
  }
  
  private getPublicDetails(deviceId: string): Promise<NabtoDevice> {
    return new Promise((resolve, reject) => {
      let url = "nabto://" + deviceId + "/get_public_device_info.json?";
      console.log(`Retrieving public details through ${url}`);
      nabto.rpcInvoke(url, (err, details) => {
        if (!err) {
          let r = details.response;
          let dev:NabtoDevice = new NabtoDevice(r.device_name,
                                                deviceId,
                                                r.device_type,
                                                r.device_icon,
                                                r.paired,
                                                r.pairingMode
                                               );
          console.log("resolving promise with public info from RPC: " + JSON.stringify(dev));
          resolve(dev);
        } else {
          console.error(`public info could not be retrieved for ${deviceId}: ${JSON.stringify(err)}`);
          resolve(new NabtoDevice(deviceId, deviceId, err.message));
        }
      });
    });
  }

  private buildParamString(input: any): string {
    let params = [];
    for (let key in input) {
      if (input.hasOwnProperty(key)) {
        let val = input[key];
        params.push(`${key}=${val}`);
      }
    }
    return params.join("&");
  }

  public prepareInvoke(devices: string[]): Promise<void> {
    return new Promise((resolve,reject) => {
      nabto.prepareInvoke(devices, (error) => {
	if(error){
	  reject(new Error("PrepareConnect failed: " + error.message));
	  return
	}
	resolve();
      });
    });
  }

  public readDeviceSecuritySettings(device: NabtoDevice) {
    return new Promise((resolve, reject) => {
      this.invokeRpc(device, "get_user_permissions.json")
        .then((user: any) => {
          device.currentUserIsOwner = ((user.permissions & FP_ACL_PERMISSION_ADMIN) == FP_ACL_PERMISSION_ADMIN);
          return this.invokeRpc(device, "get_system_security_settings.json");
        })
        .then((system: any) => {
          device.remoteAccessEnabled = ((system.remote_access_enabled & FP_ACL_SYSTEM_PERMISSION_REMOTE_ACCESS) ==
                                        FP_ACL_SYSTEM_PERMISSION_REMOTE_ACCESS);
          device.openForPairing = ((system.permissions & FP_ACL_SYSTEM_PERMISSION_PAIRING) ==
                                   FP_ACL_SYSTEM_PERMISSION_PAIRING);
          device.grantGuestRemoteAccess = ((system.default_user_permissions_after_pairing & FP_ACL_PERMISSION_REMOTE_ACCESS) ==
                                           FP_ACL_PERMISSION_REMOTE_ACCESS);
          console.log("Added security settings to device: " + JSON.stringify(device));
          resolve(device);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  
  public invokeRpc(device: NabtoDevice, request: string, parameters?: any): Promise<NabtoDevice> { // NabtoDevice??
    return new Promise((resolve, reject) => {
      let paramString = "";
      if (parameters) {
        paramString = this.buildParamString(parameters);
      }
      if (this.initialized) {
        this.doInvokeRpc(device, request, paramString).then(resolve).catch(reject);
      } else {
        this.startupAndOpenProfile().then(() => {
          return this.doInvokeRpc(device, request, paramString).then(resolve).catch(reject);
        }).catch(reject);
      }
    });
  }

  private doInvokeRpc(device: NabtoDevice, request: string, paramString: string): Promise<NabtoDevice>  {
    return new Promise((resolve, reject) => {
      nabto.rpcInvoke(`nabto://${device.id}/${request}?${paramString}`, (err, res) => {
        if (!err) {
          resolve(res.response);
        } else {
          if (err.code == NabtoError.Code.API_RPC_COMMUNICATION_PROBLEM) {
            // retry on this specific error (API will have flushed connection and re-connect)
            nabto.rpcInvoke(`nabto://${device.id}/${request}?${paramString}`, (err, res) => {
              if (!err) {
                resolve(res.response);
              } else {
                if (err.code == NabtoError.Code.API_CONNECT_TIMEOUT) {
                  // work around for NABTO-1330: if ec 1000026 follows after 2000058 it usually is because of target device has gone offline in between two invocations
                  err.code = NabtoError.Code.API_RPC_DEVICE_OFFLINE;
                }
                reject(err);
              }
            });
          } else {
            reject(err);
          }
        }
      });
    });
  }
}


