import "dotenv/config"
import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "../entities/user.js"
import { Product } from "../entities/product.js";
import {CartItem} from "../entities/cart.js"
import {Order} from "../entities/order.js"
import {OrderItem} from "../entities/orderItem.js"

export const AppDataSource = new DataSource({
    type:"postgres",

    host: process.env.PG_HOST,
    port: Number(process.env.PG_PORT),
    username: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,

    entities: [User, Product, CartItem, Order, OrderItem],
    migrations: ["src/migrations/*.js"],

    synchronize:false,
    logging: false

})
