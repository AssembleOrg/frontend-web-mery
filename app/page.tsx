import { redirect } from 'next/navigation';

// This page only renders when the user is on the root path in production
export default function RootPage() {
  // Redirect to the default locale
  redirect('/es');
}
