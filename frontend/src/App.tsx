import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layout/MainLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Goods from './pages/Goods'
import Categories from './pages/Categories'
import Records from './pages/Records'
import Stocktake from './pages/Stocktake'
import Users from './pages/Users'
import Logs from './pages/Logs'

// Auth Guard
const RequireAuth = ({ children, adminOnly = false }: { children: JSX.Element, adminOnly?: boolean }) => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        return <Navigate to="/login" replace />;
    }
    const user = JSON.parse(userStr);
    if (adminOnly && user.role !== 'ADMIN') {
        return <Navigate to="/dashboard" replace />;
    }
    return children;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<RequireAuth><MainLayout /></RequireAuth>}>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="goods" element={<Goods />} />
                    <Route path="categories" element={<Categories />} />
                    <Route path="records" element={<Records />} />
                    <Route path="stocktake" element={<Stocktake />} />
                    <Route path="users" element={<RequireAuth adminOnly><Users /></RequireAuth>} />
                    <Route path="logs" element={<RequireAuth adminOnly><Logs /></RequireAuth>} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App
