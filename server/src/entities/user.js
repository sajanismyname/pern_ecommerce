import {
    EntitySchema
} from "typeorm"

export const User = new EntitySchema({

    name: "User",
    tableName: "users",

    columns:{
        id: {
        type: "int",
        primary: true,
        generated: true,
        },

        name: {
        type: "varchar",
        length: 100,
        },

        email: {
        type: "varchar",
        length: 150,
        unique: true,
        },

        password: {
        type: "varchar",
        length: 255,
        },

        role: {
        type: "enum",
        enum: ["user", "admin"],
        enumName: "user_role",
        default: "user",
        },

        created_at: {
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        },

        phone: {
        type: "varchar",
        length: 20,
        nullable: true,
    },
    },
})