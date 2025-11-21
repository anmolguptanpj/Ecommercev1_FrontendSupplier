import React, { useEffect, useState } from 'react'
import { useDispatch,useSelector } from 'react-redux'
import { login } from '../store/authSlice'
import { useNavigate } from 'react-router-dom'

function Login() {

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const {loading,error,isAuthenticated} = useSelector((state)=> state.auth);


  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const loginFrom = "SUPPLIER"
  function handleSubmit(e){
    e.preventDefault();

    dispatch(login({email,password,loginFrom}))
    .unwrap()
    .then(()=>{
      navigate("/home")
    })
    .catch((err)=>console.log("Login Failed:",err));
    

  };


  useEffect(()=>{if(isAuthenticated){
    navigate("/home");
  }},[isAuthenticated,navigate])
    
  return (
  <div>
    <form onSubmit={handleSubmit}>
    <input  type="email" placeholder="Enter your Email" value = {email} onChange={(e)=>setEmail(e.target.value)}/><br/>
    <input type='password'  placeholder=" Enter your password "  value = {password} onChange={(e)=>setPassword(e.target.value)}/><br/>
    <button type='submit' disabled = {loading}>{loading ? "Loggin in..." : "Login"}</button>
    </form>


    {error && <p style={{color :"red"}}>{error}</p>}
    {isAuthenticated && <p style={{color:"green"}}>Logged in Successfully </p>}
  </div>
  )
}

export default Login