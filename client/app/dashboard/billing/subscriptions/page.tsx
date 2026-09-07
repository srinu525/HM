"use client";

import { useState, useEffect } from "react";
import { billingApi, Plan, PlanAddon } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  CreditCard,
  AlertTriangle,
  Package,
  X,
  Users,
  Stethoscope,
} from "lucide-react";

interface Subscription {
  id: string;
  startDate: string;
  endDate: string | null;
  status: string;
  plan: Plan;
}

interface OrgAddon {
  id: string;
  status: string;
  addon: PlanAddon;
}

const MODULE_LABEL: Record<string, string> = {
  reception: "Reception",
  doctor: "Doctor",
  pharmacy: "Pharmacy",
  admin: "Admin",
};

export default function BillingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [addons, setAddons] = useState<PlanAddon[]>([]);
  const [orgAddons, setOrgAddons] = useState<OrgAddon[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [addingAddon, setAddingAddon] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [plansRes, subRes, addonsRes, orgAddonsRes] = await Promise.all([
          billingApi.getPlans(),
          billingApi.getSubscription(),
          billingApi.getAddons(),
          billingApi.getOrgAddons(),
        ]);
        setPlans(plansRes.data.data);
        setSubscription(subRes.data.data);
        setAddons(addonsRes.data.data);
        setOrgAddons(orgAddonsRes.data.data);
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    load();
  }, []);

  const handleSubscribe = async (planId: string) => {
    setSubscribing(planId);
    setMessage("");
    try {
      const res = await billingApi.subscribe(planId, 1);
      setSubscription(res.data.data);
      setMessage("Subscribed successfully!");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setMessage(error.response?.data?.message || "Failed to subscribe");
    } finally {
      setSubscribing(null);
    }
  };

  const handleCancel = async () => {
    if (!subscription) return;
    try {
      await billingApi.cancelSubscription(subscription.id);
      setSubscription(null);
      setMessage("Subscription cancelled");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setMessage(error.response?.data?.message || "Failed to cancel");
    }
  };

  const addAddon = async (addonId: string) => {
    setAddingAddon(addonId);
    setMessage("");
    try {
      const res = await billingApi.addOrgAddon(addonId);
      setOrgAddons((prev) => [...prev, res.data.data]);
      setMessage("Add-on added to your subscription!");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setMessage(error.response?.data?.message || "Failed to add add-on");
    } finally {
      setAddingAddon(null);
    }
  };

  const removeAddon = async (addonId: string) => {
    try {
      await billingApi.removeOrgAddon(addonId);
      setOrgAddons((prev) => prev.filter((o) => o.addon.id !== addonId));
      setMessage("Add-on removed");
    } catch (error) {
      console.error(error);
    }
  };

  const daysUntilExpiry = subscription?.endDate
    ? Math.ceil((new Date(subscription.endDate).getTime() - Date.now()) / 86400000)
    : null;

  if (loading) {
    return <div className="animate-pulse space-y-4">{[1, 2, 3].map(i => <Card key={i}><CardContent className="p-6 h-32 bg-gray-100 rounded" /></Card>)}</div>;
  }

  const ownedAddonIds = new Set(orgAddons.map((o) => o.addon.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
        <p className="text-gray-600 mt-1">Manage your subscription plan &amp; add-on facilities</p>
      </div>

      {message && (
        <div className={`p-3 rounded-md text-sm ${message.includes("success") || message.includes("added") || message.includes("removed") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message}
        </div>
      )}

      {subscription && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Current Plan: {subscription.plan.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Price</p>
                <p className="text-xl font-bold">₹{subscription.plan.price}/month</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge className={subscription.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                  {subscription.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Expires</p>
                {daysUntilExpiry !== null ? (
                  <p className={`font-medium ${daysUntilExpiry < 7 ? "text-red-600" : "text-gray-900"}`}>
                    {daysUntilExpiry > 0 ? `${daysUntilExpiry} days remaining` : "Expired"}
                  </p>
                ) : (
                  <p className="text-gray-900">No expiry</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600">Limits</p>
                <p className="font-medium text-gray-900">
                  {subscription.plan.maxUsers === -1 || subscription.plan.maxUsers === 0 ? "Unlimited" : `${subscription.plan.maxUsers}`} users ·{" "}
                  {subscription.plan.maxDoctors === -1 || subscription.plan.maxDoctors === 0 ? "Unlimited" : `${subscription.plan.maxDoctors}`} doctors
                </p>
                <p className="text-xs text-gray-500">Unlimited patients</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              {subscription.status === "ACTIVE" && (
                <Button variant="destructive" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-1" /> Cancel Subscription
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {!subscription && (
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardContent className="p-6 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <p className="text-yellow-800">No active subscription. Choose a plan below.</p>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.filter(p => p.isActive).map((plan) => {
            const isCurrent = subscription?.plan.id === plan.id;
            return (
              <Card key={plan.id} className={`relative ${isCurrent ? "border-blue-500 ring-2 ring-blue-200" : ""}`}>
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-blue-600">Current</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">₹{plan.price}</span>
                    <span className="text-gray-500">/mo</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600 text-center">{plan.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span>{plan.maxUsers === -1 || plan.maxUsers === 0 ? "Unlimited" : `Up to ${plan.maxUsers}`} users</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-blue-500" />
                      <span>{plan.maxDoctors === -1 || plan.maxDoctors === 0 ? "Unlimited" : `Up to ${plan.maxDoctors}`} doctors</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Unlimited patients</span>
                    </div>
                    <div className="pt-1">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Modules</p>
                      <div className="flex flex-wrap gap-1">
                        {plan.modules.map((m) => (
                          <Badge key={m} className="bg-blue-50 text-blue-700 border-blue-200">
                            {MODULE_LABEL[m] ?? m}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {plan.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                  {!isCurrent && (
                    <Button
                      className="w-full mt-4"
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={subscribing === plan.id}
                    >
                      {subscribing === plan.id ? "Subscribing..." : plan.price === 0 ? "Get Started" : "Subscribe"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
          <Package className="h-5 w-5" /> Add-on Facilities
        </h2>
        <p className="text-sm text-gray-600 mb-4">Optional add-ons you can add to your current subscription</p>

        {orgAddons.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Your Add-ons</p>
            <div className="flex flex-wrap gap-2">
              {orgAddons.map((o) => (
                <Badge key={o.id} className="bg-purple-100 text-purple-700 border-purple-200 text-sm px-3 py-1 flex items-center gap-2">
                  {o.addon.name}
                  <button onClick={() => removeAddon(o.addon.id)} className="text-purple-500 hover:text-purple-700">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {addons.filter(a => a.isActive).map((addon) => {
            const owned = ownedAddonIds.has(addon.id);
            return (
              <Card key={addon.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{addon.name}</h3>
                    <p className="font-bold text-gray-900">₹{addon.price}<span className="text-xs text-gray-400">/mo</span></p>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{addon.description}</p>
                  <Badge className="mt-2 bg-purple-50 text-purple-700 border-purple-200">{addon.module} module</Badge>
                  <div className="mt-3">
                    {owned ? (
                      <Button variant="outline" className="w-full" disabled>
                        <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" /> Added
                      </Button>
                    ) : (
                      <Button className="w-full" onClick={() => addAddon(addon.id)} disabled={addingAddon === addon.id}>
                        {addingAddon === addon.id ? "Adding..." : "Add Add-on"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {addons.filter(a => a.isActive).length === 0 && (
            <p className="text-center text-gray-500 py-6 col-span-full">No add-ons available</p>
          )}
        </div>
      </div>
    </div>
  );
}
