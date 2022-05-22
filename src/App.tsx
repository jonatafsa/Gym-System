import './styles/global.scss'
import 'react-toastify/dist/ReactToastify.css';

import { ToastContainer, Zoom } from 'react-toastify';
import MyRoutes from "./routes"
import { AuthContextProvider } from './contexts/auth-context';

function App() {
  return (
    <AuthContextProvider>
      <div className="container dark">
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
    </AuthContextProvider>
  )
}

export default App



