"use client";

import { useEffect, useState } from "react";
import { patientPortalApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserRound, Loader2, Mail, Phone, MapPin, Lock, Save, Calendar, Activity } from "lucide-react";

export default function PatientProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    patientPortalApi.getProfile().then((res) => {
      const d = res.data.data || res.data;
      setName(d.name || "");
      setEmail(d.email || "");
      setPhone(d.phone || "");
      setAddress(d.address || "");
      setGender(d.gender || "");
      setAge(d.age ? String(d.age) : "");
      setDob(d.dob ? new Date(d.dob).toISOString().split("T")[0] : "");
    }).catch((err) => {
      console.error(err);
      setMsg("Failed to load profile");
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMsg("");
    try {
      const data: any = { name };
      if (phone) data.phone = phone;
      if (address) data.address = address;
      if (password) data.password = password;
      await patientPortalApi.updateProfile(data);
      setMsg("Profile updated successfully");
      if (password) setPassword("");
    } catch {
      setMsg("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Loading profile...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1">Manage your personal information</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-sm">
            <UserRound className="h-8 w-8 text-white" />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">{name}</p>
            <p className="text-sm text-gray-500">{email}</p>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <UserRound className="h-4 w-4 text-gray-400" /> Full Name
              </Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" /> Email
              </Label>
              <Input value={email} disabled className="bg-gray-50 text-gray-500" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" /> Phone
              </Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Activity className="h-4 w-4 text-gray-400" /> Gender
              </Label>
              <Input value={gender} disabled className="bg-gray-50 text-gray-500" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" /> Age
              </Label>
              <Input value={age} disabled className="bg-gray-50 text-gray-500" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" /> Date of Birth
              </Label>
              <Input value={dob} disabled className="bg-gray-50 text-gray-500" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" /> Address
              </Label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 min-h-[80px] text-sm"
              />
            </div>

            <div className="md:col-span-2 pt-4 border-t border-gray-100">
              <div className="max-w-sm space-y-2">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-gray-400" /> Change Password
                </Label>
                <Input
                  type="password"
                  placeholder="Leave blank to keep current"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          {msg && (
            <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${
              msg.includes("success") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
            }`}>
              {msg}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
