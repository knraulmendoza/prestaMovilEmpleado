import { Component } from "@angular/core";
import { Platform, LoadingController } from "ionic-angular";
import { StatusBar } from "@ionic-native/status-bar";
import { SplashScreen } from "@ionic-native/splash-screen";

import { LoginPage } from "../pages/login/login";
import { LogueoService } from "../services/logueo.service";
import { BdService } from "../services/bd.service";
import { Toast } from "@ionic-native/toast";
import { GlobalService } from "../services/globales.service";
import { iCobro } from "../interfaces/interfaces";
import { TabsPage } from "../pages/tabPrincipal/tabs/tabs";
import { MenuPage } from "../pages/tabPrincipal/menu/menu";

@Component({
  templateUrl: "app.html"
})
export class MyApp {
  rootPage: any;

  constructor(
    platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    public logueoSer: LogueoService,
    public db: BdService,
    public toastNative: Toast,
    public globalSer: GlobalService,
    public loading: LoadingController
  ) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
    logueoSer.Session.subscribe(user => {
      if (user) {
        console.log(user.uid)
        this.showUser(user.uid);
      } else {
        this.rootPage = LoginPage;
      }
    });
  }
  toastMensaje(msg: string, key: number) {
    this.toastNative.show(msg, "3000", "bottom").subscribe(toast => {
      console.log(toast);
    });
  }
  showUser(uid) {
    let state = true;
    let tablaCobro = this.db.getDatos("cobro", uid, 1);
    tablaCobro.ref.get().then(ok => {
      if (ok.exists) {
        tablaCobro.valueChanges().subscribe((res: iCobro) => {
          console.log(res);
          if (res.state == state) {
            this.globalSer.getCobro = res;
            this.globalSer.getCobro.id = this.logueoSer.uid;
            let cargar = this.loading.create({
              content: "Cargando Espere...",
              duration: 4000
            });
            cargar.present().then(() => {
              setTimeout(() => {
                this.rootPage = MenuPage;
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
      }
    });
  }
}
