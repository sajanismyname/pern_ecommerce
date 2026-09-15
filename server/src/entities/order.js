    import { EntitySchema } from "typeorm";

    export const Order = new EntitySchema({
    name: "Order",
    tableName: "orders",

    columns: {
        id: {
        type: "int",
        primary: true,
        generated: true,
        },

        order_number: {
        type: "varchar",
        length: 20,
        unique: true,
        nullable: true,
        },

        user_id: {
        type: "int",
        },

        total: {
        type: "numeric",
        precision: 10,
        scale: 2,
        },

        payment_method: {
        type: "varchar",
        length: 50,
        },

        payment_status: {
        type: "varchar",
        length: 30,
        default: "paid",
        },

        order_status: {
        type: "varchar",
        length: 30,
        default: "pending",
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