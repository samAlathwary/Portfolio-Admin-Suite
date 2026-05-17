import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  useListAdminServices, getListAdminServicesQueryKey, 
  useCreateService, useUpdateService, useDeleteService,
  getGetDashboardSummaryQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Form, FormControl, FormDescription, FormField, FormItem, 
  FormLabel, FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Layers, TrendingUp, Megaphone, BarChart3, Briefcase, Globe, Target, Sparkles, Users, MessageSquare } from "lucide-react";
import { toast } from "sonner";

// Map string names to Lucide components
const IconMap: Record<string, React.ElementType> = {
  TrendingUp, Megaphone, BarChart3, Briefcase, 
  Globe, Target, Sparkles, Users, MessageSquare, Layers
};

const serviceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  active: z.boolean().default(true),
  activeFrom: z.string().optional(),
  activeUntil: z.string().optional(),
  displayOrder: z.coerce.number().default(0),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

function toDatetimeLocalValue(value?: string | null): string {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function toIsoDateTime(value?: string): string | null {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function formatSchedule(value?: string | null): string | null {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleString();
}

export default function ServicesPage() {
  const queryClient = useQueryClient();
  const { data: services, isLoading } = useListAdminServices({ query: { queryKey: getListAdminServicesQueryKey() } });
  const serviceList = Array.isArray(services) ? services : [];
  
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [serviceToDelete, setServiceToDelete] = useState<number | null>(null);

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      title: "",
      description: "",
      icon: "Layers",
      active: true,
      activeFrom: "",
      activeUntil: "",
      displayOrder: 0,
    },
  });

  const onSubmit = (data: ServiceFormValues) => {
    // Convert empty strings to null for optional fields
    const payload = {
      ...data,
      description: data.description || null,
      icon: data.icon || null,
      activeFrom: toIsoDateTime(data.activeFrom),
      activeUntil: toIsoDateTime(data.activeUntil),
    };

    if (editingService) {
      updateService.mutate(
        { id: editingService.id, data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListAdminServicesQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
            toast.success("Service updated successfully");
            setEditingService(null);
            form.reset();
          },
          onError: () => toast.error("Failed to update service"),
        }
      );
    } else {
      createService.mutate(
        { data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListAdminServicesQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
            toast.success("Service created successfully");
            setIsCreateOpen(false);
            form.reset();
          },
          onError: () => toast.error("Failed to create service"),
        }
      );
    }
  };

  const handleEdit = (service: any) => {
    setEditingService(service);
    form.reset({
      title: service.title,
      description: service.description || "",
      icon: service.icon || "Layers",
      active: service.active,
      activeFrom: toDatetimeLocalValue(service.activeFrom),
      activeUntil: toDatetimeLocalValue(service.activeUntil),
      displayOrder: service.displayOrder,
    });
  };

  const handleDelete = () => {
    if (!serviceToDelete) return;
    
    deleteService.mutate(
      { id: serviceToDelete },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAdminServicesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          toast.success("Service deleted successfully");
          setServiceToDelete(null);
        },
        onError: () => toast.error("Failed to delete service"),
      }
    );
  };

  const toggleActiveStatus = (service: any, isActive: boolean) => {
    updateService.mutate(
      { id: service.id, data: { ...service, active: isActive } },
      {
        onSuccess: () => {
          queryClient.setQueryData(getListAdminServicesQueryKey(), (old: any) => 
            old ? old.map((s: any) => s.id === service.id ? { ...s, active: isActive } : s) : old
          );
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          toast.success(`Service ${isActive ? 'activated' : 'deactivated'}`);
        },
        onError: () => toast.error("Failed to update status"),
      }
    );
  };

  const renderIcon = (iconName: string | null) => {
    const IconComponent = iconName && IconMap[iconName] ? IconMap[iconName] : Layers;
    return <IconComponent className="h-6 w-6" />;
  };

  return (
    <DashboardLayout title="Services">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-muted-foreground">
              Manage the services your agency offers to clients.
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) form.reset();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Service</DialogTitle>
                <DialogDescription>
                  Create a new service offering for your public website.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Digital Marketing" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="icon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Icon</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || "Layers"}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select icon" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.keys(IconMap).map((key) => {
                                const IconComp = IconMap[key];
                                return (
                                  <SelectItem key={key} value={key}>
                                    <div className="flex items-center gap-2">
                                      <IconComp className="h-4 w-4 text-muted-foreground" />
                                      <span>{key}</span>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="displayOrder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Order</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Detail what this service includes..." 
                            className="resize-none h-24"
                            {...field} 
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="activeFrom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Active From</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormDescription>
                            Optional. Leave empty to make activation immediate.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="activeUntil"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Active Until</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormDescription>
                            Optional. Leave empty to keep the service active with no end date.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Active Service
                          </FormLabel>
                          <FormDescription>
                            If inactive, it will be hidden from the website. When schedule fields are set, they further limit when the service is shown.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createService.isPending}>
                      {createService.isPending ? "Creating..." : "Create Service"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Modal */}
        <Dialog open={!!editingService} onOpenChange={(open) => {
          if (!open) {
            setEditingService(null);
            form.reset();
          }
        }}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Service</DialogTitle>
              <DialogDescription>
                Update details for {editingService?.title}.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Digital Marketing" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="icon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Icon</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || "Layers"}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select icon" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.keys(IconMap).map((key) => {
                              const IconComp = IconMap[key];
                              return (
                                <SelectItem key={key} value={key}>
                                  <div className="flex items-center gap-2">
                                    <IconComp className="h-4 w-4 text-muted-foreground" />
                                    <span>{key}</span>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="displayOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Order</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Detail what this service includes..." 
                          className="resize-none h-24"
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                    )}
                  />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="activeFrom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Active From</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormDescription>
                          Optional. Leave empty to make activation immediate.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="activeUntil"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Active Until</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormDescription>
                          Optional. Leave empty to keep the service active with no end date.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Active Service
                        </FormLabel>
                        <FormDescription>
                          If inactive, it will be hidden from the website. When schedule fields are set, they further limit when the service is shown.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditingService(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateService.isPending}>
                    {updateService.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!serviceToDelete} onOpenChange={(open) => !open && setServiceToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently remove the service from your website.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete} 
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                disabled={deleteService.isPending}
              >
                {deleteService.isPending ? "Deleting..." : "Delete Service"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Data List */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="p-5 flex flex-row items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-md" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <Skeleton className="h-20 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : serviceList.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl border-dashed bg-secondary/30">
            <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Layers className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-display font-medium text-foreground mb-1">No services yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
              You haven't defined any services yet. Add your first service to show what your agency offers.
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add your first service
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {serviceList.map((service) => (
              <Card key={service.id} className={`overflow-hidden group transition-all duration-200 ${!service.active ? 'opacity-70 bg-secondary/50 hover:opacity-100' : 'hover:border-primary/20'}`}>
                <CardHeader className="p-5 flex flex-row items-start gap-4 space-y-0">
                  <div className={`h-12 w-12 shrink-0 rounded-md flex items-center justify-center border ${service.active ? 'bg-primary/5 text-primary border-primary/10' : 'bg-secondary text-muted-foreground border-border'}`}>
                    {renderIcon(service.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-display font-semibold truncate" title={service.title ?? "Untitled service"}>{service.title ?? "Untitled service"}</h3>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      <Badge variant={service.active ? "default" : "secondary"} className="text-[10px] px-1.5 h-5 font-normal">
                        {service.active ? "Active" : "Inactive"}
                      </Badge>
                      {(service.activeFrom || service.activeUntil) && (
                        <Badge variant="outline" className="text-[10px] px-1.5 h-5 font-normal">
                          Scheduled
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[10px] px-1.5 h-5 font-normal text-muted-foreground">Order: {service.displayOrder}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-3 min-h-[60px]">
                    {service.description || "No description provided."}
                  </p>
                  {(service.activeFrom || service.activeUntil) && (
                    <div className="mt-4 rounded-lg border border-border/60 bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
                      {service.activeFrom ? `From: ${formatSchedule(service.activeFrom)}` : "From: Immediately"}
                      <br />
                      {service.activeUntil ? `Until: ${formatSchedule(service.activeUntil)}` : "Until: No end date"}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={service.active} 
                        onCheckedChange={(checked) => toggleActiveStatus(service, checked)}
                        disabled={updateService.isPending}
                      />
                      <span className="text-xs text-muted-foreground font-medium">
                        {service.active ? "Visible on site" : "Hidden"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleEdit(service)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setServiceToDelete(service.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
