// seeders/20250507000004-Client.js
export async function up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Clients', [
        {
            id: '456789ab-cdef-1234-5678-901234567891',
            name: 'Alice Johnson',
            medicalId: 'MED001',
            signature: null,
            contactNumber: '555-123-4567',
            email: 'alice.johnson@example.com',
            orgId: '987fcdeb-1234-5678-9012-345678901234', // Belongs to Org 1
            createdAt: new Date('2025-07-05T00:00:00.000Z'),
            updatedAt: new Date('2025-07-05T00:00:00.000Z'),
        },
        {
            id: '456789ab-cdef-1234-5678-901234567892',
            name: 'Bob Williams',
            medicalId: 'MED002',
            signature: null,
            contactNumber: '555-987-6543',
            email: 'bob.williams@example.com',
            orgId: '987fcdeb-1234-5678-9012-345678901235', // Belongs to Org 2
            createdAt: new Date('2025-07-05T00:00:00.000Z'),
            updatedAt: new Date('2025-07-05T00:00:00.000Z'),
        },
    ], {});
}
export async function down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Clients', null, {});
}