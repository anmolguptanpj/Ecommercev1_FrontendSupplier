import { useSelector } from "react-redux";

export const useExtraDetails = () =>{
    return useSelector(state=>state.auth.extraDetails)
}