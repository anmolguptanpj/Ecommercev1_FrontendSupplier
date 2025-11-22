import React from 'react'
import { Link } from 'react-router-dom'

function Insideheader({
  className ="",
  navClass="",
  style = {},
  navStyle = {},
  headerTitle = "",
  links = [
  ],
  headerStyle={}
}) {
  return (
    <div className={className} style={style}>
      <h2 style={{headerStyle}}>{headerTitle}</h2>

      <nav className={navClass} style={navStyle}>
        {links.map((l, index) => (
          <Link key={index} to={l.path}>
            {l.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}

export default Insideheader
