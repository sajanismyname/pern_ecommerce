import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "../entities/user.js"

export const AppDataSource = new DataSource({
    type:"postgres",

    host: process.env.PG_HOST,
    port: Number(process.env.PG_PORT),
    username: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,

    entities: [User],
    migrations: [],

    synchronize:false,
    logging: false

})
