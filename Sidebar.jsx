import React from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Map, 
  CloudSun, 
  Coins, 
  Sparkles, 
  User, 
  Briefcase, 
  Settings 
} from "lucide-react";

const Sidebar = () => {
  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "My Trips", path: "/trips", icon: Briefcase },
    { name: "AI Planner", path: "/ai-chat", icon: Sparkles },
    { name: "Weather Integration", path: "/weather", icon: CloudSun },
    { name: "Explore Maps", path: "/maps", icon: Map },
    { name: "Currency Exchange", path: "/currency", icon: Coins },
    { name: "Profile", path: "/profile", icon: User },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <aside className="sidebar animate-fade">
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem" }}>
          <Sparkles size={22} style={{ color: "var(--gold-primary)" }} />
          <span className="sidebar-logo-text">Vault Panel</span>
        </div>

        <nav style={{ width: "100%" }}>
          <ul className="sidebar-menu">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `sidebar-item-link ${isActive ? "active" : ""}`
                    }
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
