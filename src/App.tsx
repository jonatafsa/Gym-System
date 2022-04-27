import './styles/global.scss'
import 'react-toastify/dist/ReactToastify.css';

import { ToastContainer, Zoom } from 'react-toastify';
import MyRoutes from "./routes"

function App() {
  return (
    <div className="container">
      <MyRoutes />
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        transition={Zoom}
      />
    </div>
  )
}

export default App



