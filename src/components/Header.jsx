import React from 'react'
import { logout } from '../store/authSlice'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'

function Header() {

  const dispatch = useDispatch();
  const navigate = useNavigate();


  const handleLogout = () =>{
    dispatch(logout());
    navigate("/");
  }
  return (
    <div>Header
      <div>
        <button onClick={handleLogout}>
        Logout
        </button>
      </div>
    </div>

  )
}

export default Header