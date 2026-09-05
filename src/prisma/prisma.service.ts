import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    try {
      await this.$connect();
    } catch (error) {
      console.warn('Advertencia: No se pudo conectar a MySQL en onModuleInit:', (error as Error).message);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
