export interface User {
    id: string;
    githubId: number;
    username: string;
    email: string | null;
    avatar: string | null;
    encryptedAccessToken: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserPayload {
    sub: string;
    username: string;
    githubId: number;
}
