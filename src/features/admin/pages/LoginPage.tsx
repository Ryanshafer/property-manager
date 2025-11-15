import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdmin } from "@/context/AdminProvider";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(4, "Password must be at least 4 characters"),
  userId: z.string().min(1, "Select a teammate"),
});

const LoginPage = () => {
  const { authed, login, users } = useAdmin();
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "demo@localguide.app", password: "puglia", userId: "" },
  });

  useEffect(() => {
    if (authed) {
      navigate("/properties", { replace: true });
    }
  }, [authed, navigate]);

  useEffect(() => {
    const firstUser = users[0]?.id;
    if (firstUser && !form.getValues("userId")) {
      form.setValue("userId", firstUser);
    }
  }, [users, form]);

  const onSubmit = form.handleSubmit((values) => {
    const selectedUser = users.find((user) => user.id === values.userId);
    if (!selectedUser) {
      toast.error("Pick a teammate to continue");
      return;
    }
    login({
      id: selectedUser.id,
      name: selectedUser.name,
      role: selectedUser.role,
      accessLevel: selectedUser.accessLevel,
      email: values.email,
    });
    toast.success(`Welcome back, ${selectedUser.name}`);
    navigate("/properties");
  });

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-background to-muted px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            <span className="block text-display-lg leading-tight">Local Guide Admin</span>
          </CardTitle>
          <CardDescription>Sign in to manage properties and the shared guest content.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sign in as</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select teammate" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} • {user.accessLevel}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="w-full">
                <Button type="submit">Sign in</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
