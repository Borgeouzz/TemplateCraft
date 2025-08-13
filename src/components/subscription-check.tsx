import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
// import { checkUserSubscription } from '@/app/actions'; // TODO: enable when API supports subscriptions

interface SubscriptionCheckProps {
    children: React.ReactNode;
    redirectTo?: string;
}

export async function SubscriptionCheck({
    children,
    redirectTo = '/pricing'
}: SubscriptionCheckProps) {
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) {
        redirect('/sign-in');
    }
    // Temporaneamente non effettuiamo il controllo abbonamento, in attesa dell'endpoint API
    return <>{children}</>;
}
