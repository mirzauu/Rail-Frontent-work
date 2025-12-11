import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Train, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setIsSubmitted(true);
        }, 1500);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
            <div className="w-full max-w-md">
                {/* Logo and Brand */}
                <div className="flex flex-col items-center mb-8">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20 mb-4">
                        <Train className="h-9 w-9 text-primary-foreground" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">RailVision AI</h1>
                    <p className="text-sm text-muted-foreground mt-1">AI-Powered C-Suite Intelligence</p>
                </div>

                {/* Forgot Password Card */}
                <Card className="border-border/50 shadow-xl">
                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-2xl font-bold text-center">
                            {isSubmitted ? "Check your email" : "Forgot password?"}
                        </CardTitle>
                        <CardDescription className="text-center">
                            {isSubmitted
                                ? "We've sent password reset instructions to your email"
                                : "No worries, we'll send you reset instructions"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!isSubmitted ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Email Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium">
                                        Email
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="name@company.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="h-11 pl-10"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Sending...
                                        </div>
                                    ) : (
                                        "Reset password"
                                    )}
                                </Button>

                                {/* Back to Login */}
                                <Link to="/login">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="w-full h-11 text-base"
                                        disabled={isLoading}
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to login
                                    </Button>
                                </Link>
                            </form>
                        ) : (
                            <div className="space-y-6">
                                {/* Success Icon */}
                                <div className="flex justify-center">
                                    <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
                                        <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
                                    </div>
                                </div>

                                {/* Success Message */}
                                <div className="text-center space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        We sent a password reset link to
                                    </p>
                                    <p className="text-sm font-semibold text-foreground">{email}</p>
                                </div>

                                {/* Instructions */}
                                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                                    <p className="text-sm font-medium">Didn't receive the email?</p>
                                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                                        <li>Check your spam or junk folder</li>
                                        <li>Make sure you entered the correct email</li>
                                        <li>Wait a few minutes and check again</li>
                                    </ul>
                                </div>

                                {/* Resend Button */}
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full h-11"
                                    onClick={() => setIsSubmitted(false)}
                                >
                                    Try another email
                                </Button>

                                {/* Back to Login */}
                                <Link to="/login">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="w-full h-11 text-base"
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to login
                                    </Button>
                                </Link>
                            </div>
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
