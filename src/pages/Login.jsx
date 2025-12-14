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
  const [show,setShow] = useState(false)
  function handleSubmit(e){
    e.preventDefault();

    dispatch(login({email,password,loginFrom}))
    .unwrap()
    .then(()=>{
      navigate("/home")
    })
    .catch((error)=>console.log("Login Failed:",error));
    

  };


  useEffect(()=>{if(isAuthenticated){
    navigate("/home");
  }},[isAuthenticated,navigate])
    
  return (
    <div className='w-screen h-screen flex flex-col items-center bg-blue-950'>

      <div className='text-4xl p-30'>
        <p className='font-bold'>Welcome to login page</p>
      </div>

      <form className='flex flex-col gap-3 ' onSubmit={handleSubmit}>
        <input
        className='border-3 w-100 p-1'
          type='email'
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br />

       <div className='flex flex-col g'>
         <input
           className='border-3 w-100 p-1'
          type={show ? "text" : "password"}
          placeholder='Enter Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
       <div className='flex gap-2 justify-center' > <label className='text-xl'>Show password</label> <input className='border-3 w-6 h-6 outline-none  rounded-2xl' type='checkbox' value={show} onClick={()=>setShow(prev => !prev)}/>
        </div>
       </div>

        <br />

      <div className='flex flex-row w-full justify-center'>
          <button className={`${loading ? "bg-yellow-400" : "bg-green-500"} w-50 p-2 border-4 border-transparent`} type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
      </form>

      {error && <p className='p-5' style={{ color: "red" }}>{error}</p>}
      {isAuthenticated && <p style={{ color: "green" }}>Logged in Successfully</p>}
    </div>
  )
}

export default Login