import Cookies from "js-cookie";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";

import {
  UilEstate,
  UilPlusCircle,
  UilUserPlus,
  UilEditAlt,
  UilUserSquare,
  UilUserCheck,
  UilExternalLinkAlt,
} from '@iconscout/react-unicons'

export default function Navigation() {
  const { logout } = useAuth()

  return (
    <nav className="hide">
      <h3 className="heading">Dashboard</h3>

      <ul>
        <li>
          <UilEstate />
          <Link to="/">Home</Link>
        </li>

        <li>
          <UilUserPlus />
          <Link to="/insert-new-user">Cadastrar Aluno</Link>
        </li>

        <li>
          <UilPlusCircle />
          <Link to="/insert-new-modalitie">Inserir nova modalidade</Link>
        </li>

        <li>
          <UilEditAlt  />
          <Link to="/edit-modalities">Editar modalidades</Link>
        </li>

        <li>
          <UilUserSquare  />
          <Link to="/insert-new-employee">Cadastrar Funcionário</Link>
        </li>

        <li>
          <UilUserCheck  />
          <Link to="/user-manager">Gerenciar usuários</Link>
        </li>
        
        <li>
          <UilExternalLinkAlt />
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