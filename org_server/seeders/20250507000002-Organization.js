// seeders/20250507000002-Organization.js
import { hash } from 'bcryptjs';

export async function up(queryInterface, Sequelize) {
    const hashedPassword = await hash('orgpassword123', 10);
    await queryInterface.bulkInsert('Organizations', [
        {
            id: '987fcdeb-1234-5678-9012-345678901234',
            orgName: 'HealthCare Org 1',
            orgType: 'Medical',
            logo: 'https://example.com/logo1.png',
            providerId: 'PROV001',
            description: 'Primary healthcare provider',
            email: 'org1@healthcare.org',
            password: hashedPassword,
            createdAt: new Date('2025-07-05T00:00:00.000Z'),
            updatedAt: new Date('2025-07-05T00:00:00.000Z'),
            expiryDate: new Date('2025-07-25T00:00:00.000Z'),
        },
        {
            id: '987fcdeb-1234-5678-9012-345678901235',
            orgName: 'HealthCare Org 2',
            orgType: 'Rehabilitation',
            logo: 'https://example.com/logo2.png',
            providerId: 'PROV002',
            description: 'Rehabilitation services',
            email: 'org2@healthcare.org',
            password: hashedPassword,
            createdAt: new Date('2025-07-05T00:00:00.000Z'),
            updatedAt: new Date('2025-07-05T00:00:00.000Z'),
            expiryDate: new Date('2026-07-23T00:00:00.000Z'),
        },
    ], {});
}
export async function down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Organizations', null, {});
}