import { Module } from '@nestjs/common';
import { UsuarioRepositorio } from './usuario.repositorio';
import { UsuariosController } from './usuarios.controller';

@Module({
  controllers: [UsuariosController],
  providers: [UsuarioRepositorio],
  exports: [UsuarioRepositorio],
})
export class UsuariosModule {}
