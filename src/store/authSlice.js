import {createSlice,createAsyncThunk} from "@reduxjs/toolkit"
import api from "../api"


/************LOGIN***********/

export const login = createAsyncThunk(
    "/login",
    async({email,password,loginFrom},{rejectWithValue}) => {
        try {
            const res = await api.post("/login",{
                email,password,loginFrom
            });
            console.log(response.data);

        } catch (error) {
            return rejectWithValue(error.response?.datan || "loginfailed")
            
        }
    }
);



export const refresh = createAsyncThunk("/refresh",
    async(_,{rejectWithValue}) =>{
        try {
            const refreshToken = localStorage.getItem("refreshToken");
            const res = api.post("/refresh",{refreshToken});

            return res.data.accessToken
            
        } catch (error) {
            return rejectWithValue("Session expired, Please login again ");
            
        }
    }
)