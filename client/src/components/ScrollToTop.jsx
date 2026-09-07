import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop=()=>{
    const {pathway}=useLocation()

    useEffect(()=>{
        window.scrollTo(0,0)
    },[pathway])

        return null
}

export default ScrollToTop