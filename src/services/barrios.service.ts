import { Injectable } from "@angular/core";

@Injectable()
export class BarrioService{
    barrios=[
        {key:1,name:'450 años'},
        {key:2,name:'populandia'},
        {key:3,name:'la victoria'},
        {key:4,name:'Villa luz'},
        {key:5,name:'san fernando'},
        {key:6,name:'Panama'},
        {key:7,name:'12 de octubre'},
        {key:8,name:'Los mayales'}
    ];
    public showBarrios(){
        return this.barrios;
    }
}