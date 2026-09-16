import { EntitySchema } from "typeorm";

export const RefreshToken = new EntitySchema({
    name: "RefreshToken",
    tableName: "refresh_tokens",

    columns: {
        id: {
            type: "int",
            primary: true,
            generated: true,
        },

        user_id: {
            type: "int",
        },

        token_hash: {
            type: "varchar",
            length: 255,
        },

        expires_at: {
            type: "timestamp",
        },

        created_at: {
            type: "timestamp",
            default: () => "CURRENT_TIMESTAMP",
        },
    },

    relations: {
        user: {
            type: "many-to-one",
            target: "User",
            joinColumn: {
                name: "user_id",
            },
            onDelete: "CASCADE",
        },
    },
});