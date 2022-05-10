import Cookies from "js-cookie";
import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const { signIn, user } = useAuth()

  function signinUser(e: FormEvent) {
    e.preventDefault()

    signIn(email, password)
    return (
      <Navigate to="/" replace />
    )
  }

  if (user?.refreshToken && Cookies.get("token")) {
    return (
      <Navigate to="/" replace />
    )
  }

  return (
    <main>
      <form onSubmit={signinUser}>
        <div className="form-container" style={{ width: "500px" }}>
          <h3 className="sub-heading">Entre com seu email e senha</h3>
          <input
            type="text"
            placeholder="E-mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          <input type="submit" value="Entrar" className="btn"></input>
        </div>
      </form>
    </main>
  )
}