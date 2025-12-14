import React from 'react'
import { Link } from 'react-router-dom'

function Insideheader({
  className ="",
  navClass="",
  style = {},
  navStyle = {},
  headerTitle = "",
  headerClass="",
  linkclass="",
  links = [
  ],
  headerStyle={}
}) {
  return (
    <div className={`${className} h-15`} style={style}>
      <h2 className={headerClass} style={{headerStyle}}>{headerTitle}</h2>

      <nav className={navClass} style={navStyle}>
        {links.map((l, index) => (
          <Link className={linkclass} key={index} to={l.path}>
            {l.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}

export default Insideheader
