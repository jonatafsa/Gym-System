import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/home';
import InsertNewEmployee from './pages/insert-new-Employee';
import InsertNewModalitie from './pages/insert-new-modalities';
import InsertNewUser from './pages/insert-new-user';
import Login from './pages/login';

export default function MyRoutes() {
  return (
    <Router>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>

          <li>
            <Link to="/login">Login</Link>
          </li>

          <li>
            <Link to="/insert-new-user">Cadastrar Aluno</Link>
          </li>

          <li>
            <Link to="/insert-new-modalitie">Inserir nova modalidade</Link>
          </li>

          <li>
            <Link to="/insert-new-employee">Cadastrar Funcionário</Link>
          </li>
        </ul>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/insert-new-user" element={<InsertNewUser />} />
        <Route path="/insert-new-modalitie" element={<InsertNewModalitie />} />
        <Route path="/insert-new-employee" element={<InsertNewEmployee />} />
      </Routes>
    </Router>
  )
}
