export namespace ConfiguracionSeguridad {
  export const claveJWT = process.env.CLAVE_JWT;
  export const mongodbConnectionString = process.env.MONGO_CNN
  export const menuUsuarioId = "64fc673920466635f0456638";
  export const listarAccion = "listar";
  export const guardarAccion = "guardar";
  export const editarAccion = "editar";
  export const eliminarAccion = "eliminar";
  export const descargarAccion = "descargar";
}
