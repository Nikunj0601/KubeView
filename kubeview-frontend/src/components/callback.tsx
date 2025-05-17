import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const Callback: React.FC = () => {
  const navigate = useNavigate();
  const consumedCode = useRef(false);
  const API_URL = process.env.REACT_APP_API_URL || "";

  const {
    mutate: handleCallback,
    isSuccess,
    isError,
  } = useMutation({
    mutationFn: async (code: string) => {
      const response = await axios.get(`${API_URL}/auth/callback`, {
        params: { code },
      });
      const { accessToken } = response.data;
      // Store the token in localStorage
      localStorage.setItem("accessToken", accessToken);

      // Set default authorization header for future requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

      navigate("/dashboard");
      // return response.data;
    },
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get("code");
    // console.log("isPending", isPending);

    if (consumedCode.current) {
      return;
    }

    if (code) {
      consumedCode.current = true;
      handleCallback(code);
    }
  }, [handleCallback]);
  // console.log("status", status);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Authenticating...
        </h2>
        <p className="mt-2 text-gray-600">Please wait while we log you in.</p>
      </div>
    </div>
  );
};

export default Callback;
