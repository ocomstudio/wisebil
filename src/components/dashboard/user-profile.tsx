// src/components/dashboard/user-profile.tsx
"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CreditCard, LogOut, Settings } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"
import { useLocale } from "@/context/locale-context"

export function UserProfile() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const { t } = useLocale();

  const handleLogout = () => {
    logout();
    toast({
      title: t('logout_success_title'),
      description: t('see_you_soon'),
    });
    router.push('/auth/login');
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.avatar} alt={user?.fullName || "User avatar"} data-ai-hint="man avatar" />
            <AvatarFallback>{user ? getInitials(user.fullName) : 'U'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.fullName || t('user_name_placeholder')}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email || t('user_email_placeholder')}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
             <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>{t('nav_settings')}</span>
             </Link>
          </DropdownMenuItem>
           <DropdownMenuItem asChild>
            <Link href="/dashboard/billing">
              <CreditCard className="mr-2 h-4 w-4" />
              <span>{t('billing')}</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
