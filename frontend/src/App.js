import {BrowserRouter, Routes ,Route} from 'react-router-dom'
import Home from './Components/Home/Home';
import Chat from './Components/Chat/Chat';

function App() {
  return (
    <div>
     <BrowserRouter>
     <Routes>
      <Route path='/' element={<Home></Home>}></Route>
      <Route path='/:roomId' element={<Chat></Chat>}></Route>
        </Routes>
     </BrowserRouter>
    </div>
  );
}

export default App;