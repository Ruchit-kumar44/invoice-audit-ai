

import { prisma } from "@/db";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";


const Auth = betterAuth({
    database: prismaAdapter(prisma, {
       provider: "postgresql",
    }),

    // 2. Authentication
    emailAndPassword: {
        enabled: true
    },

    //
    plugins: [
       //Manages member seats, workspace invites, and company boundaries 
       organization(),

       nextCookies()
    ],
});

export default Auth;