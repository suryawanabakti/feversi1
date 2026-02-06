import { React, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import useAuthContext from "../context/AuthContext";

const GuestLayout = () => {
  const { user, loading } = useAuthContext();
  if (loading) return null;
  return !user ? (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"
      />
      <Toaster /> <Outlet />
    </>
  ) : (
    <Navigate to="/dashboard" />
  );
};

export default GuestLayout;
