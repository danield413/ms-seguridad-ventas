import {injectable, /* inject, */ BindingScope} from '@loopback/core';
const axios = require('axios');

@injectable({scope: BindingScope.TRANSIENT})
export class NotificacionesService {
  constructor(/* Add @inject to inject parameters */) {}

  /*
   * Add service methods here
   */

  enviarCorreoElectronico(datos: any, url: string) {
    //do the same with axios
    axios.post(url, datos)
  }
}
