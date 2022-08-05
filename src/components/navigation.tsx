import Cookies from "js-cookie";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";

import { BiHomeAlt, BiUserPin } from "react-icons/bi";
import { FaUserShield } from "react-icons/fa";
import { CgInsertAfterR } from "react-icons/cg";
import {
  AiOutlineUserAdd,
  AiOutlinePlusCircle,
  AiOutlineEdit,
} from "react-icons/ai";
import Modal from "./modal";
import { useState } from "react";
import InsertNewModalitie from "./insert-new-modalities";
import InsertNewEmployee from "./insert-new-Employee";
import { useModal } from "../hooks/use-modal";

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

  return (
    <nav className="hide">
      <Modal title={modal?.title}> {modal?.content}</Modal>
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

        <li onClick={() => modalToggle("modalities")}>
          <AiOutlinePlusCircle size={22} />
          <a> Cadastrar nova modalidade </a>
        </li>

        <li>
          <AiOutlineEdit size={22} />
          <Link to="/edit-modalities">Editar modalidades</Link>
        </li>

        <li onClick={() => modalToggle("insert-staff")}>
          <FaUserShield size={22} />
          <a> Cadastrar Funcionário </a>
        </li>

        <li>
          <BiUserPin size={22} />
          <Link to="/user-manager">Gerenciar usuários</Link>
        </li>

        <li>
          <CgInsertAfterR size={22} />
          <Link to="/external-values">Inserir valores externos</Link>
        </li>
      </ul>
    </nav>
  );
}
