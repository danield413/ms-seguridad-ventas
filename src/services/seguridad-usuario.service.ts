import {/* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {ConfiguracionSeguridad} from '../config/seguridad.config';
import {Credenciales, FactorDeAutenticacionPorCodigo, Usuario} from '../models';
import {LoginRepository, UsuarioRepository} from '../repositories';
const generator = require('generate-password');
const MD5 = require('crypto-js/md5');
const jwt = require('jsonwebtoken');

@injectable({scope: BindingScope.TRANSIENT})
export class SeguridadUsuarioService {
  constructor(
    @repository(UsuarioRepository) public usuarioRepository: UsuarioRepository,
    @repository(LoginRepository) public loginRepository: LoginRepository,
  ) {}

  /*
   * Add service methods here
   */

  /**
   * Función para crear una clave aleatoria
   * @returns clave aleatoria
   */
  crearTextoAleatorio(length: number = 10): string {
    const password = generator.generate({
      length,
      numbers: true,
    });

    return password;
  }

  /**
   * Función para cifrar un texto con MD
   * @param texto Texto a cifrar
   * @returns Texto cifrado
   **/
  cifrarTexto(texto: string): string {
    const cadena = MD5(texto).toString();

    return cadena;
  }

  /**
   * Función para identificar a un usuario
   * @param credenciales Credenciales de acceso
   * @returns Usuario identificado
   **/
  async identificarUsuario(
    credenciales: Credenciales,
  ): Promise<Usuario | null> {
    const usuario = await this.usuarioRepository.findOne({
      where: {
        correo: credenciales.correo,
        clave: credenciales.clave,
      },
    });
    return usuario as Usuario;
  }

  /**
   *
   * @param credenciales credenciales del usuario con el codigo 2fa
   * @returns el Usuario ó null
   */
  async validarCodigo2fa(
    credenciales: FactorDeAutenticacionPorCodigo,
  ): Promise<Usuario | null> {
    const login = await this.loginRepository.findOne({
      where: {
        usuarioId: credenciales.usuarioId,
        codigo2fa: credenciales.codigo2fa,
        estadoCodigo2fa: false,
      },
    });

    if (login) {
      const usuario = await this.usuarioRepository.findById(
        credenciales.usuarioId,
      );
      return usuario as Usuario;
    }

    return null;
  }

  /**
   * Generación de jwt
   * @param usuario información del usuario
   * @returns token
   */
  crearToken(usuario: Usuario) {
    const datos = {
      name: `${usuario.primerNombre} ${usuario.segundoNombre} ${usuario.primerApellido} ${usuario.segundoApellido}`,
      role: usuario.rolId,
      email: usuario.correo,
    };
    const token = jwt.sign(datos, ConfiguracionSeguridad.claveJWT);
    return token;
  }

  /**
   * Valida y obtiene el rol de un token
   * @param tk el token
   * @returns el _id del rol
   */
  obtenerRolDesdeToken(tk: string): string {
    const obj = jwt.verify(tk, ConfiguracionSeguridad.claveJWT);
    return obj.role;
  }
}
