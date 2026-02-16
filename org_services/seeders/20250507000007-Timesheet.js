// seeders/20250507000007-Timesheet.js
'use strict';

export async function up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Timesheets', [
        {
            id: '22222222-3333-4444-5555-666666666661',
            employeeId: '123e4567-e89b-12d3-a456-426614174003', // John Doe
            clientId: '456789ab-cdef-1234-5678-901234567891', // Alice Johnson
            date: '2025-07-05',
            clockIn: new Date('2025-07-05T00:00:00.000Z'),
            clockOut: new Date('2025-07-05T00:00:00.000Z'),
            clientSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
            completedWorks: JSON.stringify([
                { workId: '789abcde-f123-4567-8901-234567890123', completed: true, code: 122, name: 'Meal Preparation' },
            ]),
            reason: "O",
            gps: 'O', // New York City
            createdAt: new Date('2025-07-05T00:00:00.000Z'),
            updatedAt: new Date('2025-07-05T00:00:00.000Z'),
        },
        {
            id: '22222222-3333-4444-5555-666666666662',
            employeeId: '123e4567-e89b-12d3-a456-426614174004', // Jane Smith
            clientId: '456789ab-cdef-1234-5678-901234567892', // Bob Williams
            date: '2025-07-05',
            clockIn: new Date('2025-07-05T00:00:00.000Z'),
            clockOut: new Date('2025-07-05T00:00:00.000Z'),
            clientSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
            completedWorks: JSON.stringify([
                { workId: '789abcde-f123-4567-8901-234567890123', completed: true, code: 122, name: 'Meal Preparation' },
            ]),
            reason: 'H',
            gps: 'H', // Los Angeles
            createdAt: new Date('2025-07-05T00:00:00.000Z'),
            updatedAt: new Date('2025-07-05T00:00:00.000Z'),
        },
    ], {});
}
export async function down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Timesheets', null, {});
}