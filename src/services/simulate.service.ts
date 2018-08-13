import { Injectable } from "@angular/core";
import { Observable } from "rxjs/rx";

@Injectable()
export class SimulateService{
    getCars(lat,lon){
        let carData = this.cars[this.carIndex];

        this.carIndex ++;

        if (this.carIndex > this.cars.length-1) {
            this.carIndex = 0;
        }
        return Observable.create(
            observer => observer.next(carData)
        );
    }

    private carIndex: number= 0;

    private cars1={
        cars:[{
            id:1,
            coord:{
                lat:10.445028,
                lon:-73.280193
            }
        }
        // {
        //     id:2,
        //     coord:{
        //         lat: 10.447919,
        //         lon: -73.277746
        //     }
        // }
        ]
    };
    private cars2 = {
        cars:[{
            id:1,
            coord:{
                lat: 10.446210,
                lon: -73.280729
            }
        }
        // {
        //     id:2,
        //     coord:{
        //         lat: 10.445450,
        //         lon: -73.278959
        //     }
        // }
        ]
    };
    private cars3 = {
        cars:[{
            id:1,
            coord:{
                lat:10.446738,
                lon:-73.279570
            }
        }
        // {
        //     id:2,
        //     coord:{
        //         lat:10.446252,
        //         lon:-73.278412
        //     }
        // }
        ]
    }
    private cars4 = {
        cars:[{
            id:1,
            coord:{
                lat:10.447413,
                lon:-73.279892
            }
        }
    //     {
    //         id:1,
    //         coord:{
    //             lat:10.445999,
    //             lon:-73.279077
    //         }
        ]
    }

    private cars: Array<any> = [this.cars1,this.cars2,this.cars3,this.cars4];
}