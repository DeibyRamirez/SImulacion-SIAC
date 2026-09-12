import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { createReadStream, existsSync, mkdirSync, writeFileSync, readFileSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class AlmacenamientoService {
  private readonly s3Client: S3Client | null;
  private readonly bucket: string;
  private readonly usarLocal: boolean;
  private readonly rutaLocal: string;

  constructor(private readonly config: ConfigService) {
    this.usarLocal = config.get('S3_USAR_ALMACEN_LOCAL') === 'true';
    this.rutaLocal = config.get('ALMACEN_LOCAL_RUTA') ?? './almacen-local';
    this.bucket = config.get('S3_BUCKET') ?? 'siac-evidencias';

    if (!this.usarLocal) {
      this.s3Client = new S3Client({
        endpoint: config.get('S3_ENDPOINT'),
        region: config.get('S3_REGION') ?? 'us-east-1',
        credentials: {
          accessKeyId: config.get('S3_ACCESS_KEY') ?? '',
          secretAccessKey: config.get('S3_SECRET_KEY') ?? '',
        },
        forcePathStyle: true,
      });
    } else {
      this.s3Client = null;
      if (!existsSync(this.rutaLocal)) {
        mkdirSync(this.rutaLocal, { recursive: true });
      }
    }
  }

  async subirArchivo(
    buffer: Buffer,
    nombreOriginal: string,
    carpeta = 'evidencias',
  ): Promise<{ ruta: string; clave: string }> {
    const clave = `${carpeta}/${randomUUID()}-${nombreOriginal}`;

    if (this.usarLocal) {
      const rutaCompleta = join(this.rutaLocal, clave);
      const dir = dirname(rutaCompleta);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      writeFileSync(rutaCompleta, buffer);
      return { ruta: rutaCompleta, clave };
    }

    await this.s3Client!.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: clave,
        Body: buffer,
      }),
    );

    return { ruta: clave, clave };
  }

  async obtenerBuffer(clave: string): Promise<Buffer> {
    if (this.usarLocal) {
      const ruta = clave.startsWith(this.rutaLocal) ? clave : join(this.rutaLocal, clave);
      return readFileSync(ruta);
    }

    const respuesta = await this.s3Client!.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: clave }),
    );
    const bytes = await respuesta.Body!.transformToByteArray();
    return Buffer.from(bytes);
  }

  crearStreamDescarga(clave: string) {
    if (this.usarLocal) {
      const ruta = clave.startsWith(this.rutaLocal) ? clave : join(this.rutaLocal, clave);
      return createReadStream(ruta);
    }
    throw new Error('Stream S3 no implementado — usar obtenerBuffer');
  }

  async eliminarArchivo(clave: string): Promise<void> {
    if (this.usarLocal) {
      const ruta = clave.startsWith(this.rutaLocal) ? clave : join(this.rutaLocal, clave);
      if (existsSync(ruta)) unlinkSync(ruta);
      return;
    }

    await this.s3Client!.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: clave }),
    );
  }
}
