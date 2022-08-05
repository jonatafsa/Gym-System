import { getDatabase, onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";
import Header from "../components/header";
import Loading from "../components/loading";
import Navigation from "../components/navigation";
import { useAuth } from "../hooks/use-auth";

import { FcEngineering, FcFullTrash } from "react-icons/fc";
import "../styles/user.scss";
import Modal from "../components/modal";
import InsertNewModalitie from "../components/insert-new-modalities";
import InsertNewEmployee from "../components/insert-new-Employee";
import { useModal } from "../hooks/use-modal";

export default function Gym() {
  const { user } = useAuth();
  const { modalChange, modal } = useModal()
  const [usersCount, setUsersCount] = useState(0);
  const [userGym, setUserGym] = useState("");
  const [modalities, setModalities] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const db = getDatabase();
    const dbRef = ref(db, "gym_users/" + user?.uid);
    const myDataRef = ref(db, "gym_users/" + user?.uid);

    onValue(myDataRef, (res) => {
      setUsersCount(Object.keys(res.val().users).length);
      setUserGym(res.val().my_data?.gym || "");
      setModalities(res.val().modalities || []);
      setStaff(res.val().staff || []);
      console.log(modalities);
      setLoading(false);
    });
  }, []);

  function modalToggle(id: string) {
    
    if(id === "modalities") {     
      modalChange("", <InsertNewModalitie />)
    }

    if( id === "insert-staff") {
      modalChange("", <InsertNewEmployee />)
    }
  }

  return (
    <div className="container">
      {loading ? <Loading /> : ""}
      <Navigation />
      <Header />
      
      <main className="row">
        <h1 className="sub-heading">Dados da academia</h1>

        <div className="box userDetails">
          <h3>Informações da conta</h3>

          <span>Academia: {userGym}</span>
          <span>
            Data de Cadastro:{" "}
            {new Date(user?.creationTime).toLocaleDateString()}
          </span>
          <span>Usuários ativos: {usersCount}</span>

          <div className="box-Footter">
            <button>Mudar nome</button>
          </div>
        </div>

        <div className="box userDetails">
          <h3>Staff</h3>
          
          {Object.values(staff).map((staff) => (
            <span key={staff.name}>
              {staff.name} / {staff.function} <FcFullTrash className="icon pointer" size={25} />{" "}
              <FcEngineering className="pointer" size={25} />
            </span>
          ))}

          <div className="box-Footter">
            <button onClick={() => modalToggle("insert-staff")}>Inserir funcionário</button>
          </div>
        </div>

        <div className="box userDetails">
          <h3>Modaliades</h3>

          {Object.keys(modalities).map((modality) => (
            <span>
              {modality} <FcFullTrash className="icon pointer" size={25} />{" "}
              <FcEngineering className="pointer" size={25} />
            </span>
          ))}

          <div className="box-Footter">
            <button onClick={() => modalToggle("modalities")}>Inserir modalidade</button>
          </div>
        </div>
      </main>
    </div>
  );
}
