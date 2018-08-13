import { Injectable } from "@angular/core";
import { AngularFireAuth } from 'angularfire2/auth';

@Injectable()
export class LogueoService{
    // listaCobros:AngularFirestoreCollection<iCobro>;
    // cobros:Observable<iCobro[]>;
    static bandera:boolean;
    constructor(private aouth: AngularFireAuth){}

    public loginUser(user,pass){
        return this.aouth.auth.signInWithEmailAndPassword(user,pass);
    }

    public createUser(user,pass){
        return this.aouth.auth.createUserWithEmailAndPassword(user,pass);
    }
    cerrarSesion(){
        return this.aouth.auth.signOut();
    }
    get Session(){
        return this.aouth.authState;
    }

    get uid(){
        return this.aouth.auth.currentUser.uid;
    }

    // public usuarios(name){
    //     this.listaCobros = this.firestore.collection<iCobro>('cobro', ref=>ref.where('name','==',name));
    //     return this.listaCobros.valueChanges();
    // }
}