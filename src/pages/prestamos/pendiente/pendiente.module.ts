import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PendientePage } from './pendiente';

@NgModule({
  declarations: [
    PendientePage,
  ],
  imports: [
    IonicPageModule.forChild(PendientePage),
  ],
})
export class PendientePageModule {}
