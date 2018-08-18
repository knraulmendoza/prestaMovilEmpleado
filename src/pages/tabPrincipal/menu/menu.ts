import { Component, ViewChild } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  ModalController,
  Nav,
  LoadingController
} from "ionic-angular";
import { iCobro, iCuadre, iGastos } from "../../../interfaces/interfaces";

import { TabsPage } from "../tabs/tabs";
import { LogueoService } from "../../../services/logueo.service";
import { LoginPage } from "../../login/login";
import { GlobalService } from "../../../services/globales.service";
import { BdService } from "../../../services/bd.service";
import { ClientesPage } from "../../clientes/clientes";
/**
 * Generated class for the MenuPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-menu",
  templateUrl: "menu.html"
})
export class MenuPage {
  @ViewChild("content") public nav: Nav;
  cobroSelect: string;
  selectCobro: boolean;
  cobros: iCobro[];
  getCobro: string = "";
  rootPage: any = TabsPage;
  listaBotones = [];
  fecha = new Date(); //`${new Date().getDate()}/${new Date().getMonth()+1}/${new Date().getFullYear()}`
  listaPages = [
    { titulo: "Cobro", component: TabsPage ,icon:'albums'},
    { titulo: "Clientes", component: ClientesPage ,icon:'contacts'}
  ];

  constructor(
    public logueoSer: LogueoService,
    public globalSer: GlobalService,
    public navCtrl: NavController,
    public navParams: NavParams,
    public db: BdService,
    public loading: LoadingController,
    public modal: ModalController
  ) {
    this.obtenerCuadre();
  }

  public showPage(page) {
    this.nav.setRoot(page);
  }

  public obtenerCuadre() {
    let dateHoy = `${this.fecha.getDate()}/${this.fecha.getMonth() +
      1}/${this.fecha.getFullYear()}`;
    this.globalSer.getCuadre = {
      cobro: "",
      abonados: 0,
      baseInicial: 0,
      fecha: "",
      gastos: [],
      prestados: 0,
      id: ""
    };
    this.db
      .selectWhere("cuadre", "cobro", this.globalSer.getCobro.id,1)
      .subscribe((res:iCuadre[]) => {
        this.fecha.setDate(this.fecha.getDate() - 1);
        let dateAfter = `${this.fecha.getDate()}/${this.fecha.getMonth() +
          1}/${this.fecha.getFullYear()}`;

        if (res.length > 0) {
          let gasto=0;
          let cuadre:iCuadre=res[res.length-1];
          if (cuadre.fecha == "") {
            res[res.length-2].gastos.forEach((gast: iGastos) => {
              gasto += gast.dinero;
            });
            this.globalSer.getCuadre = res[res.length-1];
            this.globalSer.getCuadre.baseInicial = res[res.length-2].baseInicial - res[res.length-2].prestados - gasto+res[res.length-2].abonados;
          }else{
            cuadre.gastos.forEach((gast: iGastos) => {
              gasto += gast.dinero;
            });
            this.globalSer.getCuadre = res[res.length-1];
          }
        }else{
          // if (this.globalSer.getCuadre.cobro == "") {
            this.globalSer.getCuadre.baseInicial = this.globalSer.getCobro.dinerInicial;
            this.globalSer.getCuadre.fecha = dateHoy;
          // }
        }
      });
  }
  public cerrarSesion() {
    this.logueoSer.cerrarSesion().then(() => {
      let cargando = this.loading.create({
        content: "Cerrando sesión",
        duration: 4000
      });
      cargando.present().then(() => {
        setTimeout(() => {
          this.navCtrl.setRoot(LoginPage);
          cargando.dismiss();
        }, 3000);
      });
    });
  }
}
