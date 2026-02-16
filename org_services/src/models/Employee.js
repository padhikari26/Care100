
import { DataTypes, Op } from 'sequelize';

export default (sequelize) => {
    const Employee = sequelize.define('Employee', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        ssn: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        code: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
        },
        signature: {
            type: DataTypes.TEXT('long'),
            allowNull: true,
        },
        role: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        reportingTo: {
            type: DataTypes.STRING,
        },
        contactNumber: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        address: {
            type: DataTypes.TEXT,
        },
        gender: {
            type: DataTypes.STRING,
        },
        dob: {
            type: DataTypes.DATEONLY,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            get() {
                return this.getDataValue('createdAt')?.toISOString();
            },
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            get() {
                return this.getDataValue('updatedAt')?.toISOString();
            },
        },
    });

    Employee.associate = (models) => {
        Employee.belongsTo(models.Organization, {
            foreignKey: 'orgId',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
        Employee.hasMany(models.WorkAssignment, {
            foreignKey: 'employeeId',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
        Employee.hasMany(models.Timesheet, {
            foreignKey: 'employeeId',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
    };

    return Employee;
};