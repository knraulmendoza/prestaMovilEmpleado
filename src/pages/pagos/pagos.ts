import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  AlertController,
  ToastController,
  ViewController,
  Events
} from "ionic-angular";
import { iUsuario, iPrestamos, iPagos } from "../../interfaces/interfaces";
import { BdService } from "../../services/bd.service";
import { GlobalService } from "../../services/globales.service";

/**
 * Generated class for the PagosPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-pagos",
  templateUrl: "pagos.html"
})
export class PagosPage {
  menu = "pagos";
  cliente: iUsuario;
  prestamo: iPrestamos[];
  fech = new Date();
  fecha = (
    this.fech.getDate() +
    "/" +
    (this.fech.getMonth() + 1) +
    "/" +
    this.fech.getFullYear()
  ).toString();
  selecPrestamo: string;
  pago: iPagos;
  pagos: iPagos[] = [];
  restante: number;
  prestamos: iPrestamos[] = [];
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public alerta: AlertController,
    public toast: ToastController,
    public db: BdService,
    public globalSer: GlobalService,
    public events: Events,
    public view: ViewController
  ) {
    this.cliente = navParams.get("client");
    if (this.cliente.prestamos.length == 1) {
      this.prestamo = this.cliente.prestamos;
      this.listaPagos(this.prestamo[0].id.toString());
    }else this.listaPrestamos();
    
    // this.listaPagos();
  }
  listaPrestamos() {
    this.prestamos=[];
    this.cliente.prestamos.forEach((pres:iPrestamos) => {
      this.prestamos.push(pres)
    });
    // this.db.selectWhere("cliente", "cc", cc)
    // .subscribe(cliList => {
    //   let presta = [];
    //   cliList.forEach((cli: iUsuario) => {
    //     cli.prestamos.forEach((pres: iPrestamos) => {
    //       presta.push(pres);
    //     });
    //   });
    //   this.prestamos = presta;
    // });
  }
  buscarPrestamo(idPres) {
    this.prestamos.forEach((pres: iPrestamos, index) => {
      if (pres.id == idPres) {
        this.prestamos[index].state = true;
      }
    });
  }
  listaPagos(id) {
    
    this.db
      .getDatos("pagos", this.cliente.id, 0, id)
      .valueChanges()
      .subscribe(res => {
        let pages = [];
        if (res) {
          this.restante = this.prestamo[0].countPrestamo;
          res.pagos.forEach(pag => {
            this.restante -= pag.pago;
            pag.resta = this.restante;
            pages.push(pag);
          });
        }
        this.pagos = pages;
      });
  }

  filtrarPrestamos(e) {
    this.prestamo = this.cliente.prestamos.filter(pre => pre.id == e);
  }

  mensaje(text: string, duracion: number, css?: string) {
    this.toast
      .create({
        message: text,
        duration: duracion,
        cssClass: css
      })
      .present();
  }
  public selectPrestamo(e) {
    this.filtrarPrestamos(e);
    this.listaPagos(e);
  }
  public pagar() {
    this.alerta
      .create({
        title: "Abonar",
        inputs: [{ name: "pagar", placeholder: "Dinero a pagar" }],
        buttons: [
          {
            text: "Ok",
            handler: data => {
              let abono = data.pagar * 1000;
              let resta: number = 0;
              // this.restante -= abono
              if (this.pagos.length == 0) {
                resta = this.prestamo[0].countPrestamo;
              } else resta = this.pagos[this.pagos.length - 1].resta;

              if (abono > resta) {
                this.mensaje(
                  "El valor a pagar es mayor a lo que debe",
                  3000,
                  "toast-error"
                );
              } else {
                resta -= abono;

                this.pago = {
                  fechaPago: this.fecha,
                  resta: resta,
                  pago: abono,
                  state: true,
                  id: Date.now()
                };

                this.pagos.push(this.pago);
                this.db
                  .add(
                    "pagos",
                    this.pagos,
                    3,
                    null,
                    this.cliente.id,
                    this.prestamo[0].id.toString()
                  )
                  .then(() => {
                    this.pagos = [];
                    this.listaPagos(this.prestamo[0].id.toString());
                    this.mensaje(`El cliente abono ${abono}`,3000,'toast-success')
                  })
                  .catch(() => {
                    console.error("error");
                  });
                if (this.pagos[this.pagos.length - 1].resta == 0) {
                  this.prestamo[0].state = true;
                  this.buscarPrestamo(this.prestamo[0].id);
                  this.db
                    .updatePrestamo("cliente", this.prestamos, this.cliente.id)
                    .catch(() => {
                      console.error("no se pudo cancelar");
                    });
                }
              }
            }
          }
        ]
      })
      .present();
    // }
    // }
  }

  cerrar() {
    // this.view.dismiss();
    this.events.publish("reloadDetails");
    this.navCtrl.popToRoot();
  }
  public delete(indice:number) {
    this.alerta.create({
      title:'contraseña',
      inputs:[{name:'password',placeholder:'Digite la contraseña',type:'password'}],
      buttons:[
      {
        text:'confirmar',
        handler:data=>{
          if (data.password == 123456) {
            this.alerta.create({
              title:'Eliminar Pago',
              message:'Esta seguro de modificar este pago?',
              buttons:[
                {
                  text:'Confirmar',
                  handler:()=>{
                    this.pagos.splice(indice,1);
                    this.db.updatePago('pagos',this.pagos,this.cliente.id,this.prestamo[0].id.toString())
                    .then(()=>{
                      this.mensaje('Se ha eliminado correctamente el pago',3000,'toast-success');
                      this.listaPagos(this.prestamo[0].id.toString())
                    })
                    .catch(()=>{
                      this.mensaje('No se pudo eliminar el pago',3000,'toast-error')
                    })
                  }
                }
              ]
            }).present();
          }else this.mensaje('Contraseña incorrecta',3000,'toast-error')
        }
      }
    ]
    }).present();
   
  }

  public editar(pago:iPagos) {
    this.alerta.create({
      title:'contraseña',
      inputs:[{name:'password',placeholder:'Digite la contraseña',type:'password'}],
      buttons:[
      {
        text:'confirmar',
        handler:data=>{
          if (data.password == 123456) {
            this.alerta.create({
              title:'Actualizar pago',
              inputs:[{name:'newPago',placeholder:'Digite el nuevo pago'}],
              buttons:[
                {
                  text:'Actualizar',
                  handler:datos=>{
                    this.alerta.create({
                      title:'Modificar Pago',
                      message:'Esta seguro de modificar este pago?',
                      buttons:[
                        {
                          text:'Confirmar',
                          handler:()=>{
                            let newPago = datos.newPago*1000;
                            pago.resta += pago.pago;
                            pago.pago = newPago;
                            pago.resta -= newPago;
                            this.db.updatePago('pagos',this.pagos,this.cliente.id,this.prestamo[0].id.toString())
                            .then(()=>{
                              this.mensaje('se ha editado correctamente',3000,'toast-success');
                              this.listaPagos(this.prestamo[0].id.toString())
                            })
                            .catch(()=>{
                              this.mensaje('No se pudo editar el pago',3000,'toast-error')
                            })
                          }
                        }
                      ]
                    }).present();
                    
                  }
                }
              ]
            }).present();
          }else this.mensaje('Contraseña incorrecta',3000,'toast-error')
        }
      }
    ]
    }).present();
    
  }
}
