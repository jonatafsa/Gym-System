import { FormEvent, useEffect, useState } from "react";
import {
  getDatabase,
  onValue,
  ref as DatabaseRef,
  set as DatabaseSet,
  get as DatabaseGet,
  child,
  ref,
  get,
} from "firebase/database";
import { getStorage, ref as StorageRef, uploadBytes } from "firebase/storage";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/use-auth";
import { CPFMask, PhoneMask } from "../services/masks";
import Navigation from "../components/navigation";
import Header from "../components/header";
import { useNavigate } from "react-router-dom";
import { GrDocumentPdf } from "react-icons/gr";

export default function InsertNewUser() {
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [cpf, setCpf] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [modalities, setModalities] = useState<any[]>([]);
  const [plan, setPlan] = useState("")
  const [file, setFile] = useState<any>();
  let userModalities: any = {};

  useEffect(() => {
    const db = getDatabase();
    const dbRef = ref(db, "gym_users/" + user?.uid + "/modalities");

    get(dbRef).then((res) => {
      if (res.exists()) {
        setModalities(res.val());
      }
    });
  }, []);

  async function registerNewUser(e: FormEvent) {
    e.preventDefault();
    let clearCPF = cpf.replace(".", "").replace(",", "").replace(/\D/g, "");

    const database = getDatabase();
    const storage = getStorage();
    const storageRef = StorageRef(
      storage,
      user!.uid + "/documents/" + cpf + "." + file?.name.split(".").pop() || ""
    );
    const userRef = DatabaseRef(
      database,
      "gym_users/" + user?.uid + "/users/" + clearCPF
    );
    const dbRef = DatabaseRef(database);
    let date = new Date().getTime();

    var data = {
      registeredIn: date,
      name,
      email,
      phone: phone.replace(".", "").replace(",", "").replace(/\D/g, ""),
      address,
      city,
      cpf: clearCPF,
      birthdate,
      userModalities,
      plan,
      paymentShedules: "init",
    };

    await DatabaseGet(child(dbRef, "gym_users/" + user?.uid + "/users")).then(
      (res) => {
        if (res.exists()) {
          const users: any = Object.values(res.val());

          for (var x = 0; x < users.length; x++) {
            if (users[x].email === email) {
              toast.warning("Existe um usuário com esse E-mail");
              return;
            }
          }
        }

        get(userRef).then((res) => {
          if (res.exists() && res.val().email !== email) {
            toast.warning("Existe um usuário com esse CPF");
          } else {
            uploadBytes(storageRef, file).catch((err) =>
              toast.error(err.message)
            );
            DatabaseSet(userRef, data)
              .then((res) => {
                toast.success("Usuário registrado com sucesso!!");
              })
              .catch((err) => {
                toast.error("Erro ao registrar usuário!!");
              });
          }
        });
      }
    );

    const navigate = useNavigate();
    navigate("/");
  }

  function check(e: any) {
    if (e.target.checked === true) {
      userModalities[e.target.name] = true;
    } else {
      delete userModalities[e.target.name];
    }
  }

  function getFile(e: any) {
    const label = document.querySelector("#labelDoc");
    label!.innerHTML = e.target.files[0].name;
    setFile(e.target.files[0]);
  }

  return (
    <div className="container">
      <Navigation />
      <main>
        <Header />

        <form onSubmit={registerNewUser} className="two-sections">
          {/* Formulário com dados do usuário */}
          <div className="form-container" style={{ maxWidth: "600px" }}>
            <h3 className="heading">Inserir novo usuário</h3>
            <input
              type="text"
              placeholder="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Telefone"
              value={PhoneMask(phone)}
              onChange={(e) => setPhone(e.target.value)}
              required
            />

            <div>
              <input
                type="text"
                placeholder="Endereço"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />

              <input
                type="text"
                placeholder="Cidade"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>

            <div>
              <input
                type="text"
                placeholder="CPF"
                value={CPFMask(cpf)}
                onChange={(e) => setCpf(e.target.value)}
                required
              />

              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <span className="text">Data de Nascimento</span>
              <input
                type="date"
                placeholder="Data de Nascimento"
                onChange={(e) => setBirthdate(e.target.value)}
                required
              />
            </div>
            <select onChange={e => setPlan(e.target.value)} required>
              <option value="">Selecione o tipo de contrato</option>
              <option value="mensal">Mensal</option>
              <option value="trimestral">Trimestral</option>
              <option value="semestral">Semestral</option>
              <option value="anual">Anual</option>
            </select>
            <input type="file" id="doc" onChange={getFile} />
            <label htmlFor="doc" id="labelDoc">
              Inserir Documento <GrDocumentPdf color="#CCC" size={25} />
            </label>

            <input
              type="submit"
              value="Cadastrar usuário"
              className="btn"
            ></input>
          </div>

          {/* Formulário com dados da Academia */}
          <div className="form-container">
            <h4 className="sub-heading">Selecione as modalidades</h4>

            <div className="check-label">
              {Object.values(modalities).map((modalitie) => (
                <label className="label-container" key={modalitie.name}>
                  {modalitie.name}

                  <input
                    type="checkbox"
                    name={modalitie.name}
                    onClick={check}
                  />
                  <span className="checkmark"></span>
                </label>
              ))}
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
