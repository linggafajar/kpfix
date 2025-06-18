"use client";

import React, { useEffect, useState } from "react";
import { SquareTerminal } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const dataNavMain = [
  {
    title: "Menu",
    url: "#",
    icon: SquareTerminal,
    isActive: true,
    items: [
      { title: "Manajemen Barang", url: "/admin" },
      { title: "Data Permintaan", url: "/admin/minta" },
      { title: "Data Peminjaman", url: "/admin/minjam" },
      { title: "Pengaturan Pengguna", url: "/admin/pengguna" },
    ],
  },
];

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState<{
    name: string;
    email: string;
    avatar: string;
  } | null>(null);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);  
        setUser({
          name: decoded.name || "User",
          email: decoded.email || "user@example.com",
          avatar: decoded.avatar || "/avatars/default-avatar.png",
        });
      } catch (err) {
        console.error("Token decode error:", err);
        setUser(null);
      }
    }
  }, []);

  const userData = user ?? {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center">
                  <img
                    src="/logo.png"
                    alt="Logo"
                    className="size-8 object-contain"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">SARPRAS</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={dataNavMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
