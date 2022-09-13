import { get, getDatabase, onValue, ref, update } from "firebase/database";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/use-auth";
import { CPFMask, PhoneMask, PriceMask } from "../services/masks";

type User = {
  name: string;
  cpf: string;
  phone: string;
  address: string;
  registeredIn: string;
  payment: any;
  paymentShedules: any;
  userModalities: any;
  birthdate: any;
  plan: string;
};

type userProps = {
  id: string;
};

export default function EditUserModal(props: userProps) {
  const { user } = useAuth();

  const [DBuser, setDBUser] = useState<User | null>(null);
  const [modalities, setModalities] = useState<any[]>([]);
  const [userModalities, setUserModalities] = useState({});
  const [dueDate, setDueDate] = useState(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [birthdate, setBirthdate] = useState("");

  useEffect(() => {
    const id = props.id;
    const db = getDatabase();
    const dbUserRef = ref(db, "gym_users/" + user?.uid + "/users/" + id);

    get(dbUserRef).then((res) => {
      setDBUser(res.val());
      setName(res.val().name);
      setPhone(res.val().phone);
      setAddress(res.val().address);
      setBirthdate(res.val().birthdate);
      setUserModalities(res.val().userModalities || {});
    });

    const dbModalitiesRef = ref(db, "gym_users/" + user?.uid + "/modalities");

    get(dbModalitiesRef).then((res) => {
      if (res.exists()) {
        setModalities(res.val());
      }
    });
  }, [props.id]);

  function checkPlanValidity(registeredIn: any, plan: string) {
    if (plan === "mensal") {
      const register = new Date(registeredIn);
      register.setMonth(register.getMonth() + 1);
      return register < new Date() ? (
        <div className="sub-heading danger">
          <p>Plano expirado</p>
        </div>
      ) : (
        ""
      );
    }

    if (plan === "trimestral") {
      const register = new Date(registeredIn);
      register.setMonth(register.getMonth() + 3);
      return register < new Date() ? (
        <div className="sub-heading danger">
          <p>Plano expirado</p>
        </div>
      ) : (
        ""
      );
    }

    if (plan === "semestral") {
      const register = new Date(registeredIn);
      register.setMonth(register.getMonth() + 6);
      return register < new Date() ? (
        <div className="sub-heading danger">
          <p>Plano expirado</p>
        </div>
      ) : (
        ""
      );
    }

    if (plan === "anual") {
      const register = new Date(registeredIn);
      register.setMonth(register.getMonth() + 12);
      return register < new Date() ? (
        <div className="sub-heading danger">
          <p>Plano expirado</p>
        </div>
      ) : (
        ""
      );
    }
  }

  function endPlanDate(registeredIn: any, plan: string) {
    let stringDate = "";

    if (plan === "mensal") {
      const register = new Date(registeredIn);
      register.setMonth(register.getMonth() + 1);
      stringDate = register.toLocaleDateString("pt-br");
    }

    if (plan === "trimestral") {
      const register = new Date(registeredIn);
      register.setMonth(register.getMonth() + 3);
      stringDate = register.toLocaleDateString("pt-br");
    }

    if (plan === "semestral") {
      const register = new Date(registeredIn);
      register.setMonth(register.getMonth() + 6);
      stringDate = register.toLocaleDateString("pt-br");
    }

    if (plan === "anual") {
      const register = new Date(registeredIn);
      register.setMonth(register.getMonth() + 12);
      stringDate = register.toLocaleDateString("pt-br");
    }

    return <>{stringDate}</>;
  }

  function monthlyFee(modalitie: any) {
    const mdlts = Object.keys(modalitie);
    const sum = mdlts
      .map((modal: any) => +modalities[modal]?.price)
      .reduce((prev, curr) => prev + curr, 0);

    return <p>{PriceMask(String(sum))}</p>;
  }

  function check(e: any) {
    let updateModalities: any = userModalities;

    if (e.target.checked === true) {
      updateModalities[e.target.name] = true;
    } else {
      delete updateModalities[e.target.name];
    }

    setUserModalities(updateModalities);
  }

  function updateUser() {
    const db = getDatabase();
    const userRef = ref(db, "gym_users/" + user?.uid + "/users/" + DBuser?.cpf);

    update(userRef, {
      name,
      phone,
      address,
      birthdate,
      userModalities: userModalities,
    }).then(() => {
      toast.success("Usuário atualizado!!");
      closeModal();
    });
  }

  function updatePlan() {
    return "Xablau";
  }

  function closeModal() {
    const admin = document.querySelector(".admin");
    admin?.classList.remove("open");
  }

  return (
    <div className="slider-wrap md">
      <h3 className="heading"> {DBuser?.name} </h3>

      <div className="user">
        {DBuser ? (
          <>
            <div className="user-data">
              <h4 className="sub-heading">Informações do usuário</h4>

              {checkPlanValidity(DBuser.registeredIn, DBuser.plan)}

              <div className="labels-user-data text">
                <strong>CPF: </strong>
                <p>{CPFMask(DBuser.cpf)}</p>
              </div>

              <div className="labels-user-data text">
                <strong>Registrado em: </strong>
                <p>
                  {new Date(DBuser.registeredIn).toLocaleDateString("pt-br")}
                </p>
              </div>

              <div className="labels-user-data text">
                <strong>Plano contratado: </strong>
                <p>{DBuser.plan}</p>
                <small>
                  (encerral em: {endPlanDate(DBuser.registeredIn, DBuser.plan)})
                </small>
              </div>

              <div className="labels-user-data text">
                <strong>Valor da mensalidade: </strong>
                {DBuser.userModalities ? (
                  monthlyFee(DBuser.userModalities)
                ) : (
                  <p className="sub-heading danger small">
                    Não cadastrado em nenuma modalidade
                  </p>
                )}
              </div>

              <div className="labels-user-data text">
                <strong>Nome:</strong>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="labels-user-data text">
                <strong>Telefone:</strong>
                <input
                  type="text"
                  id="name"
                  value={PhoneMask(phone)}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="labels-user-data text">
                <strong>Endereço:</strong>
                <input
                  type="text"
                  id="name"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="labels-user-data text">
                <strong>Data de nascimento:</strong>
                <input
                  type="date"
                  id="name"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                />
              </div>

              {/* {DBuser.payment ? (
                  DBuser.payment < dueDate ? (
                    <span className="text">
                      <strong>Status de pagamento: </strong>Pagamaneto
                      Atrasado
                    </span>
                  ) : (
                    <span className="text">
                      <strong>Status de pagamento: </strong>Em dias
                    </span>
                  )
                ) : (
                  <span className="text">
                    <strong>Sem registro de pagamento</strong>
                  </span>
                )} */}
            </div>

            <div className="user-details">
              {DBuser.userModalities ? (
                <>
                  <h4 className="sub-heading">Matrículas do usuário</h4>
                  <p className="text">
                    Marque as modalidades que deseja matricular o usuário e
                    aplique com o botão checar abaixo.
                  </p>
                  <div className="check-label">
                    {Object.values(modalities).map((modalitie) => (
                      <label className="label-container" key={modalitie.name}>
                        {modalitie.name} -{" "}
                        {DBuser.userModalities[modalitie.name]
                          ? "true"
                          : "false"}
                        <input
                          defaultChecked={
                            DBuser.userModalities[modalitie.name] ? true : false
                          }
                          type="checkbox"
                          name={modalitie.name}
                          onClick={check}
                        />
                        <span className="checkmark"></span>
                      </label>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <h4 className="sub-heading danger">
                    Usuário não matriculado em nenhuma modalidade
                  </h4>
                  <p className="text">
                    Marque as modalidades e aplique com o botão checar abaixo,
                    para matricular o usuário na modalidade.
                  </p>
                  <div className="check-label">
                    {Object.values(modalities).map((modalitie) => (
                      <label className="label-container" key={modalitie.name}>
                        {modalitie.name}

                        <input
                          type="checkbox"
                          name={modalitie.name}
                          defaultChecked={false}
                          onClick={check}
                        />
                        <span className="checkmark"></span>
                      </label>
                    ))}
                  </div>
                </>
              )}

              {DBuser.payment < dueDate ? (
                <div className="payment-record">
                  {DBuser.paymentShedules ? (
                    <>
                      <h5 className="text">Pendências</h5>

                      <div className="month red">
                        <span className="text">Ultimo pagamento</span>
                        <p className="text">{`${new Date(
                          DBuser.payment
                        ).toLocaleDateString("pt-br")}`}</p>
                      </div>
                    </>
                  ) : (
                    ""
                  )}
                </div>
              ) : (
                ""
              )}
            </div>
          </>
        ) : (
          <p>"Nenhum usuário selecionado!"</p>
        )}
      </div>

      <div className="button-container">
        <button
          className="renove"
          title="Renovar contrato"
          onClick={updatePlan}
        >
          Renovar Contrato
        </button>

        <button
          className="check"
          title="Atualizar usuário"
          onClick={updateUser}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
          </svg>
        </button>

        <button className="danger" title="Deletar usuário">
          <svg viewBox="0 0 448 512" width="24">
            <path d="M32 464a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128H32zm272-256a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zM432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16z"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}
