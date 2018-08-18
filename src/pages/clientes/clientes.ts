import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { iUsuario, iPrestamos, iPagos } from '../../interfaces/interfaces';
import { BdService } from '../../services/bd.service';
import { GlobalService } from '../../services/globales.service';

/**
 * Generated class for the ClientesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-clientes',
  templateUrl: 'clientes.html',
})
export class ClientesPage {
  dateHoy = `${new Date().getDate()}/${new Date().getMonth()+1}/${new Date().getFullYear()}`;
  clientes:any[]=[];
  clientesAux:any[]=[];
  cancelados:number=0;
  activos:number=0;
  can=[];
  search: string = "";
  color="secondary";
  constructor(public navCtrl: NavController, public navParams: NavParams, public db: BdService,public globalSer:GlobalService) {
    this.listaClientes();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ClientesPage');
  }

  public restarFecha(f1, f2): number{
    var aFecha1 = f1.split("/");
    var aFecha2 = f2.split("/");
    var fFecha1 = Date.UTC(aFecha1[2], aFecha1[1] - 1, aFecha1[0]);
    var fFecha2 = Date.UTC(aFecha2[2], aFecha2[1] - 1, aFecha2[0]);
    var dif = fFecha1 - fFecha2;
    var dias = Math.floor(dif / (1000 * 60 * 60 * 24));
    return dias;
  }
  mensaje(f1,f2){
    let res = this.restarFecha(f1,f2);
    let respuesta = {msg:null,color:null};
    if (res < 0) {
      respuesta = {msg:'A',color:'pago'};
    } else {
      respuesta = {msg:'Ok',color:'primary'};
    }
    return respuesta;
  }
  buscarCLiente(cli: iUsuario, pres: iPrestamos, pago: iPagos) {
    let bandera = false;
    let prestamo;
    let ind = -1;
    this.clientes.forEach((cliente, index) => {
      if (cli.id.localeCompare(cliente.id) == 0) {
        bandera = true;
        prestamo = pres;
        ind = index;
      }
    });
    if (bandera) {
      if (ind != -1) {
        if (pago != null) {
          prestamo.resta = pago.resta;
          prestamo.fechaPago = pago.fechaPago;
        }
        this.clientes[ind].prestamos.push(prestamo);
      }
    } else {
      cli.prestamos = [];
      prestamo = pres;
      if (pago != null) {
        prestamo.resta = pago.resta;
        prestamo.fechaPago = pago.fechaPago;
      }
      cli.prestamos.push(prestamo);
      this.clientes.push(cli);
    }
    this.canAndAct();
    // return bandera;
  }
  canAndAct(){
    let canc=0;
      let act=0;
      this.can=[];
      this.clientes.forEach((cliente, index) => {
        canc=0;
        act=0;
        cliente.prestamos.forEach(pres => {
          if (pres.resta == 0) canc++;
          else act++;
        });
        // ind = index;
        this.can.push({index:index,cancelados:canc,activos:act});
      });
      this.can.forEach(res => {
        this.clientes[res.index].cancelados=res.cancelados;
        this.clientes[res.index].activos=res.activos;
      });
  }
  public listaClientes(){
    this.db.selectWhere('cliente','cobro',this.globalSer.getCobro.id,1).subscribe((res)=>{
      let cliente=[];
      res.forEach((clien:iUsuario) => {
        cliente.push(clien)
        clien.prestamos.forEach((pres:iPrestamos) => {
          let tablaPago = this.db.getDatos("pagos", clien.id, 0, pres.id);
          tablaPago.ref.get().then(ok => {
            if (ok.exists) {
              tablaPago.valueChanges().subscribe(res => {
                let pagado: iPagos = res.pagos[res.pagos.length - 1];
                this.buscarCLiente(clien,pres,pagado);
              });
            }else this.buscarCLiente(clien,pres,null);
          })
        });
      });
      this.clientesAux = this.clientes;
    });
  }

  public abrirCliente(i:number){
    this.clientes[i].open = !this.clientes[i].open;
  }

  public searchCLiente() {
    this.clientesAux = this.clientes;
    this.clientesAux = this.clientes.filter(cli => {
      return (
        cli.name.toLowerCase().indexOf(this.search.toLowerCase()) > -1 ||
        cli.lastName.toLowerCase().indexOf(this.search.toLowerCase()) > -1 ||
        cli.cc.indexOf(this.search) > -1
      );
    });
  }

}
