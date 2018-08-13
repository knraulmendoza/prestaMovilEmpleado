import { Component } from '@angular/core';
import { CuadrePage } from '../cuadre/cuadre';
import { PendientePage } from '../../prestamos/pendiente/pendiente';


@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  cobro = PendientePage;
  cuadre = CuadrePage
}
