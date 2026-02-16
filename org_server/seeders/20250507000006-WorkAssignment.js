// seeders/20250507000006-WorkAssignment.js
export async function up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('WorkAssignments', [
        {
            id: '11111111-2222-3333-4444-555555555551',
            employeeId: '123e4567-e89b-12d3-a456-426614174003', // John Doe
            clientId: '456789ab-cdef-1234-5678-901234567891', // Alice Johnson
            workId: '789abcde-f123-4567-8901-234567890123', // Hygiene
            createdAt: new Date('2025-05-07T00:00:00.000Z'),
            updatedAt: new Date('2025-05-07T00:00:00.000Z'),
        },
        {
            id: '11111111-2222-3333-4444-555555555552',
            employeeId: '123e4567-e89b-12d3-a456-426614174004', // Jane Smith
            clientId: '456789ab-cdef-1234-5678-901234567892', // Bob Williams
            workId: '789abcde-f123-4567-8901-234567890124', // Meal Preparation
            createdAt: new Date('2025-05-07T00:00:00.000Z'),
            updatedAt: new Date('2025-05-07T00:00:00.000Z'),
        },
    ], {});
}
export async function down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('WorkAssignments', null, {});
}