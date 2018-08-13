import { Component, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Network } from "@ionic-native/network";
import { Toast } from "@ionic-native/toast";
import {
  IonicPage,
  NavController,
  NavParams,
  Nav,
  LoadingController,
  ToastController
} from "ionic-angular";
import { AngularFireAuth } from "angularfire2/auth";

import { MenuPage } from "../tabPrincipal/menu/menu";
import { LogueoService } from "../../services/logueo.service";
import { iCobro, iPagos } from "../../interfaces/interfaces";
import { GlobalService } from "../../services/globales.service";
import { BdService } from "../../services/bd.service";
/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-login",
  templateUrl: "login.html"
})
export class LoginPage {
  // rootNavCtrl: NavController;
  conexion: boolean = true;
  @ViewChild("myNav") nav: Nav;
  rootNavCtrl: NavController;
  // user = {} as User;
  focu: boolean = false;
  public formLogin: FormGroup;
  // user: string;
  // pass: string;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public loading: LoadingController,
    // private aouth: AngularFireAuth,
    public toast: ToastController,
    public build: FormBuilder,
    private network: Network,
    private toastNative: Toast,
    public globalSer: GlobalService,
    public db: BdService,
    public logueoSer: LogueoService
  ) {
    this.rootNavCtrl = navParams.get("rootNavCtrl");
    this.formLogin = build.group({
      user: ["", Validators.compose([Validators.required])],
      password: ["", Validators.compose([Validators.required])]
    });
    // this.rootNavCtrl = navParams.get('rootNavCtrl');
  }
  ionViewDidEnter() {
    // console.log(this.logueoSer.uid.uid);

    this.network.onConnect().subscribe(
      data => {
        this.conexion = true;
        this.toast
          .create({
            message: "conectado",
            duration: 3000,
            cssClass: "toast-success"
          })
          .present();
      },
      error => console.error("error")
    );
    this.network.onDisconnect().subscribe(
      data => {
        this.conexion = false;
        this.toast
          .create({
            message: "Conectese a internet",
            duration: 8000,
            cssClass: "toast-error"
          })
          .present();
      },
      error => console.error("error")
    );
  }

  toastMensaje(msg: string, duration: number) {
    this.toast
      .create({
        message: msg, //"Este usuario no puede ingresar en esta app",
        duration: duration
      })
      .present();
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
                cargar.present().then(() => {
                  setTimeout(() => {
                    this.navCtrl.setRoot(MenuPage);
                    cargar.dismiss();
                  }, 5000);
                });
              } else {
                if (res.state) {
                  this.toastMensaje("El usuario esta activo", 3000);
                } else {
                  this.toastMensaje("Usuario inactivo", 3000);
                  this.logueoSer.cerrarSesion();
                  this.navCtrl.setRoot(LoginPage);
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

  /**
   * focus
   */
  public enfoque() {
    this.focu = true;
  }
  /**
   *  desenfoque
   */
  public desenfoque() {
    this.focu = false;
  }
}
