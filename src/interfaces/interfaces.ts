export interface iCobro{
    name:string;
    fecha:string;
    dinerInicial:number;
    dinerFinal:number;
    pass:string;
    state:boolean;
    id?:string;
}

export interface iUsuario{
    cobro:string;
    cc:string;
    name:string;
    lastName:string;
    tel:number;
    dirFisica:string;
    barrio:string;
    dirGps?:string;
    fecha?:string;
    state:number;
    prestamos:iPrestamos[];
    id?:string;
}

export interface iPrestamos{
    plazo:number;
    countPrestamo:number;
    formaPago:number;
    fechaInicio:string;
    fechaFin:string;
    state:boolean;
    id:string;
    interes:number;
}

export interface iPagos{
    pago:number;
    resta?:number;
    fechaPago:string;
    state:boolean;
    id:number;
}

export interface iBarrio{
    name:string,
    comuna:number,
    id?:string
}

export interface iCuadre{
    cobro:string;
    abonados:number;
    prestados:number;
    gastos:iGastos[];
    baseInicial:number;
    fecha:string;
    id?:string;
}

export interface iGastos{
    name:string;
    dinero:number;
}