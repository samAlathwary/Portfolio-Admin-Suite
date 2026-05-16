import React, { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Link } from "wouter";
import { useClerk, useUser } from "@clerk/react";
import { useGetDashboardSummary, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Star, Layers, Activity, ArrowRight, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user } = useUser();
  const { data: summary, isLoading } = useGetDashboardSummary({ query: { queryKey: getGetDashboardSummaryQueryKey() } });
  const recentPartners = Array.isArray(summary?.recentPartners) ? summary.recentPartners : [];
  const recentServices = Array.isArray(summary?.recentServices) ? summary.recentServices : [];

  const stats = [
    {
      title: "Total Partners",
      value: summary?.partnerCount || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Featured Partners",
      value: summary?.featuredPartnerCount || 0,
      icon: Star,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Total Services",
      value: summary?.serviceCount || 0,
      icon: Layers,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      title: "Active Services",
      value: summary?.activeServiceCount || 0,
      icon: Activity,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">
            Welcome back, {user?.firstName || "Admin"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with Easy Way Agency today.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-1/3" />
                </CardContent>
              </Card>
            ))
          ) : (
            stats.map((stat, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold font-display">{stat.value}</div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Partners */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-display">Recent Partners</CardTitle>
                <CardDescription>Latest additions to your network</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/partners">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentPartners.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  No partners added yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {recentPartners.map((partner) => (
                    <div key={partner.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden border">
                          {partner.logoUrl ? (
                            <img src={partner.logoUrl} alt={partner.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-muted-foreground font-medium text-xs">
                              {(partner.name ?? "?").substring(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-none">{partner.name}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{partner.industry || "No industry specified"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {partner.featured && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 bg-accent/10 text-accent hover:bg-accent/20">Featured</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Services */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-display">Recent Services</CardTitle>
                <CardDescription>Recently updated offerings</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/services">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-md" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentServices.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  No services added yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {recentServices.map((service) => (
                    <div key={service.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md bg-secondary flex items-center justify-center text-primary">
                          <Layers className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-none">{service.title}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1 max-w-[200px]">
                            {service.description || "No description"}
                          </p>
                        </div>
                      </div>
                      <Badge variant={service.active ? "default" : "secondary"} className="text-[10px] px-1.5">
                        {service.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
