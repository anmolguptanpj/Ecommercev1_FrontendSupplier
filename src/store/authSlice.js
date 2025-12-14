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
            console.log(res.data)
           return res.data
        } catch (err) {
            return rejectWithValue(err?.message|| "login failed")
            
        }
    }
);





const authSlice = createSlice({
    name:"auth",
    initialState:{
        user:(()=>{
            const stored = localStorage.getItem("user");
            try {
                return stored  && stored !== "undefined" ? JSON.parse(stored): null;
            } catch (error) {
                return null;
            }
        })(),
        extraDetails:(()=>{
            const stored = localStorage.getItem("extraDetails");
            try {
                return stored  && stored !== "undefined" ? JSON.parse(stored): null;
            } catch (error) {
                return null;
            }
        })(),
        accessToken:localStorage.getItem("accessToken") || null,
        refreshToken: localStorage.getItem("refreshToken") || null,
        loading : false, 
        error: null,
        isAuthenticated: !!localStorage.getItem("accessToken"),
    },


    reducers: {
        logout:(state) => {
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            state.extraDetails = null;

            localStorage.removeItem("user");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("extraDetails")
        }
    },
        extraReducers: (builder) => {
            /////////----------------------------LOGIN HANDLER--------------------------/
            builder
            .addCase(login.pending,(state)=>{
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled,(state,action)=>{
                state.loading = false;

                const user = action.payload.data.user;
                const accessToken = action.payload.data.accessToken;
                const refreshToken = action.payload.data.refreshToken;
                const extraDetails = action.payload.data.extraDetails;

                state.user = user;
                state.accessToken = accessToken;
                state.refreshToken = refreshToken;
                state.isAuthenticated = true;
                state.extraDetails = extraDetails;

                localStorage.setItem("user",JSON.stringify(user));
                localStorage.setItem("extraDetails",JSON.stringify(extraDetails));
                localStorage.setItem("accessToken",accessToken);
                localStorage.setItem("refreshToken",refreshToken);
            })
            .addCase(login.rejected,(state,action)=>{
                state.loading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
            });

          
        }

});

export const { logout } = authSlice.actions;
export default authSlice.reducer;