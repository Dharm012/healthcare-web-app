"use client";

import { useState } from 'react';
import { Search, UserPlus, MoreVertical, Edit2, Ban, ShieldCheck, Mail } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { toast } from '@/components/ui/toast';

const usersList = [
  { id: 'USR-9821', name: 'John Doe', email: 'john@example.com', role: 'Patient', status: 'Active', joinedAt: 'Aug 10, 2026', avatar: 'JD' },
  { id: 'USR-9822', name: 'Dr. Sarah Jenkins', email: 'sarah.j@hospital.com', role: 'Doctor', status: 'Active', joinedAt: 'Aug 05, 2026', avatar: 'SJ' },
  { id: 'USR-9823', name: 'Admin User', email: 'admin@healthconnect.com', role: 'Admin', status: 'Active', joinedAt: 'Jan 01, 2026', avatar: 'AD' },
  { id: 'USR-9824', name: 'Priya Sharma', email: 'priya@example.com', role: 'Patient', status: 'Inactive', joinedAt: 'Jul 22, 2026', avatar: 'PS' },
  { id: 'USR-9825', name: 'Dr. Rajiv Mehta', email: 'rajiv.m@hospital.com', role: 'Doctor', status: 'Suspended', joinedAt: 'Jun 15, 2026', avatar: 'RM' },
  { id: 'USR-9826', name: 'Arjun Mehta', email: 'arjun@example.com', role: 'Patient', status: 'Active', joinedAt: 'Aug 18, 2026', avatar: 'AM' },
];

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleComingSoon = () => toast.add({ title: 'Coming Soon', description: 'This feature will be available soon.', type: 'info' });

  const filtered = usersList.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          <p className="text-gray-500">Manage all platform users, roles, and access levels.</p>
        </div>
        <Button onClick={handleComingSoon} className="bg-indigo-600 hover:bg-indigo-700">
          <UserPlus className="h-4 w-4 mr-2" /> Add User
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-base font-semibold">All Users</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                className="pl-10 h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-gray-500">
                  <th className="px-6 py-3 font-medium">User</th>
                  <th className="px-6 py-3 font-medium">ID</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Joined</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, i) => (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className={
                            user.role === 'Admin' ? 'bg-indigo-100 text-indigo-700' :
                            user.role === 'Doctor' ? 'bg-teal-100 text-teal-700' :
                            'bg-gray-100 text-gray-700'
                          }>{user.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">{user.id}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={
                        user.role === 'Admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                        user.role === 'Doctor' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={
                        user.status === 'Active' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                        user.status === 'Suspended' ? 'bg-red-100 text-red-700 hover:bg-red-100' :
                        'bg-gray-100 text-gray-700 hover:bg-gray-100'
                      } variant="outline">
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{user.joinedAt}</td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={handleComingSoon}>
                            <Edit2 className="h-4 w-4 mr-2 text-gray-500" /> Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={handleComingSoon}>
                            <Mail className="h-4 w-4 mr-2 text-gray-500" /> Send Email
                          </DropdownMenuItem>
                          {user.role !== 'Admin' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={handleComingSoon} className="text-amber-600 focus:bg-amber-50 focus:text-amber-700">
                                <Ban className="h-4 w-4 mr-2" /> Suspend User
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No users found matching "{searchQuery}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
