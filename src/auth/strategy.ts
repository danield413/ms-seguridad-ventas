import {AuthenticationBindings, AuthenticationMetadata, AuthenticationStrategy} from '@loopback/authentication';
import { inject, service } from '@loopback/core';
import { repository } from '@loopback/repository';
import {HttpErrors, Request} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import parseBearerToken from 'parse-bearer-token';
import { SeguridadUsuarioService } from '../services';
import { RolMenuRepository } from '../repositories';

export class AuthStrategy implements AuthenticationStrategy {
  name: string = 'auth';

  constructor(
    @service(SeguridadUsuarioService)
    private servicioSeguridad: SeguridadUsuarioService,
    @inject(AuthenticationBindings.METADATA)
    private metadata: AuthenticationMetadata[],
    @repository(RolMenuRepository)
    private repositorioRolMenu: RolMenuRepository,
  ) { }


  /**
   * Autenticación de un usuario frente a una acción en la base de datos
   * @param request la solicitud con el token
   * @returns el perfil del usuario, undefined cuando no tiene permiso o un httpError cuando no existe el permiso
   */
  async authenticate(request: Request): Promise<UserProfile | undefined> {
    const token = parseBearerToken(request);
    if (token) {
      const idRol = this.servicioSeguridad.obtenerRolDesdeToken(token);
      const idMenu: string = this.metadata[0].options![0];
      const accion: string = this.metadata[0].options![1];
      
      const permiso = await this.repositorioRolMenu.findOne({
        where: {
          rolId: idRol,
          menuId: idMenu,
        }
      });
      let continuar: boolean = false;
      if (permiso) {
        switch (accion) {
          case 'guardar':
            continuar = permiso.guardar;
            break;
          case 'editar':
            continuar = permiso.editar;
            break;
          case 'eliminar':
            continuar = permiso.eliminar;
            break;
          case 'listar':
            continuar = permiso.listar;
            break;
          case 'descargar':
            continuar = permiso.descargar;
            break;

          default:
            throw new HttpErrors[401]("No es posible ejecutar la acción porque no existe.");
            break;
        }

        if(continuar) {
          const perfil: UserProfile = Object.assign({
            permitido: 'OK',
          });
          return perfil;
        } else {
          return undefined;
        }

      } else {
        throw new HttpErrors[401]("No es posible ejecutar la acción por falta de un permiso.");
      }

    }
  }
}
