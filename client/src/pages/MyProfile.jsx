import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { User, Mail, Shield, LogOut, Pencil, Save, X, } from "lucide-react";
import { Button } from "../components/ui/button";
import {updateProfileSchema} from "../validation/authSchema";
import { useState, useEffect } from "react";

const MyProfile = () => {
    const { user, logout, isAdmin, updateUser } = useAuth()
    const navigate = useNavigate()

    const [editing, setEditing] = useState(false)

    const [form, setForm] = useState({
        name: user?.name || "",
        email: user?.email || "",
    })

    const [error, setError] = useState("")
    const [saving, setSaving] = useState(false)

        useEffect(() => {
            window.scrollTo(0, 0);
        }, []);

    const handleChange = (field) => (e) => {
        setForm({
            ...form,
            [field]: e.target.value
        })
    }

    const handleEdit = () => {
        setForm({
            name: user?.name || "",
            email: user?.email || "",
        })

        setError("")
        setEditing(true)
    }

    const handleCancel = () => {
        setForm({
            name: user?.name || "",
            email: user?.email || "",
        })

        setError("")
        setEditing(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        setError("")

        const result = updateProfileSchema.safeParse(form)

        if (!result.success) {
            setError(result.error.issues[0].message)
            return
        }

        setSaving(true)

        try {
            await updateUser(result.data)

            setEditing(false)
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "could not update profile"
            )
        } finally {
            setSaving(false)
        }

    }

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    if (!user) {
        return (
            <div className="mx-auto max-w-xl px-6 py-10">
                <p className="text-muted">Please login to view your profile</p>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">

            {/* PAGE HEADER */}
            <div className="mb-8">
                <h1 className="text-3xl font-800 text-ink">
                    My Profile
                </h1>

                <p className="mt-1 text-muted">
                    Manage your account information.
                </p>
            </div>

            <div className="card overflow-hidden">

                {/* PROFILE HEADER */}
                <div className="flex flex-col items-center gap-4 border-b border-border p-6 sm:flex-row">

                    {/* Avatar */}
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        <User size={40} />
                    </div>

                    <div className="text-center sm:text-left">
                        <h2 className="text-xl font-bold text-ink">
                            {user.name}
                        </h2>

                        <p className="break-all text-sm text-muted">
                            {user.email}
                        </p>

                        <span className="mt-2 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                            {isAdmin ? "Administrator" : "Customer"}
                        </span>
                    </div>
                </div>

                {/* ACCOUNT INFORMATION */}
                <form onSubmit={handleSubmit}>

                    <div className="space-y-5 p-6">

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <h3 className="text-lg font-semibold text-ink">
                                Account Information
                            </h3>

                            {!editing && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleEdit}
                                >
                                    <Pencil size={16} />
                                    Edit Profile
                                </Button>
                            )}
                        </div>

                        {/* NAME */}
                        <div>
                            <label className="label">
                                Name
                            </label>

                            {editing ? (
                                <input
                                    type="text"
                                    className="input"
                                    value={form.name}
                                    onChange={handleChange("name")}
                                />
                            ) : (
                                <div className="flex items-center gap-3">
                                    <User
                                        size={18}
                                        className="shrink-0 text-muted"
                                    />

                                    <p className="font-medium text-slate-900">
                                        {user.name}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* EMAIL */}
                        <div>
                            <label className="label">
                                Email
                            </label>

                            {editing ? (
                                <input
                                    type="email"
                                    className="input"
                                    value={form.email}
                                    onChange={handleChange("email")}
                                />
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Mail
                                        size={18}
                                        className="shrink-0 text-muted"
                                    />

                                    <p className="break-all font-medium text-slate-900">
                                        {user.email}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* ROLE */}
                        <div>
                            <label className="label">
                                Account Type
                            </label>

                            <div className="flex items-center gap-3">
                                <Shield
                                    size={18}
                                    className="shrink-0 text-muted"
                                />

                                <p className="font-medium capitalize text-slate-900">
                                    {user.role}
                                </p>
                            </div>
                        </div>

                        {/* ERROR */}
                        {error && (
                            <p className="text-sm text-red-600">
                                {error}
                            </p>
                        )}
                    </div>

                    {/* SAVE / CANCEL */}
                    {editing && (
                        <div className="flex flex-col gap-3 border-t border-border p-6 sm:flex-row">

                            <Button
                                type="submit"
                                variant="outline"
                                disabled={saving}
                                className="w-full sm:w-auto"
                            >
                                <Save size={18} />

                                {saving
                                    ? "Saving..."
                                    : "Save Changes"}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                className="w-full sm:w-auto"
                            >
                                <X size={18} />
                                Cancel
                            </Button>

                        </div>
                    )}
                </form>

                {/* LOGOUT / BACK */}
                {!editing && (
                    <div className="flex flex-col gap-3 border-t border-border p-6 sm:flex-row">

                        <Button
                            variant="destructive"
                            onClick={handleLogout}
                            className="w-full sm:w-auto"
                        >
                            <LogOut size={18} />
                            Logout
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => navigate("/")}
                            className="w-full sm:w-auto"
                        >
                            Back to Home
                        </Button>

                    </div>
                )}

            </div>
        </div>
    );
};

export default MyProfile