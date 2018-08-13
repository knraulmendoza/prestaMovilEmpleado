import { Injectable } from "@angular/core";
import { iCobro, iCuadre, iGastos } from "../interfaces/interfaces";

@Injectable()
export class GlobalService{
    public getCobro:iCobro;
    public getCuadre:iCuadre={cobro:'',abonados:0,baseInicial:0,fecha:'',gastos:[],prestados:0,id:''};
    public idcobro:string;
    dinerFinal:number;
    gastos:iGastos[]=[];
    public addGastos(gasto:iGastos){
        this.gastos.push(gasto);
    }
    public showGastos():iGastos[] {return this.gastos}
    set dinerSet(dinero){
        this.dinerFinal=dinero;
    }
    get dinerGet(){
        return this.dinerFinal;
    }
    
}