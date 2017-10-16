import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MjpgPlayerPage } from './mjpg-player';
@NgModule({
  declarations: [MjpgPlayerPage],
  imports: [IonicPageModule.forChild(MjpgPlayerPage)],
})
export class MjpgPlayerPageModule { }
