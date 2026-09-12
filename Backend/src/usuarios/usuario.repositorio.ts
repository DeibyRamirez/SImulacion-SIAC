import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { Usuario, RolUsuario, Prisma } from '@prisma/client';

@Injectable()
export class UsuarioRepositorio {
  constructor(private readonly prisma: PrismaService) {}

  buscarPorCorreo(correo: string): Promise<Usuario | null> {
    return this.prisma.usuario.findUnique({ where: { correo: correo.toLowerCase() } });
  }

  buscarPorId(id: string): Promise<Usuario | null> {
    return this.prisma.usuario.findUnique({ where: { id } });
  }

  listarTodos(): Promise<Omit<Usuario, 'contrasena'>[]> {
    return this.prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        correo: true,
        rol: true,
        activo: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  actualizarRol(id: string, rol: RolUsuario): Promise<Usuario> {
    return this.prisma.usuario.update({ where: { id }, data: { rol } });
  }

  crear(datos: Prisma.UsuarioCreateInput): Promise<Usuario> {
    return this.prisma.usuario.create({ data: datos });
  }
}
