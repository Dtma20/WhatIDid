import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    await prisma.user.upsert({
        where: { githubId: 'mock-dev-user' },
        update: {},
        create: {
            githubId: 'mock-dev-user',
            username: 'dev-user',
            avatarUrl: 'https://avatars.githubusercontent.com/u/0',
            encryptedAccessToken: 'mock-token-for-development',
        },
    });

    console.log('Seed completed successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
