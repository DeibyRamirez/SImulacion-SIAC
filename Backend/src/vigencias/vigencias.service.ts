import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.module';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { EstadoVigencia } from '@prisma/client';

@Injectable()
export class VigenciasService {
  private readonly logger = new Logger(VigenciasService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificaciones: NotificacionesService,
    private readonly config: ConfigService,
  ) {
    const host = config.get('SMTP_HOST');
    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: parseInt(config.get('SMTP_PORT') ?? '587', 10),
        auth: {
          user: config.get('SMTP_USUARIO'),
          pass: config.get('SMTP_CONTRASENA'),
        },
      });
    }
  }

  listarAnexos(programaId?: string) {
    return this.prisma.anexoVigencia.findMany({
      where: programaId ? { programaId } : undefined,
      include: { programa: { select: { id: true, nombre: true, codigo: true } } },
      orderBy: { fechaVencimiento: 'asc' },
    });
  }

  crearAnexo(datos: {
    titulo: string;
    programaId: string;
    tipo: string;
    fechaVencimiento: Date;
    responsable: string;
  }) {
    const estado = this.calcularEstado(datos.fechaVencimiento);
    return this.prisma.anexoVigencia.create({
      data: { ...datos, estado },
    });
  }

  actualizarAnexo(id: string, datos: Partial<{ titulo: string; fechaVencimiento: Date; responsable: string }>) {
    const updateData: Record<string, unknown> = { ...datos };
    if (datos.fechaVencimiento) {
      updateData.estado = this.calcularEstado(datos.fechaVencimiento);
    }
    return this.prisma.anexoVigencia.update({ where: { id }, data: updateData });
  }

  eliminarAnexo(id: string) {
    return this.prisma.anexoVigencia.delete({ where: { id } });
  }

  calcularEstado(fechaVencimiento: Date): EstadoVigencia {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const vencimiento = new Date(fechaVencimiento);
    vencimiento.setHours(0, 0, 0, 0);

    const diffDias = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDias < 0) return EstadoVigencia.Vencido;
    if (diffDias <= 30) return EstadoVigencia.Proximo;
    return EstadoVigencia.Vigente;
  }

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async actualizarVigenciasDiarias() {
    this.logger.log('Ejecutando cron de vigencias...');

    const anexos = await this.prisma.anexoVigencia.findMany();
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    manana.setHours(0, 0, 0, 0);

    for (const anexo of anexos) {
      const nuevoEstado = this.calcularEstado(anexo.fechaVencimiento);

      if (nuevoEstado !== anexo.estado) {
        await this.prisma.anexoVigencia.update({
          where: { id: anexo.id },
          data: { estado: nuevoEstado },
        });
      }

      const vencimiento = new Date(anexo.fechaVencimiento);
      vencimiento.setHours(0, 0, 0, 0);

      if (vencimiento.getTime() === manana.getTime()) {
        const mensaje = `El anexo "${anexo.titulo}" vence mañana. Responsable: ${anexo.responsable}.`;
        await this.enviarAlerta(anexo.responsable, mensaje, anexo.id);
      }
    }

    this.logger.log('Cron de vigencias completado.');
  }

  private async enviarAlerta(responsable: string, mensaje: string, anexoId: string) {
    const usuario = await this.prisma.usuario.findFirst({
      where: { correo: { contains: responsable.split('@')[0] ?? responsable } },
    });

    if (usuario) {
      await this.notificaciones.crear(usuario.id, mensaje, 'vigencia');
    }

    if (this.transporter && responsable.includes('@')) {
      try {
        await this.transporter.sendMail({
          from: this.config.get('SMTP_FROM') ?? 'planeacion@uniautonoma.edu.co',
          to: responsable.includes('@') ? responsable : undefined,
          subject: '[SIAC] Alerta de vencimiento',
          text: mensaje,
        });
      } catch (error) {
        this.logger.error(`Fallo SMTP para anexo ${anexoId}: ${error}`);
      }
    }
  }
}
