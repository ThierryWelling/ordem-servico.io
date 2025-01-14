import { User } from "../types/User";

const mockUsers: User[] = [
  {
    id: "1",
    name: "Admin",
    email: "admin@example.com",
    role: "admin",
    username: "admin",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const mockApi = {
  login: async (username: string, password: string): Promise<{ user: User; token: string }> => {
    const user = mockUsers.find(u => u.username === username);
    
    if (user && password === "admin") {
      return {
        user,
        token: "mock-jwt-token"
      };
    }
    
    throw new Error("Credenciais inválidas");
  }
};

export default mockApi; 