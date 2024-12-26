import { NextResponse } from 'next/server';

export function middleware(req) {
    const blockedCountries = [
        'US', 'GB', 'CN', 'CA', 'RU',
        'AT', 'BE', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE',
        'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
        'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
    ];

    const country = req.geo?.country || 'UNKNOWN';

    if (blockedCountries.includes(country)) {
        return NextResponse.redirect(new URL('/access-denied', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/:path*',
};

