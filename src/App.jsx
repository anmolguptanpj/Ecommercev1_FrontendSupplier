import React, { useEffect } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
} from 'react-router-dom'

import { useDispatch, useSelector } from 'react-redux'


import Sidebar from './components/Sidebar'

import Login from './pages/Login'
import Home from './pages/Home'
import Orders from './pages/Orders'
import Payments from './pages/Payments'
import Sales from './pages/Sales'
import Return from './pages/Return'
import Customer from './pages/Customer'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Products from './pages/Products/Products'
import Staff from './pages/Staff'
import Inventory from './pages/Inventory'

import './App.css'

import { getCurrentUser } from './store/authSlice'
import { store } from './store/store'

function App() {

  const state = store.getState()
  console.log(state)
  const dispatch = useDispatch()

  const { isAuthenticated, authChecking } = useSelector(
    (state) => state.auth
  )

  useEffect(() => {
    dispatch(getCurrentUser())
  }, [dispatch])

  const PublicLayout = () => (
    <div id='main' className='bg-white flex text-black'>
      
          <Sidebar />
          <Outlet />
    
    </div>
  )

  const ProtectedRoute = ({ children }) => {
    if (authChecking) {
      return <div>Loading...</div>
    }

    if (!isAuthenticated) {
      return <Navigate to='/' replace />
    }

    return children
  }

  return (
    <Router>
      <Routes>
        <Route path='/' element={<Login />} />

        <Route
          element={
            <ProtectedRoute>
              <PublicLayout />
            </ProtectedRoute>
          }
        >
          <Route path='/home' element={<Home />} />
          <Route path='/payments' element={<Payments />} />
          <Route path='/sales' element={<Sales />} />
          <Route path='/returns' element={<Return />} />
          <Route path='/customer' element={<Customer />} />
          <Route path='/staff' element={<Staff />} />
          <Route path='/profile' element={<Profile />} />
          <Route path='/products' element={<Products />} />
          <Route path='/orders' element={<Orders />} />
          <Route path='/inventory' element={<Inventory />} />
          <Route path='/dashboard' element={<Dashboard />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App