    import { EntitySchema } from "typeorm";

export const CartItem = new EntitySchema({
    name: "CartItem",
    tableName: "cart_items",

    columns: {
        id: {
        type: "int",
        primary: true,
        generated: true,
        },

        user_id: {
        type: "int",
        },

        product_id: {
        type: "int",
        },

        quantity: {
        type: "int",
        default: 1,
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

        product: {
        type: "many-to-one",
        target: "Product",
        joinColumn: {
            name: "product_id",
        },
        onDelete: "CASCADE",
        },
    },
    
    uniques: [
    {
        columns: ["user_id", "product_id"],
    },
    ],


    checks: [
    {
        expression: `"quantity" > 0`,
    },
    ],
});