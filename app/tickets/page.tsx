import TicketList from '../../components/TicketList';

export default function TicketsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <TicketList />
      </div>
    </div>
  );
}