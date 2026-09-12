import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { EstadoEvidencia } from '@prisma/client';

export interface ParametrosBusqueda {
  busqueda?: string;
  programaId?: string;
  factor?: string;
  indicador?: string;
  periodo?: string;
  estado?: EstadoEvidencia;
  pagina?: number;
  limite?: number;
}

@Injectable()
export class BusquedaService {
  constructor(private readonly prisma: PrismaService) {}

  async buscar(parametros: ParametrosBusqueda, soloValidados = false) {
    const where: Record<string, unknown> = {};

    if (soloValidados) where.estado = EstadoEvidencia.Validado;
    else if (parametros.estado) where.estado = parametros.estado;

    if (parametros.programaId) where.programaId = parametros.programaId;
    if (parametros.factor) where.factor = parametros.factor;
    if (parametros.indicador) where.indicador = parametros.indicador;
    if (parametros.periodo) where.periodo = parametros.periodo;

    if (parametros.busqueda) {
      where.OR = [
        { nombre: { contains: parametros.busqueda, mode: 'insensitive' } },
        { factor: { contains: parametros.busqueda, mode: 'insensitive' } },
        { indicador: { contains: parametros.busqueda, mode: 'insensitive' } },
        { periodo: { contains: parametros.busqueda, mode: 'insensitive' } },
        { nombreArchivo: { contains: parametros.busqueda, mode: 'insensitive' } },
      ];
    }

    const pagina = parametros.pagina ?? 1;
    const limite = parametros.limite ?? 20;

    const [resultados, total] = await this.prisma.$transaction([
      this.prisma.evidencia.findMany({
        where,
        include: {
          programa: { select: { id: true, nombre: true, codigo: true } },
          autor: { select: { id: true, nombre: true } },
        },
        orderBy: { fechaCarga: 'desc' },
        skip: (pagina - 1) * limite,
        take: limite,
      }),
      this.prisma.evidencia.count({ where }),
    ]);

    return { resultados, total, pagina, limite };
  }
}
