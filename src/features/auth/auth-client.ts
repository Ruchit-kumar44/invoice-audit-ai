import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";


export const authClient = createAuthClient({
    
    plugins: [
        organizationClient(),
    ],
})

// Shorthand exports for cleaner usage across components
// export const { useSession, signIn, signUp, signOut } = authClient;