Auth Controller
├── register        → Repository
├── login           → Repository
├── getMe           → Repository
├── updateProfile   → Repository
├── refreshToken    → Repository
└── logout          → Repository

Product Controller
├── getProducts     → Repository / query conditions
├── getById         → Repository
├── createProduct   → Repository
├── updateProduct   → Repository
└── deleteProduct   → Repository

Cart Controller
├── getCart         → Repository + relations
├── addToCart       → Repository
├── updateCartItem  → Repository
└── removeCartItem  → Repository

Order Controller
├── createOrder         → Repository + QueryRunner transaction
├── getMyOrders        → Repository + relations
├── getAdminOrders     → Repository + relations
└── updateOrderStatus  → Repository + QueryRunner + QueryBuilder
                         ↑
                    pessimistic lock