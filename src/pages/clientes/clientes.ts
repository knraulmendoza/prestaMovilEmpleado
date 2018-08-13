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

  clientes:any[]=[];
  cancelados:number=0;
  activos:number=0;
  can=[]
  constructor(public navCtrl: NavController, public navParams: NavParams, public db: BdService,public globalSer:GlobalService) {
    this.listaClientes();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ClientesPage');
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
            prestamo.resta = pago.resta;
        this.clientes[ind].prestamos.push(prestamo);
      }
    } else {
      cli.prestamos = [];
      prestamo = pres;
      if (pago != null) {
          prestamo.resta = pago.resta;
      }
      cli.prestamos.push(prestamo);
      this.clientes.push(cli);
    }

    // return bandera;
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
      console.log(this.clientes.length)
      let clients = this.clientes;
      clients.forEach(element => {
        console.log(element)
      });
      // let ind;
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
        console.log(this.clientes[res.index])
      });
      
    });
  }

  public abrirCliente(i:number){
    this.clientes[i].open = !this.clientes[i].open;
  }

}
