    import { EntitySchema } from "typeorm";

    export const OrderItem = new EntitySchema({
    name: "OrderItem",
    tableName: "order_items",

    columns: {
        id: {
        type: "int",
        primary: true,
        generated: true,
        },

        order_id: {
        type: "int",
        },

        product_id: {
        type: "int",
        },

        quantity: {
        type: "int",
        },

        price: {
        type: "numeric",
        precision: 10,
        scale: 2,
        },
    },

    relations: {
        order: {
        type: "many-to-one",
        target: "Order",
        joinColumn: {
            name: "order_id",
        },
        onDelete: "CASCADE",
        },

        product: {
        type: "many-to-one",
        target: "Product",
        joinColumn: {
            name: "product_id",
        },
        },
    },
    });