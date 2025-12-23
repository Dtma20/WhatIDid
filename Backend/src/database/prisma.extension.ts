import { PrismaClient } from '@prisma/client';
import { EncryptionService } from './encryption.service';

export function createExtendedPrismaClient(
    prisma: PrismaClient,
    encryptionService: EncryptionService,
) {
    return prisma.$extends({
        query: {
            user: {
                async create({ args, query }: { args: any; query: any }) {
                    if (args.data.encryptedAccessToken) {
                        args.data.encryptedAccessToken = encryptionService.encrypt(
                            args.data.encryptedAccessToken,
                        );
                    }
                    return query(args);
                },

                async update({ args, query }: { args: any; query: any }) {
                    if (args.data.encryptedAccessToken) {
                        const token = args.data.encryptedAccessToken;
                        if (typeof token === 'string') {
                            args.data.encryptedAccessToken = encryptionService.encrypt(token);
                        }
                    }
                    return query(args);
                },

                async upsert({ args, query }: { args: any; query: any }) {
                    if (args.create.encryptedAccessToken) {
                        args.create.encryptedAccessToken = encryptionService.encrypt(
                            args.create.encryptedAccessToken,
                        );
                    }
                    if (args.update.encryptedAccessToken) {
                        const token = args.update.encryptedAccessToken;
                        if (typeof token === 'string') {
                            args.update.encryptedAccessToken = encryptionService.encrypt(token);
                        }
                    }
                    return query(args);
                },

                async findUnique({ args, query }: { args: any; query: any }) {
                    const result = await query(args);
                    if (result?.encryptedAccessToken) {
                        result.encryptedAccessToken = encryptionService.decrypt(
                            result.encryptedAccessToken,
                        );
                    }
                    return result;
                },

                async findFirst({ args, query }: { args: any; query: any }) {
                    const result = await query(args);
                    if (result?.encryptedAccessToken) {
                        result.encryptedAccessToken = encryptionService.decrypt(
                            result.encryptedAccessToken,
                        );
                    }
                    return result;
                },

                async findMany({ args, query }: { args: any; query: any }) {
                    const results = await query(args);
                    return results.map((user: any) => {
                        if (user.encryptedAccessToken) {
                            user.encryptedAccessToken = encryptionService.decrypt(
                                user.encryptedAccessToken,
                            );
                        }
                        return user;
                    });
                },
            },
        },
    });
}

export type ExtendedPrismaClient = ReturnType<typeof createExtendedPrismaClient>;
