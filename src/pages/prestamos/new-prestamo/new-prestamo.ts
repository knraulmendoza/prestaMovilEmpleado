import { Component } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import {
  IonicPage,
  NavController,
  NavParams,
  ViewController,
  ToastController
} from "ionic-angular";
import { Prestamo, Validar } from "../../../validaciones/validar";
import { GlobalService } from "../../../services/globales.service";
import { iUsuario, iPrestamos, iBarrio } from "../../../interfaces/interfaces";
import { BdService } from "../../../services/bd.service";
//
/**
 * Generated class for the NewPrestamoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-new-prestamo",
  templateUrl: "new-prestamo.html"
})
export class NewPrestamoPage {
  fecha = new Date();
  fActual: string = `${this.fecha.getDate()}/${this.fecha.getMonth() + 1}/${this.fecha.getFullYear()}`;
  clientes: iUsuario[];
  cliente = [];
  barrios: iBarrio[];
  client: iUsuario;
  prestamo: iPrestamos;
  prestamos: iPrestamos[];
  encontrado: boolean = false;
  idCliente: string;
  // prestamo={cliente:String.prototype,key:Math.random(),count:Number.prototype,plazo:Number.prototype,modoPago:Number.prototype};
  formPrestamo: FormGroup;
  formCliente: FormGroup;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public view: ViewController,
    public formBuild: FormBuilder,
    public toast: ToastController,
    public globalSer: GlobalService,
    public db: BdService
  ) {
    this.formPrestamo = formBuild.group({
      count: ["", Validators.compose([Validators.required, Prestamo.count])],
      plazo: ["", Validators.compose([Validators.required, Prestamo.plazo])],
      modoPago: [
        "",
        Validators.compose([Validators.required, Prestamo.modoPago])
      ],
      interes:["",Validators.compose([Validators.required,Validar.dinerValido])]
    });
    this.formCliente = formBuild.group({
      cc: ["", Validators.compose([Validators.required])],
      name: ["", Validators.compose([Validators.required])],
      lastName: ["", Validators.compose([Validators.required])],
      tel: ["", Validators.compose([Validators.required])],
      dir: ["", Validators.compose([Validators.required])],
      barrio: ["", Validators.compose([Validators.required])]
    });
    this.listaClientes();
    this.listaBarrios();
  }

  public listaClientes() {
    let clien = [];
    this.db.selectWhere("cliente",'cobro',this.globalSer.getCobro.id,1).subscribe(res => {
      res.forEach(cli => {
        clien.push(cli);
      });
      this.clientes = clien;
    });
  }

  public listaBarrios() {
    let barr = [];
    this.db.consultaId("barrio").subscribe(res => {
      res.forEach(bar => {
        barr.push(bar);
      });
      this.barrios = barr;
    });
  }
  public cerrar() {
    this.view.dismiss();
  }
  public renombrar(cli: iUsuario) {
    this.cliente = [];
    this.formCliente.get("cc").setValue(cli.cc);
    this.formCliente.get("name").setValue(cli.name);
    this.formCliente.get("lastName").setValue(cli.lastName);
    this.formCliente.get("tel").setValue(cli.tel);
    this.formCliente.get("dir").setValue(cli.dirFisica);
    this.formCliente.get("barrio").setValue(cli.barrio);
    this.encontrado = true;
    this.idCliente = cli.id;
    this.listaPrestamos(cli.id);
  }

  listaPrestamos(id) {
    let pres = [];
    this.db.getDatos("cliente", id,1).valueChanges().subscribe(res => {
      let clie: iUsuario = res;
      clie.prestamos.forEach(pre => {
        pres.push(pre);
      });
      this.prestamos = pres;
    });
  }

  public bCliente() {
    // this.buscar.length
    if (this.formCliente.get("cc").value != " ") {
      this.cliente = this.clientes.filter(cli => {
        return cli.cc.indexOf(this.formCliente.get("cc").value) > -1;
      });
    } else {
      this.cliente = [];
    }
  }

  clienteJSON(formCli: FormGroup) {
    return {
      cobro:this.globalSer.getCobro.id,
      cc: formCli.get("cc").value,
      name: formCli.get("name").value,
      lastName: formCli.get("lastName").value,
      tel: formCli.get("tel").value,
      dirFisica: formCli.get("dir").value,
      barrio: formCli.get("barrio").value,
      state: 1,
      fecha:this.fActual,
      prestamos: []
    } as iUsuario;
  }

  mensaje(text: string, duracion: number, css: string) {
    this.toast
      .create({
        message: text,
        duration: duracion,
        cssClass: css
      })
      .present();
  }
  public addCliente() {
    this.client = this.clienteJSON(this.formCliente);
    this.db.add("cliente", this.client,1)
      .then(res => {
        this.mensaje("Cliente registrado correctamente", 2000, "toast-success");
        this.encontrado = true;
        this.idCliente = res.id;
        this.listaPrestamos(res.id);
      })
      .catch(() => {
        this.mensaje("Error al registrar el cliente", 2000, "toast-error");
      });
  }

  prestamoJSON(form: FormGroup) {
    // this.fecha = new Date(this.fActual);
    this.fecha.setDate(this.fecha.getDate()+parseInt(form.get("plazo").value));
    let inte = `1.${form.get("interes").value}`
    let presta = parseFloat(form.get("count").value) * 1000 *(parseFloat(inte))
    return {
      countPrestamo: presta,
      plazo: parseInt(form.get("plazo").value),
      formaPago: parseInt(form.get("modoPago").value),
      fechaInicio: this.fActual,
      fechaFin:`${this.fecha.getDate()}/${this.fecha.getMonth()+1}/${this.fecha.getFullYear()}`,
      interes:parseInt(form.get("interes").value),
      state: false
    } as iPrestamos;
  }

  public addPrestamo() {
    this.prestamo = this.prestamoJSON(this.formPrestamo);
    this.prestamo.id = Date.now().toString();
    this.prestamos.push(this.prestamo);
    this.db
      .updatePrestamo("cliente", this.prestamos, this.idCliente)
      // this.db.add('prestamo',this.prestamo)
      .then(() => {
        // this.mensaje('El prestamo se realizo correctamente',2000,'toast-success');
        // this.globalSer.getCobro.dinerFinal -= this.prestamo.countPrestamo;
        // this.db
        //   .updateDinerFinal(this.globalSer.getCobro)
        //   .then(() => {
        //     this.mensaje(
        //       "Prestamo realizado correctamente",
        //       2000,
        //       "toast-success"
        //     );
        //   })
        //   .catch(() => {
        //     this.mensaje(
        //       "No se pudo realizar el prestamo",
        //       2000,
        //       "toast-error"
        //     );
        //   });
        this.mensaje(
                "Prestamo realizado correctamente",
                2000,
                "toast-success"
              );
      })
      .catch(() => {
        this.mensaje("El prestamo no se pudo realizar", 2000, "toast-error");
      });
  }
}
