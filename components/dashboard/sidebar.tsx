import type React from "react"
import { Link } from "react-router-dom"

const Sidebar: React.FC = () => {
  const navItems = [
    { href: "/dashboard/content", label: "Content" },
    { href: "/dashboard/users", label: "Users" },
    { href: "/dashboard/services", label: "Services" },
  ]

  return (
    <div className="sidebar">
      {navItems.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground"
        >
          <svg aria-hidden="true" focusable="false" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <title>{item.label}</title>
            <rect x="3" y="4" width="7" height="7" rx="1"></rect>
            <rect x="14" y="4" width="7" height="7" rx="1"></rect>
            <rect x="3" y="15" width="7" height="7" rx="1"></rect>
            <rect x="14" y="15" width="7" height="7" rx="1"></rect>
          </svg>
          <span>{item.label}</span>
        </Link>
      ))}
    </div>
  )
}

export default Sidebar
