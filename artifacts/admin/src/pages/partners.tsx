import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  useListPartners, getListPartnersQueryKey, 
  useCreatePartner, useUpdatePartner, useDeletePartner,
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
import { Checkbox } from "@/components/ui/checkbox";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Globe, Users } from "lucide-react";
import { toast } from "sonner";

const partnerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  logoUrl: z.string().url("Must be a valid URL").or(z.string().length(0)).nullable().optional(),
  websiteUrl: z.string().url("Must be a valid URL").or(z.string().length(0)).nullable().optional(),
  description: z.string().nullable().optional(),
  industry: z.string().nullable().optional(),
  featured: z.boolean().default(false),
  displayOrder: z.coerce.number().default(0),
});

type PartnerFormValues = z.infer<typeof partnerSchema>;

export default function PartnersPage() {
  const queryClient = useQueryClient();
  const { data: partners, isLoading } = useListPartners({ query: { queryKey: getListPartnersQueryKey() } });
  const partnerList = Array.isArray(partners) ? partners : [];
  
  const createPartner = useCreatePartner();
  const updatePartner = useUpdatePartner();
  const deletePartner = useDeletePartner();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<any>(null);
  const [partnerToDelete, setPartnerToDelete] = useState<number | null>(null);

  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      name: "",
      logoUrl: "",
      websiteUrl: "",
      description: "",
      industry: "",
      featured: false,
      displayOrder: 0,
    },
  });

  const onSubmit = (data: PartnerFormValues) => {
    // Convert empty strings to null for optional fields
    const payload = {
      ...data,
      logoUrl: data.logoUrl || null,
      websiteUrl: data.websiteUrl || null,
      description: data.description || null,
      industry: data.industry || null,
    };

    if (editingPartner) {
      updatePartner.mutate(
        { id: editingPartner.id, data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListPartnersQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
            toast.success("Partner updated successfully");
            setEditingPartner(null);
            form.reset();
          },
          onError: () => toast.error("Failed to update partner"),
        }
      );
    } else {
      createPartner.mutate(
        { data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListPartnersQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
            toast.success("Partner created successfully");
            setIsCreateOpen(false);
            form.reset();
          },
          onError: () => toast.error("Failed to create partner"),
        }
      );
    }
  };

  const handleEdit = (partner: any) => {
    setEditingPartner(partner);
    form.reset({
      name: partner.name,
      logoUrl: partner.logoUrl || "",
      websiteUrl: partner.websiteUrl || "",
      description: partner.description || "",
      industry: partner.industry || "",
      featured: partner.featured,
      displayOrder: partner.displayOrder,
    });
  };

  const handleDelete = () => {
    if (!partnerToDelete) return;
    
    deletePartner.mutate(
      { id: partnerToDelete },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPartnersQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          toast.success("Partner deleted successfully");
          setPartnerToDelete(null);
        },
        onError: () => toast.error("Failed to delete partner"),
      }
    );
  };

  return (
    <DashboardLayout title="Partners">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-muted-foreground">
              Manage the companies you work with. These appear on the public website.
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) form.reset();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Partner
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Add New Partner</DialogTitle>
                <DialogDescription>
                  Create a new partner entry to display on your website.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Company Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Acme Corp" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Industry</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Technology" {...field} value={field.value || ""} />
                          </FormControl>
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
                    <FormField
                      control={form.control}
                      name="websiteUrl"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Website URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://..." {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="logoUrl"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Logo URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://..." {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Brief description of the partnership..." 
                              className="resize-none"
                              {...field} 
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="featured"
                      render={({ field }) => (
                        <FormItem className="col-span-2 flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Featured Partner
                            </FormLabel>
                            <FormDescription>
                              Show this partner prominently on the homepage.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createPartner.isPending}>
                      {createPartner.isPending ? "Creating..." : "Create Partner"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Modal */}
        <Dialog open={!!editingPartner} onOpenChange={(open) => {
          if (!open) {
            setEditingPartner(null);
            form.reset();
          }
        }}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Edit Partner</DialogTitle>
              <DialogDescription>
                Update details for {editingPartner?.name}.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Company Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Acme Corp" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Technology" {...field} value={field.value || ""} />
                        </FormControl>
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
                  <FormField
                    control={form.control}
                    name="websiteUrl"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Website URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Logo URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Brief description of the partnership..." 
                            className="resize-none"
                            {...field} 
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="col-span-2 flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Featured Partner
                          </FormLabel>
                          <FormDescription>
                            Show this partner prominently on the homepage.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditingPartner(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updatePartner.isPending}>
                    {updatePartner.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!partnerToDelete} onOpenChange={(open) => !open && setPartnerToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently remove the partner from your website.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete} 
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                disabled={deletePartner.isPending}
              >
                {deletePartner.isPending ? "Deleting..." : "Delete Partner"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Data List */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="p-4 flex flex-row items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-md" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : partnerList.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl border-dashed bg-secondary/30">
            <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-display font-medium text-foreground mb-1">No partners yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
              You haven't added any partner companies yet. Add your first partner to show them on your website.
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add your first partner
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {partnerList.map((partner) => (
              <Card key={partner.id} className="overflow-hidden group hover:border-primary/20 transition-colors">
                <CardHeader className="p-5 flex flex-row items-start gap-4 space-y-0">
                  <div className="h-12 w-12 shrink-0 rounded-md bg-secondary flex items-center justify-center overflow-hidden border">
                    {partner.logoUrl ? (
                      <img src={partner.logoUrl} alt={partner.name} className="h-full w-full object-cover bg-white" />
                    ) : (
                      <span className="text-muted-foreground font-display font-bold">
                        {(partner.name ?? "?").substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-display font-semibold truncate" title={partner.name ?? "Unnamed partner"}>{partner.name ?? "Unnamed partner"}</h3>
                    </div>
                    {partner.industry && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{partner.industry}</p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {partner.featured && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 h-5 bg-accent/10 text-accent hover:bg-accent/20 border-accent/20">Featured</Badge>
                      )}
                      <Badge variant="outline" className="text-[10px] px-1.5 h-5 font-normal text-muted-foreground">Order: {partner.displayOrder}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                    {partner.description || "No description provided."}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div>
                      {partner.websiteUrl ? (
                        <a 
                          href={partner.websiteUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Globe className="h-3 w-3 mr-1" />
                          Visit website
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground/50">No website</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleEdit(partner)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setPartnerToDelete(partner.id)}>
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
