import React from 'react'
import { BrowserRouter as Router,Routes , Route , Outlet , Navigate} from 'react-router-dom'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Home from './pages/Home'
import Orders from './pages/Orders/Orders'
import Payments from './pages/Payments'
import Sales from './pages/Sales'
import Return from './pages/Return'
import Customer from './pages/Customer'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Products from './pages/Products/Products'
import Staff from './pages/Staff'
import './App.css'
import AddProducts from './pages/Products/CreateProducts'
import Inventory from './pages/Inventory'

function App() {

  const PublicLayout = () =>(
    <div id='main'>
      <div id = 'header'><Header/></div>
      <div id = 'body'>
        <div className=' bg-blue-300 shadow-2xl' id = "sidebar"><Sidebar/></div>
        <div className='bg-blue-700 h-full w-full' id = 'outlet1'><Outlet/></div>
      </div>
    </div>
  )

  const SecLayout = () => (
    <div id='main'>
      <div id = 'header'><Header/></div>
        <div id = 'outlet'><Outlet/></div>
      </div>
  )

  return (

<Router>
  <Routes>
    <Route path='/' element={<Login/>}/>
    <Route element={<PublicLayout/>}>
    <Route path='/home' element={<Home/>}/>
    <Route path='/payments' element={<Payments/>}/>
    <Route path='/sales' element={<Sales/>}/>
    <Route path='/returns' element={<Return/>}/>
    <Route path="/customer" element={<Customer/>}/>
    <Route path="/staff" element={<Staff/>}/>
    <Route path="/profile" element={<Profile/>}/>
    <Route path="/products/*" element={<Products/>}/>
    <Route path="/orders/*" element={<Orders/>}/>
    <Route path='/inventory' element = {<Inventory/>}/>
    </Route>

    <Route element= {<SecLayout/>} >
    <Route path = '/dashboard' element={<Dashboard/>}/>
    </Route>
  
  </Routes>
</Router>
  )
}

export default App