export const authErrors: { [key: string]: string } = {
  OAuthSignin: "Error signing in with OAuth provider",
  OAuthCallback: "Error processing OAuth callback",
  OAuthCreateAccount: "Error creating OAuth account",
  EmailCreateAccount: "Error creating email account",
  Callback: "Error processing authentication callback",
  OAuthAccountNotLinked: "Email already exists with different provider",
  EmailSignin: "Error sending verification email",
  CredentialsSignin: "Invalid email or password",
  SessionRequired: "Please sign in to access this page",
  Default: "An error occurred during authentication",
};

export function getAuthErrorMessage(error: string | undefined): string {
  if (!error) return authErrors.Default;
  return authErrors[error] || authErrors.Default;
}
