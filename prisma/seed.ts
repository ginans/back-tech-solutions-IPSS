import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const claveCifrada = await bcrypt.hash('demo123456', 10);

  const usuario = await prisma.usuario.upsert({
    where: { correo: 'demo@techsolutions.cl' },
    update: {},
    create: {
      nombre: 'Usuario Demo',
      correo: 'demo@techsolutions.cl',
      clave: claveCifrada,
    },
  });

  const proyectosEstaticos = [
    {
      nombre: 'Sistema de Facturación',
      fechaInicio: new Date('2026-01-10'),
      estado: 'En progreso',
      responsable: 'María Pérez',
      monto: 2500000,
    },
    {
      nombre: 'App de Delivery',
      fechaInicio: new Date('2026-02-15'),
      estado: 'Planificado',
      responsable: 'Carlos Gómez',
      monto: 4800000,
    },
    {
      nombre: 'Portal de Ventas',
      fechaInicio: new Date('2026-03-01'),
      estado: 'Finalizado',
      responsable: 'Ana Torres',
      monto: 1200000,
    },
  ];

  for (const proyecto of proyectosEstaticos) {
    await prisma.proyecto.create({
      data: {
        ...proyecto,
        createdBy: usuario.id,
      },
    });
  }

  console.log(`Proyectos estáticos creados para el usuario ${usuario.correo}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });