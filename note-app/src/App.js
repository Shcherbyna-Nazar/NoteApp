import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/login/Login';
import Register from './pages/register/Register';
import TOTP from './pages/TOTP';
import NoteDetail from "./pages/NoteDetail";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/register" element={<Register/>}/>
                <Route path="/totp" element={<TOTP/>}/>
                <Route path="/note/:noteId" element={<NoteDetail/>}/>
                {/* Добавьте другие маршруты по необходимости */}
            </Routes>
        </Router>
    );
}

export default App;
