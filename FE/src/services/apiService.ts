const API_BASE_URL = "http://localhost:5000/api";

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error("Login gagal");
  return res.json(); // { token, user, role }
}

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  role: string;
}) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Registrasi gagal");
  return res.json();
}

export async function getMyData(token: string) {
  const res = await fetch(`${API_BASE_URL}/dashboard/my-data`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Gagal ambil data sales");
  return res.json();
}

export async function getAllData(token: string) {
  const res = await fetch(`${API_BASE_URL}/dashboard/all-data`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Gagal ambil semua data");
  return res.json();
}
