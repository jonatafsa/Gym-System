import {
  get,
  getDatabase,
  off,
  onValue,
  ref,
  remove,
  set,
  update,
} from "firebase/database";
import { useEffect, useState } from "react";

import { FiChevronDown } from "react-icons/fi";
import { BiError } from "react-icons/bi";
import { RiErrorWarningLine } from "react-icons/ri";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/use-auth";
import { CPFMask, PhoneMask, PriceMask } from "../services/masks";
import Navigation from "../components/navigation";
import Header from "../components/header";
import EditUserModal from "../components/edit-user-modal";
import { useModal } from "../hooks/use-modal";

type Users = [
  {
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
  }
];

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

export default function UserManager() {
  const { user } = useAuth();
  const { modalChange } = useModal();

  const [users, setUsers] = useState<Users[]>([]);
  const [clearUsers, setClearUsers] = useState<Users[]>([]);
  const [usersCount, setUsersCount] = useState(0);
  const [dueDate, setDueDate] = useState(0);
  const [expirationDate, setExpirationDate] = useState(0);
  const [DBuser, setUser] = useState<User | null>(null);
  const [modalities, setModalities] = useState<any[]>([]);
  const [pagination, setPagination] = useState(0);
  const [userModalities, setUserModalities] = useState({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [search, setSearch] = useState<any>("");

  useEffect(() => {
    const db = getDatabase();
    const dbRef = ref(db, "gym_users/" + user?.uid + "/users");

    onValue(dbRef, (res) => {
      if (res.exists()) {
        const data: any = Object.values(res.val()).sort((a: any, b: any) => {
          if (a.name > b.name) {
            return 1;
          }
          if (a.name < b.name) {
            return -1;
          }
          // a must be equal to b
          return 0;
        });

        let splitedArray: any = [];
        let max = 8;

        for (var i = 0; i < data.length; i = i + (max - 1)) {
          splitedArray.push(data.slice(i, i + max));
        }

        setUsers(splitedArray);
        setUsersCount(splitedArray.length);
        setClearUsers(data);
      }
    });

    let date = new Date();
    let getDay = new Date(date).getDate();
    let nextMouth = new Date(date).setMonth(date.getMonth() + 1);
    let dueDate = new Date(nextMouth).setDate(5);

    if (getDay > 5) {
      setDueDate(dueDate);
    }

    if (getDay <= 5) {
      setDueDate(new Date(date).setDate(5));
      var expiration = new Date().setDate(1);
      setExpirationDate(expiration);
    }

    const dbModalitiesRef = ref(db, "gym_users/" + user?.uid + "/modalities");

    get(dbModalitiesRef).then((res) => {
      if (res.exists()) {
        setModalities(res.val());
      }
    });
  }, []);

  function checkUser(id: string) {
    modalChange("show", <EditUserModal id={id} />);
  }

  function closeModal() {
    const modal = document.querySelector("main");
    modal?.classList.remove("open");
    modal?.classList.remove("open-payment");
    modal?.classList.remove("open-delete");
    setUser(null);
  }

  function closeModalPayment() {
    const modal = document.querySelector("main");
    modal?.classList.remove("open-payment");
    modal?.classList.remove("open-delete");
    setUser(null);
  }

  function checkUserPayment(id: string) {
    const modal = document.querySelector("main");
    modal?.classList.add("open-payment");

    const db = getDatabase();
    const dbRef = ref(db, "gym_users/" + user?.uid + "/users/" + id);

    get(dbRef).then((res) => {
      setUser(res.val());
    });
  }

  function confirmPayment(id: string, payment: number, modalities: any) {
    const updatePayment = monthlyFee(modalities);
    const paymnetValue = updatePayment.props.children;

    const modal = document.querySelector("main");
    modal?.classList.remove("open-payment");
    setUser(null);

    const db = getDatabase();
    const dbRef = ref(db, "gym_users/" + user?.uid + "/users/" + id);
    const payShedules = ref(
      db,
      "gym_users/" + user?.uid + "/users/" + id + "/paymentShedules"
    );
    const payShedulesWithYear = ref(
      db,
      "gym_users/" +
      user?.uid +
      "/users/" +
      id +
      "/paymentShedules/" +
      new Date(payment).toLocaleString("pt-br", { year: "numeric" })
    );

    if (!modalities) {
      toast.error("Usuário não matriculado em nenhuma modalidade!!");
      return;
    }

    //Se o pagamento for UNDEFINED vou guardar o pagamento recebido com as datas desse mês
    if (!payment) {
      let month = new Date().getMonth();
      let dueMonth = new Date(dueDate).getMonth();
      let setDuemonth = new Date(dueDate).setMonth(dueMonth + 1);
      let paymentDay =
        month === dueMonth
          ? new Date(setDuemonth).setDate(6)
          : new Date(dueDate).setDate(6);
      // const actualPrice = monthlyFee(DBuser?.userModalities)
      let actualPrice = "";

      update(dbRef, {
        payment: paymentDay,
      })
        .then(() => {
          let date = String(
            new Date().toLocaleString("pt-br", { month: "short" })
          ).replace(".", "");
          let year = String(
            new Date().toLocaleString("pt-br", { year: "numeric" })
          );
          update(payShedules, {
            [year]: {
              [date]: paymnetValue
                .replace(".", "")
                .replace(",", "")
                .replace(/\D/g, ""),
            },
          }).then(() => {
            toast.success(
              `Pagamento do mês ${new Date(paymentDay).toLocaleDateString(
                "pt-br",
                {
                  month: "long",
                }
              )} registrado!!`
            );
          });
        })
        .catch((err) => {
          toast.error("Erro ao registrar: " + err.code);
        });

      return;
    }

    let upMonth = new Date(payment).setMonth(new Date(payment).getMonth() + 1);

    update(dbRef, {
      payment: upMonth,
    }).then(() => {
      let date = String(
        new Date(payment).toLocaleString("pt-br", { month: "short" })
      ).replace(".", "");
      update(payShedulesWithYear, {
        [date]: paymnetValue
          .replace(".", "")
          .replace(",", "")
          .replace(/\D/g, ""),
      });
    });

    toast.success(
      `Pagamento do mês de ${new Date(payment).toLocaleDateString("pt-br", {
        month: "long",
      })} registrado!!`
    );
  }

  function deleteUser(cpf: string) {
    const modal = document.querySelector("main");
    modal?.classList.add("open-delete");

    const db = getDatabase();
    const dbRef = ref(db, "gym_users/" + user?.uid + "/users/" + cpf);

    get(dbRef).then((res) => {
      setUser(res.val());
    });
  }

  function confirmDelete(cpf: string) {
    const db = getDatabase();
    const userRef = ref(db, "gym_users/" + user?.uid + "/users/" + cpf);
    const deletedUserRef = ref(
      db,
      "gym_users/" + user?.uid + "/deleted_users/" + new Date()
    );
    const date = new Date().toLocaleDateString("pt-br");

    get(userRef).then((res) => {
      set(deletedUserRef, {
        name: res.val().name,
        cpf: res.val().cpf,
        phone: res.val().phone,
        address: res.val().address,
        registeredIn: res.val().registeredIn || "NO DATE",
        payment: res.val().payment || null,
        paymentShedules: res.val().paymentShedules || null,
        date,
      }).then(() => {
        remove(userRef).then(() => {
          toast.success("Usuário deletado com sucesso!!!");
        });
      });
    });

    closeModal();
  }

  function updateUser() {
    const db = getDatabase();
    const userRef = ref(db, "gym_users/" + user?.uid + "/users/" + DBuser?.cpf);
    const data = userModalities;

    update(userRef, {
      userModalities: userModalities,
    }).then(() => {
      toast.success("Usuário atualizado!!");
      closeModal();
    });
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

  function monthlyFee(modalitie: any) {
    const mdlts = Object.keys(modalitie);
    const sum = mdlts
      .map((modal: any) => +modalities[modal]?.price)
      .reduce((prev, curr) => prev + curr, 0);

    return <p>{PriceMask(String(sum))}</p>;
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

  function updatePlan() {
    return "Xablau";
  }

  function searchUser() {
    const param = Number(search);

    if (isNaN(param)) {
      const found = clearUsers.filter((element: any) =>
        element.name.includes(search)
      );

      let splitedArray: any = [];
      let max = 8;

      for (var i = 0; i < found.length; i = i + (max - 1)) {
        splitedArray.push(found.slice(i, i + max));
      }

      setUsers(splitedArray);
      setUsersCount(splitedArray.length);

      return;
    }

    const found = clearUsers.filter((element: any) =>
      element.cpf.includes(search)
    );

    let splitedArray: any = [];
    let max = 8;

    for (var i = 0; i < found.length; i = i + (max - 1)) {
      splitedArray.push(found.slice(i, i + max));
    }

    setUsers(splitedArray);
    setUsersCount(splitedArray.length);
  }

  function filterUsers(e: any) {
    if (e.target.value === "clear") {
      let splitedArray: any = [];
      let max = 8;

      for (var i = 0; i < clearUsers.length; i = i + (max - 1)) {
        splitedArray.push(clearUsers.slice(i, i + max));
      }

      setUsers(splitedArray);
      setUsersCount(splitedArray.length);

      return;
    }

    if (e.target.value === "late") {
      const found = clearUsers.filter((e: any) => e.payment <= dueDate);

      let splitedArray: any = [];
      let max = 8;

      for (var i = 0; i < found.length; i = i + (max - 1)) {
        splitedArray.push(found.slice(i, i + max));
      }

      setUsers(splitedArray);
      setUsersCount(splitedArray.length);

      console.log(found);
      return;
    }

    if (e.target.value === "open") {
      const found = clearUsers.filter((e: any) => !e.userModalities)

      let splitedArray: any = [];
      let max = 8;

      for (var i = 0; i < found.length; i = i + (max - 1)) {
        splitedArray.push(found.slice(i, i + max));
      }

      setUsers(splitedArray);
      setUsersCount(splitedArray.length);

      console.log(found);
      return;
    }

    if (e.target.value === "awaiting") {
      const found = clearUsers.filter((e: any) => !e.payment)

      let splitedArray: any = [];
      let max = 8;

      for (var i = 0; i < found.length; i = i + (max - 1)) {
        splitedArray.push(found.slice(i, i + max));
      }

      setUsers(splitedArray);
      setUsersCount(splitedArray.length);

      console.log(found);
      return;
    }

    if (e.target.value === "ok") {
      const found = clearUsers.filter((e: any) => e.payment > dueDate);

      let splitedArray: any = [];
      let max = 8;

      for (var i = 0; i < found.length; i = i + (max - 1)) {
        splitedArray.push(found.slice(i, i + max));
      }

      setUsers(splitedArray);
      setUsersCount(splitedArray.length);

      console.log(found);
      return;
    }

    console.log(e.target.value);
  }

  return (
    <div className="container">
      <Navigation />
      <main>
        <Header />

        {/* __________________________ Tabela com os Clientes __________________________ */}
        <div className="table-header">
          <h4 className="sub-heading">
            mostrando {!users[0] ? 0 : users[0].length} de {clearUsers.length} usuários
          </h4>
          <div className="search">
            <input
              type="text"
              placeholder="Digite o nome ou CPF"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={searchUser}
            />
            <button onClick={searchUser}>Buscar</button>
          </div>
          <div>
            <label>Filtar:</label>
            <select onChange={filterUsers}>
              <option value="clear">Mostrar Todos</option>
              <option value="open">Não matriculados</option>
              <option value="awaiting">Aguardando pagamento</option>
              <option value="late">Pagamento Atrasado</option>
              <option value="ok">Pagamento em dias</option>
            </select>
          </div>
        </div>

        <div className="card">
          <div className="table-concept">
            <table>
              <thead>
                <tr>
                  <th>Doc</th>
                  <th>Nome</th>
                  <th>Telefone</th>
                  <th>Endereço</th>
                  <th>Valor da Mensalidade</th>
                  <th>Pagamento</th>
                  <th>Gerenciar</th>
                </tr>
              </thead>
              <tbody>
                {usersCount === 0
                  ? "Nenhum usuário"
                  : users[pagination].map((user) => (
                    <tr>
                      <td>{CPFMask(user.cpf)}</td>
                      <td>{user.name}</td>
                      <td>{PhoneMask(user.phone)}</td>
                      <td>{user.address}</td>
                      <td>
                        {user.userModalities ? (
                          monthlyFee(user.userModalities)
                        ) : (
                          <p className="sub-heading danger small">
                            Não matriculado
                          </p>
                        )}
                      </td>
                      <td>
                        {!user.payment ? (
                          <p className="status">
                            Aguardando pagamento
                            <RiErrorWarningLine color="rgb(255, 238, 81)" />
                          </p>
                        ) : user.payment <= dueDate ? (
                          <p className="status">
                            Pagamento Atrasado
                            <BiError color="rgb(218, 58, 10)" />
                          </p>
                        ) : new Date(user.payment).getMonth() ===
                          new Date(dueDate).getMonth() &&
                          new Date().getDate() >
                          new Date(expirationDate).getDate() &&
                          new Date().getDate() <
                          new Date(dueDate).getDate() ? (
                          <p className="status">
                            Próximo do vencimento
                            <RiErrorWarningLine color="rgb(255, 238, 81)" />
                          </p>
                        ) : (
                          <p className="status">
                            Pagamento em dias
                            <FiChevronDown color="rgb(10, 218, 97)" />
                          </p>
                        )}
                      </td>
                      <td className="button-container">
                        {user.payment > dueDate ? (
                          ""
                        ) : (
                          <button
                            className="check"
                            title="Verificar pagamento"
                            onClick={() => checkUserPayment(user.cpf)}
                          >
                            <svg viewBox="0 0 24 24" width="16">
                              <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
                            </svg>
                          </button>
                        )}

                        {new Date(user.payment).getMonth() ===
                          new Date(dueDate).getMonth() &&
                          new Date().getDate() >
                          new Date(expirationDate).getDate() &&
                          new Date().getDate() < new Date(dueDate).getDate() ? (
                          <button
                            className="check"
                            title="Verificar pagamento"
                            onClick={() => checkUserPayment(user.cpf)}
                          >
                            <svg viewBox="0 0 24 24" width="16">
                              <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
                            </svg>
                          </button>
                        ) : (
                          ""
                        )}

                        <button
                          className="primary"
                          title="Ver mais"
                          onClick={() => checkUser(user.cpf)}
                        >
                          <svg viewBox="0 0 512 512" width="16">
                            <path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm144 276c0 6.6-5.4 12-12 12h-92v92c0 6.6-5.4 12-12 12h-56c-6.6 0-12-5.4-12-12v-92h-92c-6.6 0-12-5.4-12-12v-56c0-6.6 5.4-12 12-12h92v-92c0-6.6 5.4-12 12-12h56c6.6 0 12 5.4 12 12v92h92c6.6 0 12 5.4 12 12v56z"></path>
                          </svg>
                        </button>

                        <button
                          className="danger"
                          title="Deletar usuário"
                          onClick={() => deleteUser(user.cpf)}
                        >
                          <svg viewBox="0 0 448 512" width="16">
                            <path d="M32 464a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128H32zm272-256a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zM432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16z"></path>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            <div className="pagination">
              {/* Condional que verifica se a paginação é maior que 0 */}
              {pagination < 1 ? (
                <label className="disabled">&laquo; Anterior</label>
              ) : (
                <label onClick={() => setPagination(pagination - 1)}>
                  &laquo; Anterior
                </label>
              )}

              {/* mapeamento e listamento do Array de usuários */}
              {users.map((e, index) =>
                // Condicional que define o label ativo
                pagination === index ? (
                  <label className="active" key={index}>
                    {index + 1}
                  </label>
                ) : (
                  <label onClick={() => setPagination(index)}>
                    {index + 1}
                  </label>
                )
              )}

              {pagination >= users.length - 1 ? (
                <label className="disabled">Próximo &raquo;</label>
              ) : (
                <label onClick={() => setPagination(pagination + 1)}>
                  Próximo &raquo;
                </label>
              )}
            </div>
          </div>
        </div>

        {/* __________________________ Modal Checagem de Pagamento __________________________ */}
        <div className="modal-payment">
          <div className="modal-payment-overlay" onClick={closeModal}></div>
          <div className="slider-wrap-payment">
            <h3 className="heading"> Checar pagamento </h3>

            <div className="user">
              <p className="text">
                Confirmar pagamento mensal do usuário {DBuser?.name}.
              </p>
              <h4 className="sub-heading">
                Essa ação é irreversível, deseja continuar?
              </h4>
            </div>

            <div className="button-container">
              <button
                className="check"
                title="Verificar pagamento"
                onClick={() =>
                  confirmPayment(
                    DBuser!.cpf,
                    DBuser!.payment,
                    DBuser!.userModalities
                  )
                }
              >
                Ok
              </button>

              <button
                className="danger"
                title="Deletar usuário"
                onClick={closeModalPayment}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>

        {/* __________________________ Modal Checagem de Delete __________________________ */}
        <div className="modal-delete">
          <div className="modal-delete-overlay" onClick={closeModal}></div>
          <div className="slider-wrap-delete">
            <h3 className="heading"> Deleter usuário </h3>

            <div className="user">
              <p className="text">Deletar usuário {DBuser?.name}.</p>
              <h4 className="sub-heading">
                Essa ação é irreversível, deseja continuar?
              </h4>
            </div>

            <div className="button-container">
              <button
                className="check"
                title="Verificar pagamento"
                onClick={() => confirmDelete(DBuser!.cpf)}
              >
                Ok
              </button>

              <button
                className="danger"
                title="Deletar usuário"
                onClick={closeModal}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>

        {/* </div> */}
      </main>
    </div>
  );
}
