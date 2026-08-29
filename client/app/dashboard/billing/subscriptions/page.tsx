"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, X, CreditCard, Clock, AlertTriangle } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  maxUsers: number;
  maxPatients: number;
  features: string[];
  isActive: boolean;
}

interface Subscription {
  id: string;
  startDate: string;
  endDate: string | null;
  status: string;
  plan: Plan;
}

export default function BillingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [subscribing, setSubscribing] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [plansRes, subRes] = await Promise.all([
          api.get("/billing/plans"),
          api.get("/billing/subscription"),
        ]);
        setPlans(plansRes.data.data);
        setSubscription(subRes.data.data);
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    load();
  }, []);

  const handleSubscribe = async (planId: string) => {
    setSubscribing(planId);
    setMessage("");
    try {
      const res = await api.post("/billing/subscription", { planId, months: 1 });
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
      await api.put(`/billing/subscription/${subscription.id}/cancel`);
      setSubscription(null);
      setMessage("Subscription cancelled");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setMessage(error.response?.data?.message || "Failed to cancel");
    }
  };

  const daysUntilExpiry = subscription?.endDate
    ? Math.ceil((new Date(subscription.endDate).getTime() - Date.now()) / 86400000)
    : null;

  if (loading) {
    return <div className="animate-pulse space-y-4">{[1, 2, 3].map(i => <Card key={i}><CardContent className="p-6 h-32 bg-gray-100 rounded" /></Card>)}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
        <p className="text-gray-600 mt-1">Manage your subscription plan</p>
      </div>

      {message && (
        <div className={`p-3 rounded-md text-sm ${message.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Up to {plan.maxUsers} users</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Up to {plan.maxPatients} patients</span>
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
    </div>
  );
}
