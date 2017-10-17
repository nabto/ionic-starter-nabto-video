import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { NabtoDevice } from '../../app/device.class';
import { NabtoService } from '../../app/nabto.service';
import { DeviceSettingsPage } from '../device-settings/device-settings';

declare var NabtoError;

@IonicPage()
@Component({
  selector: 'page-mjpg-player',
  templateUrl: 'mjpg-player.html'
})
export class MjpgPlayerPage {
  
  device: NabtoDevice;
  timer: any;
  spinner: any;
  url: string;
  tunnel: string;
  remotePort: number = 8081;
  videoIsOk: boolean = false;

  constructor(private navCtrl: NavController,
              private nabtoService: NabtoService,
              private toastCtrl: ToastController,
              private navParams: NavParams) {
    this.device = navParams.get('device');
    this.timer = undefined;
    this.url = "assets/img/spinner.gif";
  }

  ionViewDidEnter() {
    this.showStream();
  }

  ionViewWillLeave() {
    this.nabtoService.closeTunnel(this.tunnel)
      .then(() => {
        console.log(`Tunnel ${this.tunnel} closed`);
      })
      .catch(() => {
        console.log(`Error: Tunnel ${this.tunnel} could not be closed`);
      });
  }

  showStream() {
    this.nabtoService.openTunnel(this.device.id, this.remotePort)
      .then((res: any) => {
        console.log(`Tunnel ${res.tunnelId} connected, portnum is ${res.localPort}, state is ${res.state}`);
        this.tunnel = res.tunnelId;
        this.videoIsOk = true;
        this.url = `http://127.0.0.1:${res.localPort}/`;
      }).catch(error => {
        this.showToast(error.message);
      });
  }

  showToast(message: string) {
    var opts = <any>{
      message: message,
      showCloseButton: true,
      closeButtonText: 'Ok',
      duration: 4000
    };
    let toast = this.toastCtrl.create(opts);
    toast.present();
  }
  
  showSettingsPage() {
    this.navCtrl.push('DeviceSettingsPage', {
      device: this.device
    });
  }

  badImage() {
    this.videoIsOk = false;
  }

  goodImage() {
    this.videoIsOk = true;
  }
  
  home() {
    this.navCtrl.popToRoot();
  }
  
}
