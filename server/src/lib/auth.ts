import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import mongoose from "mongoose";

export const auth = betterAuth({
    database: mongodbAdapter(mongoose.connection.getClient().db()),
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5000",
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
    },
    trustedOrigins: [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || "PLACEHOLDER",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "PLACEHOLDER",
        },
        github: {
            clientId: process.env.GITHUB_CLIENT_ID || "PLACEHOLDER",
            clientSecret: process.env.GITHUB_CLIENT_SECRET || "PLACEHOLDER",
        },
    },
    // Adding optional metadata fields if needed
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "user",
            },
        },
    },
});
