import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized: ({ token, req }) => {
            if (req.nextUrl.pathname.startsWith("/admin")) {
                return token?.role === "admin";
            }
            return !!token;
        },
    },
});

export const config = {
    matcher: ["/", "/addTopic/:path*", "/editTopic/:path*", "/admin/:path*"],
};
