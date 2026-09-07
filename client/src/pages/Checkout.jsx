import React, { useState } from 'react'
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import api from "../api/axios.js"

const Checkout = () => {

    const {items, total, refreshCart}= useCart();
    const navigate=useNavigate()

    const[paymentMethod, setPaymentMethod]= useState("Dummy eSewa");
    const[loading, setLoading]=useState(false)
    const[error, setError]=useState("")

    const handleCheckout = async () =>{
        setError("")
        setLoading(true);

        try {
            const res = await api.post("/orders", {
                paymentMethod,
            })

            await refreshCart()

            navigate("/payment-success", {
                state: {
                    order: res.data.order,
                }
            })
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Could not complete checkout."
            );
        } finally {
            setLoading(false);
        }

            if (items.length === 0) {
            return (
                <div className="mx-auto max-w-2xl px-6 py-10 text-center">
                    <h1 className="text-2xl font-bold text-ink">
                        Your cart is empty
                    </h1>
                </div>
            );
        }
    }

    return (
        <div className="mx-auto max-w-2xl px-6 py-10">

            <h1 className="mb-8 text-3xl font-bold text-ink">
                Checkout
            </h1>

            <div className="card p-6">

                <h2 className="mb-4 text-lg font-semibold text-ink">
                    Order Summary
                </h2>

                <div className="space-y-3">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="flex justify-between"
                        >
                            <span>
                                {item.name} × {item.quantity}
                            </span>

                            <span>
                                Rs{(
                                    Number(item.price) *
                                    item.quantity
                                ).toFixed(2)}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="my-6 border-t border-border pt-4">
                    <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>Rs{total.toFixed(2)}</span>
                    </div>
                </div>

                <h2 className="mb-4 text-lg font-semibold text-ink">
                    Payment Method
                </h2>

                <div className="space-y-3">

                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-4">
                        <input
                            type="radio"
                            value="Dummy eSewa"
                            checked={paymentMethod === "Dummy eSewa"}
                            onChange={(e) =>
                                setPaymentMethod(e.target.value)
                            }
                        />

                        <span>Dummy eSewa</span>
                    </label>

                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-4">
                        <input
                            type="radio"
                            value="Dummy Khalti"
                            checked={paymentMethod === "Dummy Khalti"}
                            onChange={(e) =>
                                setPaymentMethod(e.target.value)
                            }
                        />

                        <span>Dummy Khalti</span>
                    </label>

                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-4">
                        <input
                            type="radio"
                            value="Cash on Delivery"
                            checked={paymentMethod === "Cash on Delivery"}
                            onChange={(e) =>
                                setPaymentMethod(e.target.value)
                            }
                        />

                        <span>Cash on Delivery</span>
                    </label>

                </div>

                {error && (
                    <p className="mt-4 text-sm text-red-600">
                        {error}
                    </p>
                )}

                <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="btn-primary mt-6 w-full"
                >
                    {loading
                        ? "Processing..."
                        : `Pay Rs${total.toFixed(2)}`}
                </button>

            </div>
        </div>
    );
};

export default Checkout