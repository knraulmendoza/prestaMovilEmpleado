import { Injectable } from "@angular/core";
import { AngularFirestore } from 'angularfire2/firestore'
import {  iCobro } from "../interfaces/interfaces";

@Injectable()

export class BdService{
    fechaHoy = `${new Date().getDate()}/${new Date().getMonth()+1}/${new Date().getFullYear()}`
    constructor(public firestore:AngularFirestore){}

    public add(tabla:string,datos,key:number,id?:string,idCliente?:string,idPres?:string){
        let coleccion;
        switch (key) {
            case 1:
                coleccion = this.firestore.collection(tabla).add(datos)
                break;
            case 2:
                coleccion = this.firestore.collection(tabla).doc(id).set(datos)
            break;
            case 3:
                coleccion = this.firestore.collection('cliente').doc(idCliente).collection(tabla).doc(idPres).set({pagos:datos});
            break;
        }
        return coleccion;
    }
    public generarId(){
        return this.firestore.createId();
    }
    public consultaId(tabla:string){
        let obj;
        let lista = this.firestore.collection(tabla);
        let dato = lista.snapshotChanges().map((List)=>{
            return List.map((dat)=>{
                obj = dat.payload.doc.data();
                obj.id=dat.payload.doc.id;
                return obj
            })
        })
        return dato;
    }

    public getDatos(tabla:string,id:string,num:number,idPres?:string) {
        // return this.clientes.filter(function(e,i) { return e.key == key;})[0] || {key:Math.random(),cedula:String,name:String,lastName:String,telefono:String,direccion:String,barrio:String,prestamos:[]};
        let lista;
        if (num==1) {
            lista = this.firestore.doc(tabla+'/'+id)
        } else {
            lista = this.firestore.collection('cliente').doc(id).collection(tabla).doc(idPres)
        }
        // lista.ref.get().then(ok=>{
        //     if (ok.exists) {
        //         return lista.valueChanges();
        //     }else return lista;
        // })
        return lista;
    }

    public updateDinerFinal(cobro:iCobro){
        return this.firestore.collection('cobro').doc(cobro.id).update({dinerFinal:cobro.dinerFinal});
    }

    public updatePrestamo(tabla:string,dato,id){
        return this.firestore.collection(tabla).doc(id).update({prestamos:dato});
    }

    public updatePago(tabla:string,datos,id:string,idPres:string){
        return this.firestore.collection('cliente').doc(id).collection(tabla).doc(idPres).set({pagos:datos});
    }

    public updateCobro(estado:boolean,id:string) {
        return this.firestore.collection('cobro').doc(id).update({state:estado});
    }

    public selectWhere(tabla:string,condicion1:string,comparar1,key:number,condicion2?:string,comparar2?){
        let obj;
        let lista
        if (key == 1) {
            lista = this.firestore.collection(tabla, ref=>ref.where(condicion1,"==",comparar1));
        }else lista = this.firestore.collection(tabla, ref=>ref.where(condicion1,"==",comparar1).where(condicion2,"==",comparar2));
        let dato = lista.snapshotChanges().map((List)=>{
            return List.map((dat)=>{
                obj = dat.payload.doc.data();
                obj.id=dat.payload.doc.id;
                return obj
            })
        })
        return dato;
    }

    // public countCliente(){

    //     return this.firestore.collection('cliente',ref=>ref.where("state","==",true))
    //     .ref.get().then(snapshot =>{
    //         let countCLi=0;
    //         snapshot.forEach(doc=>{
    //             console.log(doc.data().count)
    //             countCLi += doc.data().count;
    //         });
    //         return countCLi;
    //     });
    // }
}