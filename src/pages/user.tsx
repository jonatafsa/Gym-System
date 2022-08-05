import Header from "../components/header";
import Navigation from "../components/navigation";
import { useAuth } from "../hooks/use-auth";
import { MdPhotoCamera } from "react-icons/md";
import "../styles/user.scss";
import { useEffect, useState } from "react";
import { getDatabase, onValue, ref, update } from "firebase/database";
import { getAuth, sendPasswordResetEmail, updateProfile } from "firebase/auth";
import { app } from "../services/firebase";
import { toast } from "react-toastify";
import { getDownloadURL, getStorage, ref as StorageRef, uploadBytes } from "firebase/storage";
import Loading from "../components/loading";
import { useModal } from "../hooks/use-modal";

export default function User() {
  const { user } = useAuth();
  const { modalChange } = useModal()
  const [usersCount, setUsersCount] = useState(0);
  const [userGym, setUserGym] = useState("");
  const [userName, setUserName] = useState(user?.name || "")
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const db = getDatabase();
    const dbRef = ref(db, "gym_users/" + user?.uid + "/users");
    const myDataRef = ref(db, "gym_users/" + user?.uid + "/my_data");

    onValue(dbRef, (res) => {
      if (res.exists()) {
        setUsersCount(Object.keys(res.val()).length);
      }
    });

    onValue(myDataRef, (res) => {
      setUserGym(res.val()?.gym || "");
    });
  }, []);

  function editDataModalToggle() {
    const admin = document.querySelector(".admin");
    admin?.classList.toggle("open");
  }

  function resetPasswordModal() {
    editDataModalToggle();
    const auth = getAuth(app);
    sendPasswordResetEmail(auth, user!.email)
      .then(() => {
        toast.success("Instruções de redefinição enviadas para seu email.");
      })
      .catch((error) => {
        const errorMessage = error.message;
        toast.error(errorMessage);
      });
  }

  function editData() {
    const auth = getAuth(app);
    updateProfile(auth.currentUser!, {
      displayName: userName,
    })
      .then(() => {
        const db = getDatabase();
        const dbRef = ref(db, "gym_users/" + user?.uid + "/my_data");

        update(dbRef, { gym: userGym }).then(() => {
          toast.success("Dados atualizados com sucesso!");
          editDataModalToggle();
        });
      })
      .catch((error) => {
        toast.error(error.message);
      });
  }

  async function toggleEditAvatar(e: any) {
    setLoading(true)
    const img = document.getElementById("avatar");
    const file = e.target.files[0];
    const fileReader = new FileReader();
    const storage = getStorage()
    const avatarRef = StorageRef(storage, user?.uid + "/avatars/" + user?.uid);

    fileReader.readAsDataURL(file)
    fileReader.addEventListener("load", function () {
      img!.innerHTML = '<img src="' + this.result + '" />';
      img?.setAttribute(
        "src",
        `${this.result}`
      )

      uploadBytes(avatarRef, file).then(() => {
        getDownloadURL(avatarRef).then((url) => {
          const auth = getAuth(app);
          updateProfile(auth.currentUser!, {
            photoURL: url,
          }).then(() => {
            toast.success("Avatar atualizado com sucesso!")
            setLoading(false)
          }).catch((error) => {
            toast.error(error.message)
            setLoading(false)
          })
        })
      })
    })
  }

  return (
    <div className="container admin">
      {loading ? (<Loading />) : ""}
      <Navigation />

      <main>
        <Header />

        <h1 className="sub-heading">Dados do usuário</h1>

        <div className="account">
          <div className="avatar">
            <img
              id="avatar"
              src={
                user?.avatar ||
                "data:image/png;base64,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"
              }
              alt="User"
            />
            <label htmlFor="editAvatar">
              <MdPhotoCamera />
            </label>
            <input type="file" id="editAvatar" onChange={toggleEditAvatar} />
          </div>
          <div className="userInfo">
            <span>{user?.name || "UserName Empty"}</span>
            <p>{user?.email}</p>
          </div>
        </div>

        <div className="box userDetails">
          <h3>Informações da conta</h3>
          <span>Nome da academia: {userGym}</span>
          <div>
            <span>Usuário: {userName}</span>
            <span>E-mail: {user?.email}</span>
          </div>
          <div>
            <span>
              Data de Cadastro:{" "}
              {new Date(user?.creationTime).toLocaleDateString()}
            </span>
            <span>Usuários ativos: {usersCount}</span>
          </div>

          <div className="box-Footter">
            <button onClick={editDataModalToggle}>Editar dados</button>
          </div>
        </div>

        <div className="box">
          <h3>Assinatura</h3>
        </div>
      </main>

      <div className="modal">
        <div className="modal-overlay" onClick={editDataModalToggle}></div>
        <div className="slider-wrap">
          <span>Editar dados</span>

          <form action="">
            <div className="form-column">
              <input
                type="text"
                placeholder="Nome da Academia"
                onChange={(e) => setUserGym(e.target.value)}
                value={userGym}
              />
              <input
                type="text"
                placeholder="Nome do usuário"
                onChange={(e) => setUserName(e.target.value)}
                value={userName}
              />
            </div>

            <div className="form-column">
              <div>
                <span>
                  Email: <strong>{user?.email}</strong>
                </span>
                <p>Para editar o e-mail entre em contato com o administrador</p>
              </div>

              <button type="button" onClick={resetPasswordModal}>
                Clique aqui para editar a senha
              </button>
            </div>

            <div className="buttons">
              <button
                className="cancel"
                type="button"
                onClick={editDataModalToggle}
              >
                cancelar
              </button>
              <button className="ok" type="button" onClick={editData}>
                Editar Dados
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
