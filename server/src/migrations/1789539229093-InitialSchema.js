export class InitialSchema1789539229093 {
    name = "InitialSchema1789539229093";

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "products_created_by_fkey"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_product_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_user_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "orders_user_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "order_items_order_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "order_items_product_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "products_price_check"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "products_stock_check"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_quantity_check"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_user_id_product_id_key"`);

        await queryRunner.query(`ALTER TABLE "users" ADD "phone" character varying(20)`);

        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "created_at" SET DEFAULT now()`);

        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "CHK_90ac64027434b412e08988bcac" CHECK ("price" >= 0)`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "CHK_1f5ec29fd762bd3d512d5a0434" CHECK ("stock" >= 0)`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "CHK_66dd42f2aee15437b7ec8caf99" CHECK ("quantity" > 0)`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "UQ_b2c6ebe6bd6f9a4e6bbd8ab082e" UNIQUE ("user_id", "product_id")`);

        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_c1af9b47239151e255f62e03247" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "FK_b7213c20c1ecdc6597abc8f1212" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "FK_30e89257a105eab7648a35c7fce" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_a922b820eeef29ac1c6800e826a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_145532db85752b29c57d2b7b1f1" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_9263386c35b6b242540f9493b00" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_9263386c35b6b242540f9493b00"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_145532db85752b29c57d2b7b1f1"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_a922b820eeef29ac1c6800e826a"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "FK_30e89257a105eab7648a35c7fce"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "FK_b7213c20c1ecdc6597abc8f1212"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_c1af9b47239151e255f62e03247"`);

        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "UQ_b2c6ebe6bd6f9a4e6bbd8ab082e"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "CHK_66dd42f2aee15437b7ec8caf99"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "CHK_1f5ec29fd762bd3d512d5a0434"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "CHK_90ac64027434b412e08988bcac"`);

        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP`);

        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phone"`);

        await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_user_id_product_id_key" UNIQUE ("user_id", "product_id")`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_quantity_check" CHECK ((quantity > 0))`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "products_stock_check" CHECK ((stock >= 0))`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "products_price_check" CHECK ((price >= (0)::numeric))`);

        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "products_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }
}