import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { LoginPage } from '../pages/login/login';
import { LogueoService } from '../services/logueo.service';
import { PendientePage } from '../pages/prestamos/pendiente/pendiente';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, public logueoSer: LogueoService) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
    logueoSer.Session.subscribe(user => {
      if (user) {
        this.rootPage = PendientePage;
      } else {
        this.rootPage = LoginPage;
      }
    })
  }
}

