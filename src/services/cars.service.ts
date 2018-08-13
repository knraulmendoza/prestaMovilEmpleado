import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Rx";
import { SimulateService } from "./simulate.service";

@Injectable()
export class CarsService{
    public simulate: SimulateService;
    constructor(){
        this.simulate = new SimulateService();
    }
    getCars(lat,lon){
        return Observable
            .interval(2000)
            .switchMap(()=>this.simulate.getCars(lat,lon))
            .share();
    }
}