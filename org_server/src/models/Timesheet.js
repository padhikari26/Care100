// models/Timesheet.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Timesheet = sequelize.define('Timesheet', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        employeeId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        clientId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        clockIn: {
            type: DataTypes.DATE,
            allowNull: false,
            get() {
                const value = this.getDataValue('clockIn');
                return value ? value.toISOString() : null;
            },
        },
        clockOut: {
            type: DataTypes.DATE,
            allowNull: true,
            get() {
                const value = this.getDataValue('clockOut');
                return value ? value.toISOString() : null;
            },
        },
        clientSignature: {
            type: DataTypes.TEXT('long'),
            allowNull: true,
        },
        completedWorks: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
            get() {
                const value = this.getDataValue('completedWorks');
                return typeof value === 'string' ? JSON.parse(value) : value;
            },
        },
        reason: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        gps: {
            type: DataTypes.TEXT,
            allowNull: true,
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

    Timesheet.associate = (models) => {
        Timesheet.belongsTo(models.Employee, {
            foreignKey: 'employeeId',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
        Timesheet.belongsTo(models.Client, {
            foreignKey: 'clientId',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
    };

    return Timesheet;
};