import { Link } from "react-router-dom";

import Modal from "./modal";
import InsertNewModalitie from "./insert-new-modalities";
import InsertNewEmployee from "./insert-new-Employee";
import { useModal } from "../hooks/use-modal";
import { FcAddImage, FcBarChart, FcContacts, FcGoodDecision, FcHome, FcManager, FcOrgUnit } from "react-icons/fc";
import { BiArrowFromLeft } from "react-icons/bi";

export default function Navigation() {
  const { modalChange, modal } = useModal();

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
              <FcHome />
            </div>
            <div className="text">Home</div>
          </li>
        </Link>

        <Link to="/insert-new-user">
          <li>
            <div className="icon">
              <FcGoodDecision />
            </div>
            <div className="text">
              Cadastrar Aluno
            </div>

          </li>
        </Link>


        <li onClick={() => modalToggle("modalities")}>

          <div className="icon">
            <FcAddImage />
          </div>
          <div className="text">
            Cadastrar modalidade
          </div>

        </li>


        <Link to="/edit-modalities">
          <li>

            <div className="icon">
              <FcOrgUnit />
            </div>
            <div className="text">
              Editar modalidades
            </div>

          </li>
        </Link>

        <li onClick={() => modalToggle("insert-staff")}>
          <div className="icon">
            <FcManager />
          </div>
          <div className="text">
            Cadastrar Funcionário
          </div>
        </li>

        <Link to="/user-manager">
          <li>
            <div className="icon">
              <FcContacts />
            </div>
            <div className="text">
              Gerenciar usuários
            </div>

          </li>
        </Link>

        <Link to="/external-values">
          <li>
            <div className="icon">
              <FcBarChart />
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
