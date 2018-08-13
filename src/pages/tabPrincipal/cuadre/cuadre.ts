import { Component } from '@angular/core';
import { NavController, ToastController, AlertController } from 'ionic-angular';
import { BdService } from '../../../services/bd.service';
import { GlobalService } from '../../../services/globales.service';
import { iUsuario,iPrestamos,iPagos,iCuadre, iGastos } from '../../../interfaces/interfaces';
import { GastosPage } from '../../gastos/gastos';

@Component({
  selector: 'page-cuadre',
  templateUrl: 'cuadre.html'
})
export class CuadrePage {
  fecha= new Date();
  fechaHoy:string;
  fechaManiana:string;
  count:number[]=[0,0,0,0]
  dinero:number[]=[0,0,0,this.globalSer.getCuadre.baseInicial,0,0];
  total:number=0;
  gastos:iGastos[];
  constructor(
    public navCtrl: NavController,
    public db: BdService,
    public globalSer: GlobalService,
    public toast:ToastController,
    public alerta:AlertController
  ) {
    this.fechaHoy=`${this.fecha.getDate()}/${this.fecha.getMonth()+1}/${this.fecha.getFullYear()}`;
    this.fecha.setDate(this.fecha.getDate()+1);
    this.fechaManiana=`${this.fecha.getDate()}/${this.fecha.getMonth()+1}/${this.fecha.getFullYear()}`;
    this.countClientes();
  }
  public countClientes(){
    this.db.selectWhere('cuadre','cobro',this.globalSer.getCobro.id,1).subscribe((res:iCuadre[])=>{
      let gasto:number=0;
      if (res.length >0) {
        let cuadre:iCuadre=res[res.length-1];
        if (cuadre.fecha == "") {
          cuadre.gastos.forEach((gast:iGastos) => {
            gasto+=gast.dinero;
          });
        }else{
          if (cuadre.fecha == this.fechaHoy) {
            cuadre.gastos.forEach((gast:iGastos) => {
              gasto+=gast.dinero;
            });
            this.total = (cuadre.baseInicial-cuadre.prestados-gasto)+cuadre.abonados;
          }
        }
      }
      this.db.selectWhere('cliente','cobro',this.globalSer.getCobro.id,1).subscribe((cliList)=>{
        this.dinero=[0,0,(gasto/1000),(this.globalSer.getCuadre.baseInicial/1000),0,0];
        this.count=[0,0,0,0];
        cliList.forEach((cli:iUsuario)=>{
          if (cli.fecha == this.fechaHoy) this.count[3]++;//this.clientesNuevos++;
          cli.prestamos.forEach((pres:iPrestamos)=>{
            if (pres.fechaInicio == this.fechaHoy) {
                let inte = `1.${pres.interes}`
                this.count[2]++;
                this.dinero[1]+=((pres.countPrestamo)/(parseFloat(inte))/1000);
            }
              let tablaPago = this.db.getDatos('pagos',cli.id,0,pres.id);
              tablaPago.ref.get().then(ok => {
                if (ok.exists) {
                  tablaPago.valueChanges().subscribe(res => {
                    // this.dinero[0]=0;
                    // this.count[0]=0
                    // this.count[1]=0
                    if (res.pagos) {
                      let pagado: iPagos = res.pagos[res.pagos.length - 1];
                      if (pagado.fechaPago == this.fechaHoy) {
                        this.dinero[0]+=(pagado.pago/1000);
                        if (pagado.resta==0) this.count[1]++;
                        else this.count[0]++;
                      }
                      this.dinero[5]=((this.dinero[3]-this.dinero[1]-this.dinero[2])+this.dinero[0]);
                    }
                  })
                }//else {
                //   console.log('no ha realizado pagos')
                // }
              })
          })
        })
        
      })
    })
    
  }
  ionViewDidEnter() {
    
    this.db.selectWhere('cuadre','cobro',this.globalSer.getCobro.id,2,'fecha',this.globalSer.getCuadre.fecha).subscribe((res:iCuadre[])=>{
      this.dinero[2]=0;
      if(res.length > 0 ) {
        let gasto:iGastos[]=[];
        res[0].gastos.forEach((gast:iGastos) => {
          console.log(res[0]);
          this.dinero[2] += (gast.dinero/1000);
          gasto.push(gast);
        });
        this.gastos = gasto;
      }
    })
  } 
  cuadreJSON(array:number[]){
    return {
      cobro:this.globalSer.getCobro.id,
      abonados:array[0]*1000,
      prestados:array[1]*1000,
      gastos:this.gastos,
      baseInicial:array[3]*1000,
      fecha:this.fechaHoy
    } as iCuadre;
  }
  toastMensaje(mensaje:string,duration:number,css:string){
    this.toast.create({
      message: mensaje,
      duration: duration,
      cssClass:css
    }).present();
  }
  public saveCuadre(){
    this.alerta.create({
      title:'Guardar Cuadre',
      message:'Retifique los datos antes de guardar',
      buttons:[
        {
          text:'Guardar',
          handler:()=>{
            let cuadre = this.cuadreJSON(this.dinero);
            if (cuadre.fecha != this.globalSer.getCuadre.fecha) {
              if (this.globalSer.getCuadre.baseInicial != this.dinero[3]) {
                this.db.add('cuadre',cuadre,2,this.globalSer.getCuadre.id)
                .then(()=>{
                  this.globalSer.getCobro.dinerFinal = this.dinero[5]*1000; 
                  this.db.updateDinerFinal(this.globalSer.getCobro)
                  .then(()=>{
                    this.toastMensaje('Se ha guardado con exito',4000,'toast-success');
                  })
                })
                .catch(()=>{
                  this.toastMensaje('Hubo problemas al guardar',4000,'toast-error');
                })
              }else this.toastMensaje('No hay ningun datos en el cuadre',3000,'toast-error');
            }else this.toastMensaje('Ya se ha guardado el cuadre en el dia de hoy',4000,'toast-error')
          }
        }
      ]
    }).present();
    
  }

  public openGastos(){
    this.navCtrl.push(GastosPage);
  }

}