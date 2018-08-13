import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  ModalController,
  App,
  AlertController,
  Events
} from "ionic-angular";
import { PagosPage } from "../../pagos/pagos";
import { BdService } from "../../../services/bd.service";
import { iUsuario, iPrestamos, iPagos } from "../../../interfaces/interfaces";
import { NewPrestamoPage } from "../new-prestamo/new-prestamo";
import { GlobalService } from "../../../services/globales.service";

/**
 * Generated class for the PendientePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-pendiente",
  templateUrl: "pendiente.html"
})
export class PendientePage {
  rootNavCtrl: NavController;
  pendientes: iUsuario[] = [];
  pendientesAux: iUsuario[] = [];
  prestamosLen: number = 0;
  clientesLen: number = 0;
  search: string = "";
  fechaActual = `${new Date().getDate()}/${new Date().getMonth() +
    1}/${new Date().getFullYear()}`;
  // resta:number;
  diasFaltantes:number;
  constructor(
    public app: App,
    public navCtrl: NavController,
    public navParams: NavParams,
    public db: BdService,
    public alert: AlertController,
    public globalSer: GlobalService,
    public events: Events,
    public modal: ModalController
  ) {
    this.rootNavCtrl = navParams.get("rootNavCtrl");
    this.listaClientes();
    events.subscribe("reloadDetails", () => {
      //call methods to refresh content
      this.listaClientes();
    });
  }
  public absNum(num:number): number{
    return Math.abs(num);
  }

  public restarFecha(f1, f2): number{
    this.diasFaltantes=0;
    var aFecha1 = f1.split("/");
    var aFecha2 = f2.split("/");
    var fFecha1 = Date.UTC(aFecha1[2], aFecha1[1] - 1, aFecha1[0]);
    var fFecha2 = Date.UTC(aFecha2[2], aFecha2[1] - 1, aFecha2[0]);
    var dif = fFecha1 - fFecha2;
    var dias = Math.floor(dif / (1000 * 60 * 60 * 24));
    this.diasFaltantes = dias;
    return dias;
  }

  buscarCLiente(cli: iUsuario, pres: iPrestamos,resta:number, pago:number) {
    let bandera = {cli:false,pres:false};
    let prestamo;
    let ind = {cli:-1,pres:-1};
    this.pendientes.forEach((cliente, index) => {
      if (cli.id.localeCompare(cliente.id) == 0) {
        bandera.cli = true;
        prestamo = pres;
        ind.cli = index;
        cliente.prestamos.forEach((presta:iPrestamos,index) => {
          if (presta.id == pres.id){
            bandera.pres = true;
            ind.pres = index
          }
        });
      }
    });
    if (bandera.cli) {
      if (bandera.pres) {
        if (pago != null) {
            prestamo.pago = pago;
        }
          prestamo.resta = resta;
          this.pendientes[ind.cli].prestamos[ind.pres] = prestamo;
      }else{
          if (pago != null) {
            prestamo.pago = pago;
          }
          prestamo.resta = resta;
          this.pendientes[ind.cli].prestamos.push(prestamo);
      }
    } else {
      cli.prestamos = [];
      prestamo = pres;
      if (pago != null) {
        prestamo.pago = pago;
      }
      prestamo.resta = resta;
      cli.prestamos.push(prestamo);
      this.pendientes.push(cli);
    }
  }

  public llenarPendientes(cli: iUsuario, pres: iPrestamos, canc: boolean) {
    let tablaPago = this.db.getDatos("pagos", cli.id, 0, pres.id);
    tablaPago.ref.get().then(ok => {
      if (ok.exists) {
        tablaPago.valueChanges().subscribe(res => {
          let pagado: iPagos = res.pagos[res.pagos.length - 1];
          if (pagado.fechaPago != this.fechaActual) {
            //prestamos pendientes
            if (!canc) {
              this.buscarCLiente(cli, pres, pagado.resta,null);
            }
          } else {
            if (canc) {
              this.buscarCLiente(cli, pres, pagado.resta,pagado.pago);
            } else {
              //prestamos abonados en el dia de hoy
              this.buscarCLiente(cli, pres, pagado.resta,pagado.pago);
            }
          }
        });
      } else {
        //prestamo nuevo sin ningun pago
        this.buscarCLiente(cli, pres,pres.countPrestamo, null);
      }
    });
  }

  public listaClientes() {
    this.db.selectWhere("cliente",'cobro',this.globalSer.getCobro.id,1).subscribe(res => {
      this.pendientes = [];
      let clien: iUsuario[] = [];
      let presta: iPrestamos[] = [];
      res.forEach((cli: iUsuario) => {
        cli.prestamos.forEach((pres: iPrestamos) => {
          if (!pres.state) {
            presta.push(pres);
            if (clien.length == 0) {
              clien.push(cli);
            } else {
              let ban = false;
              clien.forEach(clie => {
                if (clie.id == cli.id) {
                  ban = true;
                }
              });
              if (!ban) clien.push(cli);
            }

            this.llenarPendientes(cli, pres, false);
          } else this.llenarPendientes(cli, pres, true);
        });
      });
      this.prestamosLen = presta.length;
      this.clientesLen = clien.length;
      this.pendientesAux = this.pendientes;
    });
  }
  public openPrestamo(cliente: iUsuario) {
    this.app.getRootNav().push(PagosPage, { client: cliente });
  }

  public mPrestamo() {
    this.app.getRootNav().push(NewPrestamoPage);
  }
  public searchCLiente() {
    this.pendientesAux = this.pendientes;
    this.pendientesAux = this.pendientes.filter(cli => {
      return (
        cli.name.toLowerCase().indexOf(this.search.toLowerCase()) > -1 ||
        cli.lastName.toLowerCase().indexOf(this.search.toLowerCase()) > -1 ||
        cli.cc.indexOf(this.search) > -1
      );
    });
  }
  // public resta(pres:iPrestamos,idCli:string):number{
  //   let resta=0;
  //   let tablaPago = this.db.getDatos("pagos", idCli, 0, pres.id);
  //   tablaPago.ref.get().then(ok => {
  //     if (ok.exists) {
  //       tablaPago.valueChanges().subscribe(res => {
  //         let pagado: iPagos = res.pagos[res.pagos.length - 1];
  //         resta = pagado.resta;
  //       });
  //     }
  //   });
  //   return resta;
  // }
}