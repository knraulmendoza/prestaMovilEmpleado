import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Device } from "@ionic-native/device";
import { FirebaseMessaging } from "@ionic-native/firebase-messaging";
import { MyApp } from './app.component';

import { AngularFireAuthModule } from "angularfire2/auth";
import { AngularFirestoreModule,AngularFirestore } from "angularfire2/firestore";
import { AngularFireModule } from 'angularfire2';
import { LoginPage } from '../pages/login/login';
import { GastosPage } from '../pages/gastos/gastos';
import { PendientePage } from '../pages/prestamos/pendiente/pendiente';
import { NewPrestamoPage } from '../pages/prestamos/new-prestamo/new-prestamo';
import { CuadrePage } from '../pages/tabPrincipal/cuadre/cuadre';
import { ShowMenuPage } from '../pages/tabPrincipal/show-menu/show-menu';
import { TabsPage } from '../pages/tabPrincipal/tabs/tabs';
import { ClientesPage } from '../pages/clientes/clientes';
import { MenuPage } from '../pages/tabPrincipal/menu/menu';
import { GlobalService } from '../services/globales.service';
import { BdService } from '../services/bd.service';
import { LogueoService } from '../services/logueo.service';
import { Network } from '@ionic-native/network';
import { Toast } from '@ionic-native/toast';
import { PagosPage } from '../pages/pagos/pagos';

export const firebaseConfig = {
  apiKey: "AIzaSyDAs9QWBE1knaQwbgiYc9M9ovBvRGxkNfU",
  authDomain: "dbprestamos-4710.firebaseapp.com",
  databaseURL: "https://dbprestamos-4710.firebaseio.com",
  projectId: "dbprestamos-4710",
  storageBucket: "dbprestamos-4710.appspot.com",
  messagingSenderId: "549457564403"
};

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    GastosPage,
    PendientePage,
    NewPrestamoPage,
    CuadrePage,
    MenuPage,
    ShowMenuPage,
    TabsPage,
    ClientesPage,
    PagosPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFirestoreModule.enablePersistence(),
    AngularFirestoreModule,
    AngularFireAuthModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    GastosPage,
    PendientePage,
    NewPrestamoPage,
    CuadrePage,
    MenuPage,
    ShowMenuPage,
    TabsPage,
    ClientesPage,
    PagosPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    GlobalService,
    BdService,
    LogueoService,
    Network,
    Toast,
    AngularFirestore,
    Device,
    FirebaseMessaging,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
