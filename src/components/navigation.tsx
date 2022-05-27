import Cookies from "js-cookie";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";

import {
  BiHomeAlt,
  BiUserPin
} from 'react-icons/bi'
import { FaUserShield } from 'react-icons/fa'
import { CgInsertAfterR } from 'react-icons/cg'
import { 
  AiOutlineUserAdd,
  AiOutlinePlusCircle,
  AiOutlineEdit
 } from 'react-icons/ai'

export default function Navigation() {
  const { logout } = useAuth()

  return (
    <nav className="hide">
      <h3 className="heading">Dashboard</h3>

      <ul>
        <li>
          <BiHomeAlt size={22} />
          <Link to="/">Home</Link>
        </li>

        <li>
          <AiOutlineUserAdd size={22} />
          <Link to="/insert-new-user">Cadastrar Aluno</Link>
        </li>

        <li>
          <AiOutlinePlusCircle size={22} />
          <Link to="/insert-new-modalitie">Inserir nova modalidade</Link>
        </li>

        <li>
          <AiOutlineEdit  size={22} />
          <Link to="/edit-modalities">Editar modalidades</Link>
        </li>

        <li>
          <FaUserShield size={22}  />
          <Link to="/insert-new-employee">Cadastrar Funcionário</Link>
        </li>

        <li>
          <BiUserPin size={22}  />
          <Link to="/user-manager">Gerenciar usuários</Link>
        </li>
        
        <li>
          <CgInsertAfterR size={22} />
          <Link to="/external-values">Inserir valores externos</Link>
        </li>

        {Cookies.get("token") ? (
          <li onClick={logout} style={{ cursor: 'pointer' }}>
            Logout
          </li>
        ) : (
          <li>
            <Link to="/login">Login</Link>
          </li>
        )}
      </ul>
    </nav>
  )
}