import NextAuth from "next-auth";
import { authOptions } from "./options";

// สร้าง handler จาก authOptions
const handler = NextAuth(authOptions);

// Export สำหรับใช้เป็น API Route
export { handler as GET, handler as POST }; 