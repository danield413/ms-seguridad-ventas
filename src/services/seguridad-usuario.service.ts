import {/* inject, */ BindingScope, injectable} from '@loopback/core';
const generator = require('generate-password');
const MD5 = require('crypto-js/md5');

@injectable({scope: BindingScope.TRANSIENT})
export class SeguridadUsuarioService {
  constructor(/* Add @inject to inject parameters */) {}

  /*
   * Add service methods here
   */

  crearClave(): string {
    const password = generator.generate({
      length: 10,
      numbers: true,
    });

    return password;
  }

  cifrarTexto(texto: string): string {
    const cadena = MD5(texto).toString();

    return cadena;
  }
}
