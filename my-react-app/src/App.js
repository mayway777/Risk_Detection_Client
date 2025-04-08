import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import SignUp from './components/SignUp';
import MainPage from './components/MainPage';
import Livevideo from './components/Livevideo';
import Alerts from './components/alerts';
import MyProfile from './components/MyProfile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/mainpage" element={<MainPage />} />
        <Route path="/Livevideo" element={<Livevideo />} />
        <Route path="/Alerts" element={<Alerts />} />
        <Route path="/MyProfile" element={<MyProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
