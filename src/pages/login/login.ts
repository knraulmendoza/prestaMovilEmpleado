import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Network } from "@ionic-native/network";
import { Toast, } from "@ionic-native/toast";
import { IonicPage, NavController, NavParams, Nav , LoadingController, ToastController} from 'ionic-angular';
import { FirebaseMessaging } from '@ionic-native/firebase-messaging';
import { LogueoService } from '../../services/logueo.service';
import { GlobalService } from '../../services/globales.service';
import { BdService } from '../../services/bd.service';
import { Device } from '@ionic-native/device';
import { iCobro } from '../../interfaces/interfaces';
/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  // rootNavCtrl: NavController;
  conexion:boolean=true;
  @ViewChild('myNav') nav: Nav;
  rootNavCtrl: NavController;
  // user = {} as User;
  focu: boolean = false;
  public formLogin:FormGroup;
  // user: string;
  // pass: string;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public loading: LoadingController,
    public toast: ToastController,
    public build: FormBuilder,
    private network:Network,
    private toastNative:Toast,
    public globalSer:GlobalService,
    public db:BdService,
    public firebaseMsg: FirebaseMessaging,
    public device:Device,
    public logueoSer:LogueoService) {
      this.rootNavCtrl = navParams.get('rootNavCtrl');
      this.formLogin = build.group({
        user:['',Validators.compose([Validators.required])],
        password:['',Validators.compose([Validators.required,Validators.minLength(6)])]
      });
  }
  ionViewDidEnter(){
    // console.log(this.logueoSer.uid.uid);
    
    this.network.onConnect().subscribe(data=>{
      this.conexion=true;
      this.toast.create({
        message:'conectado',
        duration:3000,
        cssClass:'toast-success'
      }).present();
    },error=>console.error('error'));
    this.network.onDisconnect().subscribe(data=>{
      this.conexion=false;
      this.toast.create({
        message:'Conectese a internet',
        duration:8000,
        cssClass:'toast-error'
      }).present();
    },error=>console.error('error'));
  }
  buscarUser(userList,user){
    let bandera=false;
    userList.forEach(element => {
      if (element.user === user) {
        bandera = true;
      }
    });
    return bandera;
  }
  getToken(_user) {
    this.firebaseMsg.getToken().then((_token) => {
      let token = {
        token: _token,
        users: [{rol:2,user:_user,fecha : `${new Date().getDate()}/${new Date().getMonth()+1}/${new Date().getFullYear()}`}],
        modelo: this.device.model,
        device: this.device.manufacturer,
      }
      let tablaDevice = this.db.getDatos('devices',_token,1);
      tablaDevice.ref.get().then(ok => {
        if (ok.exists) {
          tablaDevice.valueChanges().subscribe(res => {
              console.log('existe');
              token = res;
              if (!this.buscarUser(res.users,_user)) {
                token.users.push({rol:2,user:_user,fecha : `${new Date().getDate()}/${new Date().getMonth()+1}/${new Date().getFullYear()}`});
                console.log(token.users);
              }
              this.db.add('devices',token,2,_token).then(() => {
                console.log('funciono')
              }).catch((err) => console.log(err));
          });
        }else{
          console.log('la tabla no existe');
          this.db.add('devices',token,2,_token).then(() => {
            console.log('funciono')
          }).catch((err) => console.log(err));
        }
      });
    })
    
  }
  public logueo() {
    let user = `${this.formLogin.get("user").value}@gmail.com`;
    let pass = this.formLogin.get("password").value;
    let state = true;
    this.logueoSer
      .loginUser(user, pass)
      .then(() => {
        let tablaCobro = this.db.getDatos("cobro", this.logueoSer.uid, 1);
        tablaCobro.ref.get().then(ok => {
          if (ok.exists) {
            tablaCobro.valueChanges().subscribe((res: iCobro) => {
              if (res.state == state) {
                this.globalSer.getCobro = res;
                this.globalSer.getCobro.id = this.logueoSer.uid;
                let cargar = this.loading.create({
                  content: "Cargando Espere...",
                  duration: 4000
                });
                this.getToken(res.name);
                cargar.present().then(() => {
                  setTimeout(() => {
                    cargar.dismiss();
                  }, 5000);
                });
              } else {
                if (res.state) {
                  this.toastMensaje("El usuario esta activo", 3000);
                } else {
                  this.toastMensaje("Usuario inactivo", 3000);
                  this.logueoSer.cerrarSesion();
                  state = false;
                }
              }
            });
          } else {
            this.toastMensaje("Usuario Incorrecto", 3000);
            this.logueoSer.cerrarSesion();
          }
        });
      })
      .catch(() => {
        this.toastMensaje("Usuario incorrecto", 3000);
      });
  }
  toastMensaje(msg:string,key:number){
    this.toastNative.show(msg,'3000','bottom').subscribe((toast)=>{console.log(toast)})
  }

  /**
   * focus
   */
  public enfoque() {
    this.focu = true;
  }
  /**
   *  desenfoque
   */
  public  desenfoque() {
    this.focu = false;
  }

}
