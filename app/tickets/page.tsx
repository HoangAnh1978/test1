import { Suspense } from 'react';
import TicketList from '../../components/TicketList';

function TicketListLoading() {
  return (
    <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}

export default function TicketsPage() {
  return (
    <div className="h-full">
      <Suspense fallback={<TicketListLoading />}>
        <TicketList />
      </Suspense>
    </div>
  );
}