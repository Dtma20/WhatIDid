import { useState, useEffect } from 'react';
import { LogOut, User } from 'lucide-react';
import { authService, type AuthUser } from '@/services/auth';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

export function UserMenu() {
    const [user, setUser] = useState<AuthUser | null>(null);

    useEffect(() => {
        // Buscar dados do usuário da API
        const fetchUser = async () => {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/me`,
                    {
                        headers: {
                            Authorization: `Bearer ${authService.getToken()}`,
                        },
                    }
                );
                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                    authService.setUser(userData);
                }
            } catch (error) {
                console.error('Failed to fetch user:', error);
            }
        };

        const savedUser = authService.getUser();
        if (savedUser) {
            setUser(savedUser);
        } else {
            fetchUser();
        }
    }, []);

    const handleLogout = () => {
        authService.logout();
    };

    if (!user) {
        return (
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
        );
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button className="h-10 w-10 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-primary/50 transition-all cursor-pointer focus:outline-none focus:ring-primary/50">
                    {user.avatar ? (
                        <img
                            src={user.avatar}
                            alt={user.username}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="h-full w-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                        </div>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56 p-2">
                <div className="px-2 py-1.5 border-b mb-2">
                    <p className="font-medium text-sm">{user.username}</p>
                    <p className="text-xs text-muted-foreground">Logado via GitHub</p>
                </div>
                <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleLogout}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                </Button>
            </PopoverContent>
        </Popover>
    );
}
