import { Global, Module, OnModuleDestroy, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { EncryptionService } from './encryption.service';
import {
    createExtendedPrismaClient,
    ExtendedPrismaClient,
} from './prisma.extension';

export const PRISMA_CLIENT = 'PRISMA_CLIENT';
const PG_POOL = 'PG_POOL';

@Global()
@Module({
    providers: [
        EncryptionService,
        {
            provide: PG_POOL,
            useFactory: (configService: ConfigService) => {
                return new Pool({
                    connectionString: configService.get<string>('DATABASE_URL'),
                });
            },
            inject: [ConfigService],
        },
        {
            provide: PRISMA_CLIENT,
            useFactory: (
                pool: Pool,
                encryptionService: EncryptionService,
            ): ExtendedPrismaClient => {
                const adapter = new PrismaPg(pool);
                const prisma = new PrismaClient({ adapter });
                return createExtendedPrismaClient(prisma, encryptionService);
            },
            inject: [PG_POOL, EncryptionService],
        },
    ],
    exports: [PRISMA_CLIENT, EncryptionService, PG_POOL],
})
export class PrismaModule implements OnModuleDestroy {
    constructor(
        @Inject(PG_POOL) private readonly pool: Pool,
    ) { }

    async onModuleDestroy() {
        await this.pool.end();
    }
}
