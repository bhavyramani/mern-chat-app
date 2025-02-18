import { Route } from 'react-router-dom/cjs/react-router-dom.min'
import Home from './pages/Home'
import Chat from './pages/Chat'
function App() {

  return (
    <>
      <Route path='/' component={Home} exact />
      <Route path='/chats' component={Chat} />

    </>
  )
}

export default App
