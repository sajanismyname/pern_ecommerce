    import { EntitySchema } from "typeorm";

export const Product = new EntitySchema({
    name: "Product",
    tableName: "products",

    columns: {
        id: {
        type: "int",
        primary: true,
        generated: true,
        },

        name: {
        type: "varchar",
        length: 150,
        },

        description: {
        type: "text",
        nullable: true,
        },

        price: {
        type: "numeric",
        precision: 10,
        scale: 2,
        },

        stock: {
        type: "int",
        default: 0,
        },


        image_url: {
        type: "varchar",
        length: 500,
        nullable: true,
        },

        category: {
        type: "varchar",
        length: 100,
        nullable: true,
        },

        created_by: {
        type: "int",
        nullable: true,
        },

        created_at: {
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        },

        updated_at: {
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
        },
    },

            checks: [
        {
            expression: `"price" >= 0`,
        },
        {
            expression: `"stock" >= 0`,
        },
        ],

    relations: {
        createdBy: {
        type: "many-to-one",
        target: "User",
        joinColumn: {
            name: "created_by",
        },
        onDelete: "SET NULL",
        },
    },
});