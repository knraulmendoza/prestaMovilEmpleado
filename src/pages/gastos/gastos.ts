import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,ToastController } from 'ionic-angular';
import { iGastos, iCuadre } from '../../interfaces/interfaces';
import { GlobalService } from '../../services/globales.service';
import { BdService } from '../../services/bd.service';

/**
 * Generated class for the GastosPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-gastos',
  templateUrl: 'gastos.html',
})
export class GastosPage {
  fecha= new Date();
  fechaHoy:string;
  gastos=[
    {id:1,name:'Gasolina'},
    {id:2,name:'Aceite'},
    {id:3,name:'Accidente'},
    {id:0,name:'Otro'},
  ]
  listaGastos:iGastos[]=[];
  gasto:number=-1;
  otroGasto:string;
  dinero:number=0;
  cuadreId:string='';
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public globalSer:GlobalService,
    public toast:ToastController,
    public db:BdService) {
    this.listaGastos = globalSer.showGastos();
    this.fechaHoy=`${this.fecha.getDate()}/${this.fecha.getMonth()+1}/${this.fecha.getFullYear()}`;
    this.listaGasto();
  }

  public listaGasto(){
    this.db.selectWhere('cuadre','cobro',this.globalSer.getCobro.id,2,'fecha',this.globalSer.getCuadre.fecha).subscribe((res:iCuadre[])=>{
      if(res.length > 0 ) {
        this.cuadreId = res[0].id;
        let gastos:iGastos[]=[];
        res[0].gastos.forEach((gast:iGastos) => {
          gastos.push(gast);
        });
        this.listaGastos = gastos;
      }
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GastosPage');
  }

  public addGasto(){
    let gast:iGastos={name:this.otroGasto,dinero:parseInt(this.dinero.toString())};
    // this.listaGastos.push(gast)
    
    if (this.globalSer.getCuadre.fecha != this.fechaHoy) {
      this.listaGastos.push(gast);
      let cuadre:iCuadre={cobro:this.globalSer.getCobro.id,abonados:0,baseInicial:0,fecha:'',gastos:this.listaGastos,prestados:0,id:''};
      let addCuadre;
      if (this.cuadreId == '') addCuadre = this.db.add('cuadre',cuadre,2,this.db.generarId());
      else addCuadre= this.db.add('cuadre',cuadre,2,this.cuadreId)
      addCuadre.then(()=>{
        this.toast.create({
          message:'Gasto registrado correctamente',
          duration:3000
        }).present();
      })
      .catch(()=>{
        this.toast.create({
          message:'El Gasto no se pudo registrar',
          duration:3000
        }).present();
      })
    }else {
      this.toast.create({
        message:'Ya no puede registrar más gastos',
        duration:3000
      }).present();
    }
  }
  public selectGasto(e){
    this.gastos.forEach(gas => {
      if (e == gas.id) this.otroGasto = gas.name;
    });
  }
}
