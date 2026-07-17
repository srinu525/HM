"use client";

import { useEffect, useState } from "react";
import { billingApi, Plan } from "@/lib/api";
import { CreditCard, Users, Stethoscope } from "lucide-react";

export default function AdminSubscriptionsPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    billingApi.getPlans().then((res) => setPlans(res.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
        <p className="text-gray-500 mt-1">View all available subscription plans</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => (
            <div key={plan.id} className={`bg-white rounded-xl border p-6 ${plan.isActive ? "border-gray-200 shadow-sm" : "border-gray-100 opacity-60"}`}>
              <h3 className="font-bold text-lg text-gray-900">{plan.name}</h3>
              <div className="text-3xl font-bold text-gray-900 mt-3">
                ₹{plan.price.toLocaleString()}
                <span className="text-sm font-normal text-gray-500">/mo</span>
              </div>
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2"><Users className="w-4 h-4" />{plan.maxUsers} users</div>
                <div className="flex items-center gap-2"><Stethoscope className="w-4 h-4" />{plan.maxPatients} patients</div>
              </div>
              {plan._count && <div className="mt-3 text-xs text-gray-500">{plan._count.subscriptions} active subscriptions</div>}
              <div className="mt-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${plan.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {plan.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
