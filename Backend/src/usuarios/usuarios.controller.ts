import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolUsuario } from '@prisma/client';
import { UsuarioRepositorio } from './usuario.repositorio';
import { Roles, RolesGuard } from '../common/guards/roles.guard';
import { ActualizarRolDto } from '../auth/dto/auth.dto';

@Controller('usuarios')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsuariosController {
  constructor(private readonly usuarioRepo: UsuarioRepositorio) {}

  @Get()
  @Roles(RolUsuario.Administrador)
  listar() {
    return this.usuarioRepo.listarTodos();
  }

  @Patch(':id/rol')
  @Roles(RolUsuario.Administrador)
  actualizarRol(@Param('id') id: string, @Body() dto: ActualizarRolDto) {
    return this.usuarioRepo.actualizarRol(id, dto.rol);
  }
}
