React component → Axios → Express route → Middleware → Controller → PostgreSQL → Controller response → React state → UI.

//create order
Checkout.jsx
     ↓
Axios POST /orders
     ↓
order.routes.js
     ↓
verifyToken
     ↓
createOrder()
     ↓
PostgreSQL
     ↓
Create order
     ↓
Create order_items
     ↓
Reduce stock
     ↓
Clear cart
     ↓
COMMIT
     ↓
Response
     ↓
React updates UI