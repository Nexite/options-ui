import { useState, useEffect } from 'react';

export type IntervalOptionsRangeResult = {
    timestamp: Date
    puts: {
        contractId: string
        expiration: Date
        strike: number
        ask: number
        bid: number
    }[]
}

interface UseIntervalDataProps {
    symbol: string;
    startDate: Date;
    endDate: Date;
    enabled: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

function formatDateToEST(date: Date): string {
    // Convert to EST
    const estDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    // Format as yyyy-mm-dd
    return estDate.toISOString().split('T')[0];
}

export function useIntervalData({ symbol, startDate, endDate, enabled }: UseIntervalDataProps) {
    const [data, setData] = useState<IntervalOptionsRangeResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    // Convert dates to EST and format as yyyy-mm-dd
    const startDateString = formatDateToEST(startDate);
    const endDateString = formatDateToEST(endDate);

    useEffect(() => {
        if (!enabled) return;

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_BASE_URL}/options-interval?symbol=${symbol}&startDate=${startDateString}&endDate=${endDateString}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch interval data');
                }
                const result = await response.json();
                setData(result);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('An error occurred'));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [symbol, startDateString, endDateString, enabled]);

    return { data, loading, error };
} 