import { Link, useLocation } from "react-router-dom";

const PaymentSuccess = ()=>{
    const {state}=useLocation()

    const order=state?.order;

    if(!order){
        return (
            <div className="mx-auto max-w-xl px-6 py-10 text-center">
                <h1 className="text-2xl font-bold">
                    Order not found
                </h1>

                <Link
                    to="/"
                    className="btn-primary mt-6 inline-block"
                >
                    Back to Home
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-xl px-6 py-16 text-center">

            <div className="mb-6 text-5xl">
                ✓
            </div>

            <h1 className="text-3xl font-bold text-ink">
                Payment Successful
            </h1>

            <p className="mt-2 text-muted">
                Your order has been placed successfully.
            </p>

            <div className="card mt-8 p-6 text-left">

                <div className="flex justify-between">
                    <span>Order ID</span>
                    <span className="font-semibold">
                        #{order.id}
                    </span>
                </div>

                <div className="mt-3 flex justify-between">
                    <span>Payment</span>
                    <span className="font-semibold">
                        {order.payment_method}
                    </span>
                </div>

                <div className="mt-3 flex justify-between">
                    <span>Status</span>
                    <span className="font-semibold text-green-600">
                        {order.payment_status}
                    </span>
                </div>

                <div className="mt-3 flex justify-between">
                    <span>Total</span>
                    <span className="font-bold">
                        Rs{Number(order.total).toFixed(2)}
                    </span>
                </div>

            </div>

            <Link
                to="/"
                className="btn-primary mt-6 inline-block"
            >
                Continue Shopping
            </Link>

        </div>
    );
}

export default PaymentSuccess