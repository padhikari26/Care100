// seeders/20250507000003-Employee.js
import { hash } from 'bcryptjs';

export async function up(queryInterface, Sequelize) {
    const hashedPassword = await hash('emppassword123', 10);
    await queryInterface.bulkInsert('Employees', [
        {
            id: '123e4567-e89b-12d3-a456-426614174003',
            name: 'John Doe',
            email: 'john.doe@healthcare.org',
            code: "1234",
            signature: null,
            role: 'Caregiver',
            reportingTo: null,
            contactNumber: '123-456-7890',
            address: '123 Main St, City',
            gender: 'Male',
            dob: '1985-01-01',
            orgId: '987fcdeb-1234-5678-9012-345678901234', // Belongs to Org 1
            createdAt: new Date('2025-07-05T00:00:00.000Z'),
            updatedAt: new Date('2025-07-05T00:00:00.000Z'),
        },
        {
            id: '123e4567-e89b-12d3-a456-426614174004',
            name: 'Jane Smith',
            email: 'jane.smith@healthcare.org',
            code: "12345",
            signature: null,
            role: 'Nurse',
            reportingTo: null,
            contactNumber: '987-654-3210',
            address: '456 Oak Ave, Town',
            gender: 'Female',
            dob: '1990-02-15',
            orgId: '987fcdeb-1234-5678-9012-345678901235', // Belongs to Org 2
            createdAt: new Date('2025-07-05T00:00:00.000Z'),
            updatedAt: new Date('2025-07-05T00:00:00.000Z'),
        },
    ], {});
}
export async function down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Employees', null, {});
}