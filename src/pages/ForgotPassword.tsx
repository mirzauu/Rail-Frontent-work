import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Train, ArrowLeft, Mail, CheckCircle2, Lock, KeyRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState<"request" | "reset">("request");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.forgotPassword(email);
            toast.success("OTP sent to your email!");
            setStep("reset");
        } catch (error: any) {
            toast.error(error.message || "Failed to send OTP");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        setIsLoading(true);
        try {
            await api.resetPassword({ email, otp, new_password: newPassword });
            toast.success("Password reset successfully! Please login.");
            navigate("/login");
        } catch (error: any) {
            toast.error(error.message || "Failed to reset password");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
            <div className="w-full max-w-md">
                {/* Logo and Brand */}
                <div className="flex flex-col items-center mb-8">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20 mb-4 transition-transform hover:scale-105">
                        <Train className="h-9 w-9 text-primary-foreground" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">RailVision AI</h1>
                    <p className="text-sm text-muted-foreground mt-1">AI-Powered C-Suite Intelligence</p>
                </div>

                {/* Main Card */}
                <Card className="border-border/50 shadow-2xl bg-card/80 backdrop-blur-sm">
                    <CardHeader className="space-y-1 pb-4 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
                            {step === "request" ? (
                                <Mail className="h-6 w-6 text-primary" />
                            ) : (
                                <Lock className="h-6 w-6 text-primary" />
                            )}
                        </div>
                        <CardTitle className="text-2xl font-bold">
                            {step === "request" ? "Forgot password?" : "Reset password"}
                        </CardTitle>
                        <CardDescription>
                            {step === "request"
                                ? "Enter your email and we'll send you an OTP."
                                : "Enter the OTP sent to your email and your new password."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {step === "request" ? (
                            <form onSubmit={handleRequestOtp} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-semibold">
                                        Work Email
                                    </Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="name@company.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="h-11 pl-10 focus-visible:ring-primary/20 transition-all"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-11 text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Requesting OTP...
                                        </div>
                                    ) : (
                                        "Send OTP"
                                    )}
                                </Button>

                                <Link to="/login" className="block">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="w-full h-11 text-base hover:bg-muted/50"
                                        disabled={isLoading}
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to login
                                    </Button>
                                </Link>
                            </form>
                        ) : (
                            <form onSubmit={handleResetPassword} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="otp" className="text-sm font-semibold">
                                        Verification OTP
                                    </Label>
                                    <div className="relative group">
                                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <Input
                                            id="otp"
                                            type="text"
                                            placeholder="Enter 6-digit code"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            required
                                            className="h-11 pl-10 focus-visible:ring-primary/20 transition-all"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="newPassword" className="text-sm font-semibold">
                                        New Password
                                    </Label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <Input
                                            id="newPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            className="h-11 pl-10 focus-visible:ring-primary/20 transition-all"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-sm font-semibold">
                                        Confirm New Password
                                    </Label>
                                    <div className="relative group">
                                        <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            className="h-11 pl-10 focus-visible:ring-primary/20 transition-all"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                <div className="pt-2 space-y-3">
                                    <Button
                                        type="submit"
                                        className="w-full h-11 text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Resetting Password...
                                            </div>
                                        ) : (
                                            "Update Password"
                                        )}
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="w-full h-11 text-base hover:bg-muted/50"
                                        onClick={() => setStep("request")}
                                        disabled={isLoading}
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Resend OTP
                                    </Button>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="mt-8 text-center text-xs text-muted-foreground">
                    <p>
                        Need help?{" "}
                        <Link to="/support" className="underline hover:text-foreground transition-colors">
                            Contact support
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
