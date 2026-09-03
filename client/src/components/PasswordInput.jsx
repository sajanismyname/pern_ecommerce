    import { useState } from "react"; 
    import { Eye, EyeOff } from "lucide-react"; 
    
    const PasswordInput = ({ value, onChange, placeholder = "Password" }) => { 
    const [showPassword, setShowPassword] = useState(false); 
    
    return (
        <div className="relative"> 
        <input 
            type={showPassword ? "text" : "password"} 
            value={value} 
            onChange={onChange} 
            placeholder={placeholder} 
            className="input w-full pr-10" 
        /> 
    
        <button 
            type="button" 
            onClick={() => setShowPassword((prev) => !prev)} 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink" 
            aria-label={showPassword ? "Hide password" : "Show password"} 
        > 
            {showPassword ? (
            <EyeOff size={18} />
            ) : (
            <Eye size={18} />
            )}
        </button>
        </div>
    );
    };

    export default PasswordInput;