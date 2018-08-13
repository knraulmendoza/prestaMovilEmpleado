import { FormControl } from "@angular/forms";

export class Validar{
    static dinerValido(control: FormControl){
        if (control.dirty) {
            if (control.value == "") {
                return null;
            }
            if (control.value < 0) { 
                return {"mensaje_error":'No se puede ingresar valores negativos'};
            }
            
        }
        return null;
    }
}

export class Prestamo{
    static count(control: FormControl){
        if (control.dirty) {
            if (control.value == "") {
                return null;
            }
            if (control.value < 0) {
                return {'mensaje_error':'No se puede ingresar valores negativos ni nulos'};
            }
            if (control.value < 50) {
                return {'mensaje_error':'El prestamo debe ser mayor a 50.000'};
            }
        }
        return null;
    }
    static plazo(control: FormControl){
        if (control.dirty) {
            if (control.value == "") {
                return null;
            }
            if (control.value < 0) {
                return {'mensaje_error':'No se puede ingresar valores negativos ni nulos'};
            }
            if (control.value < 30 || control.value > 40) {
                return {"mensaje_error":'El plazo tiene que ser de 30 a 40 dias'};
            }
        }
        return null;
    }
    static modoPago(control: FormControl){
        if (control.dirty) {
            if (control.value == "") {
                return {'mensaje_error':'Debe seleccionar un modo de pago'};
            }
        }
        return null;
    }
}