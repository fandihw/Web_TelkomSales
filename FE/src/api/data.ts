export async function fetchMyData(token: string) {
  const res = await fetch('http://localhost:5000/api/data/my-data', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}
