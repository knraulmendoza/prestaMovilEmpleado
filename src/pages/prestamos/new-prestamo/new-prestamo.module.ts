import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NewPrestamoPage } from './new-prestamo';

@NgModule({
  declarations: [
    NewPrestamoPage,
  ],
  imports: [
    IonicPageModule.forChild(NewPrestamoPage),
  ],
})
export class NewPrestamoPageModule {}
