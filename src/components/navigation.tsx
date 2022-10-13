import { Link } from "react-router-dom";

import Modal from "./modal";
import InsertNewModalitie from "./insert-new-modalities";
import InsertNewEmployee from "./insert-new-Employee";
import { useModal } from "../hooks/use-modal";
import { BiArrowFromLeft } from "react-icons/bi";
import { FaDollarSign, FaUserPlus, FaUsersCog, FaUserShield } from "react-icons/fa";
import { SiCkeditor4 } from "react-icons/si";
import { BsPatchPlusFill } from "react-icons/bs";
import { AiFillHome } from "react-icons/ai";
import { HiDocumentReport } from "react-icons/hi";

export default function Navigation() {
  const { modalChange, modal } = useModal();

  //Estado que guardará os parametros vindo da minha URL
  console.log(location)



  function modalToggle(id: string) {
    if (id === "modalities") {
      modalChange("", <InsertNewModalitie />);
    }

    if (id === "insert-staff") {
      modalChange("", <InsertNewEmployee />);
    }
  }

  function toogleNavigation() {
    const menu = document.querySelector("nav");
    menu?.classList.toggle("hide");
  }

  return (
    <nav className="hide">
      <Modal title={modal?.title}> {modal?.content}</Modal>
      <BiArrowFromLeft className="toggle-icon" onClick={toogleNavigation} />

      <ul>
        <Link to="/">
          <li>
            <div className="icon">
              <AiFillHome />
            </div>
            <div className="text">Home</div>
          </li>
        </Link>

        <li className="report-style">
          <div className="icon">
            <HiDocumentReport />
          </div>
          <div className="text">Relatórios</div>

          {location.pathname === "/reports" ? (
            <div className="reports">
              <a onClick={() => location.search = 'weekly'}>Semanal</a>
              <a onClick={() => location.search = 'montly'}>Mensal</a>
              <a onClick={() => location.search = 'yearly'}>Anual</a>
            </div>
          ) : (
            <div className="reports">
              <Link to="/reports?weekly"><a>Semanal</a></Link>
              <Link to="/reports?montly"><a>Mensal</a></Link>
              <Link to="/reports?yearly"><a>Anual</a></Link>
            </div>
          )}
        </li>

        <Link to="/insert-new-user">
          <li>
            <div className="icon">
              <FaUserPlus />
            </div>
            <div className="text">
              Cadastrar Aluno
            </div>

          </li>
        </Link>


        <li onClick={() => modalToggle("modalities")}>

          <div className="icon">
            <BsPatchPlusFill />
          </div>
          <div className="text">
            Cadastrar modalidade
          </div>

        </li>


        <Link to="/edit-modalities">
          <li>

            <div className="icon">
              <SiCkeditor4 />
            </div>
            <div className="text">
              Editar modalidades
            </div>

          </li>
        </Link>

        <li onClick={() => modalToggle("insert-staff")}>
          <div className="icon">
            <FaUserShield />
          </div>
          <div className="text">
            Cadastrar Funcionário
          </div>
        </li>

        <Link to="/user-manager">
          <li>
            <div className="icon">
              <FaUsersCog />
            </div>
            <div className="text">
              Gerenciar usuários
            </div>

          </li>
        </Link>

        <Link to="/external-values">
          <li>
            <div className="icon">
              <FaDollarSign />
            </div>
            <div className="text">
              Valores externos
            </div>
          </li>
        </Link>
      </ul>
    </nav>
  );
}
