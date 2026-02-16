"use client";

import type React from "react";

import { useAuth } from "@/components/auth-provider";
import { DashboardLayout } from "@/components/dashboard-layout";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  authService,
  type UpdateProfileData,
  type UserProfile,
} from "@/lib/auth";
import {
  Bell,
  Building2,
  Edit,
  Key,
  Palette,
  Save,
  Shield,
  Upload,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<UpdateProfileData>({});
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const profile = await authService.getUserProfile();
      setUserProfile(profile);
      setFormData({
        orgName: profile.orgName || "",
        orgType: profile.orgType || "",
        logo: profile.logo || "",
        providerId: profile.providerId || "",
        description: profile.description || "",
        email: profile.email || "",
        name: profile.name || "",
      });
      if (profile.logo) {
        setLogoPreview(profile.logo);
      }
    } catch (error) {
      toast("Error", {
        description: "Failed to fetch profile data",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!userProfile?.id) {
      toast("Error", {
        description: "User ID not found",
      });
      return;
    }

    try {
      setIsSaving(true);
      const updatedProfile = await authService.updateProfile(
        formData,
        userProfile.id
      );

      setUserProfile(updatedProfile);
      setIsEditing(false);
      toast("Success", {
        description: "Profile updated successfully",
      });
      localStorage.setItem("logo", updatedProfile.logo || "");
    } catch (error) {
      console.log(error);

      toast("Error", {
        description: "Failed to update profile",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof UpdateProfileData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast("Error", {
          description: "File size must be less than 5MB",
        });
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        toast("Error", {
          description: "Please select an image file",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        setLogoPreview(base64String);
        handleInputChange("logo", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    handleInputChange("logo", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form data to original values
    if (userProfile) {
      setFormData({
        orgName: userProfile.orgName || "",
        orgType: userProfile.orgType || "",
        logo: userProfile.logo || "",
        providerId: userProfile.providerId || "",
        description: userProfile.description || "",
        email: userProfile.email || "",
        name: userProfile.name || "",
      });
      setLogoPreview(userProfile.logo || null);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <LoadingSpinner size={12} className="h-32" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid gap-6">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {user?.userType === "organization" ? (
                    <Building2 className="h-5 w-5" />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                  Profile Information
                </CardTitle>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <LoadingSpinner size={4} className="mr-2" />
                        ) : (
                          <Save className="mr-2 h-4 w-4" />
                        )}
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {user?.userType === "organization" ? (
                // Organization Profile Fields
                <div className="space-y-6">
                  {/* Logo Section */}
                  <div>
                    <Label>Organization Logo</Label>
                    <div className="mt-2 flex items-center gap-4">
                      {logoPreview ? (
                        <div className="relative">
                          <img
                            src={logoPreview || "/placeholder.svg"}
                            alt="Organization Logo"
                            className="h-20 w-20 rounded-lg object-cover border"
                          />
                          {isEditing && (
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2 h-6 w-6"
                              onClick={handleRemoveLogo}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="h-20 w-20 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                          <Building2 className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                      )}
                      {isEditing && (
                        <div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Logo
                          </Button>
                          <p className="text-xs text-muted-foreground mt-1">
                            Max file size: 5MB. Supported formats: JPG, PNG, GIF
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="orgName">Organization Name</Label>
                      {isEditing ? (
                        <Input
                          id="orgName"
                          value={formData.orgName || ""}
                          onChange={(e) =>
                            handleInputChange("orgName", e.target.value)
                          }
                          placeholder="Enter organization name"
                        />
                      ) : (
                        <p className="text-sm mt-1">
                          {userProfile?.orgName || "Not provided"}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="orgType">Organization Type</Label>
                      {isEditing ? (
                        <Input
                          id="orgType"
                          value={formData.orgType || ""}
                          onChange={(e) =>
                            handleInputChange("orgType", e.target.value)
                          }
                          placeholder="Enter organization type"
                        />
                      ) : (
                        <p className="text-sm mt-1">
                          {userProfile?.orgType || "Not provided"}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      {isEditing ? (
                        <Input
                          id="email"
                          type="email"
                          value={formData.email || ""}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          placeholder="Enter email address"
                        />
                      ) : (
                        <p className="text-sm mt-1">{userProfile?.email}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="providerId">Provider ID</Label>
                      {isEditing ? (
                        <Input
                          id="providerId"
                          value={formData.providerId || ""}
                          onChange={(e) =>
                            handleInputChange("providerId", e.target.value)
                          }
                          placeholder="Enter provider ID"
                        />
                      ) : (
                        <p className="text-sm mt-1">
                          {userProfile?.providerId || "Not provided"}
                        </p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="description">Description</Label>
                      {isEditing ? (
                        <Textarea
                          id="description"
                          value={formData.description || ""}
                          onChange={(e) =>
                            handleInputChange("description", e.target.value)
                          }
                          placeholder="Enter organization description"
                          rows={3}
                        />
                      ) : (
                        <p className="text-sm mt-1">
                          {userProfile?.description || "Not provided"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // Employee/Other User Profile Fields
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={formData.name || ""}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        placeholder="Enter your name"
                      />
                    ) : (
                      <p className="text-sm mt-1">
                        {userProfile?.name || "Not provided"}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={formData.email || ""}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        placeholder="Enter email address"
                      />
                    ) : (
                      <p className="text-sm mt-1">{userProfile?.email}</p>
                    )}
                  </div>
                  <div>
                    <Label>User Type</Label>
                    <p className="text-sm mt-1 capitalize">
                      {userProfile?.userType?.replace("_", " ")}
                    </p>
                  </div>
                  {userProfile?.role && (
                    <div>
                      <Label>Role</Label>
                      <p className="text-sm mt-1">{userProfile.role}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Password</h4>
                  <p className="text-sm text-muted-foreground">
                    Change your account password
                  </p>
                </div>
                <Link href="/dashboard/settings/change-password">
                  <Button variant="outline" size="sm">
                    <Key className="mr-2 h-4 w-4" />
                    Change Password
                  </Button>
                </Link>
              </div>
              {/* <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">
                    Two-Factor Authentication
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Enable 2FA
                </Button>
              </div> */}
            </CardContent>
          </Card>

          {/* <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Email Notifications</h4>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Configure
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Push Notifications</h4>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications in your browser
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card> */}

          {/* <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Theme</h4>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred theme
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  System
                </Button>
              </div>
            </CardContent>
          </Card> */}
        </div>
      </div>
    </DashboardLayout>
  );
}
