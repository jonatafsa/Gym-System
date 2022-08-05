import "../styles/components/header-navigation.scss";
import { FaBars } from "react-icons/fa";
import { FaToggleOn, FaToggleOff } from "react-icons/fa";
import { AiFillMessage } from "react-icons/ai";
import { CgLogOut } from "react-icons/cg";
import { IoMdNotifications } from "react-icons/io";

import Cookies from "js-cookie";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";
import { useState } from "react";

export default function Header() {
  const { logout, user } = useAuth();
  const [darkModeIcon, setDarkModeIcon] = useState(
    Cookies.get("darkMode") === "true" ? (
      <FaToggleOn size={22} />
    ) : (
      <FaToggleOff size={22} />
    )
  );

  function toogleNavigation() {
    const menu = document.querySelector("nav");
    menu?.classList.toggle("hide");
  }

  function toggleMenu() {
    const menu = document.querySelector(".user-links");
    menu?.classList.toggle("show-menu");
  }

  function darkMode() {
    const darkMode = Cookies.get("dark");
    if (darkMode === "true") {
      Cookies.set("dark", "false");
      document.body.classList.toggle("dark");
      setDarkModeIcon(<FaToggleOff size={22} />);
    } else {
      Cookies.set("dark", "true");
      document.body.classList.toggle("dark");
      setDarkModeIcon(<FaToggleOn size={22} />);
    }
  }

  if (typeof window !== "undefined") {
    if (Cookies.get("dark") === "true") {
      document.body.classList.add("dark");
    }
  }

  return (
    <header>
      <FaBars size={22} onClick={toogleNavigation} className="btn-toogle" />
      <div className="user-content">
        {/* <FcClock /> */}
        <AiFillMessage />
        <IoMdNotifications />
        <img
          src={
            user?.avatar ||
            "data:image/png;base64,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"
          }
          onClick={toggleMenu}
        />
      </div>

      <div className="user-links">
        <ul>
          <Link to="/gym">
            <li>Dados da academia</li>
          </Link>
          <Link to="/user">
            <li>Dados do usuário</li>
          </Link>
          <li onClick={darkMode}>Dark mode {darkModeIcon} </li>
          <li onClick={logout}>
            Sair do sistema <CgLogOut />
          </li>
        </ul>
      </div>
    </header>
  );
}
