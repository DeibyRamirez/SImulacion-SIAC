import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolUsuario } from '@prisma/client';
import { VigenciasService } from './vigencias.service';
import { Roles, RolesGuard } from '../common/guards/roles.guard';

@Controller('vigencias')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class VigenciasController {
  constructor(private readonly vigenciasService: VigenciasService) {}

  @Get()
  listar(@Query('programaId') programaId?: string) {
    return this.vigenciasService.listarAnexos(programaId);
  }

  @Post()
  @Roles(RolUsuario.Administrador, RolUsuario.Revisor)
  crear(
    @Body()
    body: {
      titulo: string;
      programaId: string;
      tipo: string;
      fechaVencimiento: string;
      responsable: string;
    },
  ) {
    return this.vigenciasService.crearAnexo({
      ...body,
      fechaVencimiento: new Date(body.fechaVencimiento),
    });
  }

  @Patch(':id')
  @Roles(RolUsuario.Administrador, RolUsuario.Revisor)
  actualizar(
    @Param('id') id: string,
    @Body() body: Partial<{ titulo: string; fechaVencimiento: string; responsable: string }>,
  ) {
    return this.vigenciasService.actualizarAnexo(id, {
      ...body,
      fechaVencimiento: body.fechaVencimiento ? new Date(body.fechaVencimiento) : undefined,
    });
  }

  @Delete(':id')
  @Roles(RolUsuario.Administrador)
  eliminar(@Param('id') id: string) {
    return this.vigenciasService.eliminarAnexo(id);
  }

  @Post('ejecutar-cron')
  @Roles(RolUsuario.Administrador)
  ejecutarCronManual() {
    return this.vigenciasService.actualizarVigenciasDiarias();
  }
}
