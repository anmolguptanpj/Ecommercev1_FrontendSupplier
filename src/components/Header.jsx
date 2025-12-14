import React from 'react'
import { logout } from '../store/authSlice'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'

function Header() {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const links = "bg-blue-400 rounded-xl p-1 w-21 text-center hover:bg-green-400"


  const handleLogout = () =>{
    dispatch(logout());
    navigate("/");
  }
  return (
    
      <div className=' bg-slate-950 h-full w-full flex flex-row justify-center items-center '>
        <div className='w-[20%] flex justify-center items-center font-bold text-4xl'>
          <p>Codex</p>
        </div>
        <div className='w-[80%] flex justify-evenly items-center'>
          <Link className={links} to={'/dashboard'}>Dashboard</Link>
          <Link className={links} to={'/home'}>Home</Link>
          <button className={links} onClick={handleLogout}>
        Logout
        </button>
        </div>
      </div>
    

  )
}

export default Header