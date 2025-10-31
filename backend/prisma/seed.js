"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding database...');
    const restaurant = await prisma.restaurant.upsert({
        where: { id: 1 },
        update: {},
        create: {
            name: 'Le Petit Bistrot',
            logo: 'https://example.com/logo.png',
            googlePlaceId: null,
        },
    });
    console.log('✅ Created restaurant:', restaurant.name);
    const user = await prisma.user.upsert({
        where: { email: 'owner@lepetitbistrot.fr' },
        update: {},
        create: {
            email: 'owner@lepetitbistrot.fr',
            restaurantId: restaurant.id,
        },
    });
    console.log('✅ Created user:', user.email);
    await prisma.client.createMany({
        data: [
            {
                restaurantId: restaurant.id,
                name: 'Marie Dupont',
                email: 'marie@example.com',
                phone: '+33612345678',
                whatsappConsent: true,
            },
            {
                restaurantId: restaurant.id,
                name: 'Jean Martin',
                email: 'jean@example.com',
                phone: '+33687654321',
                whatsappConsent: false,
            },
        ],
        skipDuplicates: true,
    });
    console.log('✅ Created sample clients');
    await prisma.menu.create({
        data: {
            restaurantId: restaurant.id,
            items: [
                {
                    title: 'Salade César',
                    desc: 'Salade romaine, croûtons, parmesan, sauce César',
                    price: '12€',
                    category: 'Entrées',
                },
                {
                    title: 'Steak Frites',
                    desc: 'Steak de bœuf grillé avec frites maison',
                    price: '18€',
                    category: 'Plats',
                },
                {
                    title: 'Tarte Tatin',
                    desc: 'Tarte aux pommes caramélisées',
                    price: '8€',
                    category: 'Desserts',
                },
            ],
        },
    });
    console.log('✅ Created sample menu');
    await prisma.avis.createMany({
        data: [
            {
                restaurantId: restaurant.id,
                rating: 5,
                text: 'Excellent restaurant ! Service impeccable.',
            },
            {
                restaurantId: restaurant.id,
                rating: 4,
                text: 'Très bon, je recommande.',
            },
        ],
        skipDuplicates: true,
    });
    console.log('✅ Created sample reviews');
    await prisma.featureToggle.upsert({
        where: {
            restaurantId_key: {
                restaurantId: restaurant.id,
                key: 'reservations',
            },
        },
        update: {},
        create: {
            restaurantId: restaurant.id,
            key: 'reservations',
            enabled: false,
        },
    });
    console.log('✅ Created feature toggles');
    console.log('🎉 Seeding complete!');
}
main()
    .catch(e => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
