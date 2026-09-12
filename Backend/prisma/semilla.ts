import { PrismaClient, RolUsuario, EstadoEvidencia, EstadoVigencia, FormatoArchivo, CategoriaPlantilla } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Sembrando base de datos SIAC...');

  const hashCargador = await bcrypt.hash('Cargador2026', 10);
  const hashRevisor = await bcrypt.hash('Revisor2026', 10);
  const hashAdmin = await bcrypt.hash('Admin2026', 10);

  const cargador = await prisma.usuario.upsert({
    where: { correo: 'maria.cargadora@uniautonoma.edu.co' },
    update: {},
    create: {
      nombre: 'María Cortés',
      correo: 'maria.cargadora@uniautonoma.edu.co',
      contrasena: hashCargador,
      rol: RolUsuario.Cargador,
    },
  });

  const revisor = await prisma.usuario.upsert({
    where: { correo: 'revisor.calidad@uniautonoma.edu.co' },
    update: {},
    create: {
      nombre: 'Laura Ramírez',
      correo: 'revisor.calidad@uniautonoma.edu.co',
      contrasena: hashRevisor,
      rol: RolUsuario.Revisor,
    },
  });

  const admin = await prisma.usuario.upsert({
    where: { correo: 'admin.planeacion@uniautonoma.edu.co' },
    update: {},
    create: {
      nombre: 'Oscar Alvarado',
      correo: 'admin.planeacion@uniautonoma.edu.co',
      contrasena: hashAdmin,
      rol: RolUsuario.Administrador,
    },
  });

  const programas = [
    { codigo: 'ING-SIS', nombre: 'Ingeniería de Sistemas', nivel: 'Pregrado' },
    { codigo: 'DER', nombre: 'Derecho', nivel: 'Pregrado' },
    { codigo: 'ADM-EMP', nombre: 'Administración de Empresas', nivel: 'Pregrado' },
    { codigo: 'PSI', nombre: 'Psicología', nivel: 'Pregrado' },
    { codigo: 'ESP-CIB', nombre: 'Especialización en Ciberseguridad', nivel: 'Posgrado' },
    { codigo: 'ESP-INN', nombre: 'Especialización en Innovación', nivel: 'Posgrado' },
  ];

  const programasCreados = [];
  for (const p of programas) {
    const prog = await prisma.programa.upsert({
      where: { codigo: p.codigo },
      update: {},
      create: { ...p, semaforo: 'Verde', porcentajeAvance: 45, estadoProceso: 'En curso' },
    });
    programasCreados.push(prog);
  }

  await prisma.plantilla.upsert({
    where: { id: 'plt-seed-001' },
    update: {},
    create: {
      id: 'plt-seed-001',
      nombre: 'Informe de Autoevaluación',
      factor: 'CI-3 Cultura de autoevaluación',
      formato: FormatoArchivo.DOCX,
      version: '2026.1',
      vigente: true,
      categoria: CategoriaPlantilla.Autoevaluacion,
      descripcion: 'Plantilla oficial para informe de autoevaluación institucional.',
    },
  });

  await prisma.plantilla.upsert({
    where: { id: 'plt-seed-002' },
    update: {},
    create: {
      id: 'plt-seed-002',
      nombre: 'Estudio de Pertinencia',
      factor: 'CP-2 Justificación',
      formato: FormatoArchivo.PDF,
      version: '2026.1',
      vigente: true,
      categoria: CategoriaPlantilla.Programa,
      descripcion: 'Formato para estudio de pertinencia de programas nuevos.',
    },
  });

  const evidencia1 = await prisma.evidencia.upsert({
    where: { id: 'ev-seed-001' },
    update: {},
    create: {
      id: 'ev-seed-001',
      nombre: 'Reglamento estudiantil vigente',
      programaId: programasCreados[0].id,
      periodo: '2025-1',
      factor: 'CI-1 Selección y evaluación',
      indicador: 'Reglamento estudiantil',
      estado: EstadoEvidencia.Borrador,
      autorId: cargador.id,
      nombreArchivo: 'reglamento-estudiantil.pdf',
      responsable: cargador.nombre,
    },
  });

  await prisma.evidencia.upsert({
    where: { id: 'ev-seed-002' },
    update: {},
    create: {
      id: 'ev-seed-002',
      nombre: 'Informe autoevaluación 2024',
      programaId: programasCreados[0].id,
      periodo: '2024-2',
      factor: 'CI-3 Cultura de autoevaluación',
      indicador: 'Informe de autoevaluación',
      estado: EstadoEvidencia.Validado,
      autorId: cargador.id,
      nombreArchivo: 'informe-autoevaluacion-2024.pdf',
      responsable: cargador.nombre,
    },
  });

  const fechaProxima = new Date();
  fechaProxima.setDate(fechaProxima.getDate() + 15);

  const fechaVencida = new Date();
  fechaVencida.setDate(fechaVencida.getDate() - 10);

  await prisma.anexoVigencia.upsert({
    where: { id: 'anx-seed-001' },
    update: {},
    create: {
      id: 'anx-seed-001',
      titulo: 'Permiso de uso de suelos — Sede principal',
      programaId: programasCreados[0].id,
      tipo: 'Infraestructura',
      fechaVencimiento: fechaProxima,
      estado: EstadoVigencia.Proximo,
      responsable: admin.correo,
    },
  });

  await prisma.anexoVigencia.upsert({
    where: { id: 'anx-seed-002' },
    update: {},
    create: {
      id: 'anx-seed-002',
      titulo: 'Certificado bomberos — Laboratorio',
      programaId: programasCreados[1].id,
      tipo: 'Infraestructura',
      fechaVencimiento: fechaVencida,
      estado: EstadoVigencia.Vencido,
      responsable: admin.correo,
    },
  });

  const etapa = await prisma.etapaAcreditacion.upsert({
    where: { id: 'etapa-seed-001' },
    update: {},
    create: {
      id: 'etapa-seed-001',
      nombre: 'Pre-radicación',
      tipo: 'PreRadicacion',
      descripcion: 'Evaluación de condiciones institucionales (CI)',
      orden: 1,
      activa: true,
    },
  });

  await prisma.carpetaNormativa.upsert({
    where: { id: 'carp-seed-001' },
    update: {},
    create: {
      id: 'carp-seed-001',
      etapaId: etapa.id,
      nombre: 'Condiciones Institucionales',
      descripcion: 'Documentos de las 6 CI del Decreto 1330',
      orden: 1,
      activa: true,
    },
  });

  console.log('Semilla completada:', {
    usuarios: [cargador.correo, revisor.correo, admin.correo],
    programas: programasCreados.length,
    evidencias: 2,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
