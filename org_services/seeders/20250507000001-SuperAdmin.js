// seeders/20250507000001-SuperAdmin.js
import { hash } from 'bcryptjs';

export async function up(queryInterface, Sequelize) {
    const hashedPassword = await hash('password123', 10);
    await queryInterface.bulkInsert('SuperAdmins', [
        {
            id: '123e4567-e89b-12d3-a456-426614174001',
            email: 'superadmin1@healthcare.org',
            password: hashedPassword,
            createdAt: new Date('2025-07-05T00:00:00.000Z'),
            updatedAt: new Date('2025-07-05T00:00:00.000Z'),
        },
        {
            id: '123e4567-e89b-12d3-a456-426614174002',
            email: 'superadmin2@healthcare.org',
            password: hashedPassword,
            createdAt: new Date('2025-07-05T00:00:00.000Z'),
            updatedAt: new Date('2025-07-05T00:00:00.000Z'),
        },
    ], {});
}
export async function down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('SuperAdmins', null, {});
}